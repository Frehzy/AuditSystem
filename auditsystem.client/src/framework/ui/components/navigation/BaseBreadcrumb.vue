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
    {
      'base-breadcrumb__link--current': index === displayItems.value.length - 1,
      'base-breadcrumb__link--disabled': item.disabled,
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
    gap: var(--space-xs);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .base-breadcrumb__item {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .base-breadcrumb__separator {
    display: flex;
    align-items: center;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .base-breadcrumb__link {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    color: var(--color-text-secondary);
    text-decoration: none;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    cursor: pointer;
  }

    .base-breadcrumb__link:hover {
      color: var(--color-primary);
      background: var(--color-surface-hover);
    }

  .base-breadcrumb__link--current {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
    cursor: default;
  }

    .base-breadcrumb__link--current:hover {
      color: var(--color-text-primary);
      background: none;
    }

  .base-breadcrumb__link--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

    .base-breadcrumb__link--disabled:hover {
      color: var(--color-text-secondary);
      background: none;
    }

  .base-breadcrumb__icon {
    flex-shrink: 0;
    color: var(--color-text-muted);
  }

  .base-breadcrumb__link:hover .base-breadcrumb__icon {
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
  }

  /* Compact variant */
  .base-breadcrumb--compact .base-breadcrumb__link {
    padding: 0.25rem 0.5rem;
  }

  .base-breadcrumb--compact .base-breadcrumb__label {
    max-width: 150px;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .base-breadcrumb__label {
      max-width: 120px;
    }

    .base-breadcrumb__link {
      padding: 0.25rem 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .base-breadcrumb__label {
      max-width: 80px;
    }

    .base-breadcrumb__icon {
      display: none;
    }
  }
</style>
