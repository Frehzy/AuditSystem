<!-- src/framework/ui/components/overlay/BaseModal.vue -->
<template>
  <teleport to="body">
    <transition name="modal" @enter="onEnter" @leave="onLeave">
      <div v-if="modelValue" class="base-modal" :class="modalClasses">
        <!-- Backdrop -->
        <div class="base-modal__backdrop" @click="handleBackdropClick"></div>

        <!-- Modal container -->
        <div class="base-modal__container" :style="containerStyle" role="dialog" :aria-labelledby="titleId" :aria-describedby="descriptionId" aria-modal="true">
          <!-- Header -->
          <header v-if="showHeader" class="base-modal__header">
            <div class="base-modal__title">
              <h2 :id="titleId">{{ title }}</h2>
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
              <BaseButton variant="secondary" @click="closeModal">
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
import { computed, ref, useId, nextTick } from 'vue'
import { CloseIcon } from '@/assets/icons'
import BaseButton from '../buttons/BaseButton.vue'

interface Props {
  modelValue: boolean
  title?: string
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showHeader?: boolean
  showFooter?: boolean
  confirmText?: string
  cancelText?: string
  persistent?: boolean
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
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
  fullscreen: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
  'confirm': []
  'open': []
  'closed': []
}>()

const titleId = `modal-title-${useId()}`
const descriptionId = `modal-description-${useId()}`

const modalClasses = computed(() => [
  'base-modal',
  `base-modal--${props.size}`,
  {
    'base-modal--fullscreen': props.fullscreen,
    'base-modal--persistent': props.persistent,
  },
])

const containerStyle = computed(() => ({
  '--modal-width': props.fullscreen ? '100%' : getModalWidth(),
}))

const getModalWidth = (): string => {
  const widths = {
    sm: '400px',
    md: '500px',
    lg: '600px',
    xl: '800px',
  }
  return widths[props.size]
}

const closeModal = () => {
  if (!props.persistent) {
    emit('update:modelValue', false)
    emit('close')
  }
}

const handleConfirm = () => {
  emit('confirm')
  closeModal()
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop && !props.persistent) {
    closeModal()
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEscape && !props.persistent) {
    closeModal()
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
    z-index: var(--z-modal);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-md);
  }

  .base-modal__backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: color-mix(in srgb, var(--color-background) 30%, transparent);
    backdrop-filter: blur(4px);
  }

  .base-modal__container {
    position: relative;
    width: var(--modal-width, 500px);
    max-width: 90vw;
    max-height: 90vh;
    background: var(--color-surface);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-xl);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: modal-scale-in 0.2s ease-out;
  }

  .base-modal--fullscreen .base-modal__container {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }

  .base-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg);
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .base-modal__title h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .base-modal__close {
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

    .base-modal__close:hover {
      background: var(--color-surface-hover);
      color: var(--color-primary);
    }

  .base-modal__content {
    flex: 1;
    padding: var(--space-lg);
    overflow-y: auto;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  .base-modal__message {
    font-size: 0.875rem;
  }

  .base-modal__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-md);
    padding: var(--space-lg);
    border-top: 1px solid var(--color-border);
    flex-shrink: 0;
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
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  .modal-enter-from .base-modal__container {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }

  .modal-leave-to .base-modal__container {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }

  @keyframes modal-scale-in {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }

    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Responsive */
  @media (max-width: 640px) {
    .base-modal {
      padding: var(--space-sm);
    }

    .base-modal__container {
      max-width: 95vw;
      max-height: 95vh;
    }

    .base-modal__header,
    .base-modal__content,
    .base-modal__footer {
      padding: var(--space-md);
    }

    .base-modal__footer {
      flex-direction: column-reverse;
      gap: var(--space-sm);
    }

      .base-modal__footer :deep(.base-button) {
        width: 100%;
      }
  }
</style>
