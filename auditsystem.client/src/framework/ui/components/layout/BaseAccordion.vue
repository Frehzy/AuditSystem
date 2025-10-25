<!-- src/framework/ui/components/layout/BaseAccordion.vue -->
<template>
  <div class="base-accordion" :class="accordionClasses">
    <div v-for="(item, index) in items"
         :key="item.id || index"
         class="base-accordion__item"
         :class="getItemClass(item, index)">

      <!-- Accordion header -->
      <button :id="`accordion-${item.id || index}`"
              @click="toggleItem(item.id || index)"
              class="base-accordion__header"
              :aria-expanded="isItemOpen(item.id || index)"
              :aria-controls="`accordion-content-${item.id || index}`">

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
        <div class="base-accordion__chevron" :class="{ 'base-accordion__chevron--open': isItemOpen(item.id || index) }">
          <ChevronDownIcon :size="16" />
        </div>
      </button>

      <!-- Accordion content -->
      <div :id="`accordion-content-${item.id || index}`"
           class="base-accordion__content"
           :aria-labelledby="`accordion-${item.id || index}`"
           :hidden="!isItemOpen(item.id || index)">

        <div class="base-accordion__content-inner">
          <slot :name="item.id || `item-${index}`" :item="item" :index="index">
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
  import { ChevronDownIcon } from '@/assets/icons'

  interface AccordionItem {
    id?: string
    title: string
    description?: string
    icon?: any
    content?: string
    component?: any
    props?: any
    disabled?: boolean
    defaultOpen?: boolean
  }

  interface Props {
    items: AccordionItem[]
    variant?: 'default' | 'bordered' | 'separated'
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
  props.items.forEach(item => {
    if (item.defaultOpen && item.id) {
      openItems.value.add(item.id)
    }
  })

  const accordionClasses = computed(() => [
    'base-accordion',
    `base-accordion--${props.variant}`,
    `base-accordion--${props.size}`,
  ])

  const getItemClass = (item: AccordionItem, index: number) => [
    'base-accordion__item',
    {
      'base-accordion__item--open': isItemOpen(item.id || String(index)),
      'base-accordion__item--disabled': item.disabled,
    },
  ]

  const isItemOpen = (itemId: string) => {
    return openItems.value.has(itemId)
  }

  const toggleItem = (itemId: string) => {
    const item = props.items.find(item => (item.id || String(props.items.indexOf(item))) === itemId)
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
      props.items.forEach(item => {
        if (item.id && !item.disabled) {
          openItems.value.add(item.id)
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
  }

  /* Item */
  .base-accordion__item {
    transition: all var(--transition-normal);
  }

  /* Variants */
  .base-accordion--bordered .base-accordion__item {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

    .base-accordion--bordered .base-accordion__item:not(:last-child) {
      margin-bottom: var(--space-md);
    }

  .base-accordion--separated .base-accordion__item {
    border-bottom: 1px solid var(--color-border);
  }

    .base-accordion--separated .base-accordion__item:last-child {
      border-bottom: none;
    }

  /* Header */
  .base-accordion__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: var(--space-md) var(--space-lg);
    background: none;
    border: none;
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: left;
  }

  .base-accordion--bordered .base-accordion__header {
    padding: var(--space-lg);
  }

  .base-accordion__header:hover {
    background: var(--color-surface-hover);
  }

  .base-accordion__item--disabled .base-accordion__header {
    opacity: 0.5;
    cursor: not-allowed;
  }

    .base-accordion__item--disabled .base-accordion__header:hover {
      background: none;
    }

  .base-accordion__header-content {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    flex: 1;
  }

  .base-accordion__icon {
    flex-shrink: 0;
    color: var(--color-text-muted);
    margin-top: 2px;
  }

  .base-accordion__text {
    flex: 1;
    min-width: 0;
  }

  .base-accordion__title {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    line-height: 1.4;
  }

  .base-accordion__description {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    line-height: 1.4;
    margin-top: var(--space-xs);
  }

  .base-accordion__chevron {
    flex-shrink: 0;
    color: var(--color-text-muted);
    transition: transform var(--transition-normal);
    margin-left: var(--space-md);
  }

  .base-accordion__chevron--open {
    transform: rotate(180deg);
  }

  /* Content */
  .base-accordion__content {
    overflow: hidden;
    transition: all var(--transition-normal);
  }

  .base-accordion__content-inner {
    padding: 0 var(--space-lg) var(--space-lg);
  }

  .base-accordion--bordered .base-accordion__content-inner {
    padding: 0 var(--space-lg) var(--space-lg);
  }

  .base-accordion--separated .base-accordion__content-inner {
    padding: var(--space-md) 0;
  }

  /* Size variants */
  .base-accordion--sm .base-accordion__header {
    padding: var(--space-sm) var(--space-md);
  }

  .base-accordion--sm .base-accordion__content-inner {
    padding: 0 var(--space-md) var(--space-md);
  }

  .base-accordion--lg .base-accordion__header {
    padding: var(--space-lg) var(--space-xl);
  }

  .base-accordion--lg .base-accordion__content-inner {
    padding: 0 var(--space-xl) var(--space-xl);
  }

  /* Animations */
  .base-accordion__content {
    max-height: 0;
    opacity: 0;
  }

  .base-accordion__item--open .base-accordion__content {
    max-height: 1000px; /* Should be enough for most content */
    opacity: 1;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .base-accordion__header {
      padding: var(--space-md);
    }

    .base-accordion__header-content {
      gap: var(--space-sm);
    }

    .base-accordion__content-inner {
      padding: 0 var(--space-md) var(--space-md);
    }

    .base-accordion--bordered .base-accordion__header {
      padding: var(--space-md);
    }

    .base-accordion--bordered .base-accordion__content-inner {
      padding: 0 var(--space-md) var(--space-md);
    }
  }
</style>
