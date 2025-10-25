// src/framework/ui/types/notification.ts
/**
 * Типы для системы уведомлений
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  title?: string
  duration?: number
  dismissible: boolean
  action?: {
    label: string
    onClick: () => void
  }
  createdAt: number
}

export interface NotificationOptions {
  title?: string
  duration?: number
  dismissible?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}
