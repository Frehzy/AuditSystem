<template>
  <div class="units-view__header">
    <div class="header-content">
      <div class="header-icon">
        <ServerIcon class="icon" />
      </div>
      <div class="header-text">
        <h1 class="units-view__title">Войсковые части</h1>
        <p class="units-view__subtitle">
          Управление военными подразделениями и их сетевыми ресурсами
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ServerIcon } from '@/assets/icons';
</script>

<style scoped>
  .units-view__header {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--spacing-2xl);
    box-shadow: var(--shadow-sm);
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .header-icon {
    width: 4rem;
    height: 4rem;
    border-radius: var(--radius-lg);
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

    .header-icon .icon {
      width: 2rem;
      height: 2rem;
      color: white;
    }

  .header-text {
    flex: 1;
  }

  .units-view__title {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--color-text-primary);
    line-height: 1.2;
  }

  .units-view__subtitle {
    font-size: 1.125rem;
    color: var(--color-text-secondary);
    margin: 0;
    font-weight: 400;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-md);
    }

    .units-view__title {
      font-size: 1.75rem;
    }
  }
</style>
