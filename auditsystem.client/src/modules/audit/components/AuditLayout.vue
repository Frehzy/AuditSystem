<template>
  <div class="audit-layout" :class="themeClass">
    <!-- Боковая панель навигации -->
    <aside class="audit-layout__sidebar" :class="{ 'audit-layout__sidebar--collapsed': isSidebarCollapsed }">
      <div class="audit-layout__sidebar-header">
        <div class="audit-layout__logo">
          <ShieldIcon class="audit-layout__logo-icon" />
          <span v-if="!isSidebarCollapsed" class="audit-layout__logo-text">Astra Audit</span>
        </div>
        <button @click="toggleSidebar" class="audit-layout__sidebar-toggle">
          <MenuIcon />
        </button>
      </div>

      <nav class="audit-layout__nav">
        <ul class="audit-layout__nav-list">
          <li v-for="item in navItems" :key="item.id" class="audit-layout__nav-item">
            <router-link :to="item.path"
                         class="audit-layout__nav-link"
                         :class="{
                          'audit-layout__nav-link--active': $route.path === item.path,
                          'audit-layout__nav-link--collapsed': isSidebarCollapsed
                         }">
              <component :is="item.icon" class="audit-layout__nav-icon" />
              <span v-if="!isSidebarCollapsed" class="audit-layout__nav-text">{{ item.title }}</span>
              <span v-if="item.badge && !isSidebarCollapsed" class="audit-layout__nav-badge">{{ item.badge }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="audit-layout__sidebar-footer">
        <div class="audit-layout__user" :class="{ 'audit-layout__user--collapsed': isSidebarCollapsed }">
          <div class="audit-layout__user-avatar">
            <UserIcon />
          </div>
          <div v-if="!isSidebarCollapsed" class="audit-layout__user-info">
            <div class="audit-layout__user-name">{{ userName }}</div>
            <div class="audit-layout__user-role">Audit Manager</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Основной контент -->
    <main class="audit-layout__main">
      <header class="audit-layout__header">
        <div class="audit-layout__breadcrumbs">
          <span class="audit-layout__breadcrumb-item">Astra Linux</span>
          <span class="audit-layout__breadcrumb-separator">/</span>
          <span class="audit-layout__breadcrumb-item audit-layout__breadcrumb-item--current">
            {{ currentPageTitle }}
          </span>
        </div>

        <div class="audit-layout__header-actions">
          <ServerStatus :server-url="serverUrl"
                        :status="serverStatus"
                        :show-retry="true"
                        @retry="handleServerRetry"
                        class="audit-layout__status" />

          <button @click="handleLogout" class="audit-layout__logout-btn">
            <LogoutIcon />
            <span>Выйти</span>
          </button>
        </div>
      </header>

      <div class="audit-layout__content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, markRaw } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuth } from '@/modules/auth/composables/useAuth';
  import { useThemeStore } from '@/framework/stores/theme.store';
  import { useServerHealth } from '@/modules/auth/composables/useServerHealth';
  import {
    ShieldIcon,
    SettingsIcon,
    ScanIcon,
    ReportIcon,
    MenuIcon,
    UserIcon,
    LogoutIcon,
    BellIcon
  } from '@/assets/icons';
  import ServerStatus from '@/modules/auth/components/ServerStatus.vue';

  interface NavItem {
    id: string;
    title: string;
    path: string;
    icon: any;
    badge?: string | number;
  }

  const route = useRoute();
  const router = useRouter();
  const auth = useAuth();
  const themeStore = useThemeStore();
  const serverHealth = useServerHealth();

  const isSidebarCollapsed = ref(false);
  const serverUrl = ref('https://audit.astra-linux.local');

  // Используем markRaw для иконок, чтобы избежать ненужной реактивности
  const navItems = ref<NavItem[]>([
    {
      id: 'dashboard',
      title: 'Обзор безопасности',
      path: '/audit',
      icon: markRaw(ShieldIcon),
      badge: '3'
    },
    {
      id: 'scan',
      title: 'Сканирование',
      path: '/audit/scan',
      icon: markRaw(ScanIcon)
    },
    {
      id: 'reports',
      title: 'Отчеты',
      path: '/audit/reports',
      icon: markRaw(ReportIcon),
      badge: '12'
    },
    {
      id: 'settings',
      title: 'Настройки',
      path: '/audit/settings',
      icon: markRaw(SettingsIcon)
    }
  ]);

  const themeClass = computed(() => `theme-${themeStore.theme}`);
  const userName = computed(() => auth.user.value?.username || 'Администратор');
  const serverStatus = computed(() => serverHealth.status.value);
  const currentPageTitle = computed(() => {
    const item = navItems.value.find(item => item.path === route.path);
    return item?.title || 'Обзор безопасности';
  });

  const toggleSidebar = (): void => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
  };

  const handleServerRetry = async (): Promise<void> => {
    await serverHealth.manualCheck();
  };

  const handleLogout = async (): Promise<void> => {
    await auth.logout();
    router.push('/auth');
  };

  onMounted(() => {
    serverHealth.startPeriodicChecks(30000);
  });
