// src/framework/ui/composables/useToast.ts
import { inject, provide } from 'vue'

export interface ToastOptions {
  title?: string
  duration?: number
  dismissible?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
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

export interface ToastApi {
  show: (type: Toast['type'], message: string, options?: ToastOptions) => string
  success: (message: string, options?: ToastOptions) => string
  error: (message: string, options?: ToastOptions) => string
  warning: (message: string, options?: ToastOptions) => string
  info: (message: string, options?: ToastOptions) => string
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
    throw new Error('Toast provider not found. Please wrap your app with ToastProvider.')
  }

  return api
}

/**
 * Провайдер для системы уведомлений
 */
export function provideToast(api: ToastApi): void {
  provide(ToastSymbol, api)
}
