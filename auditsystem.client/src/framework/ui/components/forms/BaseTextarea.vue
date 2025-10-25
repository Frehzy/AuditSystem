<!-- src/framework/ui/components/forms/BaseTextarea.vue -->
<template>
  <div class="base-textarea" :class="containerClasses">
    <label v-if="label" :for="textareaId" class="base-textarea__label">
      {{ label }}
      <span v-if="required" class="base-textarea__required">*</span>
    </label>

    <div class="base-textarea__wrapper">
      <textarea :id="textareaId"
                ref="textareaRef"
                :value="modelValue"
                :placeholder="placeholder"
                :disabled="disabled"
                :readonly="readonly"
                :rows="rows"
                :maxlength="maxlength"
                :class="textareaClasses"
                @input="onInput"
                @blur="onBlur"
                @focus="onFocus"
                @keydown="onKeydown" />

      <div v-if="hasActions" class="base-textarea__actions">
        <button v-if="clearable && modelValue"
                type="button"
                class="base-textarea__clear"
                @click="clearTextarea"
                aria-label="Очистить поле">
          <CloseIcon :size="16" />
        </button>
      </div>
    </div>

    <div v-if="helpText && !error" class="base-textarea__help">
      {{ helpText }}
    </div>

    <div v-if="error" class="base-textarea__error" role="alert">
      <AlertIcon :size="14" />
      {{ error }}
    </div>

    <div v-if="maxlength && showCounter" class="base-textarea__counter">
      {{ currentLength }}/{{ maxlength }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, useId, nextTick } from 'vue'
  import { CloseIcon, AlertIcon } from '@/assets/icons'

  interface Props {
    id?: string
    modelValue: string
    label?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    error?: string
    helpText?: string
    rows?: number
    maxlength?: number
    showCounter?: boolean
    clearable?: boolean
    resize?: 'none' | 'vertical' | 'horizontal' | 'both'
    size?: 'sm' | 'md' | 'lg'
  }

  const props = withDefaults(defineProps<Props>(), {
    required: false,
    disabled: false,
    readonly: false,
    error: undefined,
    helpText: undefined,
    rows: 3,
    showCounter: false,
    clearable: false,
    resize: 'vertical',
    size: 'md',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    'blur': [event: FocusEvent]
    'focus': [event: FocusEvent]
    'keydown': [event: KeyboardEvent]
    'clear': []
  }>()

  const textareaRef = ref<HTMLTextAreaElement | null>(null)
  const isFocused = ref(false)

  const textareaId = computed(() => props.id || `textarea-${useId()}`)
  const currentLength = computed(() => props.modelValue?.length || 0)

  const hasActions = computed(() => props.clearable)

  const containerClasses = computed(() => [
    'base-textarea',
    `base-textarea--${props.size}`,
    {
      'base-textarea--error': !!props.error,
      'base-textarea--disabled': props.disabled,
      'base-textarea--focused': isFocused.value,
    },
  ])

  const textareaClasses = computed(() => [
    'base-textarea__input',
    `base-textarea__input--resize-${props.resize}`,
    {
      'base-textarea__input--error': !!props.error,
      'base-textarea__input--disabled': props.disabled,
    },
  ])

  const onInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
    emit('update:modelValue', target.value)
  }

  const onBlur = (event: FocusEvent) => {
    isFocused.value = false
    emit('blur', event)
  }

  const onFocus = (event: FocusEvent) => {
    isFocused.value = true
    emit('focus', event)
  }

  const onKeydown = (event: KeyboardEvent) => {
    emit('keydown', event)
  }

  const clearTextarea = () => {
    emit('update:modelValue', '')
    emit('clear')
    nextTick(() => textareaRef.value?.focus())
  }

  defineExpose({
    focus: () => textareaRef.value?.focus(),
    blur: () => textareaRef.value?.blur(),
    select: () => textareaRef.value?.select(),
  })
</script>

<style scoped>
  .base-textarea {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: var(--space-md);
  }

  .base-textarea__label {
    display: block;
    margin-bottom: var(--space-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    line-height: 1.25;
  }

  .base-textarea__required {
    color: var(--color-error);
    margin-left: var(--space-xs);
  }

  .base-textarea__wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .base-textarea__input {
    width: 100%;
    padding: var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    font-family: var(--font-family-sans);
    line-height: 1.5;
    outline: none;
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-sm);
  }

  .base-textarea__input--resize-none {
    resize: none;
  }

  .base-textarea__input--resize-vertical {
    resize: vertical;
  }

  .base-textarea__input--resize-horizontal {
    resize: horizontal;
  }

  .base-textarea__input--resize-both {
    resize: both;
  }

  .base-textarea__input:focus {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-focus);
  }

  .base-textarea--error .base-textarea__input {
    border-color: var(--color-error);
    box-shadow: 0 0 0 1px var(--color-error);
  }

    .base-textarea--error .base-textarea__input:focus {
      border-color: var(--color-error);
      box-shadow: var(--shadow-error);
    }

  .base-textarea--disabled .base-textarea__input {
    background-color: var(--color-surface-disabled);
    opacity: 0.6;
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }

  .base-textarea__actions {
    position: absolute;
    top: var(--space-md);
    right: var(--space-md);
    display: flex;
    gap: var(--space-xs);
  }

  .base-textarea__clear {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
  }

    .base-textarea__clear:hover {
      background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
      color: var(--color-primary);
    }

  .base-textarea--disabled .base-textarea__clear {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .base-textarea__help {
    margin-top: var(--space-xs);
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.25;
  }

  .base-textarea__error {
    margin-top: var(--space-xs);
    color: var(--color-error);
    font-size: 0.75rem;
    line-height: 1.25;
    font-weight: var(--font-weight-medium);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .base-textarea__counter {
    margin-top: var(--space-xs);
    text-align: right;
    color: var(--color-text-muted);
    font-size: 0.75rem;
  }

  /* Sizes */
  .base-textarea--sm .base-textarea__input {
    padding: var(--space-sm) var(--space-md);
    font-size: 0.8125rem;
  }

  .base-textarea--lg .base-textarea__input {
    padding: var(--space-lg);
    font-size: 1rem;
  }
</style>
