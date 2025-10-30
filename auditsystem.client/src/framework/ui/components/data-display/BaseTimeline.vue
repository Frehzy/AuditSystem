<template>
  <div class="base-timeline" :class="computedClasses">
    <div v-for="(item, index) in items"
         :key="getItemKey(item, index)"
         class="base-timeline__item"
         :class="getComputedItemClass(item, index)">

      <!-- Timeline connector -->
      <div v-if="index < items.length - 1"
           class="base-timeline__connector"
           :class="`base-timeline__connector--${item.status || 'default'}`" />

      <!-- Timeline dot -->
      <div class="base-timeline__dot" :class="`base-timeline__dot--${item.status || 'default'}`">
        <component v-if="item.icon"
                   :is="item.icon"
                   class="base-timeline__icon"
                   :size="16" />
        <div v-else class="base-timeline__dot-inner" />
      </div>

      <!-- Timeline content -->
      <div class="base-timeline__content">
        <div class="base-timeline__header">
          <div class="base-timeline__title">
            {{ item.title }}
          </div>
          <div v-if="item.time" class="base-timeline__time">
            {{ item.time }}
          </div>
        </div>

        <div v-if="item.description" class="base-timeline__description">
          {{ item.description }}
        </div>

        <div v-if="item.content" class="base-timeline__body">
          <slot :name="`content-${index}`" :item="item" :index="index">
            {{ item.content }}
          </slot>
        </div>

        <!-- Additional content slot -->
        <slot v-if="$slots[`extra-${index}`]"
              :name="`extra-${index}`"
              :item="item"
              :index="index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { Component } from 'vue';

  interface TimelineItem {
    id?: string
    title: string
    description?: string
    content?: string
    time?: string
    icon?: Component
    status?: 'default' | 'success' | 'error' | 'warning' | 'info'
  }

  interface Props {
    items: TimelineItem[]
    alternate?: boolean
    size?: 'sm' | 'md' | 'lg'
    compact?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    alternate: false,
    size: 'md',
    compact: false,
  })

  const computedClasses = computed(() => [
    'base-timeline',
    `base-timeline--${props.size}`,
    {
      'base-timeline--alternate': props.alternate,
      'base-timeline--compact': props.compact,
    },
  ])

  const getItemKey = (item: TimelineItem, index: number): string => {
    return item.id || `timeline-item-${index}`
  }

  const getComputedItemClass = (item: TimelineItem, index: number) => [
    'base-timeline__item',
    `base-timeline__item--${item.status || 'default'}`,
    {
      'base-timeline__item--alternate': props.alternate && index % 2 === 1,
      'base-timeline__item--last': index === props.items.length - 1,
    },
  ]
</script>

