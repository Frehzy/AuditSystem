import { ref, computed } from 'vue'
import type { ChatMessage } from '../types/chat.types'

export const useChatMessages = () => {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)

  const addMessage = (message: ChatMessage): void => {
    messages.value.push(message)
  }

  const addUserMessage = (text: string, sessionId?: string): ChatMessage => {
    const message: ChatMessage = {
      id: generateId(),
      type: 'user',
      text,
      timestamp: new Date(),
      sessionId: sessionId || 'default'
    }
    addMessage(message)
    return message
  }

  const addAssistantMessage = (text: string, sessionId?: string): ChatMessage => {
    const message: ChatMessage = {
      id: generateId(),
      type: 'assistant',
      text,
      timestamp: new Date(),
      sessionId: sessionId || 'default'
    }
    addMessage(message)
    return message
  }

  const clearMessages = (): void => {
    messages.value = []
  }

  const formattedMessages = computed(() => {
    return messages.value.map(msg => ({
      ...msg,
      time: msg.timestamp.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }))
  })

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  return {
    messages: computed(() => messages.value),
    formattedMessages,
    isLoading,
    addMessage,
    addUserMessage,
    addAssistantMessage,
    clearMessages,
    setLoading: (loading: boolean) => isLoading.value = loading
  }
}
