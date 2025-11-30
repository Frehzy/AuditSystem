<template>
  <div class="quick-actions-section">
    <div class="section-header">
      <div class="section-title-group">
        <h2 class="section-title">Быстрые действия</h2>
        <p class="section-description">Создание новых единиц и сканирование сети</p>
      </div>
    </div>

    <div class="actions-grid">
      <div class="action-card" @click="$emit('create-unit')" role="button" tabindex="0">
        <div class="action-icon primary">
          <PlusIcon class="icon" />
        </div>
        <div class="action-content">
          <h3 class="action-title">Добавить часть</h3>
          <p class="action-description">
            Создать новую войсковую часть с подсетями и хостами
          </p>
        </div>
        <div class="action-arrow">
          <ArrowRightIcon class="icon" />
        </div>
      </div>

      <div class="action-card" @click="$emit('scan-network')" role="button" tabindex="0">
        <div class="action-icon secondary">
          <ScanIcon class="icon" />
        </div>
        <div class="action-content">
          <h3 class="action-title">Сканировать сеть</h3>
          <p class="action-description">
            Запустить автоматическое сканирование сетевых ресурсов
          </p>
        </div>
        <div class="action-arrow">
          <ArrowRightIcon class="icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { PlusIcon, ScanIcon, ArrowRightIcon } from '@/assets/icons';

  interface Emits {
    (e: 'create-unit'): void;
    (e: 'scan-network'): void;
  }

  defineEmits<Emits>();
</script>

<style scoped>
  .quick-actions-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--spacing-2xl);
    box-shadow: var(--shadow-sm);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-xl);
  }

  .section-title-group {
    flex: 1;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--color-text-primary);
  }

  .section-description {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg);
  }

  .action-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
    background: var(--color-surface-hover);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-normal);
    text-align: left;
    outline: none;
  }

    .action-card:hover,
    .action-card:focus {
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .action-card:active {
      transform: translateY(-1px);
    }

  .action-icon {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

    .action-icon.primary {
      background: var(--color-primary-light);
      color: var(--color-primary);
    }

    .action-icon.secondary {
      background: var(--color-info-light);
      color: var(--color-info);
    }

    .action-icon .icon {
      width: 1.5rem;
      height: 1.5rem;
    }

  .action-content {
    flex: 1;
  }

  .action-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 var(--spacing-xs) 0;
    color: var(--color-text-primary);
  }

  .action-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .action-arrow .icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-text-muted);
    transition: transform var(--transition-fast);
  }

  .action-card:hover .action-arrow .icon {
    transform: translateX(2px);
  }

  @media (max-width: 768px) {
    .actions-grid {
      grid-template-columns: 1fr;
    }

    .action-card {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-md);
    }
  }
</style>