<style scoped>
  .base-timeline {
    display: flex;
    flex-direction: column;
    position: relative;
    gap: 0;
  }

  .base-timeline__item {
    display: flex;
    position: relative;
    margin-bottom: var(--space-xl);
    transition: all var(--transition-fast);
  }

  .base-timeline--compact .base-timeline__item {
    margin-bottom: var(--space-lg);
  }

  .base-timeline--alternate .base-timeline__item {
    flex-direction: row;
  }

  .base-timeline--alternate .base-timeline__item--alternate {
    flex-direction: row-reverse;
  }

    .base-timeline--alternate .base-timeline__item--alternate .base-timeline__content {
      text-align: right;
      margin-right: var(--space-xl);
      margin-left: 0;
    }

  /* Connector Styles */
  .base-timeline__connector {
    position: absolute;
    top: 24px;
    left: 11px;
    bottom: -24px;
    width: 2px;
    background: var(--color-border);
    z-index: 1;
    transition: all var(--transition-fast);
  }

  .base-timeline--compact .base-timeline__connector {
    top: 20px;
    bottom: -20px;
  }

  .base-timeline--alternate .base-timeline__connector {
    left: 50%;
    transform: translateX(-50%);
  }

  .base-timeline__item--last .base-timeline__connector {
    display: none;
  }

  /* Status-based connector colors */
  .base-timeline__connector--success {
    background: var(--color-success-light);
  }

  .base-timeline__connector--error {
    background: var(--color-error-light);
  }

  .base-timeline__connector--warning {
    background: var(--color-warning-light);
  }

  .base-timeline__connector--info {
    background: var(--color-info-light);
  }

  /* Dot Styles */
  .base-timeline__dot {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-full);
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    z-index: 2;
    flex-shrink: 0;
    transition: all var(--transition-fast);
    box-shadow: var(--shadow-sm);
  }

  .base-timeline--compact .base-timeline__dot {
    width: 20px;
    height: 20px;
  }

  .base-timeline__dot:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-md);
  }

  /* Status-based dot styles */
  .base-timeline__dot--success {
    border-color: var(--color-success);
    background: var(--color-success-light);
    color: var(--color-success);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-success) 15%, transparent);
  }

  .base-timeline__dot--error {
    border-color: var(--color-error);
    background: var(--color-error-light);
    color: var(--color-error);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-error) 15%, transparent);
  }

  .base-timeline__dot--warning {
    border-color: var(--color-warning);
    background: var(--color-warning-light);
    color: var(--color-warning);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-warning) 15%, transparent);
  }

  .base-timeline__dot--info {
    border-color: var(--color-info);
    background: var(--color-info-light);
    color: var(--color-info);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-info) 15%, transparent);
  }

  .base-timeline__dot-inner {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    background: var(--color-border);
    transition: all var(--transition-fast);
  }

  .base-timeline--compact .base-timeline__dot-inner {
    width: 6px;
    height: 6px;
  }

  .base-timeline__dot--success .base-timeline__dot-inner {
    background: var(--color-success);
  }

  .base-timeline__dot--error .base-timeline__dot-inner {
    background: var(--color-error);
  }

  .base-timeline__dot--warning .base-timeline__dot-inner {
    background: var(--color-warning);
  }

  .base-timeline__dot--info .base-timeline__dot-inner {
    background: var(--color-info);
  }

  .base-timeline__icon {
    color: inherit;
    transition: transform var(--transition-fast);
  }

  .base-timeline__dot:hover .base-timeline__icon {
    transform: scale(1.1);
  }

  /* Content Styles */
  .base-timeline__content {
    flex: 1;
    margin-left: var(--space-xl);
    padding-top: 2px;
    transition: all var(--transition-fast);
  }

  .base-timeline--compact .base-timeline__content {
    margin-left: var(--space-lg);
  }

  .base-timeline__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-xs);
    gap: var(--space-md);
  }

  .base-timeline__title {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    line-height: 1.4;
    font-size: 1rem;
  }

  .base-timeline--compact .base-timeline__title {
    font-size: 0.9rem;
  }

  .base-timeline__time {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    white-space: nowrap;
    background: var(--color-surface-hover);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    font-weight: var(--font-weight-medium);
  }

  .base-timeline--compact .base-timeline__time {
    font-size: 0.8rem;
    padding: var(--space-xs) var(--space-sm);
  }

  .base-timeline__description {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
    margin-bottom: var(--space-sm);
  }

  .base-timeline--compact .base-timeline__description {
    font-size: 0.8rem;
    margin-bottom: var(--space-xs);
  }

  .base-timeline__body {
    color: var(--color-text-secondary);
    line-height: 1.5;
    background: var(--color-surface-hover);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-light);
  }

  .base-timeline--compact .base-timeline__body {
    padding: var(--space-sm);
    font-size: 0.875rem;
  }

  /* Sizes */
  .base-timeline--sm .base-timeline__item {
    margin-bottom: var(--space-lg);
  }

  .base-timeline--sm .base-timeline__dot {
    width: 20px;
    height: 20px;
  }

  .base-timeline--sm .base-timeline__connector {
    top: 20px;
    left: 9px;
  }

  .base-timeline--sm .base-timeline__content {
    margin-left: var(--space-lg);
  }

  .base-timeline--sm .base-timeline__title {
    font-size: 0.9rem;
  }

  .base-timeline--sm .base-timeline__description {
    font-size: 0.8rem;
  }

  .base-timeline--lg .base-timeline__item {
    margin-bottom: var(--space-2xl);
  }

  .base-timeline--lg .base-timeline__dot {
    width: 28px;
    height: 28px;
  }

  .base-timeline--lg .base-timeline__connector {
    top: 28px;
    left: 13px;
  }

  .base-timeline--lg .base-timeline__content {
    margin-left: var(--space-2xl);
  }

  .base-timeline--lg .base-timeline__title {
    font-size: 1.125rem;
  }

  .base-timeline--lg .base-timeline__description {
    font-size: 1rem;
  }

  /* Animation for new items */
  .base-timeline__item {
    animation: slideInUp 0.3s ease-out;
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .base-timeline--alternate .base-timeline__item {
      flex-direction: row;
    }

    .base-timeline--alternate .base-timeline__item--alternate .base-timeline__content {
      text-align: left;
      margin-right: 0;
      margin-left: var(--space-xl);
    }

    .base-timeline--alternate .base-timeline__connector {
      left: 11px;
    }

    .base-timeline__header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-xs);
    }

    .base-timeline__time {
      margin-left: 0;
    }

    .base-timeline__content {
      margin-left: var(--space-lg);
    }

    .base-timeline--lg .base-timeline__content {
      margin-left: var(--space-xl);
    }
  }

  @media (max-width: 480px) {
    .base-timeline__item {
      margin-bottom: var(--space-lg);
    }

    .base-timeline__content {
      margin-left: var(--space-md);
    }

    .base-timeline__dot {
      width: 20px;
      height: 20px;
    }

    .base-timeline__connector {
      top: 20px;
      left: 9px;
    }

    .base-timeline__title {
      font-size: 0.9rem;
    }

    .base-timeline__description {
      font-size: 0.8rem;
    }
  }

  /* Dark theme specific adjustments */
  .theme-dark .base-timeline__body {
    background: var(--color-surface-hover-dark);
    border-color: var(--color-border-dark);
  }

  .theme-dark .base-timeline__time {
    background: var(--color-surface-hover-dark);
  }

  /* Focus styles for accessibility */
  .base-timeline__item:focus-within {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-radius: var(--radius-md);
  }

  /* Print styles */
  @media print {
    .base-timeline__connector {
      background: var(--color-gray-300) !important;
    }

    .base-timeline__dot {
      border-color: var(--color-gray-500) !important;
      background: white !important;
    }

    .base-timeline__dot-inner {
      background: var(--color-gray-500) !important;
    }
  }
</style>
