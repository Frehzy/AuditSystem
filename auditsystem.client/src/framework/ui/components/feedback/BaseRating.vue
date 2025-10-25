<!-- src/framework/ui/components/feedback/BaseRating.vue -->
<template>
  <div class="base-rating" :class="ratingClasses">
    <button v-for="star in maxStars"
            :key="star"
            :disabled="disabled || readonly"
            @click="setRating(star)"
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0"
            class="base-rating__star"
            :class="getStarClass(star)"
            :aria-label="`Оценить ${star} из ${maxStars}`">
      <StarIcon :size="starSize" :fill="getStarFill(star)" />
    </button>

    <span v-if="showValue" class="base-rating__value">
      {{ displayValue }}
    </span>
  </div>
</template>

<script setup lang="ts">
  import { StarIcon } from '@/assets/icons'

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

  const ratingClasses = computed(() => [
    'base-rating',
    `base-rating--${props.size}`,
    {
      'base-rating--disabled': props.disabled,
      'base-rating--readonly': props.readonly,
    },
  ])

  const starSize = computed(() => {
    const sizes = { sm: 16, md: 20, lg: 24 }
    return sizes[props.size]
  })

  const displayValue = computed(() => {
    return `${props.modelValue.toFixed(1)} / ${props.maxStars}`
  })

  const getStarClass = (star: number) => [
    'base-rating__star',
    {
      'base-rating__star--active': star <= (hoverRating.value || props.modelValue),
    },
  ]

  const getStarFill = (star: number): string | undefined => {
    const currentRating = hoverRating.value || props.modelValue
    return star <= currentRating ? 'currentColor' : undefined
  }

  const setRating = (rating: number) => {
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
    gap: var(--space-xs);
  }

  .base-rating__star {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    color: var(--color-border);
  }

    .base-rating__star:hover:not(.base-rating--disabled, .base-rating--readonly) {
      color: var(--color-warning);
      transform: scale(1.1);
    }

  .base-rating__star--active {
    color: var(--color-warning);
  }

  .base-rating--disabled .base-rating__star,
  .base-rating--readonly .base-rating__star {
    cursor: default;
  }

    .base-rating--disabled .base-rating__star:hover,
    .base-rating--readonly .base-rating__star:hover {
      transform: none;
    }

  .base-rating__value {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-left: var(--space-sm);
  }

  /* Sizes */
  .base-rating--sm {
    gap: 0.25rem;
  }

    .base-rating--sm .base-rating__star {
      padding: 0.125rem;
    }

  .base-rating--lg {
    gap: var(--space-sm);
  }

    .base-rating--lg .base-rating__star {
      padding: var(--space-sm);
    }
</style>
