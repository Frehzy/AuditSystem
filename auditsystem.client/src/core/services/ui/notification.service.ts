// src/core/services/ui/notification.service.ts
import { logger } from '@/core/utils/logger';
import { errorHandler } from '../utils/error-handler.service';
import type {
  NotificationService,
  Notification,
  NotificationType,
  NotificationOptions
} from '@/core/types';

interface NotificationAction {
  label: string;
  onClick: () => void;
}

interface ExtendedNotificationOptions extends NotificationOptions {
  priority?: 'low' | 'normal' | 'high';
  group?: string;
  icon?: string;
  action?: NotificationAction;
}

interface ExtendedNotification extends Notification {
  priority?: 'low' | 'normal' | 'high';
  group?: string;
  icon?: string;
  action?: NotificationAction;
  read?: boolean;
}

/**
 * Production-ready notification service with queue management and persistence
 */
class NotificationServiceImpl implements NotificationService {
  private readonly logger = logger.create('NotificationService');
  private notifications: Map<string, ExtendedNotification> = new Map();
  private notificationHistory: ExtendedNotification[] = [];
  private subscribers: Set<(notifications: ExtendedNotification[]) => void> = new Set();
  private autoDismissTimers: Map<string, number> = new Map();
  private pausedTimers: Map<string, { remaining: number; startTime: number }> = new Map();

  private config = {
    maxVisible: 5,
    maxHistory: 100,
    defaultDuration: 5000
  };

  constructor() {
    this.logger.debug('NotificationService initialized', {
      config: this.config
    });

    this.setupStorageCleanup();
  }

  show(
    type: NotificationType,
    message: string,
    options: ExtendedNotificationOptions = {}
  ): string {
    try {
      this.validateNotificationParams(type, message, options);

      const id = this.generateId();
      const notification: ExtendedNotification = {
        id,
        type,
        message,
        title: options.title,
        dismissible: options.dismissible ?? true,
        duration: options.duration ?? this.config.defaultDuration,
        createdAt: Date.now(),
        pauseOnHover: options.pauseOnHover ?? true,
        priority: options.priority,
        group: options.group,
        icon: options.icon,
        action: options.action,
        read: false
      };

      this.addNotification(notification);
      this.notifySubscribers();

      this.logger.debug('Notification shown', {
        id,
        type,
        message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        duration: notification.duration
      });

      return id;
    } catch (error) {
      const handledError = errorHandler.handle(error, 'Notification:show');
      this.logger.error('Failed to show notification', {
        type,
        message,
        error: handledError.message
      });

      throw handledError;
    }
  }

  success(message: string, options?: ExtendedNotificationOptions): string {
    return this.show('success', message, options);
  }

  error(message: string, options?: ExtendedNotificationOptions): string {
    return this.show('error', message, options);
  }

  warning(message: string, options?: ExtendedNotificationOptions): string {
    return this.show('warning', message, options);
  }

  info(message: string, options?: ExtendedNotificationOptions): string {
    return this.show('info', message, options);
  }

  dismiss(id: string): void {
    const notification = this.notifications.get(id);

    if (notification) {
      this.clearAutoDismissTimer(id);
      this.notifications.delete(id);

      this.logger.debug('Notification dismissed', {
        id,
        type: notification.type,
        message: notification.message.substring(0, 50) + (notification.message.length > 50 ? '...' : '')
      });

      this.notifySubscribers();
    }
  }

  dismissByType(type: NotificationType): void {
    let dismissedCount = 0;

    for (const [id, notification] of this.notifications.entries()) {
      if (notification.type === type) {
        this.clearAutoDismissTimer(id);
        this.notifications.delete(id);
        dismissedCount++;
      }
    }

    if (dismissedCount > 0) {
      this.logger.debug(`Dismissed notifications by type`, {
        type,
        count: dismissedCount
      });

      this.notifySubscribers();
    }
  }

  clearAll(): void {
    const clearedCount = this.notifications.size;

    for (const id of this.notifications.keys()) {
      this.clearAutoDismissTimer(id);
    }

    this.notifications.clear();

    this.logger.debug('All notifications cleared', {
      clearedCount
    });

    this.notifySubscribers();
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    const wrappedListener = (notifications: ExtendedNotification[]) => listener(notifications as Notification[]);
    this.subscribers.add(wrappedListener);

    this.logger.debug('Notification subscriber added', {
      totalSubscribers: this.subscribers.size
    });

    return () => {
      this.subscribers.delete(wrappedListener);

      this.logger.debug('Notification subscriber removed', {
        totalSubscribers: this.subscribers.size
      });
    };
  }

