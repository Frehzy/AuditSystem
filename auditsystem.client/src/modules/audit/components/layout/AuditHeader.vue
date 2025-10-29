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
  }

  .header__content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .header__left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .sidebar-toggle {
    padding: 0.75rem;
    border: none;
    background: var(--color-surface-hover);
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

    .sidebar-toggle:hover {
      background: var(--color-primary);
      color: white;
      transform: translateY(-2px);
    }

  .sidebar-toggle__icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.95rem;
  }

  .breadcrumbs__item {
    color: var(--color-text-secondary);
    transition: color 0.2s ease;
  }

  .breadcrumbs__item--current {
    color: var(--color-text-primary);
    font-weight: 600;
  }

  .breadcrumbs__separator {
    color: var(--color-text-muted);
  }

  .header__right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .scan-indicator {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1.25rem;
    background: var(--color-surface-hover);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
  }

  .scan-progress {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 120px;
  }

  .scan-progress__bar {
    flex: 1;
    height: 0.5rem;
    background: var(--color-border);
    border-radius: 1rem;
    overflow: hidden;
  }

  .scan-progress__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
    border-radius: 1rem;
    transition: width 0.3s ease;
  }

  .scan-progress__text {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    min-width: 2.5rem;
  }

  .cancel-scan-btn {
    color: var(--color-error);
  }

  .start-scan-btn {
    transition: all 0.3s ease;
  }

    .start-scan-btn:hover {
      transform: translateY(-2px);
    }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: 0.5rem;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 0.95rem;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

    .logout-btn:hover {
      background: var(--color-error-light);
      border-color: var(--color-error);
      color: var(--color-error);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
    }

  .logout-btn__icon {
    width: 1.25rem;
    height: 1.25rem;
    transition: transform 0.2s ease;
  }

  .logout-btn:hover .logout-btn__icon {
    transform: scale(1.1);
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .header__content {
      padding: 0 1.5rem;
    }
  }

  @media (max-width: 1024px) {
    .header {
      height: 4.5rem;
    }

    .header__content {
      padding: 0 1.25rem;
    }

    .breadcrumbs {
      font-size: 0.9rem;
    }

    .logout-btn {
      padding: 0.625rem 1rem;
    }

    .scan-indicator {
      padding: 0.625rem 1rem;
    }
  }

  @media (max-width: 900px) {
    .header__content {
      padding: 0 1rem;
    }

    .logout-btn__text {
      display: none;
    }

    .logout-btn {
      padding: 0.75rem;
      border-radius: 50%;
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
      gap: 0.5rem;
    }

    .header__content {
      padding: 0 0.875rem;
    }

    .header__left {
      gap: 1rem;
    }

    .header__right {
      gap: 1rem;
    }
  }

  @media (max-width: 640px) {
    .scan-indicator {
      flex-direction: column;
      gap: 0.5rem;
      align-items: stretch;
    }

    .scan-progress {
      min-width: auto;
    }

    .start-scan-btn .button-text {
      display: none;
    }

    .start-scan-btn {
      padding: 0.75rem;
    }
  }
</style>
