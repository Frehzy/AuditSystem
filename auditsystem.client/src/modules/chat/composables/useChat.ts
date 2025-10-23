import { ref } from 'vue'
import { chatApiService } from '../services/chatApi.service'
import type { ChatMessage, SendMessageRequest } from '../types/chat.types'

export const useChat = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const sendMessage = async (request: SendMessageRequest): Promise<ChatMessage | null> => {
    if (isLoading.value) return null

    isLoading.value = true
    error.value = null

    try {
      const response = await chatApiService.sendMessage(request.message)
      return response
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Ошибка отправки сообщения'
      error.value = errorMessage
      return null
    } finally {
      isLoading.value = false
    }
  }

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Заглушка для демонстрации
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    const responses = [
      'Интересный вопрос! Давайте разберем его подробнее.',
      'Я понимаю ваш интерес к этой теме. Вот что я могу сказать:',
      'Отличный вопрос! На основе моего обучения я могу предложить следующее:',
      'Спасибо за ваш запрос. Вот информация по этой теме:',
      'Я рад помочь вам с этим вопросом. Вот что я нашел:'
    ]

    return responses[Math.floor(Math.random() * responses.length)] +
      ` Вы спросили: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"`
  }

  const clearError = (): void => {
    error.value = null
  }

  return {
    isLoading,
    error,
    sendMessage,
    simulateAIResponse,
    clearError
  }
}
