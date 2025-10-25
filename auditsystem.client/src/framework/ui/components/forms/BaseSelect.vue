<!-- src/framework/ui/components/forms/BaseSelect.vue -->
<template>
  <div class="base-select" :class="containerClasses">
    <label v-if="label" :for="selectId" class="base-select__label">
      {{ label }}
      <span v-if="required" class="base-select__required">*</span>
    </label>

    <div class="base-select__wrapper">
      <select :id="selectId"
              :value="modelValue"
              :disabled="disabled || loading"
              @change="onChange"
              @blur="onBlur"
              @focus="onFocus"
              class="base-select__select">
        <option v-if="placeholder" value="" disabled>
          {{ placeholder }}
        </option>
        <option v-for="option in normalizedOptions"
                :key="getOptionValue(option)"
                :value="getOptionValue(option)"
                :disabled="getOptionDisabled(option)">
          {{ getOptionLabel(option) }}
        </option>
      </select>

      <div class="base-select__indicators">
        <BaseSpinner v-if="loading"
                     size="16px"
                     variant="primary"
                     class="base-select__spinner" />
        <div v-else class="base-select__arrow">
          <ChevronDownIcon :size="16" />
        </div>
      </div>
    </div>

    <div v-if="helpText && !error" class="base-select__help">
      {{ helpText }}
    </div>

    <div v-if="error" class="base-select__error" role="alert">
      <AlertIcon :size="14" />
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import BaseSpinner from '../feedback/BaseSpinner.vue'
import { ChevronDownIcon, AlertIcon } from '@/assets/icons'

interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string | number
  options: SelectOption[] | string[] | number[]
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  loading?: boolean
  error?: string
  helpText?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  loading: false,
  error: undefined,
  helpText: undefined,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
  'change': [value: string | number]
}>()

const selectId = computed(() => `select-${useId()}`)

const containerClasses = computed(() => [
  'base-select',
  `base-select--${props.size}`,
  {
    'base-select--error': !!props.error,
    'base-select--disabled': props.disabled,
    'base-select--loading': props.loading,
  },
])

const normalizedOptions = computed(() => {
  if (props.options.length === 0) return []

  // Handle string/number arrays
  if (typeof props.options[0] !== 'object') {
    return props.options.map(option => ({
      value: option,
      label: String(option)
    }))
  }

  return props.options as SelectOption[]
})

const getOptionValue = (option: SelectOption): string | number => {
  return option.value
}

const getOptionLabel = (option: SelectOption): string => {
  return option.label
}

const getOptionDisabled = (option: SelectOption): boolean => {
  return option.disabled || false
}

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  emit('update:modelValue', value)
  emit('change', value)
}

const onBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const onFocus = (event: FocusEvent) => {
  emit('focus', event)
}
</script>

<style scoped>
  .base-select {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: var(--space-md);
  }

  .base-select__label {
    display: block;
    margin-bottom: var(--space-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    line-height: 1.25;
  }

  .base-select__required {
    color: var(--color-error);
    margin-left: var(--space-xs);
  }

  .base-select__wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .base-select__select {
    width: 100%;
    padding: var(--space-md) var(--space-2xl) var(--space-md) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    cursor: pointer;
    appearance: none;
    outline: none;
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-sm);
    font-family: var(--font-family-sans);
  }

    .base-select__select:focus {
      border-color: var(--color-primary);
      box-shadow: var(--shadow-focus);
    }

  .base-select--error .base-select__select {
    border-color: var(--color-error);
    box-shadow: 0 0 0 1px var(--color-error);
  }

    .base-select--error .base-select__select:focus {
      border-color: var(--color-error);
      box-shadow: var(--shadow-error);
    }

  .base-select--disabled .base-select__select,
  .base-select--loading .base-select__select {
    background-color: var(--color-surface-disabled);
    opacity: 0.6;
    cursor: not-allowed;
  }

  .base-select__indicators {
    position: absolute;
    right: var(--space-md);
    pointer-events: none;
    color: var(--color-text-muted);
    transition: color var(--transition-fast);
    display: flex;
    align-items: center;
  }

  .base-select__select:focus + .base-select__indicators {
    color: var(--color-primary);
  }

  .base-select__spinner {
    width: 16px;
    height: 16px;
  }

  .base-select__help {
    margin-top: var(--space-xs);
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.25;
  }

  .base-select__error {
    margin-top: var(--space-xs);
    color: var(--color-error);
    font-size: 0.75rem;
    line-height: 1.25;
    font-weight: var(--font-weight-medium);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  /* Sizes */
  .base-select--sm .base-select__select {
    padding: var(--space-sm) var(--space-xl) var(--space-sm) var(--space-sm);
    font-size: 0.8125rem;
  }

  .base-select--lg .base-select__select {
    padding: var(--space-lg) var(--space-3xl) var(--space-lg) var(--space-lg);
    font-size: 1rem;
  }
</style>
