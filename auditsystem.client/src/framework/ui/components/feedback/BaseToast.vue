// src/framework/ui/components/feedback/BaseToast.vue
<template>
  <teleport to="body">
    <transition-group name="toast-list" tag="div" class="base-toast-container">
      <div v-for="toast in toasts"
           :key="toast.id"
           :class="['base-toast', `base-toast--${toast.type}`]"
           role="alert"
           :aria-live="getAriaLive(toast.type)"
           :aria-atomic="true"
           @mouseenter="pauseToast(toast.id)"
           @mouseleave="resumeToast(toast.id)">
        <div class="base-toast__content">
          <div class="base-toast__icon">
            <component :is="getIconComponent(toast.type)" />
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
                  @click="handleDismissToast(toast.id)"
                  class="base-toast__close"
                  :aria-label="`Закрыть ${getToastTypeName(toast.type)} уведомление`">
            <CloseIcon />
          </button>
        </div>

        <!-- Прогресс-бар с улучшенной видимостью -->
        <div v-if="toast.duration && toast.duration > 0" class="base-toast__progress">
          <div class="base-toast__progress-bar"
               :style="getProgressBarStyle(toast)"
               :class="{ 'base-toast__progress-bar--paused': isToastPaused(toast.id) }"></div>
        </div>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed, defineAsyncComponent } from 'vue'
  import type { Component } from 'vue';
  import { notificationService } from '@/core/services/core/ui/notification.service';
  import type { Notification } from '@/core/types/services';

  // Асинхронные импорты иконок
  const SuccessIcon = defineAsyncComponent(() => import('@/assets/icons/status/SuccessIcon.vue'));
  const ErrorIcon = defineAsyncComponent(() => import('@/assets/icons/status/ErrorIcon.vue'));
  const WarningIcon = defineAsyncComponent(() => import('@/assets/icons/status/WarningIcon.vue'));
  const InfoIcon = defineAsyncComponent(() => import('@/assets/icons/status/InfoIcon.vue'));
  const CloseIcon = defineAsyncComponent(() => import('@/assets/icons/actions/CloseIcon.vue'));

  const toasts = ref<Notification[]>([]);
  const toastTimers = new Map<string, number>();
  const pausedToasts = new Map<string, number>();
  const progressIntervals = new Map<string, number>();
  const progressStates = ref<Map<string, number>>(new Map());

  // Подписка на изменения уведомлений
  const unsubscribe = notificationService.subscribe((notifications: Notification[]) => {
    toasts.value = notifications;

    // Управление таймерами для новых уведомлений
    notifications.forEach(notification => {
      if (!toastTimers.has(notification.id) && notification.duration && notification.duration > 0) {
        startToastTimer(notification.id, notification.duration);
        startProgressAnimation(notification.id, notification.duration);
      }
    });

    // Очистка таймеров для удаленных уведомлений
    const currentIds = new Set(notifications.map(n => n.id));
    toastTimers.forEach((timer, id) => {
      if (!currentIds.has(id)) {
        clearToastTimer(id);
        clearProgressInterval(id);
        progressStates.value.delete(id);
      }
    });
  });

  // Функция для получения компонента иконки по типу
  const getIconComponent = (type: Notification['type']): Component => {
    switch (type) {
      case 'success': return SuccessIcon;
      case 'error': return ErrorIcon;
      case 'warning': return WarningIcon;
      case 'info': return InfoIcon;
      default: return InfoIcon;
    }
  };

  const getToastTypeName = (type: Notification['type']): string => {
    switch (type) {
      case 'success': return 'успех';
      case 'error': return 'ошибка';
      case 'warning': return 'предупреждение';
      case 'info': return 'информация';
      default: return 'уведомление';
    }
  };

  const handleDismissToast = (id: string) => {
    clearToastTimer(id);
    clearProgressInterval(id);
    pausedToasts.delete(id);
    progressStates.value.delete(id);
    notificationService.dismiss(id);
  };

  const startToastTimer = (id: string, duration: number) => {
    const timer = window.setTimeout(() => {
      if (!pausedToasts.has(id)) {
        handleDismissToast(id);
      }
    }, duration);

    toastTimers.set(id, timer);
  };

  const clearToastTimer = (id: string) => {
    const timer = toastTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.delete(id);
    }
  };

  const startProgressAnimation = (id: string, duration: number) => {
    clearProgressInterval(id);

    const startTime = Date.now();
    progressStates.value.set(id, 100);

    const interval = window.setInterval(() => {
      if (!pausedToasts.has(id)) {
        const elapsed = Date.now() - startTime;
        const progress = Math.max(0, 100 - (elapsed / duration) * 100);

        progressStates.value.set(id, progress);

        if (progress <= 0) {
          clearProgressInterval(id);
        }
      }
    }, 50);

    progressIntervals.set(id, interval);
  };

  const clearProgressInterval = (id: string) => {
    const interval = progressIntervals.get(id);
    if (interval) {
      clearInterval(interval);
      progressIntervals.delete(id);
    }
  };

  const pauseToast = (id: string) => {
    const toast = toasts.value.find(t => t.id === id);
    if (toast && toast.duration) {
      const elapsed = Date.now() - toast.createdAt;
      const remainingTime = toast.duration - elapsed;

      if (remainingTime > 0) {
        pausedToasts.set(id, remainingTime);
        clearToastTimer(id);
        clearProgressInterval(id);
      }
    }
  };

  const resumeToast = (id: string) => {
    const remainingTime = pausedToasts.get(id);
    if (remainingTime && remainingTime > 0) {
      const toast = toasts.value.find(t => t.id === id);
      if (toast) {
        startToastTimer(id, remainingTime);
        startProgressAnimation(id, remainingTime);
      }
    }
    pausedToasts.delete(id);
  };

  const isToastPaused = (id: string): boolean => {
    return pausedToasts.has(id);
  };

  const getProgressBarStyle = (toast: Notification) => {
    if (!toast.duration || toast.duration <= 0) return { width: '0%' };

    const progress = progressStates.value.get(toast.id) || 100;

    return {
      width: `${progress}%`,
      transition: 'width 0.05s linear'
    };
  };

  const getAriaLive = (type: Notification['type']): 'assertive' | 'polite' => {
    return type === 'error' ? 'assertive' : 'polite';
  };

  // Очистка при размонтировании
  onUnmounted(() => {
    unsubscribe();

    toastTimers.forEach(timer => clearTimeout(timer));
    toastTimers.clear();

    progressIntervals.forEach(interval => clearInterval(interval));
    progressIntervals.clear();

    pausedToasts.clear();
    progressStates.value.clear();
  });
