<!-- src/framework/ui/components/overlay/BaseDrawer.vue -->
<template>
  <teleport to="body">
    <transition name="drawer">
      <div v-if="modelValue" class="base-drawer" :class="drawerClasses" @click="handleBackdropClick">
        <div class="base-drawer__content" :style="contentStyle" @click.stop>
          <!-- Header -->
          <header v-if="showHeader" class="base-drawer__header">
            <div class="base-drawer__title">
              <h2>{{ title }}</h2>
            </div>
            <button v-if="closable"
                    @click="closeDrawer"
                    class="base-drawer__close"
                    aria-label="Закрыть панель">
              <CloseIcon :size="20" />
            </button>
          </header>

          <!-- Content -->
          <div class="base-drawer__body">
            <slot name="default">
              <div v-if="message" class="base-drawer__message">
                {{ message }}
              </div>
            </slot>
          </div>

          <!-- Footer -->
          <footer v-if="showFooter" class="base-drawer__footer">
            <slot name="footer">
              <BaseButton variant="secondary" @click="closeDrawer">
                {{ cancelText }}
              </BaseButton>
              <BaseButton @click="handleConfirm">
                {{ confirmText }}
              </BaseButton>
            </slot>
          </footer>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted } from 'vue'
  import { CloseIcon } from '@/assets/icons'
  import BaseButton from '../buttons/BaseButton.vue'

  interface Props {
    modelValue: boolean
    title?: string
    message?: string
    position?: 'left' | 'right' | 'top' | 'bottom'
    size?: 'sm' | 'md' | 'lg' | 'xl'
    closable?: boolean
    closeOnBackdrop?: boolean
    closeOnEscape?: boolean
    showHeader?: boolean
    showFooter?: boolean
    confirmText?: string
    cancelText?: string
    persistent?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    message: '',
    position: 'right',
    size: 'md',
    closable: true,
    closeOnBackdrop: true,
    closeOnEscape: true,
    showHeader: true,
    showFooter: true,
    confirmText: 'Подтвердить',
    cancelText: 'Отмена',
    persistent: false,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'close': []
    'confirm': []
    'open': []
    'closed': []
  }>()

  const drawerClasses = computed(() => [
    'base-drawer',
    `base-drawer--${props.position}`,
    `base-drawer--${props.size}`,
    {
      'base-drawer--persistent': props.persistent,
    },
  ])

  const contentStyle = computed(() => ({
    '--drawer-width': getDrawerWidth(),
    '--drawer-height': getDrawerHeight(),
  }))

  const getDrawerWidth = (): string => {
    if (props.position === 'top' || props.position === 'bottom') {
      return '100%'
    }
    const widths = {
      sm: '320px',
      md: '400px',
      lg: '480px',
      xl: '560px',
    }
    return widths[props.size]
  }

  const getDrawerHeight = (): string => {
    if (props.position === 'left' || props.position === 'right') {
      return '100%'
    }
    const heights = {
      sm: '300px',
      md: '400px',
      lg: '500px',
      xl: '600px',
    }
    return heights[props.size]
  }

  const closeDrawer = () => {
    if (!props.persistent) {
      emit('update:modelValue', false)
      emit('close')
    }
  }

  const handleConfirm = () => {
    emit('confirm')
    closeDrawer()
  }

  const handleBackdropClick = () => {
    if (props.closeOnBackdrop && !props.persistent) {
      closeDrawer()
    }
  }

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.closeOnEscape && !props.persistent) {
      closeDrawer()
    }
  }

  const onEnter = () => {
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    emit('open')
  }

  const onLeave = () => {
    document.removeEventListener('keydown', handleEscape)
    document.body.style.overflow = ''
    emit('closed')
  }

  // Public methods
  const open = () => {
    emit('update:modelValue', true)
  }

  defineExpose({
    open,
    close: closeDrawer,
  })

  // Lifecycle hooks
  onMounted(() => {
    onEnter()
  })

  onUnmounted(() => {
    onLeave()
  })
</script>

<style scoped>
  .base-drawer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: var(--z-modal);
    background: color-mix(in srgb, var(--color-background) 30%, transparent);
    backdrop-filter: blur(4px);
  }

  .base-drawer__content {
    position: absolute;
    background: var(--color-surface);
    box-shadow: var(--shadow-xl);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Position variants */
  .base-drawer--left .base-drawer__content {
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--drawer-width);
    animation: drawer-slide-in-left 0.3s ease-out;
  }

  .base-drawer--right .base-drawer__content {
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--drawer-width);
    animation: drawer-slide-in-right 0.3s ease-out;
  }

  .base-drawer--top .base-drawer__content {
    top: 0;
    left: 0;
    right: 0;
    height: var(--drawer-height);
    animation: drawer-slide-in-top 0.3s ease-out;
  }

  .base-drawer--bottom .base-drawer__content {
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--drawer-height);
    animation: drawer-slide-in-bottom 0.3s ease-out;
  }

  .base-drawer__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg);
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .base-drawer__title h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .base-drawer__close {
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
  }

    .base-drawer__close:hover {
      background: var(--color-surface-hover);
      color: var(--color-primary);
    }

  .base-drawer__body {
    flex: 1;
    padding: var(--space-lg);
    overflow-y: auto;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  .base-drawer__message {
    font-size: 0.875rem;
  }

  .base-drawer__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-md);
    padding: var(--space-lg);
    border-top: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  /* Animations */
  .drawer-enter-active,
  .drawer-leave-active {
    transition: opacity 0.3s ease;
  }

  .drawer-enter-from,
  .drawer-leave-to {
    opacity: 0;
  }

  .drawer-enter-active .base-drawer__content,
  .drawer-leave-active .base-drawer__content {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  .drawer-leave-to .base-drawer__content {
    opacity: 0;
  }

  .base-drawer--left .drawer-leave-to .base-drawer__content {
    transform: translateX(-100%);
  }

  .base-drawer--right .drawer-leave-to .base-drawer__content {
    transform: translateX(100%);
  }

  .base-drawer--top .drawer-leave-to .base-drawer__content {
    transform: translateY(-100%);
  }

  .base-drawer--bottom .drawer-leave-to .base-drawer__content {
    transform: translateY(100%);
  }

  @keyframes drawer-slide-in-left {
    from {
      transform: translateX(-100%);
    }

    to {
      transform: translateX(0);
    }
  }

  @keyframes drawer-slide-in-right {
    from {
      transform: translateX(100%);
    }

    to {
      transform: translateX(0);
    }
  }

  @keyframes drawer-slide-in-top {
    from {
      transform: translateY(-100%);
    }

    to {
      transform: translateY(0);
    }
  }

  @keyframes drawer-slide-in-bottom {
    from {
      transform: translateY(100%);
    }

    to {
      transform: translateY(0);
    }
  }

  /* Responsive */
  @media (max-width: 640px) {
    .base-drawer--left .base-drawer__content,
    .base-drawer--right .base-drawer__content {
      width: 85vw;
    }

    .base-drawer--top .base-drawer__content,
    .base-drawer--bottom .base-drawer__content {
      height: 70vh;
    }

    .base-drawer__header,
    .base-drawer__body,
    .base-drawer__footer {
      padding: var(--space-md);
    }

    .base-drawer__footer {
      flex-direction: column-reverse;
      gap: var(--space-sm);
    }

      .base-drawer__footer :deep(.base-button) {
        width: 100%;
      }
  }
</style>
