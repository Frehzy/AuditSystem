<template>
  <div class="unit-details">
    <!-- Основная информация -->
    <div class="details-section">
      <h3 class="section-title">Основная информация</h3>
      <div class="details-grid">
        <div class="detail-item">
          <span class="detail-label">Название:</span>
          <span class="detail-value">{{ unit.name }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Местоположение:</span>
          <span class="detail-value">{{ unit.location }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Статус:</span>
          <BaseChip :color="getStatusColor(unit.status)" size="sm">
            {{ getStatusText(unit.status) }}
          </BaseChip>
        </div>
        <div class="detail-item">
          <span class="detail-label">Дата создания:</span>
          <span class="detail-value">{{ formatDate(unit.createdAt) }}</span>
        </div>
      </div>

      <div v-if="unit.description" class="detail-item full-width">
        <span class="detail-label">Описание:</span>
        <p class="detail-description">{{ unit.description }}</p>
      </div>
    </div>

    <!-- Статистика -->
    <div class="details-section">
      <h3 class="section-title">Статистика</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">
            <NetworkIcon class="icon" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ unit.subnets.length }}</div>
            <div class="stat-label">Подсетей</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">
            <HostIcon class="icon" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ unit.hosts.length }}</div>
            <div class="stat-label">Хостов</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">
            <ServerIcon class="icon" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ onlineHostsCount }}</div>
            <div class="stat-label">Активных хостов</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Подсети -->
    <div class="details-section">
      <div class="section-header">
        <h3 class="section-title">Подсети</h3>
        <BaseButton @click="$emit('edit', unit)"
                    variant="secondary"
                    size="sm">
          <EditIcon class="button-icon" />
          Редактировать
        </BaseButton>
      </div>

      <SubnetsPreview :subnets="unit.subnets"
                      :max-display="10" />
    </div>

    <!-- Хосты -->
    <div class="details-section">
      <div class="section-header">
        <h3 class="section-title">Хосты</h3>
        <BaseButton @click="$emit('edit', unit)"
                    variant="secondary"
                    size="sm">
          <EditIcon class="button-icon" />
          Редактировать
        </BaseButton>
      </div>

      <HostsPreview :hosts="unit.hosts"
                    :max-display="10" />
    </div>

    <!-- Действия -->
    <div class="details-actions">
      <BaseButton @click="$emit('edit', unit)"
                  variant="primary">
        <EditIcon class="button-icon" />
        Редактировать
      </BaseButton>
      <BaseButton @click="$emit('delete', unit)"
                  variant="secondary"
                  color="error">
        <DeleteIcon class="button-icon" />
        Удалить
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
import SubnetsPreview from '../partials/SubnetsPreview.vue';
import HostsPreview from '../partials/HostsPreview.vue';
import {
  EditIcon,
  DeleteIcon,
  NetworkIcon,
  HostIcon,
  ServerIcon
} from '@/assets/icons';
import type { MilitaryUnit } from '@/modules/audit/api/audit.types';
import { formatDate } from '@/core/utils/date.utils';

interface Props {
  unit: MilitaryUnit;
}

interface Emits {
  (e: 'edit', unit: MilitaryUnit): void;
  (e: 'delete', unit: MilitaryUnit): void;
}

defineProps<Props>();
defineEmits<Emits>();

const onlineHostsCount = computed(() =>
  props.unit.hosts.filter(host => host.status === 'online').length
);

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: 'Активна',
    deployed: 'На выезде',
    headquarters: 'Штаб'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    active: 'success',
    deployed: 'warning',
    headquarters: 'primary'
  };
  return colorMap[status] || 'default';
};
</script>

<style scoped>
  .unit-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
    max-height: 70vh;
    overflow-y: auto;
  }

  .details-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 var(--spacing-lg) 0;
    color: var(--color-text-primary);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

    .detail-item.full-width {
      grid-column: 1 / -1;
    }

  .detail-label {
    font-weight: 600;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  .detail-value {
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .detail-description {
    color: var(--color-text-primary);
    line-height: 1.5;
    margin: 0;
    padding: var(--spacing-md);
    background: var(--color-surface-hover);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .stat-icon {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-md);
    background: var(--color-primary-light);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

    .stat-icon .icon {
      width: 1.5rem;
      height: 1.5rem;
    }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--color-text-primary);
    line-height: 1;
    margin-bottom: var(--spacing-xs);
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .details-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-border);
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: var(--spacing-sm);
  }

  @media (max-width: 768px) {
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
    }

    .details-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .details-actions {
      flex-direction: column;
    }
  }
</style>
