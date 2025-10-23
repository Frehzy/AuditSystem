<template>
  <div class="chat-messages">
    <div v-if="isLoading" class="chat-messages__loading">
      <BaseSpinner />
      <span>Загрузка сообщений...</span>
    </div>
    
    <div v-else-if="messages.length === 0" class="chat-messages__empty">
      <div class="chat-messages__empty-icon">💬</div>
      <h3 class="chat-messages__empty-title">Нет сообщений</h3>
      <p class="chat-messages__empty-text">Начните общение, отправив первое сообщение</p>
    </div>
    
    <div v-else class="chat-messages__list">
      <div v-for="message in messages" 
           :key="message.id"
           class="chat-message"
           :class="`chat-message--${message.type}`">
        <div class="chat-message__content">
          {{ message.content }}
        </div>
        <div class="chat-message__time">
          {{ formatTime(message.timestamp) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseSpinner } from '@/framework/ui';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
}

interface Props {
  messages: Message[];
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  messages: () => [],
  isLoading: false,
});

const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.chat-messages__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #64748b;
  height: 100%;
}

.chat-messages__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  height: 100%;
  text-align: center;
}

.chat-messages__empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.chat-messages__empty-title {
  color: #64748b;
  margin: 0;
}

.chat-messages__empty-text {
  color: #94a3b8;
  margin: 0;
}

.chat-messages__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.chat-message {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 70%;
}

.chat-message--user {
  align-self: flex-end;
  align-items: flex-end;
}

.chat-message--bot {
  align-self: flex-start;
  align-items: flex-start;
}

.chat-message__content {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  line-height: 1.4;
}

.chat-message--user .chat-message__content {
  background: #3b82f6;
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.chat-message--bot .chat-message__content {
  background: #f1f5f9;
  color: #334155;
  border-bottom-left-radius: 0.25rem;
}

.chat-message__time {
  font-size: 0.75rem;
  color: #94a3b8;
}

@media (prefers-color-scheme: dark) {
  .chat-message--bot .chat-message__content {
    background: #334155;
    color: #e2e8f0;
  }
}
</style>
