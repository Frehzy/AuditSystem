<!-- src/framework/ui/components/overlay/BaseModal.vue -->
<template>
  <teleport to="body">
    <transition name="modal" @enter="onEnter" @leave="onLeave">
      <div v-if="modelValue" class="base-modal" :class="[wrapperClass, modalClasses]">
        <!-- Backdrop -->
        <div class="base-modal__backdrop" @click="handleBackdropClick"></div>

        <!-- Modal container -->
        <div class="base-modal__container" :style="containerStyle" role="dialog"
             :aria-labelledby="titleId" :aria-describedby="descriptionId" aria-modal="true">

          <!-- Loading overlay -->
          <div v-if="loading" class="base-modal__loading">
            <BaseSpinner size="lg" />
          </div>

          <!-- Header -->
          <header v-if="showHeader" class="base-modal__header">
            <div class="base-modal__title">
              <slot name="icon">
                <div v-if="icon" class="base-modal__title-icon">
                  <component :is="icon" />
                </div>
              </slot>
              <div>
                <h2 :id="titleId" class="base-modal__title-text">{{ title }}</h2>
                <p v-if="subtitle" class="base-modal__subtitle">{{ subtitle }}</p>
              </div>
            </div>
            <button v-if="closable"
                    @click="closeModal"
                    class="base-modal__close"
                    aria-label="Закрыть модальное окно">
              <CloseIcon :size="20" />
            </button>
          </header>

          <!-- Content -->
          <div class="base-modal__content" :id="descriptionId">
            <slot name="default">
              <div v-if="message" class="base-modal__message">
                {{ message }}
              </div>
            </slot>
          </div>

          <!-- Footer -->
          <footer v-if="showFooter" class="base-modal__footer">
            <slot name="footer">
              <BaseButton @click="closeModal"
                          variant="secondary"
                          :disabled="loading"
                          class="base-modal__footer-btn">
                {{ cancelText }}
              </BaseButton>
              <BaseButton @click="handleConfirm"
                          variant="primary"
                          :loading="loading"
                          class="base-modal__footer-btn">
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
  import { computed, useId, useAttrs } from 'vue'
  import { CloseIcon } from '@/assets/icons'
  import BaseButton from '../buttons/BaseButton.vue'
  import BaseSpinner from '../feedback/BaseSpinner.vue'

  interface Props {
    modelValue: boolean
    title?: string
    subtitle?: string
    message?: string
    icon?: any
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'
    closable?: boolean
    closeOnBackdrop?: boolean
    closeOnEscape?: boolean
    showHeader?: boolean
    showFooter?: boolean
    confirmText?: string
    cancelText?: string
    persistent?: boolean
    loading?: boolean
    overlayBlur?: 'sm' | 'md' | 'lg' | 'xl'
    wrapperClass?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    subtitle: '',
    message: '',
    size: 'md',
    closable: true,
    closeOnBackdrop: true,
    closeOnEscape: true,
    showHeader: true,
    showFooter: true,
    confirmText: 'Подтвердить',
    cancelText: 'Отмена',
    persistent: false,
    loading: false,
    overlayBlur: 'lg',
    wrapperClass: ''
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'close': []
    'confirm': []
    'open': []
    'closed': []
  }>()

  const attrs = useAttrs()
  const titleId = `modal-title-${useId()}`
  const descriptionId = `modal-description-${useId()}`

  const wrapperClass = computed(() => {
    const classFromAttrs = attrs.class || attrs['wrapper-class'] || ''
    return `${classFromAttrs} ${props.wrapperClass}`.trim()
  })

  const modalClasses = computed(() => [
    `base-modal--${props.size}`,
    `base-modal--blur-${props.overlayBlur}`,
    {
      'base-modal--persistent': props.persistent,
      'base-modal--loading': props.loading,
    },
  ])

  const containerStyle = computed(() => ({
    '--modal-width': getModalWidth(),
    '--modal-max-width': getModalMaxWidth(),
  }))

  const getModalWidth = (): string => {
    if (props.size === 'fullscreen') return '100%'
    const widths = {
      sm: '400px',
      md: '500px',
      lg: '600px',
      xl: '800px',
    }
    return widths[props.size]
  }

  const getModalMaxWidth = (): string => {
    if (props.size === 'fullscreen') return 'none'
    return '90vw'
  }

  const closeModal = () => {
    if (!props.persistent && !props.loading) {
      emit('update:modelValue', false)
      emit('close')
    }
  }

  const handleConfirm = () => {
    if (!props.loading) {
      emit('confirm')
    }
  }

  const handleBackdropClick = () => {
    if (props.closeOnBackdrop && !props.persistent && !props.loading) {
      closeModal()
    }
  }

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.closeOnEscape && !props.persistent && !props.loading) {
      closeModal()
    }
  }

  const onEnter = () => {
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = getScrollbarWidth() + 'px'
    emit('open')
  }

  const onLeave = () => {
    document.removeEventListener('keydown', handleEscape)
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    emit('closed')
  }

  const getScrollbarWidth = (): number => {
    return window.innerWidth - document.documentElement.clientWidth
  }

  // Public methods
  const open = () => {
    emit('update:modelValue', true)
  }

  defineExpose({
    open,
    close: closeModal,
  })
</script>

