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
        <span>{{ min }}</span>
        <span>{{ max }}</span>
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
    'base-slider',
    `base-slider--${props.size}`,
    {
      'base-slider--error': !!props.error,
      'base-slider--disabled': props.disabled,
      'base-slider--focused': isFocused.value,
      'base-slider--with-ticks': props.showTicks && props.ticks.length > 0,
    },
  ])

  const sliderClasses = computed(() => [
    'base-slider__input',
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
    margin-bottom: var(--space-md);
  }

  .base-slider__label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    line-height: 1.25;
  }

  .base-slider__value {
    font-weight: var(--font-weight-medium);
    color: var(--color-primary);
    font-size: 0.875rem;
  }

  .base-slider__wrapper {
    position: relative;
    width: 100%;
  }

  .base-slider__input {
    width: 100%;
    height: 4px;
    border-radius: var(--radius-full);
    background: var(--color-border);
    outline: none;
    transition: all var(--transition-normal);
    appearance: none;
    cursor: pointer;
  }

    .base-slider__input::-webkit-slider-thumb {
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: var(--radius-full);
      background: var(--color-primary);
      cursor: pointer;
      border: 2px solid white;
      box-shadow: var(--shadow-md);
      transition: all var(--transition-fast);
    }

    .base-slider__input::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: var(--radius-full);
      background: var(--color-primary);
      cursor: pointer;
      border: 2px solid white;
      box-shadow: var(--shadow-md);
      transition: all var(--transition-fast);
    }

    .base-slider__input:focus::-webkit-slider-thumb {
      box-shadow: var(--shadow-focus);
      transform: scale(1.1);
    }

    .base-slider__input:focus::-moz-range-thumb {
      box-shadow: var(--shadow-focus);
      transform: scale(1.1);
    }

  .base-slider--error .base-slider__input {
    background: var(--color-error-light);
  }

    .base-slider--error .base-slider__input::-webkit-slider-thumb {
      background: var(--color-error);
    }

    .base-slider--error .base-slider__input::-moz-range-thumb {
      background: var(--color-error);
    }

  .base-slider--disabled .base-slider__input {
    opacity: 0.6;
    cursor: not-allowed;
  }

    .base-slider--disabled .base-slider__input::-webkit-slider-thumb {
      cursor: not-allowed;
      background: var(--color-text-muted);
    }

    .base-slider--disabled .base-slider__input::-moz-range-thumb {
      cursor: not-allowed;
      background: var(--color-text-muted);
    }

  .base-slider__ticks {
    position: absolute;
    top: 12px;
    left: 8px;
    right: 8px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .base-slider__tick {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    transform: translateX(-50%);
  }

  .base-slider__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--space-sm);
  }

  .base-slider__help {
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.25;
  }

  .base-slider__min-max {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 200px;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .base-slider__error {
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
  .base-slider--sm .base-slider__input {
    height: 3px;
  }

    .base-slider--sm .base-slider__input::-webkit-slider-thumb {
      width: 14px;
      height: 14px;
    }

    .base-slider--sm .base-slider__input::-moz-range-thumb {
      width: 14px;
      height: 14px;
    }

  .base-slider--lg .base-slider__input {
    height: 6px;
  }

    .base-slider--lg .base-slider__input::-webkit-slider-thumb {
      width: 20px;
      height: 20px;
    }

    .base-slider--lg .base-slider__input::-moz-range-thumb {
      width: 20px;
      height: 20px;
    }
</style>
