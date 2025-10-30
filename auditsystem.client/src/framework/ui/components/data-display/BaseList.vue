<!-- src/framework/ui/components/data-display/BaseList.vue -->
<template>
  <div class="base-list" :class="listClasses" role="list">
    <div v-for="(item, index) in items"
         :key="getItemKey(item, index)"
         class="base-list__item"
         :class="getItemClass(item)"
         role="listitem"
         tabindex="0"
         @keydown.enter="handleItemClick(item)"
         @keydown.space="handleItemClick(item)">

      <!-- Item content -->
      <div class="base-list__item-content" @click="handleItemClick(item)">
        <!-- Avatar/Icon -->
        <div v-if="$slots.avatar || item.avatar" class="base-list__avatar">
          <slot name="avatar" :item="item" :index="index">
            <BaseAvatar v-if="item.avatar" :src="item.avatar" :alt="item.title" size="sm" />
          </slot>
        </div>

        <!-- Main content -->
        <div class="base-list__content">
          <div class="base-list__title">
            <slot name="title" :item="item" :index="index">
              {{ item.title }}
            </slot>
          </div>
          <div v-if="item.description || $slots.description" class="base-list__description">
            <slot name="description" :item="item" :index="index">
              {{ item.description }}
            </slot>
          </div>
          <div v-if="item.meta || $slots.meta" class="base-list__meta">
            <slot name="meta" :item="item" :index="index">
              {{ item.meta }}
            </slot>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="$slots.actions || item.actions" class="base-list__actions">
          <slot name="actions" :item="item" :index="index">
            <BaseButton v-for="action in item.actions"
                        :key="action.label"
                        :variant="action.variant || 'ghost'"
                        :size="action.size || 'sm'"
                        @click.stop="handleAction(action, item)"
                        class="base-list__action">
              {{ action.label }}
            </BaseButton>
          </slot>
        </div>

        <!-- Selection indicator -->
        <div v-if="selectable" class="base-list__selection">
          <BaseCheckbox :model-value="isItemSelected(item)"
                        @update:model-value="toggleItemSelection(item)"
                        @click.stop />
        </div>
      </div>

      <!-- Divider -->
      <div v-if="index < items.length - 1 && divided" class="base-list__divider" />
    </div>

    <!-- Empty state -->
    <div v-if="items.length === 0" class="base-list__empty">
      <slot name="empty">
        <div class="base-list__empty-content">
          <InfoIcon :size="32" class="base-list__empty-icon" />
          <div class="base-list__empty-text">
            {{ emptyText }}
          </div>
          <BaseButton v-if="emptyAction"
                      @click="emptyAction.onClick"
                      :variant="emptyAction.variant || 'primary'"
                      size="sm"
                      class="base-list__empty-action">
            {{ emptyAction.label }}
          </BaseButton>
        </div>
      </slot>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="base-list__loading">
      <div class="base-list__loading-content">
        <div class="base-list__loading-spinner"></div>
        <div class="base-list__loading-text">{{ loadingText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { InfoIcon } from '@/assets/icons'
  import BaseAvatar from './BaseAvatar.vue'
  import BaseButton from '../buttons/BaseButton.vue'
  import BaseCheckbox from '../forms/BaseCheckbox.vue'

  interface ListItemAction {
    label: string
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    onClick?: (item: ListItem) => void
  }

  interface EmptyAction {
    label: string
    variant?: 'primary' | 'secondary' | 'ghost'
    onClick: () => void
  }

  interface ListItem {
    id?: string | number
    title: string
    description?: string
    meta?: string
    avatar?: string
    actions?: ListItemAction[]
    [key: string]: unknown
  }

  interface Props {
    items: ListItem[]
    divided?: boolean
    bordered?: boolean
    clickable?: boolean
    selectable?: boolean
    selectedItems?: (string | number)[]
    dense?: boolean
    loading?: boolean
    loadingText?: string
    emptyText?: string
    emptyAction?: EmptyAction
    itemKey?: string | ((item: ListItem, index: number) => string)
  }

  const props = withDefaults(defineProps<Props>(), {
    divided: false,
    bordered: false,
    clickable: false,
    selectable: false,
    selectedItems: () => [],
    dense: false,
    loading: false,
    loadingText: 'Загрузка...',
    emptyText: 'Нет элементов для отображения',
    itemKey: 'id',
  })

  const emit = defineEmits<{
    'item-click': [item: ListItem, index: number]
    'action-click': [action: ListItemAction, item: ListItem, index: number]
    'item-select': [item: ListItem, selected: boolean, index: number]
    'update:selectedItems': [selectedItems: (string | number)[]]
  }>()

  const listClasses = computed(() => [
    {
      'base-list--divided': props.divided,
      'base-list--bordered': props.bordered,
      'base-list--clickable': props.clickable,
      'base-list--selectable': props.selectable,
      'base-list--dense': props.dense,
      'base-list--loading': props.loading,
    },
  ])

  const getItemKey = (item: ListItem, index: number): string => {
    if (typeof props.itemKey === 'function') {
      return props.itemKey(item, index)
    }
    return String(item[props.itemKey] || `item-${index}`)
  }

  const getItemClass = (item: ListItem) => [
    {
      'base-list__item--clickable': props.clickable,
      'base-list__item--selected': props.selectable && isItemSelected(item),
    },
  ]

  const isItemSelected = (item: ListItem): boolean => {
    const key = getItemKey(item, props.items.indexOf(item))
    return props.selectedItems.includes(key)
  }

  const handleItemClick = (item: ListItem) => {
    if (props.clickable) {
      const index = props.items.indexOf(item)
      emit('item-click', item, index)
    }
  }

  const handleAction = (action: ListItemAction, item: ListItem) => {
    if (action.onClick) {
      action.onClick(item)
    }
    const index = props.items.indexOf(item)
    emit('action-click', action, item, index)
  }

  const toggleItemSelection = (item: ListItem) => {
    if (!props.selectable) return

    const key = getItemKey(item, props.items.indexOf(item))
    const index = props.selectedItems.indexOf(key)
    const newSelectedItems = [...props.selectedItems]

    if (index > -1) {
      newSelectedItems.splice(index, 1)
    } else {
      newSelectedItems.push(key)
    }

    const itemIndex = props.items.indexOf(item)
    emit('update:selectedItems', newSelectedItems)
    emit('item-select', item, index === -1, itemIndex)
  }
</script>

<style scoped>
  .base-list {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    overflow: hidden;
    position: relative;
    transition: all var(--transition-fast);
  }

  .base-list--bordered {
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
  }

    .base-list--bordered:hover {
      box-shadow: var(--shadow-md);
    }

  .base-list__item {
    transition: all var(--transition-fast);
    position: relative;
    background: var(--color-surface);
  }

  .base-list__item--clickable {
    cursor: pointer;
    outline: none;
  }

    .base-list__item--clickable:hover {
      background: var(--color-surface-hover);
    }

    .base-list__item--clickable:focus-visible {
      background: var(--color-surface-hover);
      box-shadow: var(--shadow-focus);
      z-index: 1;
    }

  .base-list__item--selected {
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);
    border-left: 3px solid var(--color-primary);
  }

  .base-list__item-content {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    position: relative;
    min-height: 4rem;
  }

  .base-list--dense .base-list__item-content {
    padding: var(--spacing-sm) var(--spacing-md);
    min-height: 3rem;
  }

  .base-list__avatar {
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .base-list__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .base-list__title {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    line-height: 1.4;
    font-size: 0.95rem;
  }

  .base-list--dense .base-list__title {
    font-size: 0.9rem;
  }

  .base-list__description {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .base-list__meta {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    line-height: 1.3;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .base-list__actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-left: auto;
  }

  .base-list__action {
    white-space: nowrap;
    transition: all var(--transition-fast);
  }

  .base-list__selection {
    flex-shrink: 0;
    margin-left: var(--spacing-md);
    display: flex;
    align-items: center;
  }

  .base-list__divider {
    height: 1px;
    background: var(--color-border);
    margin: 0 var(--spacing-md);
  }

  .base-list--divided .base-list__divider:last-child {
    display: none;
  }

  /* Empty state */
  .base-list__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-2xl);
    color: var(--color-text-muted);
    text-align: center;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
  }

  .base-list__empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    max-width: 300px;
  }

  .base-list__empty-icon {
    color: var(--color-text-muted);
    opacity: 0.4;
  }

  .base-list__empty-text {
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
  }

  .base-list__empty-action {
    margin-top: var(--spacing-sm);
  }

  /* Loading state */
  .base-list__loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: color-mix(in srgb, var(--color-surface) 90%, transparent);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: var(--radius-lg);
  }

  .base-list__loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }

  .base-list__loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid var(--color-border);
    border-top: 2px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .base-list__loading-text {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .base-list__item-content {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: stretch;
    }

    .base-list__actions {
      margin-left: 0;
      width: 100%;
      justify-content: flex-end;
      order: 3;
    }

    .base-list__selection {
      position: absolute;
      top: var(--spacing-md);
      right: var(--spacing-md);
      margin-left: 0;
    }

    .base-list--dense .base-list__selection {
      top: var(--spacing-sm);
      right: var(--spacing-sm);
    }

    .base-list__action {
      flex: 1;
      min-width: auto;
    }
  }

  @media (max-width: 480px) {
    .base-list__item-content {
      padding: var(--spacing-sm);
    }

    .base-list--dense .base-list__item-content {
      padding: var(--spacing-xs) var(--spacing-sm);
    }

    .base-list__actions {
      flex-direction: column;
    }

    .base-list__action {
      width: 100%;
    }
  }

  /* Accessibility improvements */
  @media (prefers-reduced-motion: reduce) {
    .base-list,
    .base-list__item,
    .base-list__action {
      transition: none;
    }

    .base-list__loading-spinner {
      animation: none;
      border-top-color: var(--color-primary);
    }
  }

  @media (prefers-contrast: high) {
    .base-list--bordered {
      border: 2px solid var(--color-text-primary);
    }

    .base-list__divider {
      height: 2px;
      background: var(--color-text-primary);
    }
  }
</style>
