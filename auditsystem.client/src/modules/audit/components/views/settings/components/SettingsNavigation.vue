<template>
  <div class="settings-navigation">
    <div class="nav-tabs">
      <button v-for="tab in tabs"
              :key="tab.id"
              :class="['nav-tab', { 'nav-tab--active': activeTab === tab.id }]"
              @click="$emit('tab-change', tab.id)">
        <component :is="tab.icon" class="tab-icon" />
        <span class="tab-text">{{ tab.title }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ScanIcon, BellIcon, UsersIcon, NetworkIcon } from '@/assets/icons';

interface Props {
  activeTab: string;
  tabs: Array<{
    id: string;
    title: string;
    icon: any;
  }>;
}

interface Emits {
  (e: 'tab-change', tabId: string): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style scoped>
  .settings-navigation {
    border-bottom: 1px solid var(--color-border);
  }

  .nav-tabs {
    display: flex;
    gap: var(--spacing-md);
    overflow-x: auto;
  }

  .nav-tab {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
    font-size: 0.95rem;
    font-weight: 500;
  }

    .nav-tab:hover {
      color: var(--color-primary);
      background: var(--color-surface-hover);
      border-radius: var(--radius-md) var(--radius-md) 0 0;
    }

  .nav-tab--active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
    background: var(--color-surface-hover);
  }

  .theme-light .nav-tab--active {
    background: var(--color-primary-50);
  }

  .theme-dark .nav-tab--active {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }

  .tab-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: currentColor;
  }

  @media (max-width: 768px) {
    .nav-tabs {
      gap: var(--spacing-sm);
    }

    .nav-tab {
      padding: var(--spacing-md);
      font-size: 0.9rem;
    }

    .tab-text {
      display: none;
    }
  }
</style>
