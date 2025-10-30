<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }">
    <div class="sidebar__header">
      <div class="sidebar__brand" :class="{ 'sidebar__brand--collapsed': isCollapsed }">
        <ShieldIcon class="sidebar__brand-icon" />
        <span v-if="!isCollapsed" class="sidebar__brand-text">Аудит Astra Linux</span>
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
                       }"
                       @click="handleNavClick(item)">
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
        <button @click="handleToggleTheme"
                class="sidebar__control-btn"
                :title="isDarkTheme ? 'Светлая тема' : 'Темная тема'">
          <component :is="themeIcon" class="sidebar__control-icon" />
        </button>
        <button @click="handleToggleSidebar"
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
          <div class="user-info__role">Аудитор Astra Linux</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { computed, markRaw } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useAuth } from '@/modules/auth/composables/useAuth';
  import { useAppStore } from '@/framework/stores/app.store';
  import {
    ShieldIcon,
    SettingsIcon,
    ScanIcon,
    ReportIcon,
    ScriptIcon,
    ServerIcon,
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

  interface Emits {
    (e: 'toggle-theme'): void;
    (e: 'toggle-sidebar'): void;
    (e: 'nav-change', item: NavItem): void;
  }

  defineProps<{
    isCollapsed?: boolean;
    activeView?: string;
  }>();

  const emit = defineEmits<Emits>();

  const router = useRouter();
  const route = useRoute();
  const auth = useAuth();
  const appStore = useAppStore();

  const navItems: NavItem[] = [
    {
      id: 'monitoring',
      title: 'Мониторинг',
      path: '/audit/monitoring',
      icon: markRaw(ScanIcon)
    },
    {
      id: 'reports',
      title: 'Отчеты',
      path: '/audit/reports',
      icon: markRaw(ReportIcon)
    },
    {
      id: 'scripts',
      title: 'Скрипты',
      path: '/audit/scripts',
      icon: markRaw(ScriptIcon)
    },
    {
      id: 'units',
      title: 'Войсковые части',
      path: '/audit/units',
      icon: markRaw(ServerIcon)
    },
    {
      id: 'settings',
      title: 'Настройки',
      path: '/audit/settings',
      icon: markRaw(SettingsIcon)
    }
  ];

  const userName = computed(() => auth.user.value?.username || 'Аудитор');
  const isDarkTheme = computed(() => appStore.isDark);
  const themeIcon = computed(() => isDarkTheme.value ? markRaw(SunIcon) : markRaw(MoonIcon));

  const handleToggleTheme = (): void => {
    emit('toggle-theme');
  };

  const handleToggleSidebar = (): void => {
    emit('toggle-sidebar');
  };

  const handleNavClick = (item: NavItem): void => {
    emit('nav-change', item);
  };
</script>

<style scoped>
  .sidebar {
    width: 280px;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    transition: all var(--transition-normal);
    flex-shrink: 0;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    box-shadow: var(--shadow-lg);
  }

  .sidebar--collapsed {
    width: 70px;
  }

  /* Header */
  .sidebar__header {
    padding: var(--spacing-xl) var(--spacing-lg);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 85px;
    background: var(--color-surface);
    position: relative;
    overflow: hidden;
  }

    .sidebar__header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--gradient-primary);
    }

  .sidebar__brand {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    transition: all var(--transition-normal);
  }

  .sidebar__brand--collapsed {
    justify-content: center;
  }

  .sidebar__brand-icon {
    width: 2.25rem;
    height: 2.25rem;
    color: white;
    flex-shrink: 0;
    transition: transform var(--transition-normal);
    background: var(--gradient-primary);
    padding: var(--spacing-sm);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-primary);
  }

  .sidebar__brand:hover .sidebar__brand-icon {
    transform: scale(1.1) rotate(5deg);
  }

  .sidebar__brand-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary);
    white-space: nowrap;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.025em;
  }

  /* Navigation */
  .sidebar__nav {
    flex: 1;
    padding: var(--spacing-xl) 0;
  }

  .nav-list {
    list-style: none;
    margin: 0;
    padding: 0 var(--spacing-md);
  }

  .nav-item {
    margin-bottom: var(--spacing-sm);
    position: relative;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg) var(--spacing-xl);
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: all var(--transition-normal);
    position: relative;
    border-left: 3px solid transparent;
    white-space: nowrap;
    min-height: 52px;
    border-radius: var(--radius-xl);
    margin: 0 var(--spacing-sm);
    background: var(--color-surface);
    border: 1px solid transparent;
  }

  .nav-link--collapsed {
    justify-content: center;
    padding: var(--spacing-lg);
    gap: 0;
  }

  .nav-link:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
    transform: translateX(4px);
    border-color: var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .nav-link--active {
    background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
    color: white;
    border-left-color: var(--color-primary-dark);
    box-shadow: var(--shadow-primary);
    transform: translateX(4px);
  }

    .nav-link--active .nav-link__icon {
      color: white;
      transform: scale(1.1);
    }

  .nav-link__icon {
    width: 1.375rem;
    height: 1.375rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--transition-normal);
    color: var(--color-text-secondary);
  }

  .nav-link:hover .nav-link__icon {
    transform: scale(1.1);
    color: var(--color-primary);
  }

  .nav-link__text {
    font-weight: 500;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.95rem;
    transition: color var(--transition-normal);
  }

  .nav-link__tooltip {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%) translateX(-8px);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: 0.9rem;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-normal);
    pointer-events: none;
    z-index: 1000;
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(10px);
    margin-left: var(--spacing-md);
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .nav-link--collapsed:hover .nav-link__tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateY(-50%) translateX(0);
  }

  /* Footer */
  .sidebar__footer {
    padding: var(--spacing-lg);
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    min-height: 130px;
    background: var(--color-surface);
  }

  .sidebar__controls {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    align-items: center;
    transition: all var(--transition-normal);
  }

  .sidebar__controls--collapsed {
    flex-direction: column;
  }

  .sidebar__control-btn {
    padding: var(--spacing-md);
    border: none;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-normal);
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    flex-shrink: 0;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border);
  }

    .sidebar__control-btn:hover {
      background: var(--color-primary);
      color: white;
      transform: translateY(-2px);
      box-shadow: var(--shadow-primary);
      border-color: var(--color-primary);
    }

  .sidebar__control-icon {
    width: 1.375rem;
    height: 1.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--transition-normal);
  }

  .sidebar__control-btn:hover .sidebar__control-icon {
    transform: scale(1.1);
  }

  /* User Info */
  .user-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    transition: all var(--transition-normal);
    padding: var(--spacing-sm);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
  }

  .user-info--collapsed {
    justify-content: center;
    gap: 0;
    padding: var(--spacing-sm);
  }

  .user-info__avatar {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-primary);
    position: relative;
    overflow: hidden;
  }

    .user-info__avatar::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
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
    position: relative;
    z-index: 1;
  }

  .user-info__details {
    flex: 1;
    min-width: 0;
    transition: all var(--transition-normal);
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
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-xs);
  }

  .user-info__role {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
      padding: var(--spacing-lg) var(--spacing-md);
      min-height: 80px;
    }

    .nav-link {
      padding: var(--spacing-md) var(--spacing-lg);
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
      padding: var(--spacing-lg) var(--spacing-md);
      min-height: 75px;
    }

    .sidebar__footer {
      padding: var(--spacing-md);
      min-height: 120px;
    }

    .nav-list {
      padding: 0 var(--spacing-sm);
    }
  }

  /* Animation improvements */
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .nav-item {
    animation: slideIn 0.3s ease-out;
  }

    .nav-item:nth-child(1) {
      animation-delay: 0.05s;
    }

    .nav-item:nth-child(2) {
      animation-delay: 0.1s;
    }

    .nav-item:nth-child(3) {
      animation-delay: 0.15s;
    }

    .nav-item:nth-child(4) {
      animation-delay: 0.2s;
    }

    .nav-item:nth-child(5) {
      animation-delay: 0.25s;
    }

  /* Focus styles for accessibility */
  .nav-link:focus-visible,
  .sidebar__control-btn:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    box-shadow: var(--shadow-focus);
  }

  /* Scrollbar styling */
  .sidebar__nav::-webkit-scrollbar {
    width: 4px;
  }

  .sidebar__nav::-webkit-scrollbar-track {
    background: var(--color-surface-hover);
    border-radius: var(--radius-sm);
  }

  .sidebar__nav::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: var(--radius-sm);
  }

    .sidebar__nav::-webkit-scrollbar-thumb:hover {
      background: var(--color-text-muted);
    }
</style>
