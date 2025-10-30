<!-- src/framework/ui/components/navigation/BaseBreadcrumb.vue -->
<template>
  <nav class="base-breadcrumb" aria-label="Хлебные крошки">
    <ol class="base-breadcrumb__list">
      <li v-for="(item, index) in displayItems"
          :key="getItemKey(item, index)"
          class="base-breadcrumb__item">

        <!-- Separator -->
        <span v-if="index > 0" class="base-breadcrumb__separator" aria-hidden="true">
          <ChevronRightIcon :size="16" />
        </span>

        <!-- Breadcrumb item -->
        <component :is="item.href ? 'a' : 'span'"
                   :href="item.href"
                   :class="getItemClass(item, index)"
                   :aria-current="index === displayItems.length - 1 ? 'page' : undefined"
                   @click="handleItemClick(item, index)">

          <!-- Icon -->
          <component v-if="item.icon"
                     :is="item.icon"
                     class="base-breadcrumb__icon"
                     :size="16" />

          <!-- Label -->
          <span class="base-breadcrumb__label">
            {{ item.label }}
          </span>
        </component>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { ChevronRightIcon } from '@/assets/icons'
  import type { Component } from 'vue';

  interface BreadcrumbItem {
    id?: string
    label: string
    href?: string
    icon?: Component
    disabled?: boolean
  }

  interface Props {
    items: BreadcrumbItem[]
    separator?: string
    maxItems?: number
    showHome?: boolean
    homeItem?: BreadcrumbItem
    variant?: 'default' | 'compact'
  }

  const props = withDefaults(defineProps<Props>(), {
    separator: '/',
    maxItems: 5,
    showHome: true,
    homeItem: () => ({
      label: 'Главная',
      href: '/',
      icon: undefined,
    }) as BreadcrumbItem,
    variant: 'default'
  })

  const emit = defineEmits<{
    'item-click': [item: BreadcrumbItem, index: number]
  }>()

  const displayItems = computed(() => {
    let items = [...props.items]

    // Add home item if enabled
    if (props.showHome && props.homeItem) {
      items = [props.homeItem, ...items]
    }

    // Limit items if maxItems is set
    if (props.maxItems && items.length > props.maxItems) {
      const firstItems = items.slice(0, 1)
      const lastItems = items.slice(-(props.maxItems - 2))
      const ellipsisItem: BreadcrumbItem = {
        label: '...',
        disabled: true,
      }

      return [...firstItems, ellipsisItem, ...lastItems]
    }

    return items
  })

  const getItemKey = (item: BreadcrumbItem, index: number): string => {
    return item.id || `breadcrumb-${index}`
  }

  const getItemClass = (item: BreadcrumbItem, index: number) => [
    'base-breadcrumb__link',
    `base-breadcrumb--${props.variant}`,
    {
      'base-breadcrumb__link--current': index === displayItems.value.length - 1,
      'base-breadcrumb__link--disabled': item.disabled,
      'base-breadcrumb__link--interactive': item.href && !item.disabled,
    },
  ]

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (!item.disabled && index !== displayItems.value.length - 1) {
      emit('item-click', item, index)
    }
  }
</script>

<style scoped>
  .base-breadcrumb {
    font-size: 0.875rem;
  }

  .base-breadcrumb__list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .base-breadcrumb__item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .base-breadcrumb__separator {
    display: flex;
    align-items: center;
    color: var(--color-text-muted);
    flex-shrink: 0;
    opacity: 0.7;
  }

  .base-breadcrumb__link {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    color: var(--color-text-secondary);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    cursor: pointer;
    background: var(--color-surface);
    border: 1px solid transparent;
    position: relative;
  }

  .base-breadcrumb__link--interactive {
    cursor: pointer;
  }

    .base-breadcrumb__link--interactive:hover {
      color: var(--color-primary);
      background: var(--color-surface-hover);
      border-color: var(--color-border);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    .base-breadcrumb__link--interactive:active {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }

    .base-breadcrumb__link--interactive:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
      box-shadow: var(--shadow-focus);
    }

  .base-breadcrumb__link--current {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold, 600);
    cursor: default;
    background: var(--color-primary-50);
    border-color: var(--color-primary-200);
  }

    .base-breadcrumb__link--current:hover {
      color: var(--color-text-primary);
      background: var(--color-primary-50);
      border-color: var(--color-primary-200);
      transform: none;
      box-shadow: none;
    }

  .base-breadcrumb__link--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--color-surface-hover);
  }

    .base-breadcrumb__link--disabled:hover {
      color: var(--color-text-secondary);
      background: var(--color-surface-hover);
      border-color: transparent;
      transform: none;
      box-shadow: none;
    }

  .base-breadcrumb__icon {
    flex-shrink: 0;
    color: var(--color-text-muted);
    transition: color var(--transition-fast);
  }

  .base-breadcrumb__link--interactive:hover .base-breadcrumb__icon {
    color: var(--color-primary);
  }

  .base-breadcrumb__link--current .base-breadcrumb__icon {
    color: var(--color-primary);
  }

  .base-breadcrumb__label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
    font-weight: var(--font-weight-medium, 500);
  }

  /* Compact variant */
  .base-breadcrumb--compact .base-breadcrumb__link {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.8125rem;
  }

  .base-breadcrumb--compact .base-breadcrumb__label {
    max-width: 150px;
  }

  /* Status indicators */
  .base-breadcrumb__link--success {
    border-left: 3px solid var(--color-success);
  }

  .base-breadcrumb__link--warning {
    border-left: 3px solid var(--color-warning);
  }

  .base-breadcrumb__link--error {
    border-left: 3px solid var(--color-error);
  }

  /* Animation for interactive states */
  @keyframes breadcrumb-pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary) 30%, transparent);
    }

    50% {
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 10%, transparent);
    }
  }

  .base-breadcrumb__link--interactive:focus {
    animation: breadcrumb-pulse 1.5s infinite;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .base-breadcrumb__label {
      max-width: 120px;
    }

    .base-breadcrumb__link {
      padding: var(--spacing-xs) var(--spacing-sm);
    }

    .base-breadcrumb--compact .base-breadcrumb__label {
      max-width: 100px;
    }
  }

  @media (max-width: 480px) {
    .base-breadcrumb__label {
      max-width: 80px;
    }

    .base-breadcrumb__icon {
      display: none;
    }

    .base-breadcrumb--compact .base-breadcrumb__label {
      max-width: 60px;
    }

    .base-breadcrumb__link {
      padding: var(--spacing-xs);
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .base-breadcrumb__link {
      border: 1px solid var(--color-text-primary);
    }

    .base-breadcrumb__link--current {
      border: 2px solid var(--color-text-primary);
    }

    .base-breadcrumb__link--interactive:hover {
      border: 2px solid var(--color-primary);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .base-breadcrumb__link {
      transition: none;
    }

    .base-breadcrumb__link--interactive:hover {
      transform: none;
    }

    .base-breadcrumb__link--interactive:focus {
      animation: none;
    }
  }

  /* Print styles */
  @media print {
    .base-breadcrumb__link {
      background: transparent;
      border: 1px solid var(--color-text-primary);
      color: var(--color-text-primary);
    }

    .base-breadcrumb__link--current {
      background: var(--color-gray-100);
    }

    .base-breadcrumb__separator {
      color: var(--color-text-primary);
    }
  }
</style>
