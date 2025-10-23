[<template>
  <div class="chat-messages">
    <div v-if="isLoading" class="chat-messages__loading">
      <BaseSpinner />
      <span>Загрузка сообщений...</span>
    </div>

    <div v-else-if="messages.length === 0" class="chat-messages__empty">
      <div class="chat-messages__empty-icon">
        <MessageCircleIcon />
      </div>
      <h3 class="chat-messages__empty-title">Нет сообщений</h3>
      <p class="chat-messages__empty-text">Начните общение, отправив первое сообщение</p>
    </div>

    <div v-else class="chat-messages__list">
      <div v-for="message in messages"
           :key="message.id"
           class="chat-message"
           :class="`chat-message--${message.type}`">
        <div class="chat-message__avatar">
          <div v-if="message.type === 'user'" class="chat-message__user-avatar">
            <UserIcon />
          </div>
          <div v-else class="chat-message__bot-avatar">
            <RobotIcon />
          </div>
        </div>
        <div class="chat-message__content-wrapper">
          <div class="chat-message__content">
            {{ message.content }}
          </div>
          <div class="chat-message__time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseSpinner } from '@/framework/ui';
import { MessageCircleIcon, UserIcon, RobotIcon } from '@/assets/icons';

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
    background: var(--color-background);
  }

  .chat-messages__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: var(--color-text-muted);
    height: 100%;
    font-size: 0.875rem;
  }

  .chat-messages__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    height: 100%;
    text-align: center;
    color: var(--color-text-muted);
  }

  .chat-messages__empty-icon {
    font-size: 3rem;
    opacity: 0.5;
    color: var(--color-primary);
  }

    .chat-messages__empty-icon svg {
      width: 48px;
      height: 48px;
    }

  .chat-messages__empty-title {
    color: var(--color-text-secondary);
    margin: 0;
    font-size: 1.125rem;
  }

  .chat-messages__empty-text {
    color: var(--color-text-muted);
    margin: 0;
    font-size: 0.875rem;
  }

  .chat-messages__list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .chat-message {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .chat-message--user {
    flex-direction: row-reverse;
  }

  .chat-message--bot {
    flex-direction: row;
  }

  .chat-message__avatar {
    flex-shrink: 0;
    margin-top: 0.25rem;
  }

  .chat-message__user-avatar,
  .chat-message__bot-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chat-message__user-avatar {
    background: var(--gradient-primary);
    color: white;
  }

  .chat-message__bot-avatar {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-primary);
  }

    .chat-message__user-avatar svg,
    .chat-message__bot-avatar svg {
      width: 1rem;
      height: 1rem;
    }

  .chat-message__content-wrapper {
    max-width: 70%;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .chat-message--user .chat-message__content-wrapper {
    align-items: flex-end;
  }

  .chat-message--bot .chat-message__content-wrapper {
    align-items: flex-start;
  }

  .chat-message__content {
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    line-height: 1.4;
    font-size: 0.875rem;
    box-shadow: var(--shadow-sm);
  }

  .chat-message--user .chat-message__content {
    background: var(--gradient-primary);
    color: white;
    border-bottom-right-radius: 0.25rem;
  }

  .chat-message--bot .chat-message__content {
    background: var(--color-surface);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    border-bottom-left-radius: 0.25rem;
  }

  .chat-message__time {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  @media (max-width: 768px) {
    .chat-messages {
      padding: 0.75rem;
    }

    .chat-message__content-wrapper {
      max-width: 85%;
    }

    .chat-message__content {
      padding: 0.625rem 0.875rem;
      font-size: 0.8125rem;
    }
  }

  @media (max-width: 480px) {
    .chat-message__content-wrapper {
      max-width: 90%;
    }

    .chat-message__avatar {
      margin-top: 0.125rem;
    }

    .chat-message__user-avatar,
    .chat-message__bot-avatar {
      width: 1.75rem;
      height: 1.75rem;
    }
  }
</style>
