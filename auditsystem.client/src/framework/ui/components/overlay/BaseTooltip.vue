<!-- src/framework/ui/components/overlay/BaseTooltip.vue -->
<template>
  <div class="base-tooltip"
       @mouseenter="handleMouseEnter"
       @mouseleave="handleMouseLeave"
       @focusin="handleFocusIn"
       @focusout="handleFocusOut">

    <slot />

    <transition :name="transitionName" :duration="transitionDuration">
      <div v-if="showTooltip"
           class="base-tooltip__content"
           :class="[`base-tooltip--${position}`, `base-tooltip--${size}`]"
           role="tooltip"
           :style="contentStyles">

        <span class="base-tooltip__text">{{ content }}</span>
        <div class="base-tooltip__arrow" :style="arrowStyles" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onUnmounted } from 'vue'

  interface Props {
    content: string
    position?: 'top' | 'bottom' | 'left' | 'right'
    size?: 'sm' | 'md' | 'lg'
    delay?: number
    maxWidth?: number
    showArrow?: boolean
  }

  withDefaults(defineProps<Props>(), {
    position: 'top',
    size: 'md',
    delay: 0,
    maxWidth: 300,
    showArrow: true
  })

  const showTooltip = ref(false)
  let timeoutId: number | null = null

  // Computed properties for dynamic styling
  const transitionName = computed(() => `tooltip-${props.position}`)
  const transitionDuration = computed(() => props.delay > 0 ? props.delay + 150 : 150)

  const contentStyles = computed(() => ({
    maxWidth: `${props.maxWidth}px`
  }))

  const arrowStyles = computed(() => ({
    display: props.showArrow ? 'block' : 'none'
  }))

  // Event handlers with delay support
  const handleMouseEnter = () => {
    if (props.delay > 0) {
      timeoutId = window.setTimeout(() => {
        showTooltip.value = true
      }, props.delay)
    } else {
      showTooltip.value = true
    }
  }

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    showTooltip.value = false
  }

  const handleFocusIn = () => {
    handleMouseEnter()
  }

  const handleFocusOut = () => {
    handleMouseLeave()
  }

  // Cleanup
  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })
</script>

<style scoped>
  .base-tooltip {
    position: relative;
    display: inline-block;
  }

  .base-tooltip__content {
    position: absolute;
    z-index: var(--z-tooltip, 9999);
    padding: var(--space-sm, 0.75rem) var(--space-md, 1rem);
    background: var(--color-surface-elevated, var(--color-surface));
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-lg, 0.5rem);
    box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium, 500);
    line-height: 1.4;
    white-space: normal;
    pointer-events: none;
    backdrop-filter: blur(8px);
    animation: tooltip-appear 0.2s ease-out;
  }

  .base-tooltip__text {
    color: var(--color-text-primary, #1e293b);
    word-wrap: break-word;
  }

  .base-tooltip__arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--color-surface-elevated, var(--color-surface));
    border: 1px solid var(--color-border, #e2e8f0);
    transform: rotate(45deg);
    z-index: 1;
  }

  /* Position variants */
  .base-tooltip--top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 10px;
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
    margin-top: 10px;
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
    margin-right: 10px;
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
    margin-left: 10px;
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
    padding: var(--space-xs, 0.5rem) var(--space-sm, 0.75rem);
    font-size: 0.75rem;
    border-radius: var(--radius-md, 0.375rem);
  }

  .base-tooltip--lg {
    padding: var(--space-md, 1rem) var(--space-lg, 1.25rem);
    font-size: 0.875rem;
    border-radius: var(--radius-xl, 0.75rem);
    max-width: 400px;
  }

  /* Animations */
  @keyframes tooltip-appear {
    from {
      opacity: 0;
      transform: scale(0.95) translateX(-50%);
    }

    to {
      opacity: 1;
      transform: scale(1) translateX(-50%);
    }
  }

  .tooltip-top-enter-active,
  .tooltip-top-leave-active,
  .tooltip-bottom-enter-active,
  .tooltip-bottom-leave-active,
  .tooltip-left-enter-active,
  .tooltip-left-leave-active,
  .tooltip-right-enter-active,
  .tooltip-right-leave-active {
    transition: all var(--transition-fast, 0.15s) ease-out;
  }

  .tooltip-top-enter-from,
  .tooltip-top-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(8px) scale(0.95);
  }

  .tooltip-top-enter-to,
  .tooltip-top-leave-from {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }

  .tooltip-bottom-enter-from,
  .tooltip-bottom-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px) scale(0.95);
  }

  .tooltip-bottom-enter-to,
  .tooltip-bottom-leave-from {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }

  .tooltip-left-enter-from,
  .tooltip-left-leave-to {
    opacity: 0;
    transform: translateY(-50%) translateX(8px) scale(0.95);
  }

  .tooltip-left-enter-to,
  .tooltip-left-leave-from {
    opacity: 1;
    transform: translateY(-50%) translateX(0) scale(1);
  }

  .tooltip-right-enter-from,
  .tooltip-right-leave-to {
    opacity: 0;
    transform: translateY(-50%) translateX(-8px) scale(0.95);
  }

  .tooltip-right-enter-to,
  .tooltip-right-leave-from {
    opacity: 1;
    transform: translateY(-50%) translateX(0) scale(1);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .base-tooltip__content {
      max-width: 250px;
      font-size: 0.75rem;
    }

    .base-tooltip--lg {
      max-width: 280px;
      padding: var(--space-sm, 0.75rem) var(--space-md, 1rem);
    }
  }

  @media (max-width: 480px) {
    .base-tooltip__content {
      max-width: 200px;
    }

    .base-tooltip--lg {
      max-width: 220px;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .base-tooltip__content {
      border: 2px solid var(--color-text-primary, #1e293b);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    }

    .base-tooltip__arrow {
      border: 2px solid var(--color-text-primary, #1e293b);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .tooltip-top-enter-active,
    .tooltip-top-leave-active,
    .tooltip-bottom-enter-active,
    .tooltip-bottom-leave-active,
    .tooltip-left-enter-active,
    .tooltip-left-leave-active,
    .tooltip-right-enter-active,
    .tooltip-right-leave-active {
      transition: opacity 0.1s ease;
    }

    .tooltip-top-enter-from,
    .tooltip-top-leave-to,
    .tooltip-bottom-enter-from,
    .tooltip-bottom-leave-to,
    .tooltip-left-enter-from,
    .tooltip-left-leave-to,
    .tooltip-right-enter-from,
    .tooltip-right-leave-to {
      transform: none;
    }
  }
</style>
