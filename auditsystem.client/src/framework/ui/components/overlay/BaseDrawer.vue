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
              <p v-if="subtitle" class="base-drawer__subtitle">{{ subtitle }}</p>
            </div>
            <div class="base-drawer__header-actions">
              <slot name="header-actions"></slot>
              <button v-if="closable"
                      @click="closeDrawer"
                      class="base-drawer__close"
                      aria-label="Закрыть панель">
                <CloseIcon :size="20" />
              </button>
            </div>
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
    subtitle?: string
    message?: string
    position?: 'left' | 'right' | 'top' | 'bottom'
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    closable?: boolean
    closeOnBackdrop?: boolean
    closeOnEscape?: boolean
    showHeader?: boolean
    showFooter?: boolean
    confirmText?: string
    cancelText?: string
    persistent?: boolean
    wrapperClass?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    subtitle: '',
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
    wrapperClass: '',
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
      [props.wrapperClass]: !!props.wrapperClass,
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
    if (props.size === 'full') {
      return '100vw'
    }
    const widths = {
      sm: '320px',
      md: '400px',
      lg: '480px',
      xl: '560px',
    }
    return widths[props.size as keyof typeof widths] || widths.md
  }

  const getDrawerHeight = (): string => {
    if (props.position === 'left' || props.position === 'right') {
      return '100%'
    }
    if (props.size === 'full') {
      return '100vh'
    }
    const heights = {
      sm: '300px',
      md: '400px',
      lg: '500px',
      xl: '600px',
    }
    return heights[props.size as keyof typeof heights] || heights.md
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
    if (props.modelValue) {
      onEnter()
    }
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
    z-index: var(--z-modal, 1000);
    background: color-mix(in srgb, var(--color-background) 30%, transparent);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
  }

  .base-drawer__content {
    position: relative;
    background: var(--color-surface);
    box-shadow: var(--shadow-xl);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
    width: 100%;
  }

  /* Position variants */
  .base-drawer--left .base-drawer__content {
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--drawer-width);
    animation: drawer-slide-in-left var(--transition-normal) ease-out;
  }

  .base-drawer--right .base-drawer__content {
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--drawer-width);
    animation: drawer-slide-in-right var(--transition-normal) ease-out;
  }

  .base-drawer--top .base-drawer__content {
    top: 0;
    left: 0;
    right: 0;
    height: var(--drawer-height);
    animation: drawer-slide-in-top var(--transition-normal) ease-out;
  }

  .base-drawer--bottom .base-drawer__content {
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--drawer-height);
    animation: drawer-slide-in-bottom var(--transition-normal) ease-out;
  }

  .base-drawer--full .base-drawer__content {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    animation: drawer-fade-in var(--transition-normal) ease-out;
  }

  /* Header */
  .base-drawer__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: var(--space-xl, 1.5rem);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
    flex-shrink: 0;
    gap: var(--space-md, 1rem);
  }

  .base-drawer__title {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 0.5rem);
  }

    .base-drawer__title h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: var(--font-weight-bold, 700);
      color: var(--color-text-primary);
      line-height: 1.3;
    }

  .base-drawer__subtitle {
    margin: 0;
    font-size: 1rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
  }

  .base-drawer__header-actions {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm, 0.75rem);
    flex-shrink: 0;
  }

  .base-drawer__close {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-xs, 0.5rem);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-hover);
  }

    .base-drawer__close:hover {
      background: var(--color-primary-light);
      color: var(--color-primary);
      transform: scale(1.05);
    }

    .base-drawer__close:active {
      transform: scale(0.95);
    }

  /* Body */
  .base-drawer__body {
    flex: 1;
    padding: var(--space-xl, 1.5rem);
    overflow-y: auto;
    color: var(--color-text-secondary);
    line-height: 1.6;
    background: var(--color-background);
  }

  .base-drawer__message {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  /* Footer */
  .base-drawer__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-md, 1rem);
    padding: var(--space-xl, 1.5rem);
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
    flex-shrink: 0;
  }

  /* Animations */
  .drawer-enter-active,
  .drawer-leave-active {
    transition: opacity var(--transition-normal) ease;
  }

  .drawer-enter-from,
  .drawer-leave-to {
    opacity: 0;
  }

  .drawer-enter-active .base-drawer__content,
  .drawer-leave-active .base-drawer__content {
    transition: transform var(--transition-normal) ease, opacity var(--transition-normal) ease;
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

  .base-drawer--full .drawer-leave-to .base-drawer__content {
    opacity: 0;
    transform: scale(0.95);
  }

  @keyframes drawer-slide-in-left {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }

    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes drawer-slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }

    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes drawer-slide-in-top {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }

    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes drawer-slide-in-bottom {
    from {
      transform: translateY(100%);
      opacity: 0;
    }

    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes drawer-fade-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }

    to {
      opacity: 1;
      transform: scale(1);
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
      padding: var(--space-lg, 1.25rem);
    }

    .base-drawer__title h2 {
      font-size: 1.25rem;
    }

    .base-drawer__subtitle {
      font-size: 0.875rem;
    }

    .base-drawer__footer {
      flex-direction: column-reverse;
      gap: var(--space-sm, 0.75rem);
    }

      .base-drawer__footer :deep(.base-button) {
        width: 100%;
      }
  }

  @media (max-width: 480px) {
    .base-drawer--left .base-drawer__content,
    .base-drawer--right .base-drawer__content {
      width: 90vw;
    }

    .base-drawer--top .base-drawer__content,
    .base-drawer--bottom .base-drawer__content {
      height: 80vh;
    }

    .base-drawer__header {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-md, 1rem);
    }

    .base-drawer__header-actions {
      align-self: flex-end;
    }
  }

  /* Scrollbar styling */
  .base-drawer__body::-webkit-scrollbar {
    width: 6px;
  }

  .base-drawer__body::-webkit-scrollbar-track {
    background: var(--color-surface-hover);
    border-radius: var(--radius-sm);
  }

  .base-drawer__body::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: var(--radius-sm);
  }

    .base-drawer__body::-webkit-scrollbar-thumb:hover {
      background: var(--color-text-muted);
    }

  /* Focus styles */
  .base-drawer__close:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    box-shadow: var(--shadow-focus);
  }

  /* Persistent state */
  .base-drawer--persistent .base-drawer__close {
    opacity: 0.6;
    cursor: not-allowed;
  }

    .base-drawer--persistent .base-drawer__close:hover {
      background: var(--color-surface-hover);
      color: var(--color-text-muted);
      transform: none;
    }
</style>
