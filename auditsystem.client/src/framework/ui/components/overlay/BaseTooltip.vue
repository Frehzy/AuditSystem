<!-- src/framework/ui/components/overlay/BaseTooltip.vue -->
<template>
  <div class="base-tooltip"
       @mouseenter="showTooltip = true"
       @mouseleave="showTooltip = false"
       @focusin="showTooltip = true"
       @focusout="showTooltip = false">

    <slot />

    <transition name="tooltip">
      <div v-if="showTooltip"
           class="base-tooltip__content"
           :class="[`base-tooltip--${position}`, `base-tooltip--${size}`]"
           role="tooltip">

        <span class="base-tooltip__text">{{ content }}</span>
        <div class="base-tooltip__arrow" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  interface Props {
    content: string
    position?: 'top' | 'bottom' | 'left' | 'right'
    size?: 'sm' | 'md' | 'lg'
    delay?: number
  }

  withDefaults(defineProps<Props>(), {
    position: 'top',
    size: 'md',
    delay: 0,
  })

  const showTooltip = ref(false)
</script>

<style scoped>
  .base-tooltip {
    position: relative;
    display: inline-block;
  }

  .base-tooltip__content {
    position: absolute;
    z-index: var(--z-tooltip);
    padding: var(--space-sm) var(--space-md);
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
    pointer-events: none;
  }

  .base-tooltip__text {
    color: var(--color-text-primary);
  }

  .base-tooltip__arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    transform: rotate(45deg);
  }

  /* Position variants */
  .base-tooltip--top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 8px;
  }

    .base-tooltip--top .base-tooltip__arrow {
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      border-top: none;
      border-left: none;
    }

  .base-tooltip--bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 8px;
  }

    .base-tooltip--bottom .base-tooltip__arrow {
      top: -4px;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      border-bottom: none;
      border-right: none;
    }

  .base-tooltip--left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: 8px;
  }

    .base-tooltip--left .base-tooltip__arrow {
      right: -4px;
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
      border-left: none;
      border-bottom: none;
    }

  .base-tooltip--right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 8px;
  }

    .base-tooltip--right .base-tooltip__arrow {
      left: -4px;
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
      border-right: none;
      border-top: none;
    }

  /* Size variants */
  .base-tooltip--sm {
    padding: var(--space-xs) var(--space-sm);
    font-size: 0.6875rem;
  }

  .base-tooltip--lg {
    padding: var(--space-md) var(--space-lg);
    font-size: 0.875rem;
    white-space: normal;
    max-width: 200px;
  }

  /* Animations */
  .tooltip-enter-active,
  .tooltip-leave-active {
    transition: all var(--transition-fast);
  }

  .tooltip-enter-from,
  .tooltip-leave-to {
    opacity: 0;
    transform: scale(0.95);
  }

  .tooltip-enter-to,
  .tooltip-leave-from {
    opacity: 1;
    transform: scale(1);
  }

  /* Position-specific animations */
  .base-tooltip--top.tooltip-enter-from {
    transform: translateX(-50%) translateY(4px);
  }

  .base-tooltip--bottom.tooltip-enter-from {
    transform: translateX(-50%) translateY(-4px);
  }

  .base-tooltip--left.tooltip-enter-from {
    transform: translateY(-50%) translateX(4px);
  }

  .base-tooltip--right.tooltip-enter-from {
    transform: translateY(-50%) translateX(-4px);
  }
</style>
