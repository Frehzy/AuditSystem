<!-- src/framework/ui/components/data-display/BaseChip.vue -->
<template>
  <span class="base-chip" :class="chipClasses" :style="chipStyle">
    <component v-if="icon"
               :is="icon"
               class="base-chip__icon"
               :size="16" />

    <span class="base-chip__label">
      <slot>{{ label }}</slot>
    </span>

    <button v-if="closable"
            @click="handleClose"
            class="base-chip__close"
            :aria-label="`Удалить ${label}`">
      <CloseIcon :size="12" />
    </button>
  </span>
</template>

<script setup lang="ts">
  import { CloseIcon } from '@/assets/icons'

  interface Props {
    label?: string
    variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
    size?: 'sm' | 'md' | 'lg'
    closable?: boolean
    icon?: any
    outlined?: boolean
    clickable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    closable: false,
    outlined: false,
    clickable: false,
  })

  const emit = defineEmits<{
    'close': []
    'click': []
  }>()

  const chipClasses = computed(() => [
    'base-chip',
    `base-chip--${props.variant}`,
    `base-chip--${props.size}`,
    {
      'base-chip--outlined': props.outlined,
      'base-chip--clickable': props.clickable,
      'base-chip--closable': props.closable,
    },
  ])

  const handleClose = (event: Event) => {
    event.stopPropagation()
    emit('close')
  }

  const handleClick = () => {
    if (props.clickable) {
      emit('click')
    }
  }
</script>

<style scoped>
  .base-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-full);
    font-weight: var(--font-weight-medium);
    font-size: 0.75rem;
    line-height: 1;
    white-space: nowrap;
    transition: all var(--transition-fast);
  }

  /* Variants */
  .base-chip--primary {
    background: var(--color-primary);
    color: white;
    border: 1px solid var(--color-primary);
  }

  .base-chip--secondary {
    background: var(--color-surface);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
  }

  .base-chip--success {
    background: var(--color-success);
    color: white;
    border: 1px solid var(--color-success);
  }

  .base-chip--error {
    background: var(--color-error);
    color: white;
    border: 1px solid var(--color-error);
  }

  .base-chip--warning {
    background: var(--color-warning);
    color: white;
    border: 1px solid var(--color-warning);
  }

  .base-chip--info {
    background: var(--color-info);
    color: white;
    border: 1px solid var(--color-info);
  }

  /* Outlined variant */
  .base-chip--outlined {
    background: transparent;
  }

    .base-chip--outlined.base-chip--primary {
      color: var(--color-primary);
    }

    .base-chip--outlined.base-chip--secondary {
      color: var(--color-text-secondary);
    }

    .base-chip--outlined.base-chip--success {
      color: var(--color-success);
    }

    .base-chip--outlined.base-chip--error {
      color: var(--color-error);
    }

    .base-chip--outlined.base-chip--warning {
      color: var(--color-warning);
    }

    .base-chip--outlined.base-chip--info {
      color: var(--color-info);
    }

  /* Sizes */
  .base-chip--sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.6875rem;
  }

  .base-chip--lg {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  /* Clickable */
  .base-chip--clickable {
    cursor: pointer;
  }

    .base-chip--clickable:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

  /* Close button */
  .base-chip__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    background: none;
    border: none;
    border-radius: var(--radius-full);
    color: inherit;
    cursor: pointer;
    opacity: 0.7;
    transition: all var(--transition-fast);
    margin-left: var(--space-xs);
  }

    .base-chip__close:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.2);
    }

  .base-chip--outlined .base-chip__close:hover {
    background: var(--color-surface-hover);
  }
</style>
