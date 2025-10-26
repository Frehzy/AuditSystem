// src/core/services/core/ui/notification.service.ts
import type { NotificationType, NotificationOptions, Notification, NotificationService } from '@/core/types/services';

/**
 * Сервис для управления уведомлениями
 */
class NotificationServiceImpl implements NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private subscribers: Set<(notifications: Notification[]) => void> = new Set();

  show(type: NotificationType, message: string, options?: NotificationOptions): string {
    const id = this.generateId();
    const notification: Notification = {
      id,
      type,
      message,
      title: options?.title,
      dismissible: options?.dismissible ?? true,
      duration: options?.duration ?? 5000,
      pauseOnHover: options?.pauseOnHover ?? true,
      createdAt: Date.now()
    };

    this.notifications.set(id, notification);
    this.notifySubscribers();

    // Автоматическое скрытие уведомления
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, notification.duration);
    }

    return id;
  }

  success(message: string, options?: NotificationOptions): string {
    return this.show('success', message, options);
  }

  error(message: string, options?: NotificationOptions): string {
    return this.show('error', message, options);
  }

  warning(message: string, options?: NotificationOptions): string {
    return this.show('warning', message, options);
  }

  info(message: string, options?: NotificationOptions): string {
    return this.show('info', message, options);
  }

  dismiss(id: string): void {
    this.notifications.delete(id);
    this.notifySubscribers();
  }

  dismissByType(type: NotificationType): void {
    for (const [id, notification] of this.notifications.entries()) {
      if (notification.type === type) {
        this.notifications.delete(id);
      }
    }
    this.notifySubscribers();
  }

  clearAll(): void {
    this.notifications.clear();
    this.notifySubscribers();
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  getNotifications(): Notification[] {
    return Array.from(this.notifications.values());
  }

  getStats(): { active: number; queued: number; types: Record<string, number> } {
    const types: Record<string, number> = {};

    for (const notification of this.notifications.values()) {
      types[notification.type] = (types[notification.type] || 0) + 1;
    }

    return {
      active: this.notifications.size,
      queued: 0,
      types
    };
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  private notifySubscribers(): void {
    const notifications = this.getNotifications();
    for (const subscriber of this.subscribers) {
      try {
        subscriber(notifications);
      } catch (error) {
        console.error('Error in notification subscriber:', error);
      }
    }
  }
}

// Экспортируем экземпляр сервиса
export const notificationService: NotificationService = new NotificationServiceImpl();
