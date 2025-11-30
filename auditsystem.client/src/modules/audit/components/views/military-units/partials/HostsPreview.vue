<template>
  <div class="hosts-preview">
    <h4 class="preview-title">Хосты</h4>
    <div class="preview-list">
      <div v-for="host in displayedHosts"
           :key="host.id"
           class="preview-item host-item"
           :class="`host-status--${host.status}`">
        <div class="preview-content">
          <span class="preview-name">{{ host.name }}</span>
          <code class="preview-address">{{ host.ipAddress }}</code>
          <BaseChip :color="getOsColor(host.osType)" size="xs">
            {{ getOsText(host.osType) }}
          </BaseChip>
        </div>
        <div class="host-status">
          <div class="status-indicator" :class="`status--${host.status}`"></div>
          <span class="status-text">{{ getHostStatusText(host.status) }}</span>
        </div>
      </div>
      <div v-if="hasMoreHosts" class="preview-more" @click="$emit('view-all')">
        +{{ remainingHostsCount }} еще
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
  import type { Host } from '@/modules/audit/api/audit.types';

  interface Props {
    hosts: Host[];
    maxDisplay?: number;
  }

  interface Emits {
    (e: 'view-all'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    maxDisplay: 3
  });

  const emit = defineEmits<Emits>();

  const displayedHosts = computed(() => props.hosts.slice(0, props.maxDisplay));
  const hasMoreHosts = computed(() => props.hosts.length > props.maxDisplay);
  const remainingHostsCount = computed(() => props.hosts.length - props.maxDisplay);

  const getHostStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      online: 'В сети',
      offline: 'Не в сети',
      unknown: 'Неизвестно'
    };
    return statusMap[status] || status;
  };

  const getOsText = (osType: string): string => {
    const osMap: Record<string, string> = {
      linux: 'Linux',
      windows: 'Windows',
      unknown: 'Неизвестно'
    };
    return osMap[osType] || osType;
  };

  const getOsColor = (osType: string): string => {
    const colorMap: Record<string, string> = {
      linux: 'info',
      windows: 'primary',
      unknown: 'default'
    };
    return colorMap[osType] || 'default';
  };
</script>

<style scoped>
  .hosts-preview {
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

  .preview-item.host-item {
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

  .host-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .status-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
  }

    .status-indicator.status--online {
      background: var(--color-success);
    }

    .status-indicator.status--offline {
      background: var(--color-error);
    }

    .status-indicator.status--unknown {
      background: var(--color-warning);
    }

  .status-text {
    font-size: 0.75rem;
    color: var(--color-text-muted);
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
