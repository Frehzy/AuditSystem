// src/framework/ui/composables/useModal.ts
import { ref, computed } from 'vue'

export interface ModalOptions {
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  persistent?: boolean
  fullscreen?: boolean
}

export interface ModalInstance {
  id: string
  component: any
  props?: any
  options: ModalOptions
}

/**
 * Композабл для управления модальными окнами
 * 
 * @example
 * const modal = useModal()
 * 
 * // Открыть модальное окно
 * modal.open(MyComponent, { prop1: 'value' })
 * 
 * // Закрыть модальное окно
 * modal.close()
 */
export function useModal() {
  const modals = ref<ModalInstance[]>([])
  const currentModal = computed(() => modals.value[modals.value.length - 1])

  const open = (component: any, props?: any, options: ModalOptions = {}) => {
    const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const modal: ModalInstance = {
      id,
      component,
      props,
      options: {
        size: 'md',
        closable: true,
        closeOnBackdrop: true,
        closeOnEscape: true,
        persistent: false,
        fullscreen: false,
        ...options,
      },
    }

    modals.value.push(modal)
    return id
  }

  const close = (id?: string) => {
    if (id) {
      modals.value = modals.value.filter(modal => modal.id !== id)
    } else if (currentModal.value) {
      modals.value.pop()
    }
  }

  const closeAll = () => {
    modals.value = []
  }

  const updateProps = (id: string, newProps: any) => {
    const modal = modals.value.find(m => m.id === id)
    if (modal) {
      modal.props = { ...modal.props, ...newProps }
    }
  }

  return {
    modals: computed(() => modals.value),
    currentModal,
    open,
    close,
    closeAll,
    updateProps,
  }
}
