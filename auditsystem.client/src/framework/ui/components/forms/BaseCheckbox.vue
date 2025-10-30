<!-- src/framework/ui/components/forms/BaseCheckbox.vue -->
<template>
  <div class="base-checkbox" :class="containerClasses">
    <label :for="checkboxId" class="base-checkbox__label">
      <input :id="checkboxId"
             type="checkbox"
             :checked="isChecked"
             :disabled="disabled"
             :indeterminate="indeterminate"
             @change="onChange"
             @blur="onBlur"
             @focus="onFocus"
             class="base-checkbox__input" />

      <span class="base-checkbox__control">
        <span class="base-checkbox__icon">
          <CheckIcon v-if="isChecked && !indeterminate" :size="iconSize" />
          <MinusIcon v-else-if="indeterminate" :size="iconSize" />
        </span>
      </span>

      <span v-if="label || description" class="base-checkbox__content">
        <span v-if="label" class="base-checkbox__text">
          {{ label }}
        </span>
        <span v-if="description" class="base-checkbox__description">
          {{ description }}
        </span>
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
  import { computed, useId } from 'vue'
  import { CheckIcon, MinusIcon } from '@/assets/icons'

  interface Props {
    modelValue: boolean | string[]
    label?: string
    description?: string
    disabled?: boolean
    indeterminate?: boolean
    size?: 'sm' | 'md' | 'lg'
    value?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    indeterminate: false,
    size: 'md',
    value: undefined,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean | string[]]
    'change': [value: boolean | string[]]
    'blur': [event: FocusEvent]
    'focus': [event: FocusEvent]
  }>()

  const checkboxId = computed(() => `checkbox-${useId()}`)

  const isArrayModel = computed(() => Array.isArray(props.modelValue))

  const isChecked = computed(() => {
    if (isArrayModel.value) {
      return props.value ? (props.modelValue as string[]).includes(props.value) : false
    }
    return props.modelValue as boolean
  })

  const iconSize = computed(() => {
    switch (props.size) {
      case 'sm': return 10
      case 'lg': return 14
      default: return 12
    }
  })

  const containerClasses = computed(() => [
    `base-checkbox--${props.size}`,
    {
      'base-checkbox--disabled': props.disabled,
      'base-checkbox--checked': isChecked.value,
      'base-checkbox--indeterminate': props.indeterminate,
    },
  ])

  const onChange = (event: Event) => {
    if (props.disabled) return

    const target = event.target as HTMLInputElement
    const newChecked = target.checked

    if (isArrayModel.value && props.value) {
      const currentArray = [...(props.modelValue as string[])]
      let newArray: string[]

      if (newChecked) {
        if (!currentArray.includes(props.value)) {
          newArray = [...currentArray, props.value]
        } else {
          newArray = currentArray
        }
      } else {
        newArray = currentArray.filter(item => item !== props.value)
      }

      emit('update:modelValue', newArray)
      emit('change', newArray)
    } else {
      emit('update:modelValue', newChecked)
      emit('change', newChecked)
    }
  }

  const onBlur = (event: FocusEvent) => {
    emit('blur', event)
  }

  const onFocus = (event: FocusEvent) => {
    emit('focus', event)
  }
</script>

