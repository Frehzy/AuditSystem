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
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square' | 'rounded'
  status?: 'online' | 'offline' | 'away' | 'busy'
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  shape: 'circle',
  alt: 'Avatar',
})

const errorLoading = ref(false)

const avatarClasses = computed(() => [
  'base-avatar',
  `base-avatar--${props.size}`,
  `base-avatar--${props.shape}`,
  {
    'base-avatar--with-status': props.status,
  },
])

const avatarStyle = computed(() => ({
  '--avatar-color': props.color,
}))

const iconSize = computed(() => {
  const sizes = { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 }
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
    background: var(--color-primary);
    color: white;
    font-weight: var(--font-weight-medium);
    flex-shrink: 0;
  }

  /* Size variants */
  .base-avatar--xs {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }

  .base-avatar--sm {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }

  .base-avatar--md {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .base-avatar--lg {
    width: 48px;
    height: 48px;
    font-size: 1.125rem;
  }

  .base-avatar--xl {
    width: 64px;
    height: 64px;
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

  /* Image */
  .base-avatar__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  }

  /* Initials */
  .base-avatar__initials {
    line-height: 1;
    font-weight: var(--font-weight-semibold);
  }

  /* Icon */
  .base-avatar__icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Status indicator */
  .base-avatar__status {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 8px;
    height: 8px;
    border: 2px solid var(--color-surface);
    border-radius: var(--radius-full);
  }

  .base-avatar--xs .base-avatar__status {
    width: 6px;
    height: 6px;
  }

  .base-avatar--lg .base-avatar__status,
  .base-avatar--xl .base-avatar__status {
    width: 10px;
    height: 10px;
  }

  .base-avatar__status--online {
    background: var(--color-success);
  }

  .base-avatar__status--offline {
    background: var(--color-text-muted);
  }

  .base-avatar__status--away {
    background: var(--color-warning);
  }

  .base-avatar__status--busy {
    background: var(--color-error);
  }

  /* Group avatar (for avatar lists) */
  .base-avatar--grouped {
    margin-left: -8px;
    box-shadow: 0 0 0 2px var(--color-surface);
  }

    .base-avatar--grouped:first-child {
      margin-left: 0;
    }
</style>
