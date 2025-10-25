<!-- src/modules/audit/components/layout/AuditSidebar.vue -->
<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }">
    <div class="sidebar__header">
      <div class="sidebar__brand" :class="{ 'sidebar__brand--collapsed': isCollapsed }">
        <ShieldIcon class="sidebar__brand-icon" />
        <span v-if="!isCollapsed" class="sidebar__brand-text">Военный Аудит</span>
      </div>
    </div>

    <nav class="sidebar__nav">
      <ul class="nav-list">
        <li v-for="item in navItems" :key="item.id" class="nav-item">
          <router-link :to="item.path"
                       class="nav-link"
                       :class="{
              'nav-link--active': $route.path.startsWith(item.path),
              'nav-link--collapsed': isCollapsed
            }">
            <component :is="item.icon" class="nav-link__icon" />
            <span v-if="!isCollapsed" class="nav-link__text">{{ item.title }}</span>

            <div v-if="isCollapsed" class="nav-link__tooltip">
              {{ item.title }}
            </div>
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="sidebar__footer">
      <div class="sidebar__controls" :class="{ 'sidebar__controls--collapsed': isCollapsed }">
        <button @click="emit('toggle-theme')"
                class="sidebar__control-btn"
                :title="isDarkTheme ? 'Светлая тема' : 'Темная тема'">
          <component :is="themeIcon" class="sidebar__control-icon" />
        </button>
        <button @click="emit('toggle-sidebar')"
                class="sidebar__control-btn"
                :title="isCollapsed ? 'Развернуть' : 'Свернуть'">
          <MenuIcon class="sidebar__control-icon" />
        </button>
      </div>

      <div class="user-info" :class="{ 'user-info--collapsed': isCollapsed }">
        <div class="user-info__avatar">
          <UserIcon class="user-info__avatar-icon" />
        </div>
        <div v-if="!isCollapsed" class="user-info__details">
          <div class="user-info__name">{{ userName }}</div>
          <div class="user-info__role">Военный аудитор</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { computed, markRaw } from 'vue';
  import { useRoute } from 'vue-router';
  import { useAuth } from '@/modules/auth/composables/useAuth';
  import { useThemeStore } from '@/framework/stores/theme.store';
  import {
    ShieldIcon,
    SettingsIcon,
    ScanIcon,
    ReportIcon,
    MenuIcon,
    UserIcon,
    MoonIcon,
    SunIcon
  } from '@/assets/icons';

  interface NavItem {
    id: string;
    title: string;
    path: string;
    icon: unknown;
  }

  interface Props {
    isCollapsed?: boolean;
  }

  interface Emits {
    (e: 'toggle-theme'): void;
    (e: 'toggle-sidebar'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const route = useRoute();
  const auth = useAuth();
  const themeStore = useThemeStore();

  const navItems: NavItem[] = [
    {
      id: 'reports',
      title: 'Отчеты',
      path: '/audit',
      icon: markRaw(ReportIcon)
    },
    {
      id: 'monitoring',
      title: 'Мониторинг',
      path: '/audit/monitoring',
      icon: markRaw(ScanIcon)
    },
    {
      id: 'settings',
      title: 'Настройки',
      path: '/audit/settings',
      icon: markRaw(SettingsIcon)
    }
  ];

  const userName = computed(() => auth.user.value?.username || 'Аудитор');
  const isDarkTheme = computed(() => themeStore.isDark);
  const themeIcon = computed(() => isDarkTheme.value ? markRaw(SunIcon) : markRaw(MoonIcon));
</script>

<style scoped>
  .sidebar {
    width: 280px;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.08);
  }

  .sidebar--collapsed {
    width: 70px;
  }

  /* Header */
  .sidebar__header {
    padding: 1.75rem 1.5rem;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 85px;
    background: var(--color-surface);
  }

  .sidebar__brand {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    transition: all 0.3s ease;
  }

  .sidebar__brand--collapsed {
    justify-content: center;
  }

  .sidebar__brand-icon {
    width: 2.25rem;
    height: 2.25rem;
    color: var(--color-primary);
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }

  .sidebar__brand:hover .sidebar__brand-icon {
    transform: scale(1.1);
  }

  .sidebar__brand-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-primary);
    white-space: nowrap;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Navigation */
  .sidebar__nav {
    flex: 1;
    padding: 1.75rem 0;
  }

  .nav-list {
    list-style: none;
    margin: 0;
    padding: 0 0.75rem;
  }

  .nav-item {
    margin-bottom: 0.375rem;
    position: relative;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 1rem 1.25rem;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    border-left: 3px solid transparent;
    white-space: nowrap;
    min-height: 52px;
    border-radius: 0.75rem;
    margin: 0 0.25rem;
  }

  .nav-link--collapsed {
    justify-content: center;
    padding: 1rem;
    gap: 0;
  }

  .nav-link:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
    transform: translateX(4px);
  }

  .nav-link--active {
    background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
    color: white;
    border-left-color: var(--color-primary-dark);
    box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.2);
  }

  .nav-link__icon {
    width: 1.375rem;
    height: 1.375rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
  }

  .nav-link:hover .nav-link__icon {
    transform: scale(1.1);
  }

  .nav-link__text {
    font-weight: 500;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.95rem;
  }

  .nav-link__tooltip {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%) translateX(-8px);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    margin-left: 0.75rem;
  }

  .nav-link--collapsed:hover .nav-link__tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateY(-50%) translateX(0);
  }

  /* Footer */
  .sidebar__footer {
    padding: 1.25rem;
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    min-height: 130px;
    background: var(--color-surface);
  }

  .sidebar__controls {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;
  }

  .sidebar__controls--collapsed {
    flex-direction: column;
  }

  .sidebar__control-btn {
    padding: 0.75rem;
    border: none;
    background: var(--color-surface-hover);
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

    .sidebar__control-btn:hover {
      background: var(--color-primary);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.3);
    }

  .sidebar__control-icon {
    width: 1.375rem;
    height: 1.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
  }

  .sidebar__control-btn:hover .sidebar__control-icon {
    transform: scale(1.1);
  }

  /* User Info */
  .user-info {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    transition: all 0.3s ease;
    padding: 0.5rem;
    border-radius: 0.75rem;
    background: var(--color-surface-hover);
  }

  .user-info--collapsed {
    justify-content: center;
    gap: 0;
    padding: 0.5rem;
  }

  .user-info__avatar {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
  }

  .user-info--collapsed .user-info__avatar {
    width: 2.5rem;
    height: 2.5rem;
  }

  .user-info__avatar-icon {
    width: 1.375rem;
    height: 1.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .user-info__details {
    flex: 1;
    min-width: 0;
    transition: all 0.3s ease;
  }

  .sidebar--collapsed .user-info__details {
    opacity: 0;
    width: 0;
    overflow: hidden;
  }

  .user-info__name {
    font-weight: 600;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-info__role {
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .sidebar {
      width: 240px;
    }

    .sidebar--collapsed {
      width: 60px;
    }

    .sidebar__header {
      padding: 1.5rem 1.25rem;
      min-height: 80px;
    }

    .nav-link {
      padding: 0.875rem 1rem;
    }
  }

  @media (max-width: 900px) {
    .sidebar {
      transform: translateX(-100%);
    }

      .sidebar:not(.sidebar--collapsed) {
        transform: translateX(0);
        width: 280px;
      }

    .sidebar--collapsed {
      transform: translateX(-100%);
    }
  }

  @media (max-width: 800px) {
    .sidebar:not(.sidebar--collapsed) {
      width: 100%;
      max-width: 320px;
    }

    .sidebar__header {
      padding: 1.25rem 1rem;
      min-height: 75px;
    }

    .sidebar__footer {
      padding: 1rem;
      min-height: 120px;
    }

    .nav-list {
      padding: 0 0.5rem;
    }
  }
</style>