</script>

<style scoped>
  .base-toast-container {
    position: fixed;
    top: var(--spacing-xl, 20px);
    right: var(--spacing-xl, 20px);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 12px);
    max-width: 400px;
    width: calc(100vw - 40px);
  }

  .base-toast {
    background: var(--color-surface);
    border-radius: var(--radius-xl, 12px);
    box-shadow: var(--shadow-xl);
    overflow: hidden;
    animation: toast-in var(--transition-normal, 0.3s) ease;
    position: relative;
    border: 1px solid var(--color-border);
    backdrop-filter: blur(10px);
    transition: transform var(--transition-fast, 0.15s), box-shadow var(--transition-fast, 0.15s);
  }

    .base-toast:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-xl), 0 8px 25px -5px rgba(0, 0, 0, 0.15);
    }

  .base-toast__content {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm, 12px);
    padding: var(--spacing-lg, 16px);
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
    font-weight: var(--font-weight-semibold, 600);
    font-size: 14px;
    margin-bottom: var(--spacing-xs, 4px);
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
    cursor: pointer;
    padding: var(--spacing-xs, 4px);
    margin: calc(-1 * var(--spacing-xs, 4px));
    border-radius: var(--radius-sm, 4px);
    opacity: 0.7;
    transition: all var(--transition-fast, 0.15s) ease;
    flex-shrink: 0;
    line-height: 1;
    color: var(--color-text-muted);
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

    .base-toast__close:hover {
      opacity: 1;
      background: color-mix(in srgb, var(--color-primary) 8%, transparent);
      color: var(--color-primary);
    }

    .base-toast__close:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    .base-toast__close svg {
      width: 14px;
      height: 14px;
    }

  /* СТИЛИ ДЛЯ ПРОГРЕСС-БАРА С УЛУЧШЕННОЙ ВИДИМОСТЬЮ */
  .base-toast__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
    z-index: 3;
    overflow: hidden;
    border-radius: 0 0 var(--radius-xl, 12px) var(--radius-xl, 12px);
  }

  .base-toast__progress-bar {
    height: 100%;
    background: currentColor;
    opacity: 0.9;
    transition: width 0.05s linear;
    transform-origin: left center;
    border-radius: 0 var(--radius-sm, 2px) var(--radius-sm, 2px) 0;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  }

  .base-toast__progress-bar--paused {
    transition: none !important;
    animation: progress-pulse 1.5s infinite;
    opacity: 0.7;
  }

  /* Type variants с использованием цветов из theme.css */
  .base-toast--success {
    border-left: 4px solid var(--color-success);
    color: var(--color-success);
    background: color-mix(in srgb, var(--color-success) 4%, var(--color-surface));
  }

    .base-toast--success .base-toast__progress-bar {
      background: var(--color-success);
      opacity: 0.9;
    }

    .base-toast--success .base-toast__icon {
      color: var(--color-success);
    }

  .base-toast--error {
    border-left: 4px solid var(--color-error);
    color: var(--color-error);
    background: color-mix(in srgb, var(--color-error) 4%, var(--color-surface));
  }

    .base-toast--error .base-toast__progress-bar {
      background: var(--color-error);
      opacity: 0.9;
    }

    .base-toast--error .base-toast__icon {
      color: var(--color-error);
    }

  .base-toast--warning {
    border-left: 4px solid var(--color-warning);
    color: var(--color-warning);
    background: color-mix(in srgb, var(--color-warning) 4%, var(--color-surface));
  }

    .base-toast--warning .base-toast__progress-bar {
      background: var(--color-warning);
      opacity: 0.9;
    }

    .base-toast--warning .base-toast__icon {
      color: var(--color-warning);
    }

  .base-toast--info {
    border-left: 4px solid var(--color-info);
    color: var(--color-info);
    background: color-mix(in srgb, var(--color-info) 4%, var(--color-surface));
  }

    .base-toast--info .base-toast__progress-bar {
      background: var(--color-info);
      opacity: 0.9;
    }

    .base-toast--info .base-toast__icon {
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

  @keyframes progress-pulse {
    0% {
      opacity: 0.6;
    }

    50% {
      opacity: 0.9;
    }

    100% {
      opacity: 0.6;
    }
  }

  .toast-list-enter-active,
  .toast-list-leave-active {
    transition: all var(--transition-normal, 0.3s) ease;
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
    transition: transform var(--transition-normal, 0.3s) ease;
  }

  /* Адаптивность */
  @media (max-width: 640px) {
    .base-toast-container {
      top: var(--spacing-sm, 10px);
      right: var(--spacing-sm, 10px);
      left: var(--spacing-sm, 10px);
      width: auto;
      max-width: none;
    }

    .base-toast__content {
      padding: var(--spacing-md, 14px);
    }

    .base-toast__progress {
      height: 3px;
    }
  }

  @media (max-width: 480px) {
    .base-toast-container {
      gap: var(--spacing-xs, 8px);
    }

    .base-toast__content {
      gap: var(--spacing-sm, 10px);
      padding: var(--spacing-md, 12px);
    }

    .base-toast__message {
      font-size: 13px;
    }
  }

  /* Улучшенная видимость прогресс-бара в разных темах */
  .theme-light .base-toast__progress {
    background: color-mix(in srgb, var(--color-gray-900) 8%, transparent);
  }

  .theme-dark .base-toast__progress {
    background: color-mix(in srgb, var(--color-gray-100) 10%, transparent);
  }

  /* Accessibility improvements */
  @media (prefers-reduced-motion: reduce) {
    .base-toast {
      animation: none;
      transition: none;
    }

    .base-toast__progress-bar {
      transition: none;
    }

    .toast-list-enter-active,
    .toast-list-leave-active,
    .toast-list-move {
      transition: none;
    }
  }

  @media (prefers-contrast: high) {
    .base-toast {
      border-width: 2px;
    }

    .base-toast__progress-bar {
      opacity: 1;
    }
  }

  /* Focus styles for better accessibility */
  .base-toast:focus-within {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
</style>
