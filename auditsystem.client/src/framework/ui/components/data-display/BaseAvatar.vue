<!-- src/framework/ui/components/data-display/BaseAvatar.vue -->
<template>
  <div class="base-avatar" :class="avatarClasses" :style="avatarStyle">
    <!-- Image avatar -->
    <img v-if="src && !errorLoading"
         :src="src"
         :alt="alt"
         @error="handleImageError"
         class="base-avatar__image" />

    <!-- Fallback: initials -->
    <span v-else-if="initials" class="base-avatar__initials">
      {{ initials }}
    </span>

    <!-- Fallback: icon -->
    <span v-else class="base-avatar__icon">
      <UserIcon :size="iconSize" />
    </span>

    <!-- Status indicator -->
    <span v-if="status" class="base-avatar__status" :class="`base-avatar__status--${status}`" />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { UserIcon } from '@/assets/icons'

  interface Props {
    src?: string
    alt?: string
    initials?: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    shape?: 'circle' | 'square' | 'rounded'
    status?: 'online' | 'offline' | 'away' | 'busy'
    color?: string
    bordered?: boolean
    group?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    shape: 'circle',
    alt: 'Avatar',
    bordered: false,
    group: false
  })

  const errorLoading = ref(false)

  const avatarClasses = computed(() => [
    `base-avatar--${props.size}`,
    `base-avatar--${props.shape}`,
    {
      'base-avatar--with-status': props.status,
      'base-avatar--bordered': props.bordered,
      'base-avatar--grouped': props.group,
      'base-avatar--has-image': src && !errorLoading.value,
      'base-avatar--has-initials': !src || errorLoading.value,
    },
  ])

  const avatarStyle = computed(() => ({
    '--avatar-color': props.color,
  }))

  const iconSize = computed(() => {
    const sizes = { xs: 12, sm: 16, md: 20, lg: 24, xl: 28, '2xl': 32 }
    return sizes[props.size]
  })

  const handleImageError = () => {
    errorLoading.value = true
  }
</script>

<style scoped>
  .base-avatar {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--avatar-color, var(--color-primary));
    color: white;
    font-weight: var(--font-weight-medium, 500);
    flex-shrink: 0;
    transition: all var(--transition-fast);
    box-shadow: var(--shadow-sm);
  }

  /* Size variants */
  .base-avatar--xs {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.625rem;
  }

  .base-avatar--sm {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }

  .base-avatar--md {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 0.875rem;
  }

  .base-avatar--lg {
    width: 3rem;
    height: 3rem;
    font-size: 1rem;
  }

  .base-avatar--xl {
    width: 4rem;
    height: 4rem;
    font-size: 1.125rem;
  }

  .base-avatar--2xl {
    width: 5rem;
    height: 5rem;
    font-size: 1.25rem;
  }

  /* Shape variants */
  .base-avatar--circle {
    border-radius: var(--radius-full);
  }

  .base-avatar--square {
    border-radius: var(--radius-md);
  }

  .base-avatar--rounded {
    border-radius: var(--radius-lg);
  }

  /* Bordered variant */
  .base-avatar--bordered {
    border: 2px solid var(--color-surface);
    box-shadow: var(--shadow-md);
  }

  /* Image */
  .base-avatar__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
    transition: opacity var(--transition-fast);
  }

  .base-avatar--has-image:hover .base-avatar__image {
    opacity: 0.9;
  }

  /* Initials */
  .base-avatar__initials {
    line-height: 1;
    font-weight: var(--font-weight-semibold, 600);
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .base-avatar--has-initials:hover {
    background: color-mix(in srgb, var(--avatar-color, var(--color-primary)) 90%, black);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  /* Icon */
  .base-avatar__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
  }

  .base-avatar:hover .base-avatar__icon {
    opacity: 1;
  }

  /* Status indicator */
  .base-avatar__status {
    position: absolute;
    bottom: 0;
    right: 0;
    border: 2px solid var(--color-surface);
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
  }

  .base-avatar--xs .base-avatar__status {
    width: 0.5rem;
    height: 0.5rem;
    border-width: 1px;
  }

  .base-avatar--sm .base-avatar__status {
    width: 0.625rem;
    height: 0.625rem;
  }

  .base-avatar--md .base-avatar__status {
    width: 0.75rem;
    height: 0.75rem;
  }

  .base-avatar--lg .base-avatar__status {
    width: 0.875rem;
    height: 0.875rem;
  }

  .base-avatar--xl .base-avatar__status {
    width: 1rem;
    height: 1rem;
  }

  .base-avatar--2xl .base-avatar__status {
    width: 1.125rem;
    height: 1.125rem;
  }

  .base-avatar__status--online {
    background: var(--color-success);
    box-shadow: 0 0 0 2px var(--color-surface), 0 0 0 4px color-mix(in srgb, var(--color-success) 30%, transparent);
  }

  .base-avatar__status--offline {
    background: var(--color-text-muted);
    box-shadow: 0 0 0 2px var(--color-surface);
  }

  .base-avatar__status--away {
    background: var(--color-warning);
    box-shadow: 0 0 0 2px var(--color-surface), 0 0 0 4px color-mix(in srgb, var(--color-warning) 30%, transparent);
  }

  .base-avatar__status--busy {
    background: var(--color-error);
    box-shadow: 0 0 0 2px var(--color-surface), 0 0 0 4px color-mix(in srgb, var(--color-error) 30%, transparent);
  }

  /* Group avatar (for avatar lists) */
  .base-avatar--grouped {
    margin-left: -0.5rem;
    box-shadow: 0 0 0 2px var(--color-surface), var(--shadow-sm);
    transition: all var(--transition-normal);
  }

    .base-avatar--grouped:hover {
      margin-left: -0.25rem;
      transform: translateY(-1px);
      box-shadow: 0 0 0 2px var(--color-surface), var(--shadow-md);
      z-index: 1;
    }

    .base-avatar--grouped:first-child {
      margin-left: 0;
    }

  /* Focus styles for accessibility */
  .base-avatar:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    box-shadow: var(--shadow-focus);
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .base-avatar {
      transition: none;
    }

    .base-avatar--grouped {
      transition: none;
    }

      .base-avatar--grouped:hover {
        transform: none;
      }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .base-avatar--bordered {
      border-width: 3px;
    }

    .base-avatar__status {
      border-width: 3px;
    }
  }

  /* Print styles */
  @media print {
    .base-avatar {
      border: 1px solid var(--color-border) !important;
      box-shadow: none !important;
    }

    .base-avatar__status {
      border-color: var(--color-border) !important;
      box-shadow: none !important;
    }
  }
</style>
