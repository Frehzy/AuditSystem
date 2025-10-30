<template>
  <header class="header">
    <div class="header__content">
      <div class="header__left">
        <button @click="$emit('toggle-sidebar')"
                class="sidebar-toggle"
                :title="isSidebarCollapsed ? 'Развернуть меню' : 'Свернуть меню'">
          <MenuIcon class="sidebar-toggle__icon" />
        </button>

        <div class="breadcrumbs">
          <span class="breadcrumbs__item">Аудит Astra Linux</span>
          <span class="breadcrumbs__separator">/</span>
          <span class="breadcrumbs__item breadcrumbs__item--current">
            {{ currentPageTitle }}
          </span>
        </div>
      </div>

      <div class="header__right">
        <div v-if="isScanning" class="scan-indicator">
          <div class="scan-progress">
            <div class="scan-progress__bar">
              <div class="scan-progress__fill"
                   :style="{ width: `${scanProgress}%` }"></div>
            </div>
            <span class="scan-progress__text">{{ scanProgress }}%</span>
          </div>
          <BaseButton @click="$emit('cancel-scan')"
                      variant="text"
                      size="sm"
                      class="cancel-scan-btn">
            Отменить
          </BaseButton>
        </div>

        <BaseButton v-else-if="showScanButton"
                    @click="$emit('start-scan')"
                    variant="primary"
                    class="start-scan-btn">
          <ScanIcon class="button-icon" />
          Запустить сканирование
        </BaseButton>

        <button @click="handleLogout" class="logout-btn">
          <LogoutIcon class="logout-btn__icon" />
          <span class="logout-btn__text">Выйти</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuth } from '@/modules/auth/composables/useAuth';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import { MenuIcon, ScanIcon, LogoutIcon } from '@/assets/icons';

  interface Props {
    title?: string;
    scanProgress?: number;
    isScanning?: boolean;
    isSidebarCollapsed?: boolean;
    showScanButton?: boolean;
  }

  interface Emits {
    (e: 'toggle-sidebar'): void;
    (e: 'start-scan'): void;
    (e: 'cancel-scan'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    scanProgress: 0,
    isScanning: false,
    isSidebarCollapsed: false,
    showScanButton: false
  });

  const emit = defineEmits<Emits>();

  const route = useRoute();
  const router = useRouter();
  const auth = useAuth();

  const currentPageTitle = computed(() => {
    if (props.title) return props.title;

    const path = route.path;
    if (path.startsWith('/audit/monitoring')) return 'Мониторинг';
    if (path.startsWith('/audit/reports')) return 'Отчеты';
    if (path.startsWith('/audit/scripts')) return 'Скрипты';
    if (path.startsWith('/audit/units')) return 'Войсковые части';
    if (path.startsWith('/audit/settings')) return 'Настройки';
    return 'Аудит';
  });

  const handleLogout = async (): Promise<void> => {
    try {
      await auth.logout();
      router.push('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
</script>

<style scoped>
  .header {
    height: 5rem;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: var(--shadow-sm);
  }

  .header__content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--spacing-xl);
    max-width: 1400px;
    margin: 0 auto;
  }

  .header__left {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .sidebar-toggle {
    padding: var(--spacing-md);
    border: none;
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-normal);
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-sm);
  }

    .sidebar-toggle:hover {
      background: var(--color-primary);
      color: white;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .sidebar-toggle:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

  .sidebar-toggle__icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    font-size: 0.95rem;
  }

  .breadcrumbs__item {
    color: var(--color-text-secondary);
    transition: color var(--transition-fast);
    font-weight: var(--font-weight-medium, 500);
  }

  .breadcrumbs__item--current {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold, 600);
  }

  .breadcrumbs__separator {
    color: var(--color-text-muted);
  }

  .header__right {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .scan-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .scan-progress {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    min-width: 120px;
  }

  .scan-progress__bar {
    flex: 1;
    height: 0.5rem;
    background: var(--color-border);
    border-radius: var(--radius-full);
    overflow: hidden;
    box-shadow: inset var(--shadow-sm);
  }

  .scan-progress__fill {
    height: 100%;
    background: var(--gradient-primary);
    border-radius: var(--radius-full);
    transition: width var(--transition-normal);
    box-shadow: var(--shadow-sm);
  }

  .scan-progress__text {
    font-size: 0.875rem;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
    min-width: 2.5rem;
  }

  .cancel-scan-btn {
    color: var(--color-error);
    font-weight: var(--font-weight-medium, 500);
  }

    .cancel-scan-btn:hover {
      color: var(--color-error-dark);
      background: var(--color-error-light);
    }

  .start-scan-btn {
    transition: all var(--transition-normal);
    font-weight: var(--font-weight-semibold, 600);
    box-shadow: var(--shadow-md);
  }

    .start-scan-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: var(--spacing-sm);
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all var(--transition-normal);
    font-size: 0.95rem;
    font-weight: var(--font-weight-medium, 500);
    box-shadow: var(--shadow-sm);
  }

    .logout-btn:hover {
      background: var(--color-error-light);
      border-color: var(--color-error);
      color: var(--color-error);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .logout-btn:focus-visible {
      outline: 2px solid var(--color-error);
      outline-offset: 2px;
    }

  .logout-btn__icon {
    width: 1.25rem;
    height: 1.25rem;
    transition: transform var(--transition-fast);
  }

  .logout-btn:hover .logout-btn__icon {
    transform: scale(1.1);
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .header__content {
      padding: 0 var(--spacing-lg);
    }
  }

  @media (max-width: 1024px) {
    .header {
      height: 4.5rem;
    }

    .header__content {
      padding: 0 var(--spacing-lg);
    }

    .breadcrumbs {
      font-size: 0.9rem;
    }

    .logout-btn {
      padding: var(--spacing-sm) var(--spacing-md);
    }

    .scan-indicator {
      padding: var(--spacing-sm) var(--spacing-md);
    }
  }

  @media (max-width: 900px) {
    .header__content {
      padding: 0 var(--spacing-md);
    }

    .logout-btn__text {
      display: none;
    }

    .logout-btn {
      padding: var(--spacing-md);
      border-radius: var(--radius-full);
      width: 3rem;
      height: 3rem;
      justify-content: center;
    }

    .scan-progress {
      min-width: 100px;
    }

    .scan-progress__text {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 800px) {
    .header {
      height: 4rem;
    }

    .breadcrumbs {
      font-size: 0.85rem;
      gap: var(--spacing-sm);
    }

    .header__content {
      padding: 0 var(--spacing-md);
    }

    .header__left {
      gap: var(--spacing-md);
    }

    .header__right {
      gap: var(--spacing-md);
    }
  }

  @media (max-width: 640px) {
    .scan-indicator {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: stretch;
    }

    .scan-progress {
      min-width: auto;
    }

    .start-scan-btn .button-text {
      display: none;
    }

    .start-scan-btn {
      padding: var(--spacing-md);
    }

    .breadcrumbs__item:first-child {
      display: none;
    }

    .breadcrumbs__separator:first-of-type {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .header__content {
      padding: 0 var(--spacing-sm);
    }

    .header__left {
      gap: var(--spacing-sm);
    }

    .header__right {
      gap: var(--spacing-sm);
    }

    .scan-indicator {
      padding: var(--spacing-sm);
    }

    .sidebar-toggle {
      padding: var(--spacing-sm);
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .header {
      border-bottom-width: 2px;
    }

    .sidebar-toggle,
    .logout-btn,
    .scan-indicator {
      border: 2px solid var(--color-border);
    }

    .scan-progress__bar {
      border: 1px solid var(--color-border);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .sidebar-toggle,
    .logout-btn,
    .start-scan-btn,
    .scan-progress__fill {
      transition: none;
    }

      .sidebar-toggle:hover,
      .logout-btn:hover,
      .start-scan-btn:hover {
        transform: none;
      }

        .logout-btn:hover .logout-btn__icon {
          transform: none;
        }
  }
</style>
