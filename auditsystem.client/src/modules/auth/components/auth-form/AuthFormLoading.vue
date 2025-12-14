<!-- src/modules/auth/components/auth-form/AuthFormLoading.vue -->
<template>
  <div :class="['auth-loading', { 'auth-loading--fullscreen': fullscreen }]">
    <div class="auth-loading__spinner">
      <LoadingSpinner />
    </div>

    <div v-if="message" class="auth-loading__message">
      {{ message }}
    </div>

    <div v-if="progress !== undefined" class="auth-loading__progress">
      <div class="auth-loading__progress-bar">
        <div class="auth-loading__progress-fill"
             :style="{ width: `${progress}%` }"></div>
      </div>
      <div v-if="progressText" class="auth-loading__progress-text">
        {{ progressText }}
      </div>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
  import { LoadingSpinner } from '@/assets/icons';

  interface Props {
    message?: string;
    progress?: number;
    progressText?: string;
    fullscreen?: boolean;
  }

  withDefaults(defineProps<Props>(), {
    progress: undefined,
    fullscreen: false,
  });
</script>

<style scoped>
  .auth-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-xl);
  }

  .auth-loading--fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-background);
    z-index: 1000;
  }

  .auth-loading__spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    animation: spin 1s linear infinite;
  }

    .auth-loading__spinner svg {
      width: 3rem;
      height: 3rem;
      color: var(--color-primary);
    }

  .auth-loading__message {
    font-size: 1rem;
    color: var(--color-text-primary);
    text-align: center;
    max-width: 20rem;
  }

  .auth-loading__progress {
    width: 100%;
    max-width: 16rem;
  }

  .auth-loading__progress-bar {
    height: 0.5rem;
    background: var(--color-border);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .auth-loading__progress-fill {
    height: 100%;
    background: var(--gradient-primary);
    border-radius: var(--radius-full);
    transition: width var(--transition-normal);
  }

  .auth-loading__progress-text {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    text-align: center;
    margin-top: var(--spacing-xs);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
</style>
