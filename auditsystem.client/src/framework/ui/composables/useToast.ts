// src/framework/ui/composables/useToast.ts
import { inject, provide } from 'vue'
import { notificationService } from '@/core/services/core/ui/notification.service';
import type { NotificationType, NotificationOptions } from '@/core/types/services';

export interface ToastApi {
  show: (type: NotificationType, message: string, options?: NotificationOptions) => string
  showToast: (options: { type: NotificationType; message: string; title?: string; duration?: number }) => string // ИЗМЕНЕНО: принимает объект
  success: (message: string, options?: NotificationOptions) => string
  error: (message: string, options?: NotificationOptions) => string
  warning: (message: string, options?: NotificationOptions) => string
  info: (message: string, options?: NotificationOptions) => string
  dismiss: (id: string) => void
  clearAll: () => void
}

const ToastSymbol = Symbol('toast')

/**
 * Композабл для работы с уведомлениями
 * 
 * @example
 * const toast = useToast()
 * toast.success('Операция выполнена успешно!')
 */
export function useToast(): ToastApi {
  const api = inject(ToastSymbol) as ToastApi

  if (!api) {
    // Fallback to direct notification service if provider not found
    return {
      show: (type: NotificationType, message: string, options?: NotificationOptions) =>
        notificationService.show(type, message, options),
      showToast: (options: { type: NotificationType; message: string; title?: string; duration?: number }) => // ИЗМЕНЕНО
        notificationService.show(options.type, options.message, {
          title: options.title,
          duration: options.duration
        }),
      success: (message: string, options?: NotificationOptions) =>
        notificationService.success(message, options),
      error: (message: string, options?: NotificationOptions) =>
        notificationService.error(message, options),
      warning: (message: string, options?: NotificationOptions) =>
        notificationService.warning(message, options),
      info: (message: string, options?: NotificationOptions) =>
        notificationService.info(message, options),
      dismiss: (id: string) => notificationService.dismiss(id),
      clearAll: () => notificationService.clearAll()
    };
  }

  return api
}

/**
 * Провайдер для системы уведомлений
 */
export function provideToast(api: ToastApi): void {
  provide(ToastSymbol, api)
}

/**
 * Создание API для уведомлений на основе notificationService
 */
export function createToastApi(): ToastApi {
  return {
    show: (type: NotificationType, message: string, options?: NotificationOptions) =>
      notificationService.show(type, message, options),
    showToast: (options: { type: NotificationType; message: string; title?: string; duration?: number }) => // ИЗМЕНЕНО
      notificationService.show(options.type, options.message, {
        title: options.title,
        duration: options.duration
      }),
    success: (message: string, options?: NotificationOptions) =>
      notificationService.success(message, options),
    error: (message: string, options?: NotificationOptions) =>
      notificationService.error(message, options),
    warning: (message: string, options?: NotificationOptions) =>
      notificationService.warning(message, options),
    info: (message: string, options?: NotificationOptions) =>
      notificationService.info(message, options),
    dismiss: (id: string) => notificationService.dismiss(id),
    clearAll: () => notificationService.clearAll()
  };
}
