<template>
  <div class="tooltip-container" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
    <slot />
    <div v-if="showTooltip" class="tooltip" :class="[`tooltip--${position}`, { 'tooltip--visible': showTooltip }]">
      <span class="tooltip__content">{{ content }}</span>
      <div class="tooltip__arrow"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

withDefaults(defineProps<Props>(), {
  position: 'top'
});

const showTooltip = ref(false);
</script>

<style scoped>
  .tooltip-container {
    position: relative;
    display: inline-block;
  }

  .tooltip {
    position: absolute;
    z-index: 1000;
    padding: 8px 12px;
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    box-shadow: var(--shadow-lg);
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    transform: scale(0.95);
    transition: all var(--transition-fast);
    pointer-events: none;
  }

  .tooltip--visible {
    opacity: 1;
    transform: scale(1);
  }

  .tooltip--top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) scale(0.95);
    margin-bottom: 8px;
  }

    .tooltip--top.tooltip--visible {
      transform: translateX(-50%) scale(1);
    }

  .tooltip--bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%) scale(0.95);
    margin-top: 8px;
  }

    .tooltip--bottom.tooltip--visible {
      transform: translateX(-50%) scale(1);
    }

  .tooltip--left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%) scale(0.95);
    margin-right: 8px;
  }

    .tooltip--left.tooltip--visible {
      transform: translateY(-50%) scale(1);
    }

  .tooltip--right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%) scale(0.95);
    margin-left: 8px;
  }

    .tooltip--right.tooltip--visible {
      transform: translateY(-50%) scale(1);
    }

  .tooltip__content {
    color: var(--color-text-primary);
  }

  .tooltip__arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    transform: rotate(45deg);
  }

  .tooltip--top .tooltip__arrow {
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    border-top: none;
    border-left: none;
  }

  .tooltip--bottom .tooltip__arrow {
    top: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    border-bottom: none;
    border-right: none;
  }

  .tooltip--left .tooltip__arrow {
    right: -4px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
    border-left: none;
    border-bottom: none;
  }

  .tooltip--right .tooltip__arrow {
    left: -4px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
    border-right: none;
    border-top: none;
  }
</style>
