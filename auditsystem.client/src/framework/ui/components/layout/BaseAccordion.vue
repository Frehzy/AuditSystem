<template>
  <div class="base-accordion" :class="computedClasses">
    <div v-for="(item, index) in items"
         :key="getItemKey(item, index)"
         class="base-accordion__item"
         :class="getComputedItemClass(item, index)">

      <!-- Accordion header -->
      <button :id="`accordion-${getItemKey(item, index)}`"
              @click="handleToggleItem(getItemKey(item, index))"
              class="base-accordion__header"
              :aria-expanded="isItemOpen(getItemKey(item, index))"
              :aria-controls="`accordion-content-${getItemKey(item, index)}`"
              :disabled="item.disabled">

        <!-- Header content -->
        <div class="base-accordion__header-content">
          <!-- Icon -->
          <component v-if="item.icon"
                     :is="item.icon"
                     class="base-accordion__icon"
                     :size="20" />

          <!-- Title and description -->
          <div class="base-accordion__text">
            <div class="base-accordion__title">
              {{ item.title }}
            </div>
            <div v-if="item.description" class="base-accordion__description">
              {{ item.description }}
            </div>
          </div>
        </div>

        <!-- Chevron icon -->
        <div class="base-accordion__chevron" :class="{ 'base-accordion__chevron--open': isItemOpen(getItemKey(item, index)) }">
          <ChevronDownIcon :size="16" />
        </div>
      </button>

      <!-- Accordion content -->
      <div :id="`accordion-content-${getItemKey(item, index)}`"
           class="base-accordion__content"
           :aria-labelledby="`accordion-${getItemKey(item, index)}`"
           :hidden="!isItemOpen(getItemKey(item, index))">

        <div class="base-accordion__content-inner">
          <slot :name="getItemKey(item, index)" :item="item" :index="index">
            <div v-if="item.content" v-html="item.content" />
            <component v-else-if="item.component" :is="item.component" v-bind="item.props" />
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import ChevronDownIcon from '@/assets/icons/arrows/ChevronDownIcon.vue'
  import type { Component } from 'vue';

  interface AccordionItem {
    id?: string
    title: string
    description?: string
    icon?: Component
    content?: string
    component?: Component
    props?: Record<string, unknown>
    disabled?: boolean
    defaultOpen?: boolean
  }

  interface Props {
    items: AccordionItem[]
    variant?: 'default' | 'bordered' | 'separated' | 'card'
    multiple?: boolean
    size?: 'sm' | 'md' | 'lg'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    multiple: false,
    size: 'md',
  })

  const emit = defineEmits<{
    'item-toggle': [itemId: string, isOpen: boolean]
    'item-open': [itemId: string]
    'item-close': [itemId: string]
  }>()

  const openItems = ref<Set<string>>(new Set())

  // Initialize default open items
  props.items.forEach((item, index) => {
    if (item.defaultOpen) {
      const itemId = getItemKey(item, index)
      openItems.value.add(itemId)
    }
  })

  const computedClasses = computed(() => [
    'base-accordion',
    `base-accordion--${props.variant}`,
    `base-accordion--${props.size}`,
  ])

  const getItemKey = (item: AccordionItem, index: number): string => {
    return item.id || `accordion-item-${index}`
  }

  const getComputedItemClass = (item: AccordionItem, index: number) => [
    'base-accordion__item',
    {
      'base-accordion__item--open': isItemOpen(getItemKey(item, index)),
      'base-accordion__item--disabled': item.disabled,
    },
  ]

  const isItemOpen = (itemId: string) => {
    return openItems.value.has(itemId)
  }

  const handleToggleItem = (itemId: string) => {
    const itemIndex = props.items.findIndex(item => getItemKey(item, props.items.indexOf(item)) === itemId)
    const item = props.items[itemIndex]
    if (!item || item.disabled) return

    const wasOpen = openItems.value.has(itemId)

    if (props.multiple) {
      if (wasOpen) {
        openItems.value.delete(itemId)
        emit('item-close', itemId)
      } else {
        openItems.value.add(itemId)
        emit('item-open', itemId)
      }
    } else {
      // Close all other items
      openItems.value.clear()
      if (!wasOpen) {
        openItems.value.add(itemId)
        emit('item-open', itemId)
      } else {
        emit('item-close', itemId)
      }
    }

    emit('item-toggle', itemId, !wasOpen)
  }

  // Public methods
  const openItem = (itemId: string) => {
    if (!props.multiple) {
      openItems.value.clear()
    }
    openItems.value.add(itemId)
  }

  const closeItem = (itemId: string) => {
    openItems.value.delete(itemId)
  }

  const openAll = () => {
    if (props.multiple) {
      props.items.forEach((item, index) => {
        if (!item.disabled) {
          const itemId = getItemKey(item, index)
          openItems.value.add(itemId)
        }
      })
    }
  }

  const closeAll = () => {
    openItems.value.clear()
  }

  defineExpose({
    openItem,
    closeItem,
    openAll,
    closeAll,
  })
</script>

