<!-- src/modules/audit/components/layout/AuditLayout.vue -->
<template>
  <div class="audit-layout">
    <AuditSidebar :is-collapsed="isSidebarCollapsed"
                  @toggle-theme="toggleTheme"
                  @toggle-sidebar="toggleSidebar" />

    <div class="layout-content" :class="{ 'layout-content--expanded': isSidebarCollapsed }">
      <AuditHeader />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useThemeStore } from '@/framework/stores/theme.store';
  import AuditSidebar from './AuditSidebar.vue';
  import AuditHeader from './AuditHeader.vue';

  const themeStore = useThemeStore();
  const isSidebarCollapsed = ref(false);

  const toggleSidebar = (): void => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
  };

  const toggleTheme = (): void => {
    themeStore.toggleTheme();
  };
</script>

<style scoped>
  .audit-layout {
    display: flex;
    min-height: 100vh;
    background: var(--color-background);
    color: var(--color-text-primary);
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
  }

  .layout-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-left: 280px;
    background: var(--color-background);
  }

  .layout-content--expanded {
    margin-left: 70px;
  }

  .main-content {
    flex: 1;
    padding: 2rem;
    overflow: auto;
    background: var(--color-background);
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .main-content {
      padding: 1.75rem;
    }
  }

  @media (max-width: 1024px) {
    .layout-content {
      margin-left: 70px;
    }

    .main-content {
      padding: 1.5rem;
    }
  }

  @media (max-width: 900px) {
    .layout-content {
      margin-left: 0 !important;
    }

    .main-content {
      padding: 1.25rem;
    }
  }

  @media (max-width: 800px) {
    .main-content {
      padding: 1rem;
    }
  }
</style>
