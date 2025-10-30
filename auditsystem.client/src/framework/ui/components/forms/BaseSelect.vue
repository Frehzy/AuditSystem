<template>
  <div class="base-select" :class="computedContainerClasses">
    <label v-if="label" :for="computedSelectId" class="base-select__label">
      {{ label }}
      <span v-if="required" class="base-select__required">*</span>
    </label>

    <div class="base-select__wrapper">
      <select :id="computedSelectId"
              :value="modelValue"
              :disabled="disabled || loading"
              @change="handleChange"
              @blur="handleBlur"
              @focus="handleFocus"
              class="base-select__select">
        <option v-if="placeholder" value="" disabled>
          {{ placeholder }}
        </option>
        <option v-for="option in computedOptions"
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
  import ChevronDownIcon from '@/assets/icons/arrows/ChevronDownIcon.vue'
  import AlertIcon from '@/assets/icons/status/AlertIcon.vue'

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

  const computedSelectId = computed(() => `select-${useId()}`)

  const computedContainerClasses = computed(() => [
    'base-select',
    `base-select--${props.size}`,
    {
      'base-select--error': !!props.error,
      'base-select--disabled': props.disabled,
      'base-select--loading': props.loading,
      'base-select--has-value': !!props.modelValue,
    },
  ])

  const computedOptions = computed(() => {
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

  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement
    const value = target.value
    emit('update:modelValue', value)
    emit('change', value)
  }

  const handleBlur = (event: FocusEvent) => {
    emit('blur', event)
  }

  const handleFocus = (event: FocusEvent) => {
    emit('focus', event)
  }
</script>

<style scoped>
  .base-select {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: var(--spacing-md);
  }

  .base-select__label {
    display: block;
    margin-bottom: var(--spacing-sm);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    line-height: 1.25;
  }

  .base-select__required {
    color: var(--color-error);
    margin-left: var(--spacing-xs);
  }

  .base-select__wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .base-select__select {
    width: 100%;
    padding: var(--spacing-md) var(--spacing-2xl) var(--spacing-md) var(--spacing-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    cursor: pointer;
    appearance: none;
    outline: none;
    transition: all var(--transition-fast);
    box-shadow: var(--shadow-sm);
    font-family: var(--font-family-sans);
  }

    .base-select__select:hover:not(:disabled) {
      border-color: var(--color-primary);
      box-shadow: var(--shadow-md);
    }

    .base-select__select:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent);
    }

  .base-select--has-value .base-select__select {
    border-color: var(--color-primary-light);
    background: color-mix(in srgb, var(--color-primary-50) 10%, transparent);
  }

  .base-select--error .base-select__select {
    border-color: var(--color-error);
    background: color-mix(in srgb, var(--color-error-light) 10%, transparent);
    box-shadow: 0 0 0 1px var(--color-error);
  }

    .base-select--error .base-select__select:focus {
      border-color: var(--color-error);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 20%, transparent);
    }

  .base-select--disabled .base-select__select,
  .base-select--loading .base-select__select {
    background-color: var(--color-surface-hover);
    opacity: 0.6;
    cursor: not-allowed;
    border-color: var(--color-border);
  }

    .base-select--disabled .base-select__select:hover,
    .base-select--loading .base-select__select:hover {
      border-color: var(--color-border);
      box-shadow: var(--shadow-sm);
    }

  .base-select__indicators {
    position: absolute;
    right: var(--spacing-md);
    pointer-events: none;
    color: var(--color-text-muted);
    transition: color var(--transition-fast);
    display: flex;
    align-items: center;
    z-index: 2;
  }

  .base-select__select:focus + .base-select__indicators,
  .base-select--has-value .base-select__indicators {
    color: var(--color-primary);
  }

  .base-select--error .base-select__indicators {
    color: var(--color-error);
  }

  .base-select__spinner {
    width: 16px;
    height: 16px;
  }

  .base-select__arrow {
    transition: transform var(--transition-fast);
  }

  .base-select__select:focus + .base-select__indicators .base-select__arrow {
    transform: rotate(180deg);
  }

  .base-select__help {
    margin-top: var(--spacing-xs);
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.25;
    font-weight: var(--font-weight-medium, 500);
  }

  .base-select__error {
    margin-top: var(--spacing-xs);
    color: var(--color-error);
    font-size: 0.75rem;
    line-height: 1.25;
    font-weight: var(--font-weight-semibold, 600);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  /* Sizes */
  .base-select--sm .base-select__select {
    padding: var(--spacing-sm) var(--spacing-xl) var(--spacing-sm) var(--spacing-sm);
    font-size: 0.8125rem;
    border-radius: var(--radius-md);
  }

  .base-select--sm .base-select__indicators {
    right: var(--spacing-sm);
  }

  .base-select--lg .base-select__select {
    padding: var(--spacing-lg) var(--spacing-3xl) var(--spacing-lg) var(--spacing-lg);
    font-size: 1rem;
    border-radius: var(--radius-xl);
  }

  .base-select--lg .base-select__indicators {
    right: var(--spacing-lg);
  }

  /* Animation states */
  .base-select {
    transition: all var(--transition-fast);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .base-select__select {
      font-size: 16px; /* Prevent zoom on iOS */
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .base-select__select {
      border-width: 2px;
    }

    .base-select--error .base-select__select {
      border-width: 2px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .base-select__select,
    .base-select__indicators,
    .base-select {
      transition: none;
    }

      .base-select__select:focus + .base-select__indicators .base-select__arrow {
        transform: none;
      }
  }
</style>
