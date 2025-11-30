<template>
  <div class="settings-view__header">
    <div class="header-content">
      <h1 class="settings-view__title">
        <SettingsIcon class="title-icon" />
        Настройки системы
      </h1>
      <p class="settings-view__subtitle">Управление параметрами безопасности и мониторинга</p>
    </div>
    <div class="header-actions">
      <BaseButton @click="$emit('export')"
                  variant="secondary"
                  size="sm"
                  class="export-btn">
        <DownloadIcon class="button-icon" />
        Экспорт
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
import { SettingsIcon, DownloadIcon } from '@/assets/icons';

defineEmits<{
  export: []
}>();
</script>

<style scoped>
  .settings-view__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-xl);
    padding: var(--spacing-xl) 0;
    border-bottom: 1px solid var(--color-border);
  }

  .header-content {
    flex: 1;
  }

  .settings-view__title {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--color-text-primary);
  }

  .title-icon {
    width: 2rem;
    height: 2rem;
    color: var(--color-primary);
  }

  .settings-view__subtitle {
    font-size: 1.125rem;
    color: var(--color-text-secondary);
    margin: 0;
    font-weight: 400;
  }

  .header-actions {
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .settings-view__header {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
      gap: var(--spacing-lg);
    }

    .settings-view__title {
      font-size: 1.5rem;
      justify-content: center;
    }
  }
</style>
