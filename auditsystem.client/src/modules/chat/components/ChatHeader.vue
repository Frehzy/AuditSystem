<template>
  <header class="chat-header">
    <div class="chat-header__content">
      <h1 class="chat-header__title">Чат</h1>
      <div class="chat-header__actions">
        <BaseButton @click="handleLogout"
                    variant="ghost"
                    size="sm">
          <template #icon-left>
            <LogOutIcon />
          </template>
          Выйти
        </BaseButton>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { BaseButton } from '@/framework/ui';
import { LogOutIcon } from '@/assets/icons';

interface Emits {
  (e: 'logout'): void;
}

const emit = defineEmits<Emits>();

const handleLogout = (): void => {
  emit('logout');
};
</script>

<style scoped>
  .chat-header {
    background: var(--color-background-card);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem 1.5rem;
    backdrop-filter: blur(10px);
  }

  .chat-header__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
  }

  .chat-header__title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
    .chat-header {
      padding: 0.75rem 1rem;
    }

    .chat-header__title {
      font-size: 1.25rem;
    }
  }
</style>
