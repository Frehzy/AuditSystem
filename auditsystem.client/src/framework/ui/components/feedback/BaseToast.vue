<template>
  <teleport to="body">
    <transition-group name="toast-list" tag="div" class="base-toast-container">
      <div v-for="toast in toasts"
           :key="toast.id"
           :class="['base-toast', `base-toast--${toast.type}`]"
           role="alert"
           :aria-live="getAriaLive(toast.type)"
           :aria-atomic="true">
        <div class="base-toast__content">
          <div class="base-toast__icon">
            <!-- Исправлены пути к иконкам -->
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
                  :aria-label="`Close ${toast.type} notification`">
            ×
          </button>
        </div>

        <div v-if="toast.duration && toast.duration > 0" class="base-toast__progress">
          <div class="base-toast__progress-bar"
               :style="getProgressBarStyle(toast)"></div>
        </div>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup lang="ts">
  import { ref, onUnmounted, defineAsyncComponent } from 'vue'
  import type { Component } from 'vue';

  // Асинхронные импорты иконок для уменьшения размера бандла
  const SuccessIcon = defineAsyncComponent(() => import('@/assets/icons/status/SuccessIcon.vue'));
  const ErrorIcon = defineAsyncComponent(() => import('@/assets/icons/status/ErrorIcon.vue'));
  const WarningIcon = defineAsyncComponent(() => import('@/assets/icons/status/WarningIcon.vue'));
  const InfoIcon = defineAsyncComponent(() => import('@/assets/icons/status/InfoIcon.vue'));

  interface ToastOptions {
    title?: string
    duration?: number
    dismissible?: boolean
  }

  interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    title?: string;
    duration?: number;
    dismissible: boolean;
    createdAt: number;
  }

  const toasts = ref<Toast[]>([]);
  const toastTimers = new Map<string, number>();

  // Функция для получения компонента иконки по типу
  const getIconComponent = (type: Toast['type']): Component => {
    switch (type) {
      case 'success': return SuccessIcon;
      case 'error': return ErrorIcon;
      case 'warning': return WarningIcon;
      case 'info': return InfoIcon;
      default: return InfoIcon;
    }
  };

  const showToast = (type: Toast['type'], message: string, options?: ToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: Toast = {
      id,
      type,
      message,
      title: options?.title,
      duration: options?.duration || 5000,
      dismissible: options?.dismissible !== false,
      createdAt: Date.now()
    };

    toasts.value.push(toast);

    if (toast.duration && toast.duration > 0) {
      const timer = window.setTimeout(() => {
        handleDismissToast(toast.id);
      }, toast.duration);

      toastTimers.set(toast.id, timer);
    }

    return id;
  }

  const handleDismissToast = (id: string) => {
    const timer = toastTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.delete(id);
    }
    toasts.value = toasts.value.filter(toast => toast.id !== id);
  }

  const clearAllToasts = () => {
    toasts.value = [];
    toastTimers.forEach(timer => clearTimeout(timer));
    toastTimers.clear();
  }

  const getProgressBarStyle = (toast: Toast) => {
    if (!toast.duration) return {};

    const elapsed = Date.now() - toast.createdAt;
    const progress = Math.max(0, (toast.duration - elapsed) / toast.duration * 100);

    return {
      width: `${progress}%`,
    };
  }

  const getAriaLive = (type: Toast['type']): 'assertive' | 'polite' => {
    return type === 'error' ? 'assertive' : 'polite';
  }

  // Публичный API
  const toast = {
    success: (message: string, options?: ToastOptions) => showToast('success', message, options),
    error: (message: string, options?: ToastOptions) => showToast('error', message, options),
    warning: (message: string, options?: ToastOptions) => showToast('warning', message, options),
    info: (message: string, options?: ToastOptions) => showToast('info', message, options),
  };

  // Очистка при размонтировании
  onUnmounted(() => {
    clearAllToasts();
  });

  defineExpose({
    showToast,
    handleDismissToast,
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
    transition: all 0.2s ease;
    flex-shrink: 0;
    line-height: 1;
    color: var(--color-text-muted);
  }

    .base-toast__close:hover {
      opacity: 1;
      background: rgba(14, 165, 233, 0.08);
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
    transition: width 0.1s linear;
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
    transition: all 0.3s ease;
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
    transition: transform 0.3s ease;
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
