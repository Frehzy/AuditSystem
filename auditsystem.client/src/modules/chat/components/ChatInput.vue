<template>
  <div class="chat-input">
    <form @submit.prevent="handleSubmit" class="chat-input__form">
      <div class="chat-input__field-wrapper">
        <BaseInput v-model="message"
                   type="text"
                   placeholder="Введите сообщение..."
                   :disabled="isLoading"
                   class="chat-input__field"
                   @keydown.enter="handleSubmit"
                   :clearable="true"
                   size="lg">
          <template #prefix>
            <MessageCircleIcon />
          </template>
        </BaseInput>
        <BaseButton type="submit"
                    :is-loading="isLoading"
                    :disabled="!message.trim()"
                    variant="primary"
                    class="chat-input__submit"
                    :aria-label="'Отправить сообщение'">
          <template #icon-right>
            <SendIcon />
          </template>
          <span class="chat-input__submit-text">Отправить</span>
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BaseInput, BaseButton } from '@/framework/ui';
import { MessageCircleIcon, SendIcon } from '@/assets/icons';

interface Props {
  isLoading?: boolean;
}

interface Emits {
  (e: 'send', message: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const emit = defineEmits<Emits>();

const message = ref('');

const handleSubmit = (): void => {
  if (message.value.trim() && !props.isLoading) {
    emit('send', message.value.trim());
    message.value = '';
  }
};
</script>

<style scoped>
  .chat-input {
    padding: 1.5rem;
    background: var(--color-background-card);
    border-top: 1px solid var(--color-border);
    backdrop-filter: blur(10px);
  }

  .chat-input__form {
    max-width: 1200px;
    margin: 0 auto;
  }

  .chat-input__field-wrapper {
    display: flex;
    gap: 0.75rem;
    align-items: flex-end;
  }

  .chat-input__field {
    flex: 1;
  }

  .chat-input__submit {
    white-space: nowrap;
    height: fit-content;
    align-self: stretch;
    min-height: 3rem;
  }

  .chat-input__submit-text {
    display: inline-block;
  }

  @media (max-width: 768px) {
    .chat-input {
      padding: 1rem;
    }

    .chat-input__field-wrapper {
      gap: 0.5rem;
    }

    .chat-input__submit-text {
      display: none;
    }

    .chat-input__submit {
      min-width: auto;
      width: 3rem;
      padding: 0;
    }
  }

  @media (max-width: 480px) {
    .chat-input {
      padding: 0.75rem;
    }

    .chat-input__field-wrapper {
      gap: 0.375rem;
    }
  }
</style>
