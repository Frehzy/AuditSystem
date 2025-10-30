<!-- src/framework/ui/components/forms/BaseSlider.vue -->
<template>
  <div class="base-slider" :class="containerClasses">
    <label v-if="label" :for="sliderId" class="base-slider__label">
      {{ label }}
      <span v-if="showValue" class="base-slider__value">
        {{ displayValue }}
      </span>
    </label>

    <div class="base-slider__wrapper">
      <input :id="sliderId"
             ref="sliderRef"
             type="range"
             :value="modelValue"
             :min="min"
             :max="max"
             :step="step"
             :disabled="disabled"
             :class="sliderClasses"
             @input="onInput"
             @change="onChange"
             @focus="onFocus"
             @blur="onBlur" />

      <div v-if="showTicks && ticks.length > 0" class="base-slider__ticks">
        <span v-for="tick in ticks"
              :key="tick"
              class="base-slider__tick"
              :style="{ left: `${getTickPosition(tick)}%` }">
          {{ tick }}
        </span>
      </div>
    </div>

    <div v-if="(helpText && !error) || showMinMax" class="base-slider__meta">
      <div v-if="helpText && !error" class="base-slider__help">
        {{ helpText }}
      </div>
      <div v-if="showMinMax" class="base-slider__min-max">
        <span>{{ minLabel || min }}</span>
        <span>{{ maxLabel || max }}</span>
      </div>
    </div>

    <div v-if="error" class="base-slider__error" role="alert">
      <AlertIcon :size="14" />
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, useId } from 'vue'
  import { AlertIcon } from '@/assets/icons'

  interface Props {
    id?: string
    modelValue: number
    label?: string
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    error?: string
    helpText?: string
    showValue?: boolean
    showTicks?: boolean
    showMinMax?: boolean
    minLabel?: string
    maxLabel?: string
    ticks?: number[]
    size?: 'sm' | 'md' | 'lg'
  }

  const props = withDefaults(defineProps<Props>(), {
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    error: undefined,
    helpText: undefined,
    showValue: false,
    showTicks: false,
    showMinMax: false,
    minLabel: undefined,
    maxLabel: undefined,
    ticks: () => [],
    size: 'md',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: number]
    'change': [value: number]
    'blur': [event: FocusEvent]
    'focus': [event: FocusEvent]
  }>()

  const sliderRef = ref<HTMLInputElement | null>(null)
  const isFocused = ref(false)

  const sliderId = computed(() => props.id || `slider-${useId()}`)

  const displayValue = computed(() => {
    if (Number.isInteger(props.modelValue)) {
      return props.modelValue
    }
    return props.modelValue.toFixed(2)
  })

  const containerClasses = computed(() => [
    `base-slider--${props.size}`,
    {
      'base-slider--error': !!props.error,
      'base-slider--disabled': props.disabled,
      'base-slider--focused': isFocused.value,
      'base-slider--with-ticks': props.showTicks && props.ticks.length > 0,
    },
  ])

  const sliderClasses = computed(() => [
    {
      'base-slider__input--error': !!props.error,
      'base-slider__input--disabled': props.disabled,
    },
  ])

  const getTickPosition = (tick: number): number => {
    return ((tick - props.min) / (props.max - props.min)) * 100
  }

  const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const value = parseFloat(target.value)
    emit('update:modelValue', value)
  }

  const onChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const value = parseFloat(target.value)
    emit('change', value)
  }

  const onFocus = (event: FocusEvent) => {
    isFocused.value = true
    emit('focus', event)
  }

  const onBlur = (event: FocusEvent) => {
    isFocused.value = false
    emit('blur', event)
  }

  defineExpose({
    focus: () => sliderRef.value?.focus(),
    blur: () => sliderRef.value?.blur(),
  })
</script>

