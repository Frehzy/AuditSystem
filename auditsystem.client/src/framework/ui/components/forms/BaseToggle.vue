<template>
  <div class="base-toggle" :class="computedContainerClasses">
    <button type="button"
            role="switch"
            :aria-checked="modelValue"
            :disabled="disabled"
            @click="handleToggle"
            @keydown.space.prevent="handleToggle"
            @keydown.enter.prevent="handleToggle"
            class="base-toggle__button">
      <span class="base-toggle__track">
        <span class="base-toggle__thumb" :style="computedThumbStyle">
          <BaseSpinner v-if="loading"
                       size="12px"
                       variant="primary"
                       class="base-toggle__spinner" />
        </span>
      </span>
    </button>

    <div v-if="label || description" class="base-toggle__content" @click="handleToggle">
      <div v-if="label" class="base-toggle__label">
        {{ label }}
      </div>
      <div v-if="description" class="base-toggle__description">
        {{ description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import BaseSpinner from '../feedback/BaseSpinner.vue'

  interface Props {
    modelValue: boolean
    label?: string
    description?: string
    disabled?: boolean
    loading?: boolean
    size?: 'sm' | 'md' | 'lg'
    variant?: 'primary' | 'success' | 'warning' | 'error'
  }

  const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    loading: false,
    size: 'md',
    variant: 'primary'
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'change': [value: boolean]
  }>()

  const computedContainerClasses = computed(() => [
    'base-toggle',
    `base-toggle--${props.size}`,
    `base-toggle--${props.variant}`,
    {
      'base-toggle--disabled': props.disabled,
      'base-toggle--checked': props.modelValue,
      'base-toggle--loading': props.loading,
    },
  ])

  const computedThumbStyle = computed(() => ({
    transform: props.modelValue ? 'translateX(100%)' : 'translateX(0)',
  }))

  const handleToggle = () => {
    if (!props.disabled && !props.loading) {
      const newValue = !props.modelValue
      emit('update:modelValue', newValue)
      emit('change', newValue)
    }
  }
</script>

<style scoped>
  .base-toggle {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    cursor: pointer;
    width: fit-content;
  }

  .base-toggle--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .base-toggle--loading {
    cursor: wait;
  }

  .base-toggle__button {
    position: relative;
    border: none;
    background: none;
    padding: 0;
    cursor: inherit;
    outline: none;
    flex-shrink: 0;
  }

  .base-toggle--disabled .base-toggle__button {
    cursor: not-allowed;
  }

  .base-toggle--loading .base-toggle__button {
    cursor: wait;
  }

  .base-toggle__track {
    display: block;
    width: 3rem;
    height: 1.5rem;
    background: var(--color-border);
    border-radius: var(--radius-full);
    position: relative;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-inner);
  }

  .base-toggle--checked .base-toggle__track {
    background: var(--color-primary);
  }

  .base-toggle--success.base-toggle--checked .base-toggle__track {
    background: var(--color-success);
  }

  .base-toggle--warning.base-toggle--checked .base-toggle__track {
    background: var(--color-warning);
  }

  .base-toggle--error.base-toggle--checked .base-toggle__track {
    background: var(--color-error);
  }

  .base-toggle__button:focus-visible .base-toggle__track {
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }

  .base-toggle__thumb {
    position: absolute;
    top: 0.125rem;
    left: 0.125rem;
    width: 1.25rem;
    height: 1.25rem;
    background: white;
    border-radius: var(--radius-full);
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .base-toggle--checked .base-toggle__thumb {
    background: white;
  }

  .base-toggle__spinner {
    width: 12px;
    height: 12px;
  }

  .base-toggle__content {
    flex: 1;
    cursor: inherit;
    user-select: none;
    min-width: 0;
  }

  .base-toggle__label {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    line-height: 1.4;
    margin-bottom: var(--space-xs);
  }

  .base-toggle__description {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    line-height: 1.3;
  }

  /* Sizes */
  .base-toggle--sm {
    gap: var(--space-sm);
  }

    .base-toggle--sm .base-toggle__track {
      width: 2.5rem;
      height: 1.25rem;
    }

    .base-toggle--sm .base-toggle__thumb {
      width: 1rem;
      height: 1rem;
      top: 0.125rem;
      left: 0.125rem;
    }

    .base-toggle--sm .base-toggle__spinner {
      width: 10px;
      height: 10px;
    }

  .base-toggle--lg {
    gap: var(--space-lg);
  }

    .base-toggle--lg .base-toggle__track {
      width: 3.5rem;
      height: 1.75rem;
    }

    .base-toggle--lg .base-toggle__thumb {
      width: 1.5rem;
      height: 1.5rem;
      top: 0.125rem;
      left: 0.125rem;
    }

    .base-toggle--lg .base-toggle__spinner {
      width: 14px;
      height: 14px;
    }
</style>
