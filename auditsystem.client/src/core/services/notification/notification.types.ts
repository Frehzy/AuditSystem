/**
 * Типы для системы уведомлений
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration: number;
  createdAt: Date;
  visible: boolean;
  progress: number;
  paused: boolean;
  dismissible: boolean;
}

export interface NotificationOptions {
  title?: string;
  duration?: number;
  persistent?: boolean; // Не исчезает автоматически
  closable?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface NotificationAction {
  label: string;
  handler: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}