<style scoped>
  .base-slider {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: var(--spacing-md);
  }

  .base-slider__label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    line-height: 1.25;
  }

  .base-slider__value {
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-primary);
    font-size: 0.875rem;
    background: var(--color-surface-hover);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .base-slider__wrapper {
    position: relative;
    width: 100%;
    padding: var(--spacing-sm) 0;
  }

  .base-slider__input {
    width: 100%;
    height: 6px;
    border-radius: var(--radius-full);
    background: var(--color-border);
    outline: none;
    transition: all var(--transition-normal);
    appearance: none;
    cursor: pointer;
    margin: 0;
  }

    .base-slider__input::-webkit-slider-thumb {
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: var(--radius-full);
      background: var(--color-primary);
      cursor: pointer;
      border: 2px solid var(--color-surface);
      box-shadow: var(--shadow-md);
      transition: all var(--transition-fast);
    }

    .base-slider__input::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: var(--radius-full);
      background: var(--color-primary);
      cursor: pointer;
      border: 2px solid var(--color-surface);
      box-shadow: var(--shadow-md);
      transition: all var(--transition-fast);
    }

    .base-slider__input:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

      .base-slider__input:focus::-webkit-slider-thumb {
        box-shadow: var(--shadow-focus);
        transform: scale(1.1);
      }

      .base-slider__input:focus::-moz-range-thumb {
        box-shadow: var(--shadow-focus);
        transform: scale(1.1);
      }

    .base-slider__input:hover::-webkit-slider-thumb {
      transform: scale(1.05);
      box-shadow: var(--shadow-lg);
    }

    .base-slider__input:hover::-moz-range-thumb {
      transform: scale(1.05);
      box-shadow: var(--shadow-lg);
    }

  /* Error state */
  .base-slider--error .base-slider__input {
    background: var(--color-error-light);
  }

    .base-slider--error .base-slider__input::-webkit-slider-thumb {
      background: var(--color-error);
      border-color: var(--color-surface);
    }

    .base-slider--error .base-slider__input::-moz-range-thumb {
      background: var(--color-error);
      border-color: var(--color-surface);
    }

  /* Disabled state */
  .base-slider--disabled {
    opacity: 0.6;
  }

    .base-slider--disabled .base-slider__input {
      cursor: not-allowed;
      background: var(--color-border-light);
    }

      .base-slider--disabled .base-slider__input::-webkit-slider-thumb {
        cursor: not-allowed;
        background: var(--color-text-muted);
        transform: none;
        box-shadow: var(--shadow-sm);
      }

      .base-slider--disabled .base-slider__input::-moz-range-thumb {
        cursor: not-allowed;
        background: var(--color-text-muted);
        transform: none;
        box-shadow: var(--shadow-sm);
      }

  /* Focus state */
  .base-slider--focused .base-slider__input {
    background: var(--color-primary-light);
  }

  /* Ticks */
  .base-slider__ticks {
    position: absolute;
    top: calc(100% + var(--spacing-xs));
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .base-slider__tick {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    transform: translateX(-50%);
    font-weight: var(--font-weight-medium, 500);
  }

  /* Meta information */
  .base-slider__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--spacing-sm);
  }

  .base-slider__help {
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.25;
    font-weight: var(--font-weight-medium, 500);
  }

  .base-slider__min-max {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 200px;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium, 500);
  }

  /* Error message */
  .base-slider__error {
    margin-top: var(--spacing-xs);
    color: var(--color-error);
    font-size: 0.75rem;
    line-height: 1.25;
    font-weight: var(--font-weight-semibold, 600);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    background: var(--color-error-light);
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-error);
  }

  /* Size variants */
  .base-slider--sm .base-slider__input {
    height: 4px;
  }

    .base-slider--sm .base-slider__input::-webkit-slider-thumb {
      width: 16px;
      height: 16px;
    }

    .base-slider--sm .base-slider__input::-moz-range-thumb {
      width: 16px;
      height: 16px;
    }

  .base-slider--lg .base-slider__input {
    height: 8px;
  }

    .base-slider--lg .base-slider__input::-webkit-slider-thumb {
      width: 24px;
      height: 24px;
    }

    .base-slider--lg .base-slider__input::-moz-range-thumb {
      width: 24px;
      height: 24px;
    }

  /* Animation for value changes */
  .base-slider__value {
    transition: all var(--transition-fast);
  }

  .base-slider__input::-webkit-slider-thumb {
    transition: all var(--transition-fast);
  }

  .base-slider__input::-moz-range-thumb {
    transition: all var(--transition-fast);
  }

  /* Accessibility improvements */
  @media (prefers-reduced-motion: reduce) {
    .base-slider__input,
    .base-slider__value,
    .base-slider__input::-webkit-slider-thumb,
    .base-slider__input::-moz-range-thumb {
      transition: none;
    }
  }

  @media (prefers-contrast: high) {
    .base-slider__input {
      border: 1px solid var(--color-text-primary);
    }

      .base-slider__input::-webkit-slider-thumb {
        border: 2px solid var(--color-text-primary);
      }

      .base-slider__input::-moz-range-thumb {
        border: 2px solid var(--color-text-primary);
      }
  }
</style>
