<template>
  <div class="base-timeline" :class="computedClasses">
    <div v-for="(item, index) in items"
         :key="getItemKey(item, index)"
         class="base-timeline__item"
         :class="getComputedItemClass(item, index)">

      <!-- Timeline connector -->
      <div v-if="index < items.length - 1" class="base-timeline__connector" />

      <!-- Timeline dot -->
      <div class="base-timeline__dot">
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
  }

  const props = withDefaults(defineProps<Props>(), {
    alternate: false,
    size: 'md',
  })

  const computedClasses = computed(() => [
    'base-timeline',
    `base-timeline--${props.size}`,
    {
      'base-timeline--alternate': props.alternate,
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
    },
  ]
</script>

<style scoped>
  .base-timeline {
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .base-timeline__item {
    display: flex;
    position: relative;
    margin-bottom: var(--space-xl);
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

  .base-timeline__connector {
    position: absolute;
    top: 24px;
    left: 11px;
    bottom: -24px;
    width: 2px;
    background: var(--color-border);
    z-index: 1;
  }

  .base-timeline--alternate .base-timeline__connector {
    left: 50%;
    transform: translateX(-50%);
  }

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
  }

  .base-timeline__item--success .base-timeline__dot {
    border-color: var(--color-success);
    color: var(--color-success);
  }

  .base-timeline__item--error .base-timeline__dot {
    border-color: var(--color-error);
    color: var(--color-error);
  }

  .base-timeline__item--warning .base-timeline__dot {
    border-color: var(--color-warning);
    color: var(--color-warning);
  }

  .base-timeline__item--info .base-timeline__dot {
    border-color: var(--color-info);
    color: var(--color-info);
  }

  .base-timeline__dot-inner {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    background: var(--color-border);
  }

  .base-timeline__item--success .base-timeline__dot-inner {
    background: var(--color-success);
  }

  .base-timeline__item--error .base-timeline__dot-inner {
    background: var(--color-error);
  }

  .base-timeline__item--warning .base-timeline__dot-inner {
    background: var(--color-warning);
  }

  .base-timeline__item--info .base-timeline__dot-inner {
    background: var(--color-info);
  }

  .base-timeline__icon {
    color: inherit;
  }

  .base-timeline__content {
    flex: 1;
    margin-left: var(--space-xl);
    padding-top: 2px;
  }

  .base-timeline__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-xs);
  }

  .base-timeline__title {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    line-height: 1.4;
  }

  .base-timeline__time {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    white-space: nowrap;
    margin-left: var(--space-md);
  }

  .base-timeline__description {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
    margin-bottom: var(--space-sm);
  }

  .base-timeline__body {
    color: var(--color-text-secondary);
    line-height: 1.5;
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
  }
</style>
