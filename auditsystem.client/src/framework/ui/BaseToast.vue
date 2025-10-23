<template>
  <teleport to="body">
    <transition-group name="toast-list" tag="div" class="base-toast-container">
      <div v-for="toast in toasts"
           :key="toast.id"
           :class="['base-toast', `base-toast--${toast.type}`]"
           role="alert"
           :aria-live="toastTypeAriaLive(toast.type)"
           :aria-atomic="true">
        <div class="base-toast__content">
          <div class="base-toast__icon">
            <SuccessIcon v-if="toast.type === 'success'" />
            <ErrorIcon v-else-if="toast.type === 'error'" />
            <WarningIcon v-else-if="toast.type === 'warning'" />
            <InfoIcon v-else />
          </div>

          <div class="base-toast__body">
            <div class="base-toast__title" v-if="toast.title">
              {{ toast.title }}
            </div>
            <div class="base-toast__message">
              {{ toast.message }}
            </div>
          </div>

          <button v-if="toast.dismissible"
                  @click="dismissToast(toast.id)"
                  class="base-toast__close"
                  :aria-label="`Close ${toast.type} notification`">
            ×
          </button>
        </div>

        <div v-if="toast.duration && toast.duration > 0" class="base-toast__progress">
          <div class="base-toast__progress-bar"
               :style="progressBarStyle(toast)"></div>
        </div>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup lang="ts">
  import { ref, onUnmounted } from 'vue'
  import { notificationService } from '@/core/services/notification/notification.service';
  import { SuccessIcon, ErrorIcon, WarningIcon, InfoIcon } from '@/assets/icons';
  import type { Notification, NotificationType } from '@/core/services/types';

  const toasts = ref<Notification[]>([]);
  const toastTimers = new Map<string, number>();

  /**
   * Подписка на уведомления
   */
  const unsubscribe = notificationService.subscribe((notifications) => {
    toasts.value = notifications;

    // Управление таймерами для авто-скрытия
    notifications.forEach(toast => {
      if (toast.duration && toast.duration > 0 && !toastTimers.has(toast.id)) {
        const timer = window.setTimeout(() => {
          dismissToast(toast.id);
        }, toast.duration);

        toastTimers.set(toast.id, timer);
      }
    });
  });

  /**
   * Закрытие уведомления
   */
  const dismissToast = (id: string) => {
    // Очистка таймера
    const timer = toastTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.delete(id);
    }

    notificationService.dismiss(id);
  }

  /**
   * Очистка всех уведомлений
   */
  const clearAllToasts = () => {
    notificationService.clearAll();
    toastTimers.forEach(timer => clearTimeout(timer));
    toastTimers.clear();
  }

  /**
   * Расчет оставшегося времени
   */
  const calculateRemainingTime = (toast: Notification): number => {
    if (!toast.duration) return 0;
    const elapsed = Date.now() - toast.createdAt;
    return Math.max(0, toast.duration - elapsed);
  }

  /**
   * Стиль прогресс-бара
   */
  const progressBarStyle = (toast: Notification) => {
    if (!toast.duration) return {};

    const remainingTime = calculateRemainingTime(toast);
    const progress = (remainingTime / toast.duration) * 100;

    return {
      width: `${progress}%`,
      animationDuration: `${remainingTime}ms`,
    };
  }

  /**
   * ARIA live region для разных типов уведомлений
   */
  const toastTypeAriaLive = (type: NotificationType): 'assertive' | 'polite' => {
    return type === 'error' ? 'assertive' : 'polite';
  }

  // Публичный API для показа уведомлений
  const showToast = (type: NotificationType, message: string, options?: any) => {
    return notificationService.show(type, message, options);
  }

  const toast = {
    success: (message: string, options?: any) => notificationService.success(message, options),
    error: (message: string, options?: any) => notificationService.error(message, options),
    warning: (message: string, options?: any) => notificationService.warning(message, options),
    info: (message: string, options?: any) => notificationService.info(message, options),
  };

  // Очистка при размонтировании
  onUnmounted(() => {
    unsubscribe();
    clearAllToasts();
  });

  defineExpose({
    showToast,
    dismissToast,
    clearAllToasts,
    toast,
  });
</script>

<style scoped>
  .base-toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 400px;
    width: calc(100vw - 40px);
  }

  .base-toast {
    background: var(--color-surface);
    border-radius: 12px;
    box-shadow: var(--shadow-xl);
    overflow: hidden;
    animation: toast-in 0.3s ease;
    position: relative;
    border: 1px solid var(--color-border);
    backdrop-filter: blur(10px);
  }

  .base-toast__content {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    position: relative;
    z-index: 2;
  }

  .base-toast__icon {
    font-size: 18px;
    flex-shrink: 0;
    margin-top: 2px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .base-toast__body {
    flex: 1;
    min-width: 0;
  }

  .base-toast__title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
    line-height: 1.3;
    color: var(--color-text-primary);
  }

  .base-toast__message {
    font-size: 14px;
    line-height: 1.4;
    word-wrap: break-word;
    color: var(--color-text-secondary);
  }

  .base-toast__close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 4px;
    margin: -4px;
    border-radius: 4px;
    opacity: 0.7;
    transition: all var(--transition-fast);
    flex-shrink: 0;
    line-height: 1;
    color: var(--color-text-muted);
  }

    .base-toast__close:hover {
      opacity: 1;
      background: color-mix(in srgb, var(--color-primary) 8%, transparent);
      color: var(--color-primary);
    }

  .base-toast__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--color-border);
    z-index: 1;
  }

  .base-toast__progress-bar {
    height: 100%;
    background: currentColor;
    opacity: 0.6;
    animation: progress linear;
  }

  /* Type variants */
  .base-toast--success {
    border-left: 4px solid var(--color-success);
    color: var(--color-success);
  }

  .base-toast--error {
    border-left: 4px solid var(--color-error);
    color: var(--color-error);
  }

  .base-toast--warning {
    border-left: 4px solid var(--color-warning);
    color: var(--color-warning);
  }

  .base-toast--info {
    border-left: 4px solid var(--color-info);
    color: var(--color-info);
  }

  /* Animations */
  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateX(100%);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .toast-list-enter-active,
  .toast-list-leave-active {
    transition: all var(--transition-normal);
  }

  .toast-list-enter-from {
    opacity: 0;
    transform: translateX(100%);
  }

  .toast-list-leave-to {
    opacity: 0;
    transform: translateX(-100%);
  }

  .toast-list-move {
    transition: transform var(--transition-normal);
  }

  @keyframes progress {
    from {
      width: 100%;
    }

    to {
      width: 0%;
    }
  }

  /* Адаптивность */
  @media (max-width: 640px) {
    .base-toast-container {
      top: 10px;
      right: 10px;
      left: 10px;
      width: auto;
    }

    .base-toast__content {
      padding: 14px;
    }
  }

  @media (max-width: 480px) {
    .base-toast-container {
      gap: 8px;
    }

    .base-toast__content {
      gap: 10px;
      padding: 12px;
    }

    .base-toast__message {
      font-size: 13px;
    }
  }
</style>
