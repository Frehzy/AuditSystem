<!-- src/framework/ui/components/navigation/BaseTabs.vue -->
<template>
  <div class="base-tabs" :class="tabsClasses">
    <!-- Tab list -->
    <div class="base-tabs__header" role="tablist" :aria-label="ariaLabel">
      <button v-for="tab in tabs"
              :key="tab.id"
              :id="`tab-${tab.id}`"
              role="tab"
              :aria-selected="activeTab === tab.id"
              :aria-controls="`panel-${tab.id}`"
              :tabindex="activeTab === tab.id ? 0 : -1"
              @click="setActiveTab(tab.id)"
              @keydown="handleKeydown"
              class="base-tabs__tab"
              :class="getTabClass(tab)">

        <!-- Tab icon -->
        <component v-if="tab.icon"
                   :is="tab.icon"
                   class="base-tabs__tab-icon"
                   :size="16" />

        <!-- Tab label -->
        <span class="base-tabs__tab-label">
          {{ tab.label }}
        </span>

        <!-- Badge -->
        <BaseBadge v-if="tab.badge"
                   :variant="tab.badgeVariant || 'primary'"
                   size="sm"
                   class="base-tabs__tab-badge">
          {{ tab.badge }}
        </BaseBadge>

        <!-- Close button -->
        <button v-if="tab.closable"
                @click.stop="closeTab(tab.id)"
                class="base-tabs__tab-close"
                aria-label="Закрыть вкладку">
          <CloseIcon :size="12" />
        </button>
      </button>

      <!-- Active tab indicator -->
      <div class="base-tabs__indicator" :style="indicatorStyle" />
    </div>

    <!-- Tab panels -->
    <div class="base-tabs__content">
      <div v-for="tab in tabs"
           :key="tab.id"
           :id="`panel-${tab.id}`"
           role="tabpanel"
           :aria-labelledby="`tab-${tab.id}`"
           :hidden="activeTab !== tab.id"
           class="base-tabs__panel"
           :class="{ 'base-tabs__panel--active': activeTab === tab.id }">

        <slot :name="tab.id" :tab="tab">
          <component v-if="tab.component" :is="tab.component" v-bind="tab.props" />
          <div v-else-if="tab.content" v-html="tab.content" />
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch, nextTick } from 'vue'
  import { CloseIcon } from '@/assets/icons'
  import type { Component } from 'vue';

  interface Tab {
    id: string
    label: string
    icon?: Component
    badge?: string | number
    badgeVariant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
    closable?: boolean
    disabled?: boolean
    component?: Component
    props?: Record<string, unknown>
    content?: string
  }

  interface Props {
    modelValue: string
    tabs: Tab[]
    variant?: 'default' | 'pills' | 'underline'
    align?: 'start' | 'center' | 'end'
    fullWidth?: boolean
    ariaLabel?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    align: 'start',
    fullWidth: false,
    ariaLabel: 'Вкладки',
  })

  const emit = defineEmits<{
    'update:modelValue': [tabId: string]
    'change': [tabId: string]
    'tab-close': [tabId: string]
  }>()

  const activeTab = ref(props.modelValue)
  const indicatorStyle = ref({})

  const tabsClasses = computed(() => [
    'base-tabs',
    `base-tabs--${props.variant}`,
    `base-tabs--align-${props.align}`,
    {
      'base-tabs--full-width': props.fullWidth,
    },
  ])

  const getTabClass = (tab: Tab) => [
    'base-tabs__tab',
    {
      'base-tabs__tab--active': activeTab.value === tab.id,
      'base-tabs__tab--disabled': tab.disabled,
    },
  ]

  const setActiveTab = (tabId: string) => {
    const tab = props.tabs.find(t => t.id === tabId)
    if (tab && !tab.disabled) {
      activeTab.value = tabId
      emit('update:modelValue', tabId)
      emit('change', tabId)
      updateIndicator()
    }
  }

  const closeTab = (tabId: string) => {
    emit('tab-close', tabId)
  }

  const handleKeydown = (event: KeyboardEvent) => {
    const currentIndex = props.tabs.findIndex(tab => tab.id === activeTab.value)
    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowLeft':
        newIndex = Math.max(0, currentIndex - 1)
        break
      case 'ArrowRight':
        newIndex = Math.min(props.tabs.length - 1, currentIndex + 1)
        break
      case 'Home':
        newIndex = 0
        break
      case 'End':
        newIndex = props.tabs.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    const newTab = props.tabs[newIndex]
    if (newTab && !newTab.disabled) {
      setActiveTab(newTab.id)
    }
  }

  const updateIndicator = () => {
    nextTick(() => {
      const activeTabElement = document.querySelector('.base-tabs__tab--active') as HTMLElement
      if (activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement
        indicatorStyle.value = {
          transform: `translateX(${offsetLeft}px)`,
          width: `${offsetWidth}px`,
        }
      }
    })
  }

  // Watch for modelValue changes from parent
  watch(() => props.modelValue, (newValue) => {
    if (newValue !== activeTab.value) {
      activeTab.value = newValue
      updateIndicator()
    }
  })

  // Initialize indicator
  watch(() => props.tabs, updateIndicator, { immediate: true, flush: 'post' })
