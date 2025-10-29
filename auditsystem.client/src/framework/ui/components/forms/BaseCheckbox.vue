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
          <CheckIcon v-if="isChecked && !indeterminate" :size="12" />
          <MinusIcon v-else-if="indeterminate" :size="12" />
        </span>
      </span>

      <span class="base-checkbox__content">
        <span class="base-checkbox__text">
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

  const containerClasses = computed(() => [
    'base-checkbox',
    `base-checkbox--${props.size}`,
    {
      'base-checkbox--disabled': props.disabled,
      'base-checkbox--checked': isChecked.value,
      'base-checkbox--indeterminate': props.indeterminate,
    },
  ])

  const onChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const newChecked = target.checked

    if (isArrayModel.value && props.value) {
      const currentArray = [...(props.modelValue as string[])]
      let newArray: string[]

      if (newChecked) {
        // Добавляем значение в массив, если его там нет
        if (!currentArray.includes(props.value)) {
          newArray = [...currentArray, props.value]
        } else {
          newArray = currentArray
        }
      } else {
        // Удаляем значение из массива
        newArray = currentArray.filter(item => item !== props.value)
      }

      emit('update:modelValue', newArray)
      emit('change', newArray)
    } else {
      // Обычный boolean режим
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
  }

  .base-checkbox__label {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    cursor: pointer;
    margin: 0;
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
  }

  .base-checkbox__control {
    position: relative;
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    transition: all var(--transition-normal);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.125rem;
  }

  .base-checkbox--checked .base-checkbox__control,
  .base-checkbox--indeterminate .base-checkbox__control {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  .base-checkbox__input:focus-visible + .base-checkbox__control {
    box-shadow: var(--shadow-focus);
  }

  .base-checkbox__icon {
    color: white;
    opacity: 0;
    transform: scale(0.8);
    transition: all var(--transition-normal);
  }

  .base-checkbox--checked .base-checkbox__icon,
  .base-checkbox--indeterminate .base-checkbox__icon {
    opacity: 1;
    transform: scale(1);
  }

  .base-checkbox__content {
    flex: 1;
    min-width: 0;
  }

  .base-checkbox__text {
    display: block;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    line-height: 1.4;
  }

  .base-checkbox__description {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    line-height: 1.3;
    margin-top: var(--space-xs);
  }

  /* Sizes */
  .base-checkbox--sm {
    font-size: 0.875rem;
  }

    .base-checkbox--sm .base-checkbox__control {
      width: 1rem;
      height: 1rem;
      margin-top: 0.125rem;
    }

    .base-checkbox--sm .base-checkbox__icon {
      width: 10px;
      height: 10px;
    }

  .base-checkbox--lg {
    font-size: 1rem;
  }

    .base-checkbox--lg .base-checkbox__control {
      width: 1.5rem;
      height: 1.5rem;
      margin-top: 0.125rem;
    }

    .base-checkbox--lg .base-checkbox__icon {
      width: 14px;
      height: 14px;
    }
</style>
