<template>
  <div class="base-card" :class="computedClasses" :style="computedStyle">
    <!-- Header -->
    <div v-if="$slots.header || title || $slots.actions" class="base-card__header">
      <slot name="header">
        <div v-if="title || subtitle" class="base-card__title">
          <h3 v-if="title" class="base-card__title-text">{{ title }}</h3>
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
    variant?: 'elevated' | 'outlined' | 'filled' | 'ghost'
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    hoverable?: boolean
    clickable?: boolean
    bordered?: boolean
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'elevated',
    padding: 'md',
    hoverable: false,
    clickable: false,
    bordered: true,
    shadow: 'md'
  })

  const computedClasses = computed(() => [
    `base-card--${props.variant}`,
    `base-card--padding-${props.padding}`,
    `base-card--shadow-${props.shadow}`,
    {
      'base-card--hoverable': props.hoverable,
      'base-card--clickable': props.clickable,
      'base-card--bordered': props.bordered,
      'base-card--has-media': Boolean(props.$slots.media),
      'base-card--has-footer': Boolean(props.$slots.footer),
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
    position: relative;
  }

  /* Variants */
  .base-card--elevated {
    background: var(--color-surface);
    border: 1px solid var(--color-border-card);
  }

  .base-card--outlined {
    background: transparent;
    border: 1px solid var(--color-border);
  }

  .base-card--filled {
    background: var(--color-background-card);
    border: 1px solid transparent;
  }

  .base-card--ghost {
    background: transparent;
    border: 1px solid transparent;
  }

  /* Border control */
  .base-card--bordered {
    border-width: 1px;
    border-style: solid;
  }

  .base-card--ghost.base-card--bordered,
  .base-card--outlined.base-card--bordered {
    border-color: var(--color-border);
  }

  .base-card--elevated.base-card--bordered {
    border-color: var(--color-border-card);
  }

  .base-card--filled.base-card--bordered {
    border-color: var(--color-border-card);
  }

  /* Shadow variants */
  .base-card--shadow-none {
    box-shadow: none;
  }

  .base-card--shadow-sm {
    box-shadow: var(--shadow-sm);
  }

  .base-card--shadow-md {
    box-shadow: var(--shadow-md);
  }

  .base-card--shadow-lg {
    box-shadow: var(--shadow-lg);
  }

  .base-card--shadow-xl {
    box-shadow: var(--shadow-xl);
  }

  /* Interactive states */
  .base-card--hoverable:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary-light);
  }

  .base-card--clickable {
    cursor: pointer;
    transition: all var(--transition-fast);
  }

    .base-card--clickable:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
      border-color: var(--color-primary);
    }

    .base-card--clickable:active {
      transform: translateY(0);
      box-shadow: var(--shadow-md);
      transition-duration: var(--transition-fast);
    }

    .base-card--clickable:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
      box-shadow: var(--shadow-focus);
    }

  /* Header */
  .base-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-md);
    background: var(--color-surface);
  }

  .base-card__title {
    flex: 1;
    min-width: 0;
  }

  .base-card__title-text {
    margin: 0;
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
    line-height: 1.4;
  }

  .base-card__subtitle {
    margin: var(--spacing-xs) 0 0 0;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    line-height: 1.4;
  }

  .base-card__actions {
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  /* Media */
  .base-card__media {
    overflow: hidden;
    background: var(--color-surface-hover);
  }

    .base-card__media ::v-deep(img) {
      width: 100%;
      height: auto;
      display: block;
    }

    .base-card__media ::v-deep(svg) {
      width: 100%;
      height: auto;
      display: block;
    }

  /* Content */
  .base-card__content {
    color: var(--color-text-secondary);
    line-height: 1.5;
    background: var(--color-surface);
  }

    .base-card__content ::v-deep(p) {
      margin: 0 0 var(--spacing-md) 0;
      font-size: 0.875rem;
    }

    .base-card__content ::v-deep(p:last-child) {
      margin-bottom: 0;
    }

    .base-card__content ::v-deep(.form-control) {
      margin-bottom: var(--spacing-md);
    }

    .base-card__content ::v-deep(.form-control:last-child) {
      margin-bottom: 0;
    }

  /* Footer */
  .base-card__footer {
    background: var(--color-surface-hover);
    border-top: 1px solid var(--color-border);
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
    padding: var(--spacing-md);
  }

  .base-card--padding-md .base-card__header,
  .base-card--padding-md .base-card__content,
  .base-card--padding-md .base-card__footer {
    padding: var(--spacing-lg);
  }

  .base-card--padding-lg .base-card__header,
  .base-card--padding-lg .base-card__content,
  .base-card--padding-lg .base-card__footer {
    padding: var(--spacing-xl);
  }

  .base-card--padding-xl .base-card__header,
  .base-card--padding-xl .base-card__content,
  .base-card--padding-xl .base-card__footer {
    padding: var(--spacing-2xl);
  }

  /* Media padding adjustments */
  .base-card--padding-sm .base-card__media + .base-card__content {
    padding-top: var(--spacing-md);
  }

  .base-card--padding-md .base-card__media + .base-card__content {
    padding-top: var(--spacing-lg);
  }

  .base-card--padding-lg .base-card__media + .base-card__content {
    padding-top: var(--spacing-xl);
  }

  .base-card--padding-xl .base-card__media + .base-card__content {
    padding-top: var(--spacing-2xl);
  }

  /* Header + Media adjustments */
  .base-card--padding-sm .base-card__header + .base-card__media {
    margin-top: var(--spacing-md);
  }

  .base-card--padding-md .base-card__header + .base-card__media {
    margin-top: var(--spacing-lg);
  }

  .base-card--padding-lg .base-card__header + .base-card__media {
    margin-top: var(--spacing-xl);
  }

  .base-card--padding-xl .base-card__header + .base-card__media {
    margin-top: var(--spacing-2xl);
  }

  /* Content + Footer adjustments */
  .base-card--padding-sm .base-card__content + .base-card__footer {
    margin-top: var(--spacing-md);
  }

  .base-card--padding-md .base-card__content + .base-card__footer {
    margin-top: var(--spacing-lg);
  }

  .base-card--padding-lg .base-card__content + .base-card__footer {
    margin-top: var(--spacing-xl);
  }

  .base-card--padding-xl .base-card__content + .base-card__footer {
    margin-top: var(--spacing-2xl);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .base-card__header {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-sm);
    }

    .base-card__actions {
      justify-content: flex-start;
    }

    .base-card--clickable:hover {
      transform: none;
    }

    .base-card--hoverable:hover {
      transform: none;
    }
  }

  @media (max-width: 640px) {
    .base-card--padding-lg .base-card__header,
    .base-card--padding-lg .base-card__content,
    .base-card--padding-lg .base-card__footer {
      padding: var(--spacing-lg);
    }

    .base-card--padding-xl .base-card__header,
    .base-card--padding-xl .base-card__content,
    .base-card--padding-xl .base-card__footer {
      padding: var(--spacing-xl);
    }
  }

  @media (max-width: 480px) {
    .base-card--padding-md .base-card__header,
    .base-card--padding-md .base-card__content,
    .base-card--padding-md .base-card__footer {
      padding: var(--spacing-md);
    }

    .base-card--padding-lg .base-card__header,
    .base-card--padding-lg .base-card__content,
    .base-card--padding-lg .base-card__footer {
      padding: var(--spacing-md);
    }

    .base-card--padding-xl .base-card__header,
    .base-card--padding-xl .base-card__content,
    .base-card--padding-xl .base-card__footer {
      padding: var(--spacing-lg);
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .base-card {
      border-width: 2px;
    }

    .base-card--clickable:focus-visible {
      outline-width: 3px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .base-card {
      transition: none;
    }

    .base-card--hoverable:hover,
    .base-card--clickable:hover,
    .base-card--clickable:active {
      transform: none;
    }
  }

  /* Print styles */
  @media print {
    .base-card {
      background: white !important;
      color: black !important;
      border: 1px solid #000 !important;
      box-shadow: none !important;
    }

    .base-card--hoverable,
    .base-card--clickable {
      transform: none !important;
    }
  }
</style>
