<template>
  <div class="audit-layout">
    <AuditSidebar :is-collapsed="isSidebarCollapsed"
                  :active-view="currentView"
                  @toggle-theme="toggleTheme"
                  @toggle-sidebar="toggleSidebar"
                  @nav-change="handleNavChange" />

    <div class="layout-content" :class="{ 'layout-content--expanded': isSidebarCollapsed }">
      <AuditHeader :title="currentViewTitle"
                   :scan-progress="currentScan?.progress"
                   :is-scanning="!!currentScan"
                   :is-sidebar-collapsed="isSidebarCollapsed"
                   :show-scan-button="showScanButton"
                   @toggle-sidebar="toggleSidebar"
                   @start-scan="$emit('start-scan')"
                   @cancel-scan="$emit('cancel-scan')" />

      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useAppStore } from '@/framework/stores/app.store';
  import AuditSidebar from './AuditSidebar.vue';
  import AuditHeader from './AuditHeader.vue';

  interface Props {
    currentScan?: any;
  }

  interface Emits {
    (e: 'start-scan'): void;
    (e: 'cancel-scan'): void;
  }

  defineProps<Props>();
  defineEmits<Emits>();

  const appStore = useAppStore();
  const route = useRoute();

  const isSidebarCollapsed = ref(false);

  const currentView = computed(() => {
    const path = route.path;
    if (path.startsWith('/audit/monitoring')) return 'monitoring';
    if (path.startsWith('/audit/reports')) return 'reports';
    if (path.startsWith('/audit/scripts')) return 'scripts';
    if (path.startsWith('/audit/units')) return 'units';
    if (path.startsWith('/audit/settings')) return 'settings';
    return 'monitoring';
  });

  const currentViewTitle = computed(() => {
    const titles = {
      monitoring: 'Мониторинг',
      reports: 'Отчеты',
      scripts: 'Скрипты',
      units: 'Войсковые части',
      settings: 'Настройки'
    };
    return titles[currentView.value];
  });

  const showScanButton = computed(() => {
    return currentView.value === 'monitoring';
  });

  const toggleSidebar = (): void => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
  };

  const toggleTheme = (): void => {
    appStore.toggleTheme();
  };

  const handleNavChange = (item: any): void => {
    // Navigation is handled by router links in sidebar
    // This is just for emitting events if needed
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
