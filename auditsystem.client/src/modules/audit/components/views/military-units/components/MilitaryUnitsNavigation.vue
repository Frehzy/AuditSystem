<template>
  <nav class="settings-navigation" aria-label="Навигация по разделам войсковых частей">
    <div class="navigation-tabs">
      <button v-for="tab in tabs"
              :key="tab.id"
              class="tab-button"
              :class="{ active: activeTab === tab.id }"
              @click="handleTabChange(tab.id)"
              :aria-selected="activeTab === tab.id"
              :aria-controls="`tab-${tab.id}`">
        <component :is="tab.icon" class="tab-icon" aria-hidden="true" />
        <span class="tab-label">{{ tab.title }}</span>
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
  interface Tab {
    id: string;
    title: string;
    icon: any;
    badge?: number;
  }

  interface Props {
    activeTab: string;
    tabs: Tab[];
  }

  interface Emits {
    (e: 'tab-change', tabId: string): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const handleTabChange = (tabId: string) => {
    if (tabId !== props.activeTab) {
      emit('tab-change', tabId);
    }
  };
</script>

<style scoped>
  .settings-navigation {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--spacing-md);
    box-shadow: var(--shadow-sm);
  }

  .navigation-tabs {
    display: flex;
    gap: var(--spacing-sm);
  }

  .tab-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-normal);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    position: relative;
    outline: none;
  }

    .tab-button:hover {
      background: var(--color-surface-hover);
      color: var(--color-text-primary);
    }

    .tab-button:focus-visible {
      box-shadow: var(--shadow-focus);
    }

    .tab-button.active {
      background: var(--color-primary-light);
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

  .tab-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  .tab-badge {
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius-full);
    padding: 0.125rem 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 1.25rem;
    text-align: center;
  }

  @media (max-width: 768px) {
    .navigation-tabs {
      flex-direction: column;
    }

    .tab-button {
      justify-content: center;
    }
  }
</style>