<style scoped>
  .base-checkbox {
    display: inline-flex;
    user-select: none;
    width: fit-content;
  }

  .base-checkbox__label {
    display: inline-flex;
    align-items: flex-start;
    gap: var(--space-md, 1rem);
    cursor: pointer;
    margin: 0;
    transition: all var(--transition-fast, 0.15s);
  }

  .base-checkbox--disabled .base-checkbox__label {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .base-checkbox__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
  }

  .base-checkbox__control {
    position: relative;
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-md, 0.375rem);
    background: var(--color-surface, #fff);
    transition: all var(--transition-fast, 0.15s);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.125rem;
  }

  .base-checkbox--checked .base-checkbox__control,
  .base-checkbox--indeterminate .base-checkbox__control {
    background: var(--color-primary, #3b82f6);
    border-color: var(--color-primary, #3b82f6);
  }

  .base-checkbox__input:focus-visible + .base-checkbox__control {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary, #3b82f6) 40%, transparent);
  }

  .base-checkbox__input:not(:disabled):hover + .base-checkbox__control {
    border-color: var(--color-primary, #3b82f6);
  }

  .base-checkbox--disabled .base-checkbox__control {
    background: var(--color-surface-hover, #f8fafc);
    border-color: var(--color-border-light, #f3f4f6);
  }

  .base-checkbox--disabled.base-checkbox--checked .base-checkbox__control,
  .base-checkbox--disabled.base-checkbox--indeterminate .base-checkbox__control {
    background: color-mix(in srgb, var(--color-primary, #3b82f6) 40%, transparent);
    border-color: color-mix(in srgb, var(--color-primary, #3b82f6) 40%, transparent);
  }

  .base-checkbox__icon {
    color: var(--color-surface, #fff);
    opacity: 0;
    transform: scale(0.8);
    transition: all var(--transition-fast, 0.15s);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .base-checkbox--checked .base-checkbox__icon,
  .base-checkbox--indeterminate .base-checkbox__icon {
    opacity: 1;
    transform: scale(1);
  }

  .base-checkbox--disabled .base-checkbox__icon {
    color: color-mix(in srgb, var(--color-surface, #fff) 80%, transparent);
  }

  .base-checkbox__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 0.5rem);
  }

  .base-checkbox__text {
    display: block;
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-primary, #111827);
    line-height: 1.4;
    transition: color var(--transition-fast, 0.15s);
  }

  .base-checkbox--disabled .base-checkbox__text {
    color: var(--color-text-muted, #9ca3af);
  }

  .base-checkbox__description {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
    line-height: 1.3;
    transition: color var(--transition-fast, 0.15s);
  }

  .base-checkbox--disabled .base-checkbox__description {
    color: var(--color-text-muted, #9ca3af);
  }

  /* Sizes */
  .base-checkbox--sm {
    font-size: 0.875rem;
  }

    .base-checkbox--sm .base-checkbox__control {
      width: 1rem;
      height: 1rem;
      margin-top: 0.125rem;
      border-width: 1.5px;
    }

    .base-checkbox--sm .base-checkbox__content {
      gap: var(--space-xs, 0.25rem);
    }

    .base-checkbox--sm .base-checkbox__description {
      font-size: 0.6875rem;
    }

  .base-checkbox--lg {
    font-size: 1rem;
  }

    .base-checkbox--lg .base-checkbox__control {
      width: 1.5rem;
      height: 1.5rem;
      margin-top: 0.125rem;
    }

    .base-checkbox--lg .base-checkbox__content {
      gap: var(--space-sm, 0.5rem);
    }

    .base-checkbox--lg .base-checkbox__description {
      font-size: 0.8125rem;
    }

  /* Анимации при взаимодействии */
  .base-checkbox:not(.base-checkbox--disabled) .base-checkbox__control {
    cursor: pointer;
  }

  .base-checkbox:not(.base-checkbox--disabled):hover .base-checkbox__control {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  }

  .base-checkbox:not(.base-checkbox--disabled).base-checkbox--checked:hover .base-checkbox__control,
  .base-checkbox:not(.base-checkbox--disabled).base-checkbox--indeterminate:hover .base-checkbox__control {
    background: var(--color-primary-dark, #2563eb);
    border-color: var(--color-primary-dark, #2563eb);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  }

  /* Состояния для темной темы */
  @media (prefers-color-scheme: dark) {
    .base-checkbox__control {
      background: var(--color-surface-dark, #1e293b);
      border-color: var(--color-border-dark, #334155);
    }

    .base-checkbox--disabled .base-checkbox__control {
      background: var(--color-surface-hover-dark, #1e293b);
      border-color: var(--color-border-card-dark, #2d3748);
    }

    .base-checkbox__text {
      color: var(--color-text-primary-dark, #f1f5f9);
    }

    .base-checkbox__description {
      color: var(--color-text-secondary-dark, #cbd5e1);
    }
  }

  /* Улучшения для доступности */
  @media (prefers-reduced-motion: reduce) {
    .base-checkbox__control,
    .base-checkbox__icon,
    .base-checkbox__text,
    .base-checkbox__description {
      transition: none;
    }
  }

  /* Улучшенный фокус для высокого контраста */
  @media (prefers-contrast: high) {
    .base-checkbox__input:focus-visible + .base-checkbox__control {
      outline: 2px solid var(--color-text-primary, #111827);
      outline-offset: 1px;
    }
  }
</style>
