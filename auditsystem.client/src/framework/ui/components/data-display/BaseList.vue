<!-- src/framework/ui/components/data-display/BaseList.vue -->
<template>
  <div class="base-list" :class="listClasses" role="list">
    <div v-for="(item, index) in items"
         :key="getItemKey(item, index)"
         class="base-list__item"
         :class="getItemClass(item)"
         role="listitem">
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
          <div v-if="item.description" class="base-list__description">
            <slot name="description" :item="item" :index="index">
              {{ item.description }}
            </slot>
          </div>
          <div v-if="item.meta" class="base-list__meta">
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
                        @click="handleAction(action, item)"
                        class="base-list__action">
              {{ action.label }}
            </BaseButton>
          </slot>
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
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { InfoIcon } from '@/assets/icons'
  import BaseAvatar from './BaseAvatar.vue'
  import BaseButton from '../buttons/BaseButton.vue'

  interface ListItemAction {
    label: string
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    onClick?: (item: ListItem) => void
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
    dense?: boolean
    emptyText?: string
    itemKey?: string | ((item: ListItem, index: number) => string)
  }

  const props = withDefaults(defineProps<Props>(), {
    divided: false,
    bordered: false,
    clickable: false,
    dense: false,
    emptyText: 'Нет элементов для отображения',
    itemKey: 'id',
  })

  const emit = defineEmits<{
    'item-click': [item: ListItem, index: number]
    'action-click': [action: ListItemAction, item: ListItem, index: number]
  }>()

  const listClasses = computed(() => [
    'base-list',
    {
      'base-list--divided': props.divided,
      'base-list--bordered': props.bordered,
      'base-list--clickable': props.clickable,
      'base-list--dense': props.dense,
    },
  ])

  const getItemKey = (item: ListItem, index: number): string => {
    if (typeof props.itemKey === 'function') {
      return props.itemKey(item, index)
    }
    return String(item[props.itemKey] || `item-${index}`)
  }

  const getItemClass = () => [
    'base-list__item',
    {
      'base-list__item--clickable': props.clickable,
    },
  ]

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
</script>

<style scoped>
  .base-list {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .base-list--bordered {
    border: 1px solid var(--color-border);
  }

  .base-list__item {
    transition: background-color var(--transition-fast);
  }

  .base-list__item--clickable {
    cursor: pointer;
  }

    .base-list__item--clickable:hover {
      background: var(--color-surface-hover);
    }

  .base-list__item-content {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-md);
  }

  .base-list--dense .base-list__item-content {
    padding: var(--space-sm) var(--space-md);
  }

  .base-list__avatar {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .base-list__content {
    flex: 1;
    min-width: 0;
  }

  .base-list__title {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    line-height: 1.4;
    margin-bottom: var(--space-xs);
  }

  .base-list__description {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
    margin-bottom: var(--space-xs);
  }

  .base-list__meta {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    line-height: 1.3;
  }

  .base-list__actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    margin-left: auto;
  }

  .base-list__action {
    white-space: nowrap;
  }

  .base-list__divider {
    height: 1px;
    background: var(--color-border);
    margin: 0 var(--space-md);
  }

  .base-list--divided .base-list__divider:last-child {
    display: none;
  }

  /* Empty state */
  .base-list__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-2xl);
    color: var(--color-text-muted);
    text-align: center;
  }

  .base-list__empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    max-width: 300px;
  }

  .base-list__empty-icon {
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  .base-list__empty-text {
    font-size: 0.875rem;
    line-height: 1.5;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .base-list__item-content {
      flex-direction: column;
      gap: var(--space-sm);
    }

    .base-list__actions {
      margin-left: 0;
      width: 100%;
      justify-content: flex-end;
    }

    .base-list__action {
      flex: 1;
    }
  }
</style>
