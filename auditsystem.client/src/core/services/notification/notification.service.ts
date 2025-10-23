import { logger } from '@/core/utils/logger/logger';
import type { NotificationService, Notification, NotificationType, NotificationOptions } from '../types';

interface NotificationQueueItem {
  notification: Notification;
  timer?: number;
  isPaused: boolean;
}

class NotificationServiceImpl implements NotificationService {
  private readonly logger = logger.create('NotificationService');
  private notifications: Notification[] = [];
  private notificationQueue: NotificationQueueItem[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private nextId = 1;
  private isQueueProcessing = false;
  private readonly maxNotifications = 5;
  private readonly defaultDurations = {
    success: 5000,
    error: 8000,
    warning: 6000,
    info: 4000,
  };

  show(type: NotificationType, message: string, options: NotificationOptions = {}): string {
    const id = this.generateId();

    const notification: Notification = {
      id,
      type,
      message,
      title: options.title,
      dismissible: options.dismissible ?? true,
      duration: options.duration ?? this.defaultDurations[type],
      createdAt: Date.now(),
      pauseOnHover: options.pauseOnHover ?? true,
    };

    // Если достигнут лимит уведомлений, добавляем в очередь
    if (this.notifications.length >= this.maxNotifications) {
      this.addToQueue(notification);
      this.logger.debug('Notification queued due to limit', { id, type, queueSize: this.notificationQueue.length });
    } else {
      this.addNotification(notification);
    }

    return id;
  }

  success(message: string, options?: NotificationOptions): string {
    return this.show('success', message, {
      duration: 5000,
      ...options
    });
  }

  error(message: string, options?: NotificationOptions): string {
    return this.show('error', message, {
      duration: 8000,
      dismissible: false,
      ...options
    });
  }

  warning(message: string, options?: NotificationOptions): string {
    return this.show('warning', message, {
      duration: 6000,
      ...options
    });
  }

  info(message: string, options?: NotificationOptions): string {
    return this.show('info', message, {
      duration: 4000,
      ...options
    });
  }

  dismiss(id: string): void {
    const index = this.notifications.findIndex(notification => notification.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
      this.processQueue(); // Проверяем очередь после удаления
      this.logger.debug('Notification dismissed', { id });
    }

    // Также удаляем из очереди если есть
    this.removeFromQueue(id);
  }

  dismissByType(type: NotificationType): void {
    const initialLength = this.notifications.length;
    this.notifications = this.notifications.filter(notification => notification.type !== type);

    if (this.notifications.length !== initialLength) {
      this.notifyListeners();
      this.processQueue();
      this.logger.debug('Notifications dismissed by type', { type, count: initialLength - this.notifications.length });
    }
  }

  clearAll(): void {
    this.notifications = [];
    this.notificationQueue = [];
    this.notifyListeners();
    this.logger.info('All notifications cleared');
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);

    // Immediately call with current state
    listener([...this.notifications]);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  getQueueLength(): number {
    return this.notificationQueue.length;
  }

  getStats() {
    return {
      active: this.notifications.length,
      queued: this.notificationQueue.length,
      types: this.notifications.reduce((acc, notification) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  pauseAutoDismiss(id: string): void {
    const queueItem = this.notificationQueue.find(item => item.notification.id === id);
    if (queueItem && queueItem.timer) {
      clearTimeout(queueItem.timer);
      queueItem.isPaused = true;
      this.logger.debug('Auto-dismiss paused', { id });
    }
  }

  resumeAutoDismiss(id: string): void {
    const queueItem = this.notificationQueue.find(item => item.notification.id === id);
    if (queueItem && queueItem.isPaused) {
      this.setupAutoDismiss(queueItem);
      queueItem.isPaused = false;
      this.logger.debug('Auto-dismiss resumed', { id });
    }
  }

  updateNotification(id: string, updates: Partial<Notification>): boolean {
    const index = this.notifications.findIndex(notification => notification.id === id);
    if (index > -1) {
      this.notifications[index] = { ...this.notifications[index], ...updates };
      this.notifyListeners();
      this.logger.debug('Notification updated', { id, updates });
      return true;
    }
    return false;
  }

  private generateId(): string {
    return `notification-${this.nextId++}-${Date.now()}`;
  }

  private addNotification(notification: Notification): void {
    this.notifications.push(notification);
    this.notifyListeners();

    // Set up auto-dismiss if duration is specified
    if (notification.duration && notification.duration > 0) {
      const queueItem: NotificationQueueItem = {
        notification,
        isPaused: false,
      };
      this.setupAutoDismiss(queueItem);
      this.notificationQueue.push(queueItem);
    }

    this.logger.info('Notification shown', {
      type: notification.type,
      id: notification.id,
      hasTitle: !!notification.title,
      duration: notification.duration
    });
  }

  private addToQueue(notification: Notification): void {
    this.notificationQueue.push({
      notification,
      isPaused: false,
    });
  }

  private removeFromQueue(id: string): void {
    const index = this.notificationQueue.findIndex(item => item.notification.id === id);
    if (index > -1) {
      const queueItem = this.notificationQueue[index];
      if (queueItem.timer) {
        clearTimeout(queueItem.timer);
      }
      this.notificationQueue.splice(index, 1);
    }
  }

  private setupAutoDismiss(queueItem: NotificationQueueItem): void {
    if (queueItem.timer) {
      clearTimeout(queueItem.timer);
    }

    queueItem.timer = window.setTimeout(() => {
      this.dismiss(queueItem.notification.id);
    }, queueItem.notification.duration);
  }

  private processQueue(): void {
    if (this.isQueueProcessing || this.notificationQueue.length === 0) {
      return;
    }

    this.isQueueProcessing = true;

    while (this.notifications.length < this.maxNotifications && this.notificationQueue.length > 0) {
      const queueItem = this.notificationQueue.shift();
      if (queueItem) {
        this.addNotification(queueItem.notification);
      }
    }

    this.isQueueProcessing = false;
  }

  private notifyListeners(): void {
    const notifications = this.getNotifications();
    this.listeners.forEach(listener => {
      try {
        listener(notifications);
      } catch (error) {
        this.logger.error('Error in notification listener:', error);
      }
    });
  }
}

export type { Notification, NotificationType, NotificationOptions };
export const notificationService: NotificationService = new NotificationServiceImpl();
