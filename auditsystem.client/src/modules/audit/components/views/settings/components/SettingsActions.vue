<template>
  <div class="settings-actions">
    <div class="actions-content">
      <BaseButton @click="$emit('reset')"
                  variant="secondary"
                  class="reset-btn">
        <ResetIcon class="button-icon" />
        Сбросить настройки
      </BaseButton>
      <BaseButton @click="$emit('save')"
                  variant="primary"
                  :loading="isSaving"
                  class="save-btn">
        <SaveIcon class="button-icon" />
        Сохранить изменения
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
import { SaveIcon, ResetIcon } from '@/assets/icons';

interface Props {
  isSaving?: boolean;
}

interface Emits {
  (e: 'save'): void;
  (e: 'reset'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style scoped>
  .settings-actions {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--spacing-xl);
    margin-top: var(--spacing-lg);
  }

  .actions-content {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: var(--spacing-sm);
  }

  @media (max-width: 768px) {
    .actions-content {
      flex-direction: column;
    }

    .save-btn,
    .reset-btn {
      width: 100%;
    }
  }
</style>
