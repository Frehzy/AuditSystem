<!-- src/modules/audit/components/layout/AuditHeader.vue -->
<template>
  <header class="header">
    <div class="header__content">
      <div class="breadcrumbs">
        <span class="breadcrumbs__item">Аудит Astra Linux</span>
        <span class="breadcrumbs__separator">/</span>
        <span class="breadcrumbs__item breadcrumbs__item--current">
          {{ currentPageTitle }}
        </span>
      </div>

      <div class="header__actions">
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
  import { LogoutIcon } from '@/assets/icons';

  const route = useRoute();
  const router = useRouter();
  const auth = useAuth();

  const currentPageTitle = computed(() => {
    const path = route.path;
    if (path.startsWith('/audit/monitoring')) return 'Мониторинг';
    if (path.startsWith('/audit/settings')) return 'Настройки';
    return 'Отчеты';
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

  .header__actions {
    display: flex;
    align-items: center;
    gap: 1rem;
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
  }
</style>
