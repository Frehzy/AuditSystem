<template>
  <div class="stats-overview">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total-units">
          <ServerIcon class="icon" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalUnits }}</div>
          <div class="stat-label">Всего частей</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon total-subnets">
          <NetworkIcon class="icon" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalSubnets }}</div>
          <div class="stat-label">Подсетей</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon total-hosts">
          <HostIcon class="icon" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalHosts }}</div>
          <div class="stat-label">Хостов</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon online-hosts">
          <CheckCircleIcon class="icon" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ onlineHosts }}</div>
          <div class="stat-label">Активных хостов</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ServerIcon, NetworkIcon, HostIcon, CheckCircleIcon } from '@/assets/icons';
  import type { MilitaryUnit } from '@/modules/audit/api/audit.types';

  interface Props {
    units?: MilitaryUnit[];
    isLoading?: boolean;
  }

  const props = defineProps<Props>();

  const totalUnits = computed(() => props.units?.length || 0);
  const totalSubnets = computed(() =>
    props.units?.reduce((total, unit) => total + unit.subnets.length, 0) || 0
  );
  const totalHosts = computed(() =>
    props.units?.reduce((total, unit) => total + unit.hosts.length, 0) || 0
  );
  const onlineHosts = computed(() =>
    props.units?.reduce((total, unit) =>
      total + unit.hosts.filter(host => host.status === 'online').length, 0
    ) || 0
  );
</script>

<style scoped>
  .stats-overview {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--spacing-2xl);
    box-shadow: var(--shadow-sm);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    transition: all var(--transition-normal);
  }

    .stat-card:hover {
      border-color: var(--color-primary);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

  .stat-icon {
    width: 4rem;
    height: 4rem;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: white;
  }

    .stat-icon.total-units {
      background: var(--color-primary);
    }

    .stat-icon.total-subnets {
      background: var(--color-info);
    }

    .stat-icon.total-hosts {
      background: var(--color-warning);
    }

    .stat-icon.online-hosts {
      background: var(--color-success);
    }

    .stat-icon .icon {
      width: 2rem;
      height: 2rem;
    }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: var(--spacing-xs);
    color: var(--color-text-primary);
    line-height: 1;
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .stat-card {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-md);
    }
  }
</style>
