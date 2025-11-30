<template>
  <article class="unit-card">
    <header class="unit-card__header">
      <div class="unit-badge" :class="`status--${unit.status}`">
        {{ getStatusText(unit.status) }}
      </div>
      <div class="unit-actions">
        <BaseButton @click.stop="$emit('edit', unit)"
                    variant="text"
                    size="sm"
                    class="action-btn"
                    :title="`Редактировать ${unit.name}`">
          <EditIcon class="button-icon" />
        </BaseButton>
        <BaseButton @click.stop="$emit('delete', unit)"
                    variant="text"
                    size="sm"
                    color="error"
                    class="action-btn"
                    :title="`Удалить ${unit.name}`">
          <DeleteIcon class="button-icon" />
        </BaseButton>
      </div>
    </header>

    <div class="unit-card__content">
      <div class="unit-main-info">
        <h3 class="unit-name">{{ unit.name }}</h3>
        <div class="unit-location">
          <MapPinIcon class="location-icon" />
          <span>{{ unit.location }}</span>
        </div>
        <p v-if="unit.description" class="unit-description">
          {{ unit.description }}
        </p>
      </div>

      <div class="unit-stats">
        <div class="stat-item">
          <div class="stat-icon">
            <NetworkIcon class="icon" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ unit.subnets.length }}</div>
            <div class="stat-label">подсетей</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">
            <HostIcon class="icon" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ unit.hosts.length }}</div>
            <div class="stat-label">хостов</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">
            <CalendarIcon class="icon" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatUnitDate(unit.createdAt) }}</div>
            <div class="stat-label">создано</div>
          </div>
        </div>
      </div>

      <SubnetsPreview v-if="unit.subnets.length > 0"
                      :subnets="unit.subnets"
                      @view-all="$emit('view-details', unit)" />

      <HostsPreview v-if="unit.hosts.length > 0"
                    :hosts="unit.hosts"
                    @view-all="$emit('view-details', unit)" />
    </div>

    <footer class="unit-card__footer">
      <BaseButton @click="$emit('view-details', unit)"
                  variant="text"
                  size="sm"
                  class="view-details-btn">
        Подробнее
        <ArrowRightIcon class="button-icon" />
      </BaseButton>
    </footer>
  </article>
</template>

<script setup lang="ts">
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import {
    EditIcon,
    DeleteIcon,
    MapPinIcon,
    CalendarIcon,
    NetworkIcon,
    HostIcon,
    ArrowRightIcon
  } from '@/assets/icons';

  import SubnetsPreview from './SubnetsPreview.vue';
  import HostsPreview from './HostsPreview.vue';
  import type { MilitaryUnit } from '@/modules/audit/api/audit.types';
  import { formatDate } from '@/core/utils/date.utils';

  interface Props {
    unit: MilitaryUnit;
  }

  interface Emits {
    (e: 'edit', unit: MilitaryUnit): void;
    (e: 'delete', unit: MilitaryUnit): void;
    (e: 'view-details', unit: MilitaryUnit): void;
  }

  defineProps<Props>();
  defineEmits<Emits>();

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      active: 'Активна',
      deployed: 'На выезде',
      headquarters: 'Штаб'
    };
    return statusMap[status] || status;
  };

  const formatUnitDate = (dateString: string): string => {
    return formatDate(dateString, 'DD.MM.YYYY');
  };
</script>

<style scoped>
  .unit-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    transition: all var(--transition-normal);
    display: flex;
    flex-direction: column;
    height: 100%;
  }

    .unit-card:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

  .unit-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  .unit-badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

    .unit-badge.status--active {
      background: var(--color-success-light);
      color: var(--color-success-dark);
    }

    .unit-badge.status--deployed {
      background: var(--color-warning-light);
      color: var(--color-warning-dark);
    }

    .unit-badge.status--headquarters {
      background: var(--color-info-light);
      color: var(--color-info-dark);
    }

  .unit-actions {
    display: flex;
    gap: var(--spacing-xs);
  }

  .action-btn {
    width: 2rem;
    height: 2rem;
    padding: 0;
  }

  .unit-card__content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    flex: 1;
  }

  .unit-main-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .unit-name {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
    line-height: 1.3;
  }

  .unit-location {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .location-icon {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  .unit-description {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .unit-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-surface-hover);
    border-radius: var(--radius-md);
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

    .stat-item .stat-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius-md);
      background: var(--color-primary-light);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

      .stat-item .stat-icon .icon {
        width: 1.25rem;
        height: 1.25rem;
      }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-item .stat-value {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
    line-height: 1;
  }

  .stat-item .stat-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin: 0;
  }

  .unit-card__footer {
    margin-top: auto;
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--color-border);
  }

  .view-details-btn {
    width: 100%;
    justify-content: center;
  }

  @media (max-width: 480px) {
    .unit-stats {
      grid-template-columns: 1fr;
    }

    .unit-card {
      padding: var(--spacing-md);
    }
  }
</style>
