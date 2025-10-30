<template>
  <div class="base-rating" :class="computedClasses">
    <button v-for="star in maxStars"
            :key="star"
            :disabled="disabled || readonly"
            @click="handleSetRating(star)"
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0"
            class="base-rating__star"
            :class="getComputedStarClass(star)"
            :aria-label="`Оценить ${star} из ${maxStars}`">
      <StarIcon :size="computedStarSize" :fill="getComputedStarFill(star)" />
    </button>

    <span v-if="showValue" class="base-rating__value">
      {{ computedDisplayValue }}
    </span>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import StarIcon from '@/assets/icons/status/StarIcon.vue';

  interface Props {
    modelValue: number
    maxStars?: number
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    readonly?: boolean
    showValue?: boolean
    allowHalf?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    maxStars: 5,
    size: 'md',
    disabled: false,
    readonly: false,
    showValue: false,
    allowHalf: false,
  })

  const emit = defineEmits<{
    'update:modelValue': [rating: number]
    'change': [rating: number]
  }>()

  const hoverRating = ref(0)

  const computedClasses = computed(() => [
    `base-rating--${props.size}`,
    {
      'base-rating--disabled': props.disabled,
      'base-rating--readonly': props.readonly,
    },
  ])

  const computedStarSize = computed(() => {
    const sizes = { sm: 16, md: 20, lg: 24 }
    return sizes[props.size]
  })

  const computedDisplayValue = computed(() => {
    return `${props.modelValue.toFixed(1)} / ${props.maxStars}`
  })

  const getComputedStarClass = (star: number) => [
    {
      'base-rating__star--active': star <= (hoverRating.value || props.modelValue),
      'base-rating__star--hover': star <= hoverRating.value,
    },
  ]

  const getComputedStarFill = (star: number): string => {
    const currentRating = hoverRating.value || props.modelValue
    return star <= currentRating ? 'currentColor' : 'none'
  }

  const handleSetRating = (rating: number) => {
    if (!props.disabled && !props.readonly) {
      emit('update:modelValue', rating)
      emit('change', rating)
    }
  }
</script>

<style scoped>
  .base-rating {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs, 0.5rem);
    background: var(--color-surface, #fff);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-sm, 0.75rem);
    border: 1px solid var(--color-border, #e5e7eb);
    transition: all var(--transition-fast, 0.15s);
  }

  .base-rating__star {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-xs, 0.5rem);
    border-radius: var(--radius-sm, 0.375rem);
    transition: all var(--transition-fast, 0.15s);
    color: var(--color-border, #e5e7eb);
    display: flex;
    align-items: center;
    justify-content: center;
  }

    .base-rating__star:hover:not(.base-rating--disabled, .base-rating--readonly) {
      color: var(--color-warning, #f59e0b);
      background: var(--color-warning-light, #fef3c7);
      transform: scale(1.1);
      box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
    }

  .base-rating__star--active {
    color: var(--color-warning, #f59e0b);
  }

  .base-rating__star--hover {
    background: var(--color-surface-hover, #f8fafc);
  }

  .base-rating--disabled,
  .base-rating--readonly {
    background: var(--color-surface-hover, #f8fafc);
    border-color: var(--color-border-light, #f3f4f6);
  }

    .base-rating--disabled .base-rating__star,
    .base-rating--readonly .base-rating__star {
      cursor: default;
      color: var(--color-text-muted, #9ca3af);
    }

      .base-rating--disabled .base-rating__star:hover,
      .base-rating--readonly .base-rating__star:hover {
        transform: none;
        background: none;
        box-shadow: none;
      }

    .base-rating--disabled .base-rating__star--active,
    .base-rating--readonly .base-rating__star--active {
      color: var(--color-warning-light, #fef3c7);
    }

  .base-rating__value {
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-secondary, #6b7280);
    margin-left: var(--space-sm, 0.75rem);
    padding: var(--space-xs, 0.5rem) var(--space-sm, 0.75rem);
    background: var(--color-surface-hover, #f8fafc);
    border-radius: var(--radius-md, 0.5rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  /* Sizes */
  .base-rating--sm {
    gap: 0.25rem;
    padding: var(--space-xs, 0.5rem);
  }

    .base-rating--sm .base-rating__star {
      padding: 0.125rem;
    }

    .base-rating--sm .base-rating__value {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }

  .base-rating--md {
    gap: var(--space-xs, 0.5rem);
    padding: var(--space-sm, 0.75rem);
  }

  .base-rating--lg {
    gap: var(--space-sm, 0.75rem);
    padding: var(--space-md, 1rem);
    border-radius: var(--radius-xl, 0.75rem);
  }

    .base-rating--lg .base-rating__star {
      padding: var(--space-sm, 0.75rem);
    }

    .base-rating--lg .base-rating__value {
      font-size: 1rem;
      padding: var(--space-sm, 0.75rem) var(--space-md, 1rem);
    }

  /* Focus states */
  .base-rating__star:focus-visible {
    outline: 2px solid var(--color-primary, #3b82f6);
    outline-offset: 2px;
    box-shadow: var(--shadow-focus, 0 0 0 3px color-mix(in srgb, var(--color-primary) 40%, transparent));
  }

  /* Animation for rating changes */
  .base-rating__star--active {
    animation: star-pop 0.2s ease-out;
  }

  @keyframes star-pop {
    0% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.2);
    }

    100% {
      transform: scale(1);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .base-rating {
      gap: 0.25rem;
      padding: var(--space-xs, 0.5rem);
    }

    .base-rating__star {
      padding: 0.25rem;
    }

    .base-rating__value {
      font-size: 0.75rem;
      margin-left: var(--space-xs, 0.5rem);
      padding: 0.25rem 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .base-rating--lg {
      gap: var(--space-xs, 0.5rem);
      padding: var(--space-sm, 0.75rem);
    }

      .base-rating--lg .base-rating__star {
        padding: var(--space-xs, 0.5rem);
      }

      .base-rating--lg .base-rating__value {
        font-size: 0.875rem;
        padding: var(--space-xs, 0.5rem) var(--space-sm, 0.75rem);
      }
  }
</style>