</script>

<style scoped>
  .base-tabs {
    display: flex;
    flex-direction: column;
  }

  .base-tabs__header {
    position: relative;
    display: flex;
    gap: var(--space-xs);
    border-bottom: 1px solid var(--color-border);
    padding: 0 var(--space-md);
  }

  .base-tabs--align-start .base-tabs__header {
    justify-content: flex-start;
  }

  .base-tabs--align-center .base-tabs__header {
    justify-content: center;
  }

  .base-tabs--align-end .base-tabs__header {
    justify-content: flex-end;
  }

  .base-tabs--full-width .base-tabs__header {
    justify-content: stretch;
  }

  .base-tabs--full-width .base-tabs__tab {
    flex: 1;
    justify-content: center;
  }

  .base-tabs__tab {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }

    .base-tabs__tab:hover {
      color: var(--color-text-primary);
      background: var(--color-surface-hover);
    }

  .base-tabs__tab--active {
    color: var(--color-primary);
  }

  .base-tabs__tab--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

    .base-tabs__tab--disabled:hover {
      color: var(--color-text-secondary);
      background: none;
    }

  .base-tabs__tab-icon {
    flex-shrink: 0;
  }

  .base-tabs__tab-label {
    flex: 1;
    text-align: left;
  }

  .base-tabs__tab-badge {
    flex-shrink: 0;
  }

  .base-tabs__tab-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    background: none;
    border: none;
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all var(--transition-fast);
    opacity: 0;
    margin-left: var(--space-xs);
  }

  .base-tabs__tab:hover .base-tabs__tab-close {
    opacity: 1;
  }

  .base-tabs__tab-close:hover {
    background: var(--color-error-light);
    color: var(--color-error);
  }

  .base-tabs__indicator {
    position: absolute;
    bottom: -1px;
    height: 2px;
    background: var(--color-primary);
    transition: all var(--transition-normal);
    border-radius: 1px 1px 0 0;
  }

  /* Variants */
  .base-tabs--pills .base-tabs__header {
    border-bottom: none;
    gap: var(--space-xs);
    padding: var(--space-sm);
    background: var(--color-background-card);
    border-radius: var(--radius-lg);
  }

  .base-tabs--pills .base-tabs__tab {
    border-radius: var(--radius-md);
    padding: var(--space-sm) var(--space-md);
  }

  .base-tabs--pills .base-tabs__tab--active {
    background: var(--color-primary);
    color: white;
  }

  .base-tabs--pills .base-tabs__indicator {
    display: none;
  }

  .base-tabs--underline .base-tabs__header {
    border-bottom: 1px solid var(--color-border);
    padding: 0;
  }

  .base-tabs--underline .base-tabs__tab {
    border-radius: 0;
    padding: var(--space-md) var(--space-lg);
    border-bottom: 2px solid transparent;
  }

  .base-tabs--underline .base-tabs__tab--active {
    border-bottom-color: var(--color-primary);
    background: none;
  }

  .base-tabs--underline .base-tabs__indicator {
    display: none;
  }

  /* Content */
  .base-tabs__content {
    flex: 1;
    padding: var(--space-lg) 0;
  }

  .base-tabs__panel {
    display: none;
  }

  .base-tabs__panel--active {
    display: block;
    animation: tab-fade-in 0.3s ease;
  }

  @keyframes tab-fade-in {
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
    .base-tabs__header {
      flex-wrap: wrap;
      gap: var(--space-xs);
      padding: var(--space-sm);
    }

    .base-tabs__tab {
      flex: 1;
      min-width: 0;
      justify-content: center;
      padding: var(--space-sm) var(--space-md);
    }

    .base-tabs__tab-label {
      text-align: center;
    }

    .base-tabs__tab-close {
      opacity: 1;
    }
  }
</style>
