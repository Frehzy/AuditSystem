<!-- src/framework/ui/components/forms/BaseRadio.vue -->
<template>
  <div class="base-radio" :class="containerClasses">
    <label :for="radioId" class="base-radio__label">
      <input :id="radioId"
             type="radio"
             :checked="isChecked"
             :disabled="disabled"
             :value="value"
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
    'base-radio',
    `base-radio--${props.size}`,
    {
      'base-radio--disabled': props.disabled,
      'base-radio--checked': isChecked.value,
    },
  ])

  const onChange = () => {
    emit('update:modelValue', props.value)
    emit('change', props.value)
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
  }

  .base-radio__label {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    cursor: pointer;
    margin: 0;
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
  }

  .base-radio--checked .base-radio__control {
    border-color: var(--color-primary);
  }

  .base-radio__input:focus-visible + .base-radio__control {
    box-shadow: var(--shadow-focus);
  }

  .base-radio__dot {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: var(--radius-full);
    background: var(--color-primary);
    opacity: 0;
    transform: scale(0);
    transition: all var(--transition-normal);
  }

  .base-radio--checked .base-radio__dot {
    opacity: 1;
    transform: scale(1);
  }

  .base-radio__content {
    flex: 1;
    min-width: 0;
  }

  .base-radio__text {
    display: block;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    line-height: 1.4;
  }

  .base-radio__description {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    line-height: 1.3;
    margin-top: var(--space-xs);
  }

  /* Sizes */
  .base-radio--sm {
    font-size: 0.875rem;
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

  .base-radio--lg {
    font-size: 1rem;
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
</style>
