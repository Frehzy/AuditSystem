/**
 * Сервис управления уведомлениями
 */

import { APP_CONFIG } from '@/core/config/app.config';
import { logger } from '@/core/services/logger/logger.service';
import type {
  Notification,
  NotificationType,
  NotificationOptions
} from './notification.types';

export class NotificationService {
  private notifications: Notification[] = [];
  private maxVisible = APP_CONFIG.NOTIFICATION.MAX_VISIBLE;
  private defaultDuration = APP_CONFIG.NOTIFICATION.DEFAULT_DURATION;
  private position = APP_CONFIG.NOTIFICATION.POSITION;
  private timers = new Map<string, number>();
  private listeners: ((notifications: Notification[]) => void)[] = [];

  constructor() {
    logger.info('Notification service initialized');
  }

  private createId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private createNotification(
    type: NotificationType,
    message: string,
    options: NotificationOptions = {}
  ): Notification {
    return {
      id: this.createId(),
      type,
      title: options.title,
      message,
      duration: options.duration || this.defaultDuration,
      createdAt: new Date(),
      visible: true,
      progress: 100,
      paused: false,
      dismissible: options.closable !== false
    };
  }

  private addNotification(notification: Notification): void {
    // Удаляем старые уведомления если превышен лимит
    if (this.notifications.length >= this.maxVisible) {
      const oldest = this.notifications.shift();
      if (oldest) {
        this.clearTimer(oldest.id);
      }
    }

    this.notifications.push(notification);

    // Запускаем таймер если уведомление не персистентное
    if (!notification.paused && notification.duration > 0) {
      this.startTimer(notification);
    }

    this.notifyListeners();

    logger.debug('Notification added', {
      id: notification.id,
      type: notification.type,
      message: notification.message
    });
  }

  private startTimer(notification: Notification): void {
    if (notification.paused || notification.duration <= 0) return;

    const startTime = Date.now();
    const totalDuration = notification.duration;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalDuration - elapsed);
      const progress = Math.max(0, Math.min(100, (remaining / totalDuration) * 100));

      const notifIndex = this.notifications.findIndex(n => n.id === notification.id);
      if (notifIndex !== -1) {
        this.notifications[notifIndex].progress = progress;
        this.notifyListeners();
      }

      if (remaining <= 0) {
        this.removeNotification(notification.id);
      }
    };

    // Обновляем прогресс каждые 100мс
    const progressInterval = setInterval(updateProgress, 100);

    // Таймер для удаления
    const removeTimer = setTimeout(() => {
      clearInterval(progressInterval);
      this.removeNotification(notification.id);
    }, notification.duration);

    this.timers.set(notification.id, removeTimer as unknown as number);
    this.timers.set(`${notification.id}_progress`, progressInterval as unknown as number);
  }

  private pauseTimer(notificationId: string): void {
    const timer = this.timers.get(notificationId);
    const progressTimer = this.timers.get(`${notificationId}_progress`);

    if (timer) {
      clearTimeout(timer);
      this.timers.delete(notificationId);
    }

    if (progressTimer) {
      clearInterval(progressTimer);
      this.timers.delete(`${notificationId}_progress`);
    }

    const notifIndex = this.notifications.findIndex(n => n.id === notificationId);
    if (notifIndex !== -1) {
      this.notifications[notifIndex].paused = true;
      this.notifyListeners();
    }
  }

  private resumeTimer(notification: Notification): void {
    if (!notification.paused) return;

    const notifIndex = this.notifications.findIndex(n => n.id === notification.id);
    if (notifIndex !== -1) {
      this.notifications[notifIndex].paused = false;
      this.startTimer(notification);
      this.notifyListeners();
    }
  }

  private clearTimer(notificationId: string): void {
    this.pauseTimer(notificationId);
  }

  success(message: string, options?: NotificationOptions): string {
    const notification = this.createNotification('success', message, options);
    this.addNotification(notification);
    return notification.id;
  }

  error(message: string, options?: NotificationOptions): string {
    const notification = this.createNotification('error', message, options);
    this.addNotification(notification);
    return notification.id;
  }

  warning(message: string, options?: NotificationOptions): string {
    const notification = this.createNotification('warning', message, options);
    this.addNotification(notification);
    return notification.id;
  }

  info(message: string, options?: NotificationOptions): string {
    const notification = this.createNotification('info', message, options);
    this.addNotification(notification);
    return notification.id;
  }

  removeNotification(id: string): void {
    this.clearTimer(id);

    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();

      logger.debug('Notification removed', { id });
    }
  }

  clearAll(): void {
    // Очищаем все таймеры
    this.timers.forEach((timer, id) => {
      if (id.includes('_progress')) {
        clearInterval(timer);
      } else {
        clearTimeout(timer);
      }
    });

    this.timers.clear();
    this.notifications = [];
    this.notifyListeners();

    logger.debug('All notifications cleared');
  }

  pauseNotification(id: string): void {
    this.pauseTimer(id);
  }

  resumeNotification(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      this.resumeTimer(notification);
    }
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);

    // Возвращаем функцию отписки
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    const notifications = this.getNotifications();
    this.listeners.forEach(listener => {
      try {
        listener(notifications);
      } catch (error) {
        logger.error('Notification listener error', { error });
      }
    });
  }

  setPosition(position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'): void {
    this.position = position;
    logger.info('Notification position changed', { position });
  }

  setMaxVisible(max: number): void {
    this.maxVisible = max;

    // Удаляем лишние уведомления
    if (this.notifications.length > max) {
      const toRemove = this.notifications.slice(0, this.notifications.length - max);
      toRemove.forEach(notif => this.removeNotification(notif.id));
    }
  }

  setDefaultDuration(duration: number): void {
    this.defaultDuration = duration;
  }
}

// Экспортируем синглтон
export const notificationService = new NotificationService();
