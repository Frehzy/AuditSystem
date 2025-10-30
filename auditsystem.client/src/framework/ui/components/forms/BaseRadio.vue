<!-- src/framework/ui/components/forms/BaseRadio.vue -->
<template>
  <div class="base-radio" :class="containerClasses">
    <label :for="radioId" class="base-radio__label">
      <input :id="radioId"
             type="radio"
             :checked="isChecked"
             :disabled="disabled"
             :value="value"
             :name="name"
             @change="onChange"
             @blur="onBlur"
             @focus="onFocus"
             class="base-radio__input" />

      <span class="base-radio__control">
        <span class="base-radio__dot"></span>
      </span>

      <span class="base-radio__content">
        <span class="base-radio__text">
          {{ label }}
        </span>
        <span v-if="description" class="base-radio__description">
          {{ description }}
        </span>
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
  import { computed, useId } from 'vue'

  interface Props {
    modelValue: string | number | boolean
    value: string | number | boolean
    label?: string
    description?: string
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg'
    name?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    size: 'md',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string | number | boolean]
    'change': [value: string | number | boolean]
    'blur': [event: FocusEvent]
    'focus': [event: FocusEvent]
  }>()

  const radioId = computed(() => `radio-${useId()}`)

  const isChecked = computed(() => props.modelValue === props.value)

  const containerClasses = computed(() => [
    `base-radio--${props.size}`,
    {
      'base-radio--disabled': props.disabled,
      'base-radio--checked': isChecked.value,
      'base-radio--error': false, // Можно добавить состояние ошибки в будущем
    },
  ])

  const onChange = () => {
    if (!props.disabled) {
      emit('update:modelValue', props.value)
      emit('change', props.value)
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
  .base-radio {
    display: inline-flex;
    user-select: none;
    transition: all var(--transition-fast);
  }

  .base-radio__label {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    cursor: pointer;
    margin: 0;
    padding: var(--space-xs) 0;
    transition: all var(--transition-fast);
  }

  .base-radio--disabled .base-radio__label {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .base-radio__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .base-radio__control {
    position: relative;
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    transition: all var(--transition-normal);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.125rem;
    box-shadow: var(--shadow-sm);
  }

  .base-radio--checked .base-radio__control {
    border-color: var(--color-primary);
    background: var(--color-primary-50);
    box-shadow: var(--shadow-primary);
  }

  .base-radio--disabled .base-radio__control {
    background: var(--color-surface-hover);
    border-color: var(--color-border-card);
  }

  .base-radio__input:focus-visible + .base-radio__control {
    box-shadow: var(--shadow-focus);
    border-color: var(--color-primary);
  }

  .base-radio__input:not(:disabled):hover + .base-radio__control {
    border-color: var(--color-primary-light);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .base-radio--checked .base-radio__input:not(:disabled):hover + .base-radio__control {
    background: var(--color-primary-100);
    border-color: var(--color-primary-dark);
  }

  .base-radio__dot {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: var(--radius-full);
    background: var(--color-primary);
    opacity: 0;
    transform: scale(0);
    transition: all var(--transition-normal);
    box-shadow: 0 1px 2px color-mix(in srgb, var(--color-primary) 30%, transparent);
  }

  .base-radio--checked .base-radio__dot {
    opacity: 1;
    transform: scale(1);
  }

  .base-radio--disabled .base-radio__dot {
    background: var(--color-text-muted);
  }

  .base-radio__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .base-radio__text {
    display: block;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    line-height: 1.4;
    transition: color var(--transition-fast);
  }

  .base-radio--disabled .base-radio__text {
    color: var(--color-text-muted);
  }

  .base-radio__description {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    line-height: 1.3;
    transition: color var(--transition-fast);
  }

  .base-radio--disabled .base-radio__description {
    color: var(--color-text-muted-light);
  }

  /* Size variants */
  .base-radio--sm {
    font-size: 0.875rem;
  }

    .base-radio--sm .base-radio__label {
      gap: var(--space-sm);
    }

    .base-radio--sm .base-radio__control {
      width: 1rem;
      height: 1rem;
      margin-top: 0.125rem;
    }

    .base-radio--sm .base-radio__dot {
      width: 0.5rem;
      height: 0.5rem;
    }

    .base-radio--sm .base-radio__description {
      font-size: 0.6875rem;
    }

  .base-radio--md {
    font-size: 0.9375rem;
  }

  .base-radio--lg {
    font-size: 1rem;
  }

    .base-radio--lg .base-radio__label {
      gap: var(--space-lg);
    }

    .base-radio--lg .base-radio__control {
      width: 1.5rem;
      height: 1.5rem;
      margin-top: 0.125rem;
    }

    .base-radio--lg .base-radio__dot {
      width: 0.75rem;
      height: 0.75rem;
    }

    .base-radio--lg .base-radio__description {
      font-size: 0.8125rem;
    }

  /* Animation states */
  .base-radio__control {
    animation: radio-appear 0.2s ease-out;
  }

  @keyframes radio-appear {
    from {
      opacity: 0;
      transform: scale(0.8);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Focus ring for accessibility */
  .base-radio__input:focus-visible ~ .base-radio__content .base-radio__text {
    color: var(--color-primary);
  }

  /* Error state (можно использовать в будущем) */
  .base-radio--error .base-radio__control {
    border-color: var(--color-error);
  }

  .base-radio--error.base-radio--checked .base-radio__control {
    border-color: var(--color-error);
    background: var(--color-error-light);
  }

  .base-radio--error .base-radio__dot {
    background: var(--color-error);
  }

  .base-radio--error .base-radio__text {
    color: var(--color-error);
  }

  /* Group context styles */
  .base-radio:not(:last-child) {
    margin-bottom: var(--space-xs);
  }

  /* Print styles */
  @media print {
    .base-radio__control {
      border-color: var(--color-gray-800);
      background: var(--color-surface);
    }

    .base-radio--checked .base-radio__control {
      border-color: var(--color-gray-800);
      background: var(--color-surface);
    }

    .base-radio__dot {
      background: var(--color-gray-800);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .base-radio,
    .base-radio__label,
    .base-radio__control,
    .base-radio__dot {
      transition: none;
      animation: none;
    }
  }

  /* High contrast */
  @media (prefers-contrast: high) {
    .base-radio__control {
      border-width: 2px;
    }

    .base-radio--checked .base-radio__control {
      border-width: 3px;
    }

    .base-radio__dot {
      box-shadow: none;
    }
  }
</style>