</script>

<style scoped>
  .audit-layout {
    display: flex;
    min-height: 100vh;
    background: var(--color-background);
    color: var(--color-text-primary);
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  }

  .audit-layout__sidebar {
    width: 280px;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    transition: all var(--transition-normal);
    flex-shrink: 0;
  }

  .audit-layout__sidebar--collapsed {
    width: 80px;
  }

  .audit-layout__sidebar-header {
    padding: 20px;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .audit-layout__logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .audit-layout__logo-icon {
    width: 32px;
    height: 32px;
    color: var(--color-primary);
  }

  .audit-layout__logo-text {
    font-size: 18px;
    font-weight: 700;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .audit-layout__sidebar-toggle {
    padding: 8px;
    border: none;
    background: var(--color-surface-hover);
    border-radius: 6px;
    cursor: pointer;
    transition: all var(--transition-fast);
    color: var(--color-text-primary);
  }

    .audit-layout__sidebar-toggle:hover {
      background: var(--color-primary-light);
      color: white;
    }

  .audit-layout__nav {
    flex: 1;
    padding: 20px 0;
  }

  .audit-layout__nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .audit-layout__nav-item {
    margin-bottom: 4px;
  }

  .audit-layout__nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: all var(--transition-fast);
    position: relative;
    border-left: 3px solid transparent;
  }

  .audit-layout__nav-link--collapsed {
    justify-content: center;
    padding: 12px;
  }

  .audit-layout__nav-link:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .audit-layout__nav-link--active {
    background: var(--color-primary-light);
    color: white;
    border-left-color: var(--color-primary);
  }

  .audit-layout__nav-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .audit-layout__nav-text {
    font-weight: 500;
    flex: 1;
  }

  .audit-layout__nav-badge {
    background: var(--color-error);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
  }

  .audit-layout__sidebar-footer {
    padding: 20px;
    border-top: 1px solid var(--color-border);
  }

  .audit-layout__user {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .audit-layout__user--collapsed {
    justify-content: center;
  }

  .audit-layout__user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .audit-layout__user-info {
    flex: 1;
  }

  .audit-layout__user-name {
    font-weight: 600;
    font-size: 14px;
  }

  .audit-layout__user-role {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  .audit-layout__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .audit-layout__header {
    height: 70px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    flex-shrink: 0;
  }

  .audit-layout__breadcrumbs {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  .audit-layout__breadcrumb-item {
    color: var(--color-text-secondary);
  }

  .audit-layout__breadcrumb-item--current {
    color: var(--color-text-primary);
    font-weight: 600;
  }

  .audit-layout__breadcrumb-separator {
    color: var(--color-text-muted);
  }

  .audit-layout__header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .audit-layout__status {
    width: 200px;
  }

  .audit-layout__logout-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 14px;
  }

    .audit-layout__logout-btn:hover {
      background: var(--color-error-light);
      border-color: var(--color-error);
      color: var(--color-error);
    }

  .audit-layout__content {
    flex: 1;
    padding: 24px;
    overflow: auto;
  }

  /* Адаптивность */
  @media (max-width: 1024px) {
    .audit-layout__sidebar {
      width: 240px;
    }

    .audit-layout__sidebar--collapsed {
      width: 70px;
    }
  }

  @media (max-width: 768px) {
    .audit-layout__sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 1000;
      transform: translateX(-100%);
    }

    .audit-layout__sidebar--collapsed {
      transform: translateX(0);
      width: 70px;
    }

    .audit-layout__header {
      padding: 0 16px;
    }

    .audit-layout__content {
      padding: 16px;
    }

    .audit-layout__status {
      display: none;
    }
  }
</style>
