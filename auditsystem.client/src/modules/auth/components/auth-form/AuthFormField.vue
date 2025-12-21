<!-- Поле формы авторизации -->
<template>
  <div :class="['form-field', { 'form-field--error': hasError, 'form-field--disabled': disabled }]">
    <label v-if="label" :for="id" class="form-field__label">
      {{ label }}
      <span v-if="required" class="form-field__required">*</span>
    </label>

    <div class="form-field__input-wrapper">
      <div v-if="$slots.prefix" class="form-field__prefix">
        <slot name="prefix" />
      </div>

      <input :id="id"
             ref="inputRef"
             v-bind="$attrs"
             :value="modelValue"
             :type="inputType"
             :placeholder="placeholder"
             :disabled="disabled"
             :autocomplete="autocomplete"
             :required="required"
             class="form-field__input"
             @input="handleInput"
             @blur="handleBlur"
             @focus="handleFocus" />

      <div v-if="$slots.suffix" class="form-field__suffix">
        <slot name="suffix" />
      </div>
    </div>

    <div v-if="hasError && showError" class="form-field__error">
      {{ error }}
    </div>

    <div v-if="hint && !hasError" class="form-field__hint">
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, useAttrs } from 'vue';

  interface Props {
    modelValue: string;
    label?: string;
    type?: string;
    placeholder?: string;
    error?: string;
    hint?: string;
    disabled?: boolean;
    required?: boolean;
    autocomplete?: string;
    touched?: boolean;
  }

  interface Emits {
    (e: 'update:modelValue', value: string): void;
    (e: 'blur'): void;
    (e: 'focus'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    required: false,
    disabled: false,
    autocomplete: 'off'
  });

  const emit = defineEmits<Emits>();
  const attrs = useAttrs();

  const inputRef = ref<HTMLInputElement>();
  const id = `field-${Math.random().toString(36).substring(2, 9)}`;

  const hasError = computed(() => !!props.error);
  const showError = computed(() => props.touched || hasError.value);

  // Используем локальную переменную чтобы избежать конфликта с пропсом
  const inputType = computed(() => props.type);

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
  };

  const handleBlur = () => {
    emit('blur');
  };

  const handleFocus = () => {
    emit('focus');
  };

  const focus = () => {
    inputRef.value?.focus();
  };

  const select = () => {
    inputRef.value?.select();
  };

  onMounted(() => {
    if (import.meta.env.DEV) {
      if (!props.label && !attrs['aria-label']) {
        console.warn('Form field should have either a label or aria-label');
      }
    }
  });

  defineExpose({
    focus,
    select
  });
</script>

<style scoped>
  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .form-field__label {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .form-field__required {
    color: var(--color-error);
  }

  .form-field__input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    border: var(--border-width-1) solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);
    transition: all var(--transition-fast);
    overflow: hidden;
  }

    .form-field__input-wrapper:focus-within {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent);
    }

  .form-field--error .form-field__input-wrapper {
    border-color: var(--color-error);
  }

  .form-field--disabled .form-field__input-wrapper {
    background: var(--color-surface-hover);
    border-color: var(--color-border);
    opacity: 0.6;
    cursor: not-allowed;
  }

  .form-field--disabled .form-field__input {
    cursor: not-allowed;
  }

  .form-field__prefix,
  .form-field__suffix {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 var(--spacing-sm);
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .form-field__prefix {
    border-right: var(--border-width-1) solid var(--color-border);
  }

  .form-field__suffix {
    border-left: var(--border-width-1) solid var(--color-border);
  }

  .form-field__input {
    flex: 1;
    padding: var(--spacing-sm);
    border: none;
    background: none;
    color: var(--color-text-primary);
    font-family: inherit;
    font-size: var(--text-base);
    outline: none;
    width: 100%;
    min-height: 2.5rem;
  }

    .form-field__input:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }

    .form-field__input::placeholder {
      color: var(--color-text-muted);
      opacity: 0.7;
    }

  .form-field__error {
    font-size: var(--text-xs);
    color: var(--color-error);
    margin-top: var(--spacing-xs);
  }

  .form-field__hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin-top: var(--spacing-xs);
  }
</style>
