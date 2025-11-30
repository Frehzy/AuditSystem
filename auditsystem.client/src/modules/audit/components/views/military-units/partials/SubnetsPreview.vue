<template>
  <div class="subnets-preview">
    <h4 class="preview-title">Подсети</h4>
    <div class="preview-list">
      <div v-for="subnet in displayedSubnets"
           :key="subnet.id"
           class="preview-item">
        <div class="preview-content">
          <span class="preview-name">{{ subnet.name }}</span>
          <code class="preview-address">{{ subnet.network }}/{{ subnet.mask }}</code>
        </div>
        <div class="preview-meta">
          <span class="devices-count">{{ subnet.devicesCount }} устройств</span>
          <span class="last-scan" :class="{ 'never-scanned': !subnet.lastScan }">
            {{ subnet.lastScan ? formatRelativeTime(subnet.lastScan) : 'Никогда' }}
          </span>
        </div>
      </div>
      <div v-if="hasMoreSubnets" class="preview-more" @click="$emit('view-all')">
        +{{ remainingSubnetsCount }} еще
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Subnet } from '@/modules/audit/api/audit.types';
  import { formatRelativeTime } from '@/core/utils/date.utils';

  interface Props {
    subnets: Subnet[];
    maxDisplay?: number;
  }

  interface Emits {
    (e: 'view-all'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    maxDisplay: 3
  });

  const emit = defineEmits<Emits>();

  const displayedSubnets = computed(() => props.subnets.slice(0, props.maxDisplay));
  const hasMoreSubnets = computed(() => props.subnets.length > props.maxDisplay);
  const remainingSubnetsCount = computed(() => props.subnets.length - props.maxDisplay);
</script>

<style scoped>
  .subnets-preview {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .preview-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  .preview-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .preview-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm);
    background: var(--color-surface-hover);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .preview-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    flex: 1;
  }

  .preview-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .preview-address {
    font-size: 0.75rem;
    font-family: var(--font-family-mono);
    color: var(--color-text-muted);
    background: var(--color-surface);
    padding: 0.125rem 0.25rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
  }

  .preview-meta {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    align-items: flex-end;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .devices-count {
    font-weight: 500;
  }

  .last-scan {
    color: var(--color-text-muted);
  }

    .last-scan.never-scanned {
      color: var(--color-error);
    }

  .preview-more {
    font-size: 0.75rem;
    color: var(--color-primary);
    font-weight: 500;
    text-align: center;
    padding: var(--spacing-xs);
    cursor: pointer;
    transition: color var(--transition-fast);
  }

    .preview-more:hover {
      color: var(--color-primary-dark);
      text-decoration: underline;
    }
</style>
