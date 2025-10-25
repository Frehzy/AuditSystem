<template>
  <div class="base-card" :class="computedClasses" :style="computedStyle">
    <!-- Header -->
    <div v-if="$slots.header || title" class="base-card__header">
      <slot name="header">
        <div class="base-card__title">
          <h3 v-if="title">{{ title }}</h3>
          <p v-if="subtitle" class="base-card__subtitle">{{ subtitle }}</p>
        </div>
      </slot>

      <div v-if="$slots.actions" class="base-card__actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- Media -->
    <div v-if="$slots.media" class="base-card__media">
      <slot name="media" />
    </div>

    <!-- Content -->
    <div class="base-card__content">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    title?: string
    subtitle?: string
    variant?: 'elevated' | 'outlined' | 'filled'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    hoverable?: boolean
    clickable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'elevated',
    padding: 'md',
    hoverable: false,
    clickable: false,
  })

  const computedClasses = computed(() => [
    'base-card',
    `base-card--${props.variant}`,
    `base-card--padding-${props.padding}`,
    {
      'base-card--hoverable': props.hoverable,
      'base-card--clickable': props.clickable,
    },
  ])

  const computedStyle = computed(() => ({
    cursor: props.clickable ? 'pointer' : 'default',
  }))
</script>

<style scoped>
  .base-card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: all var(--transition-normal);
  }

  /* Variants */
  .base-card--elevated {
    box-shadow: var(--shadow-md);
    border: 1px solid transparent;
  }

  .base-card--outlined {
    box-shadow: none;
    border: 1px solid var(--color-border);
  }

  .base-card--filled {
    box-shadow: none;
    border: 1px solid transparent;
    background: var(--color-background-card);
  }

  /* Hover effects */
  .base-card--hoverable:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .base-card--clickable {
    cursor: pointer;
  }

    .base-card--clickable:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
    }

    .base-card--clickable:active {
      transform: translateY(0);
    }

  /* Header */
  .base-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-md);
  }

  .base-card__title h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    line-height: 1.3;
  }

  .base-card__subtitle {
    margin: var(--space-xs) 0 0 0;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    line-height: 1.4;
  }

  .base-card__actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  /* Media */
  .base-card__media {
    overflow: hidden;
  }

    .base-card__media ::v-deep(img) {
      width: 100%;
      height: auto;
      display: block;
    }

  /* Content */
  .base-card__content {
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

    .base-card__content ::v-deep(p) {
      margin: 0 0 var(--space-md) 0;
    }

    .base-card__content ::v-deep(p:last-child) {
      margin-bottom: 0;
    }

  /* Footer */
  .base-card__footer {
    border-top: 1px solid var(--color-border);
    background: var(--color-background);
  }

  /* Padding variants */
  .base-card--padding-none .base-card__header,
  .base-card--padding-none .base-card__content,
  .base-card--padding-none .base-card__footer {
    padding: 0;
  }

  .base-card--padding-sm .base-card__header,
  .base-card--padding-sm .base-card__content,
  .base-card--padding-sm .base-card__footer {
    padding: var(--space-md);
  }

  .base-card--padding-md .base-card__header,
  .base-card--padding-md .base-card__content,
  .base-card--padding-md .base-card__footer {
    padding: var(--space-lg);
  }

  .base-card--padding-lg .base-card__header,
  .base-card--padding-lg .base-card__content,
  .base-card--padding-lg .base-card__footer {
    padding: var(--space-xl);
  }

  /* Media padding adjustments */
  .base-card--padding-sm .base-card__media + .base-card__content {
    padding-top: var(--space-md);
  }

  .base-card--padding-md .base-card__media + .base-card__content {
    padding-top: var(--space-lg);
  }

  .base-card--padding-lg .base-card__media + .base-card__content {
    padding-top: var(--space-xl);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .base-card__header {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-sm);
    }

    .base-card__actions {
      justify-content: flex-end;
    }
  }
</style>