  getNotifications(): Notification[] {
    const notifications = Array.from(this.notifications.values());

    // Sort by priority and creation time
    const priorityOrder: Record<string, number> = { high: 3, normal: 2, low: 1 };

    return notifications
      .sort((a, b) => {
        const aPriority = a.priority ? priorityOrder[a.priority] : 2;
        const bPriority = b.priority ? priorityOrder[b.priority] : 2;

        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }

        return b.createdAt - a.createdAt;
      })
      .slice(0, this.config.maxVisible) as Notification[];
  }

  getStats(): { active: number; queued: number; types: Record<string, number> } {
    const types: Record<string, number> = {};

    for (const notification of this.notifications.values()) {
      types[notification.type] = (types[notification.type] || 0) + 1;
    }

    return {
      active: this.notifications.size,
      queued: Math.max(0, this.notifications.size - this.config.maxVisible),
      types
    };
  }

  getHistory(): Notification[] {
    return [...this.notificationHistory] as Notification[];
  }

  clearHistory(): void {
    const previousSize = this.notificationHistory.length;
    this.notificationHistory = [];

    this.logger.debug('Notification history cleared', {
      previousSize,
      currentSize: this.notificationHistory.length
    });
  }

  pauseAutoDismiss(id: string): void {
    const timerId = this.autoDismissTimers.get(id);

    if (timerId && this.notifications.has(id)) {
      const notification = this.notifications.get(id)!;
      const elapsed = Date.now() - notification.createdAt;
      const remaining = Math.max(0, (notification.duration || 0) - elapsed);

      clearTimeout(timerId);
      this.autoDismissTimers.delete(id);

      this.pausedTimers.set(id, {
        remaining,
        startTime: Date.now()
      });

      this.logger.debug('Auto-dismiss paused', {
        id,
        remaining
      });
    }
  }

  resumeAutoDismiss(id: string): void {
    const paused = this.pausedTimers.get(id);

    if (paused && this.notifications.has(id)) {
      const notification = this.notifications.get(id)!;

      this.pausedTimers.delete(id);
      this.setupAutoDismiss(id, notification, paused.remaining);

      this.logger.debug('Auto-dismiss resumed', {
        id,
        remaining: paused.remaining
      });
    }
  }

  markAsRead(id: string): void {
    const notification = this.notifications.get(id);

    if (notification) {
      notification.read = true;
      this.logger.debug('Notification marked as read', { id });
      this.notifySubscribers();
    }
  }

  markAllAsRead(): void {
    let markedCount = 0;

    for (const notification of this.notifications.values()) {
      if (!notification.read) {
        notification.read = true;
        markedCount++;
      }
    }

    if (markedCount > 0) {
      this.logger.debug('All notifications marked as read', {
        markedCount
      });

      this.notifySubscribers();
    }
  }

  getConfig(): { maxVisible: number; maxHistory: number; defaultDuration: number } {
    return { ...this.config };
  }

  private addNotification(notification: ExtendedNotification): void {
    if (this.notifications.size >= this.config.maxVisible) {
      const oldestId = this.findOldestNotificationId();
      if (oldestId) {
        this.dismiss(oldestId);
      }
    }

    this.notifications.set(notification.id, notification);
    this.addToHistory(notification);

    if (notification.duration && notification.duration > 0) {
      this.setupAutoDismiss(notification.id, notification, notification.duration);
    }
  }

  private addToHistory(notification: ExtendedNotification): void {
    this.notificationHistory.unshift(notification);

    if (this.notificationHistory.length > this.config.maxHistory) {
      this.notificationHistory = this.notificationHistory.slice(0, this.config.maxHistory);
    }
  }

  private setupAutoDismiss(id: string, notification: ExtendedNotification, duration: number): void {
    const timerId = window.setTimeout(() => {
      this.dismiss(id);
    }, duration);

    this.autoDismissTimers.set(id, timerId);
  }

  private clearAutoDismissTimer(id: string): void {
    const timerId = this.autoDismissTimers.get(id);

    if (timerId) {
      clearTimeout(timerId);
      this.autoDismissTimers.delete(id);
    }

    this.pausedTimers.delete(id);
  }

  private findOldestNotificationId(): string | null {
    let oldestId: string | null = null;
    let oldestTime = Infinity;

    for (const [id, notification] of this.notifications.entries()) {
      if (notification.createdAt < oldestTime) {
        oldestTime = notification.createdAt;
        oldestId = id;
      }
    }

    return oldestId;
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifySubscribers(): void {
    const notifications = this.getNotifications();

    for (const subscriber of this.subscribers) {
      try {
        subscriber(notifications as ExtendedNotification[]);
      } catch (error) {
        const handledError = errorHandler.handle(error, 'Notification:subscriber');
        this.logger.error('Notification subscriber error', {
          error: handledError.message
        });
      }
    }
  }

  private validateNotificationParams(
    type: NotificationType,
    message: string,
    options: ExtendedNotificationOptions
  ): void {
    if (!type || !['success', 'error', 'warning', 'info'].includes(type)) {
      throw errorHandler.create('Invalid notification type', 'INVALID_NOTIFICATION_TYPE');
    }

    if (!message || typeof message !== 'string') {
      throw errorHandler.create('Notification message must be a non-empty string', 'INVALID_NOTIFICATION_MESSAGE');
    }

    if (options.title && typeof options.title !== 'string') {
      throw errorHandler.create('Notification title must be a string', 'INVALID_NOTIFICATION_TITLE');
    }

    if (options.duration !== undefined && (typeof options.duration !== 'number' || options.duration < 0)) {
      throw errorHandler.create('Notification duration must be a non-negative number', 'INVALID_NOTIFICATION_DURATION');
    }

    if (options.action && typeof options.action !== 'object') {
      throw errorHandler.create('Notification action must be an object', 'INVALID_NOTIFICATION_ACTION');
    }

    if (options.action) {
      const action = options.action as NotificationAction;
      if (!action.label || typeof action.label !== 'string') {
        throw errorHandler.create('Notification action label must be a string', 'INVALID_NOTIFICATION_ACTION_LABEL');
      }

      if (!action.onClick || typeof action.onClick !== 'function') {
        throw errorHandler.create('Notification action onClick must be a function', 'INVALID_NOTIFICATION_ACTION_HANDLER');
      }
    }
  }

  private setupStorageCleanup(): void {
    window.addEventListener('beforeunload', () => {
      for (const timerId of this.autoDismissTimers.values()) {
        clearTimeout(timerId);
      }

      this.autoDismissTimers.clear();
      this.pausedTimers.clear();

      this.logger.debug('Notification service cleanup completed');
    });
  }
}

// Создание и экспорт синглтона
export const notificationService: NotificationService = new NotificationServiceImpl();