<style scoped>
  .base-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: var(--z-modal, 1000);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-md, 1rem);
    animation: modal-fade-in 0.2s ease-out;
  }

  .base-modal__backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: color-mix(in srgb, var(--color-background, #000) 40%, transparent);
    backdrop-filter: blur(var(--backdrop-blur, 8px));
    transition: backdrop-filter 0.3s ease;
  }

  .base-modal--blur-sm .base-modal__backdrop {
    --backdrop-blur: 4px;
  }

  .base-modal--blur-md .base-modal__backdrop {
    --backdrop-blur: 8px;
  }

  .base-modal--blur-lg .base-modal__backdrop {
    --backdrop-blur: 12px;
  }

  .base-modal--blur-xl .base-modal__backdrop {
    --backdrop-blur: 16px;
  }

  .base-modal__container {
    position: relative;
    width: var(--modal-width, 500px);
    max-width: var(--modal-max-width, 90vw);
    max-height: 90vh;
    background: var(--color-surface, #fff);
    border-radius: var(--radius-xl, 1rem);
    box-shadow: var(--shadow-2xl, 0 25px 50px -12px rgba(0, 0, 0, 0.25));
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: modal-scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .base-modal--fullscreen .base-modal__container {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }

  .base-modal__loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: color-mix(in srgb, var(--color-surface) 80%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    backdrop-filter: blur(2px);
  }

  .base-modal__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: var(--space-xl, 1.5rem);
    border-bottom: 1px solid var(--color-border, #e5e7eb);
    flex-shrink: 0;
    background: var(--color-surface, #fff);
  }

  .base-modal__title {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md, 1rem);
    flex: 1;
  }

  .base-modal__title-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-md, 0.5rem);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary-light, #dbeafe);
    color: var(--color-primary, #3b82f6);
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

    .base-modal__title-icon :deep(svg) {
      width: 1.25rem;
      height: 1.25rem;
    }

  .base-modal__title-text {
    margin: 0;
    font-size: 1.25rem;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
    line-height: 1.4;
  }

  .base-modal__subtitle {
    margin: var(--space-xs, 0.25rem) 0 0 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
    line-height: 1.4;
  }

  .base-modal__close {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-xs, 0.5rem);
    border-radius: var(--radius-sm, 0.375rem);
    transition: all var(--transition-fast, 0.15s) ease;
    color: var(--color-text-muted, #9ca3af);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: var(--space-md, 1rem);
  }

    .base-modal__close:hover {
      background: var(--color-surface-hover, #f9fafb);
      color: var(--color-primary, #3b82f6);
      transform: scale(1.1);
    }

    .base-modal__close:active {
      transform: scale(0.95);
    }

  .base-modal__content {
    flex: 1;
    padding: var(--space-xl, 1.5rem);
    overflow-y: auto;
    color: var(--color-text-secondary, #6b7280);
    line-height: 1.6;
    background: var(--color-surface, #fff);
  }

  .base-modal__message {
    font-size: 0.875rem;
    text-align: center;
  }

  .base-modal__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-md, 1rem);
    padding: var(--space-xl, 1.5rem);
    border-top: 1px solid var(--color-border, #e5e7eb);
    flex-shrink: 0;
    background: var(--color-surface, #fff);
  }

  .base-modal__footer-btn {
    min-width: 100px;
  }

  /* Size variants */
  .base-modal--sm .base-modal__container {
    --modal-width: 400px;
  }

  .base-modal--lg .base-modal__container {
    --modal-width: 600px;
  }

  .base-modal--xl .base-modal__container {
    --modal-width: 800px;
  }

  /* Animations */
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-enter-active .base-modal__container,
  .modal-leave-active .base-modal__container {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .modal-enter-from .base-modal__container {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }

  .modal-leave-to .base-modal__container {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }

  @keyframes modal-fade-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes modal-scale-in {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-10px);
    }

    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Responsive */
  @media (max-width: 640px) {
    .base-modal {
      padding: var(--space-sm, 0.5rem);
    }

    .base-modal__container {
      max-width: 95vw;
      max-height: 95vh;
    }

    .base-modal__header {
      padding: var(--space-lg, 1.25rem);
      flex-direction: column;
      gap: var(--space-md, 1rem);
    }

    .base-modal__title {
      width: 100%;
    }

    .base-modal__close {
      align-self: flex-end;
      margin-left: 0;
    }

    .base-modal__content {
      padding: var(--space-lg, 1.25rem);
    }

    .base-modal__footer {
      padding: var(--space-lg, 1.25rem);
      flex-direction: column-reverse;
      gap: var(--space-sm, 0.75rem);
    }

    .base-modal__footer-btn {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .base-modal__title {
      flex-direction: column;
      text-align: center;
      gap: var(--space-sm, 0.75rem);
    }

    .base-modal__title-icon {
      align-self: center;
    }
  }

  /* Dark theme support */
  @media (prefers-color-scheme: dark) {
    .base-modal__container {
      background: var(--color-surface-dark, #1f2937);
      border-color: var(--color-border-dark, #374151);
    }

    .base-modal__header,
    .base-modal__footer {
      background: var(--color-surface-dark, #1f2937);
    }

    .base-modal__title-icon {
      background: var(--color-primary-dark, #1e40af);
      color: var(--color-primary-light, #dbeafe);
    }
  }
</style>