<style scoped>
  .base-accordion {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  /* Item */
  .base-accordion__item {
    transition: all var(--transition-normal);
    background: var(--color-surface);
    border-radius: var(--radius-lg);
  }

  /* Variants */
  .base-accordion--bordered .base-accordion__item {
    border: 1px solid var(--color-border);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

    .base-accordion--bordered .base-accordion__item:not(:last-child) {
      margin-bottom: var(--spacing-md);
    }

  .base-accordion--separated .base-accordion__item {
    border-bottom: 1px solid var(--color-border);
    border-radius: 0;
    background: transparent;
  }

    .base-accordion--separated .base-accordion__item:last-child {
      border-bottom: none;
    }

  .base-accordion--card .base-accordion__item {
    background: var(--color-background-card);
    border: 1px solid var(--color-border-card);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
  }

    .base-accordion--card .base-accordion__item:hover {
      box-shadow: var(--shadow-md);
      border-color: var(--color-primary-light);
    }

  .base-accordion--card .base-accordion__item--open {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
  }

  /* Header */
  .base-accordion__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: var(--spacing-lg) var(--spacing-xl);
    background: none;
    border: none;
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: left;
    color: var(--color-text-primary);
    border-radius: inherit;
  }

  .base-accordion--bordered .base-accordion__header,
  .base-accordion--card .base-accordion__header {
    padding: var(--spacing-lg) var(--spacing-xl);
  }

  .base-accordion__header:hover:not(:disabled) {
    background: var(--color-surface-hover);
  }

  .base-accordion__header:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .base-accordion__item--disabled .base-accordion__header {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--color-surface-hover);
  }

    .base-accordion__item--disabled .base-accordion__header:hover {
      background: var(--color-surface-hover);
    }

  .base-accordion__header-content {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    flex: 1;
  }

  .base-accordion__icon {
    flex-shrink: 0;
    color: var(--color-text-muted);
    margin-top: 2px;
  }

  .base-accordion__item--open .base-accordion__icon {
    color: var(--color-primary);
  }

  .base-accordion__text {
    flex: 1;
    min-width: 0;
  }

  .base-accordion__title {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    line-height: 1.4;
    font-size: 1rem;
  }

  .base-accordion__item--open .base-accordion__title {
    color: var(--color-primary);
  }

  .base-accordion__description {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
    margin-top: var(--spacing-xs);
  }

  .base-accordion__chevron {
    flex-shrink: 0;
    color: var(--color-text-muted);
    transition: transform var(--transition-normal);
    margin-left: var(--spacing-md);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .base-accordion__item--open .base-accordion__chevron {
    color: var(--color-primary);
  }

  .base-accordion__chevron--open {
    transform: rotate(180deg);
  }

  /* Content */
  .base-accordion__content {
    overflow: hidden;
    transition: all var(--transition-normal);
    background: var(--color-surface);
  }

  .base-accordion--card .base-accordion__content {
    background: transparent;
  }

  .base-accordion__content-inner {
    padding: 0 var(--spacing-xl) var(--spacing-xl);
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .base-accordion--bordered .base-accordion__content-inner {
    padding: 0 var(--spacing-xl) var(--spacing-xl);
  }

  .base-accordion--separated .base-accordion__content-inner {
    padding: var(--spacing-md) 0;
  }

  .base-accordion--card .base-accordion__content-inner {
    padding: 0 var(--spacing-xl) var(--spacing-xl);
    border-top: 1px solid var(--color-border-light);
    margin: 0 var(--spacing-lg);
  }

  /* Size variants */
  .base-accordion--sm .base-accordion__header {
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .base-accordion--sm .base-accordion__content-inner {
    padding: 0 var(--spacing-lg) var(--spacing-lg);
  }

  .base-accordion--sm .base-accordion--card .base-accordion__content-inner {
    padding: 0 var(--spacing-lg) var(--spacing-lg);
    margin: 0 var(--spacing-md);
  }

  .base-accordion--lg .base-accordion__header {
    padding: var(--spacing-xl) var(--spacing-2xl);
  }

  .base-accordion--lg .base-accordion__content-inner {
    padding: 0 var(--spacing-2xl) var(--spacing-2xl);
  }

  .base-accordion--lg .base-accordion--card .base-accordion__content-inner {
    padding: 0 var(--spacing-2xl) var(--spacing-2xl);
    margin: 0 var(--spacing-xl);
  }

  /* Animations */
  .base-accordion__content {
    max-height: 0;
    opacity: 0;
  }

  .base-accordion__item--open .base-accordion__content {
    max-height: 500vh;
    opacity: 1;
  }

  /* Smooth height transition */
  .base-accordion__content {
    transition: max-height var(--transition-normal) ease-in-out, opacity var(--transition-normal) ease-in-out;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .base-accordion__header {
      padding: var(--spacing-md) var(--spacing-lg);
    }

    .base-accordion__header-content {
      gap: var(--spacing-sm);
    }

    .base-accordion__content-inner {
      padding: 0 var(--spacing-lg) var(--spacing-lg);
    }

    .base-accordion--bordered .base-accordion__header,
    .base-accordion--card .base-accordion__header {
      padding: var(--spacing-md) var(--spacing-lg);
    }

    .base-accordion--bordered .base-accordion__content-inner,
    .base-accordion--card .base-accordion__content-inner {
      padding: 0 var(--spacing-lg) var(--spacing-lg);
    }

    .base-accordion--card .base-accordion__content-inner {
      margin: 0 var(--spacing-md);
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .base-accordion__item--open {
      border-color: var(--color-text-primary);
    }

      .base-accordion__item--open .base-accordion__title {
        color: var(--color-text-primary);
      }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .base-accordion__item,
    .base-accordion__header,
    .base-accordion__content,
    .base-accordion__chevron {
      transition: none;
    }

    .base-accordion__content {
      transition: opacity 0.1s ease;
    }
  }
</style>
