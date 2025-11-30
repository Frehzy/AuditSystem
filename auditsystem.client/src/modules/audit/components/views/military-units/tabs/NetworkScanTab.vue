<template>
  <div class="network-scan-tab">
    <div class="scan-content">
      <!-- Заголовок и описание -->
      <div class="scan-header">
        <div class="scan-icon">
          <ScanIcon class="icon" />
        </div>
        <div class="scan-text">
          <h2 class="scan-title">Сканирование сети</h2>
          <p class="scan-description">
            Автоматическое обнаружение сетевых ресурсов и их добавление в войсковые части
          </p>
        </div>
      </div>

      <!-- Действия -->
      <div class="scan-actions">
        <div class="actions-group">
          <BaseButton @click="$emit('scan-network')"
                      variant="primary"
                      size="lg"
                      class="main-action">
            <ScanIcon class="button-icon" />
            Запустить сканирование сети
          </BaseButton>

          <div class="scan-info">
            <div class="info-item">
              <strong>Всего подсетей:</strong>
              {{ totalSubnets }}
            </div>
            <div class="info-item">
              <strong>Обнаружено хостов:</strong>
              {{ totalHosts }}
            </div>
            <div class="info-item">
              <strong>Активных хостов:</strong>
              {{ onlineHosts }}
            </div>
          </div>
        </div>
      </div>

      <!-- История сканирований -->
      <div class="scan-history">
        <div class="section-header">
          <h3 class="section-title">История сканирований</h3>
          <BaseButton @click="loadScanHistory"
                      variant="text"
                      size="sm"
                      :loading="isLoadingHistory">
            <RefreshIcon class="button-icon" />
            Обновить
          </BaseButton>
        </div>

        <div class="history-list">
          <div v-if="scanHistory.length === 0" class="empty-history">
            <p>История сканирований отсутствует</p>
          </div>

          <div v-else class="history-items">
            <div v-for="scan in scanHistory"
                 :key="scan.id"
                 class="history-item">
              <div class="scan-info">
                <div class="scan-range">{{ scan.ipRange }}</div>
                <div class="scan-meta">
                  <span class="scan-date">{{ formatDate(scan.startedAt) }}</span>
                  <BaseChip :color="getScanStatusColor(scan.status)"
                            size="xs">
                    {{ getScanStatusText(scan.status) }}
                  </BaseChip>
                </div>
              </div>
              <div class="scan-results">
                <div class="result-item">
                  <span class="result-label">Найдено хостов:</span>
                  <span class="result-value">{{ scan.hostsFound || 0 }}</span>
                </div>
                <div class="result-item">
                  <span class="result-label">Длительность:</span>
                  <span class="result-value">{{ formatDuration(scan.duration) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
  import { ScanIcon, RefreshIcon } from '@/assets/icons';
  import type { MilitaryUnit } from '@/modules/audit/api/audit.types';
  import { formatDate } from '@/core/utils/date.utils';

  interface Props {
    units?: MilitaryUnit[];
  }

  interface Emits {
    (e: 'scan-network'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const isLoadingHistory = ref(false);
  const scanHistory = ref<any[]>([]);

  const totalHosts = computed(() => {
    return props.units?.reduce((total, unit) => total + unit.hosts.length, 0) || 0;
  });

  const onlineHosts = computed(() => {
    return props.units?.reduce((total, unit) =>
      total + unit.hosts.filter(host => host.status === 'online').length, 0
    ) || 0;
  });

  const totalSubnets = computed(() => {
    return props.units?.reduce((total, unit) => total + unit.subnets.length, 0) || 0;
  });

  const loadScanHistory = async (): Promise<void> => {
    isLoadingHistory.value = true;
    try {
      // TODO: Implement API call to load scan history
      // const response = await auditApiService.getScanHistory();
      // scanHistory.value = response.data;

      // Mock data for demonstration
      scanHistory.value = [
        {
          id: '1',
          ipRange: '192.168.1.0/24',
          status: 'completed',
          hostsFound: 15,
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          duration: 300
        },
        {
          id: '2',
          ipRange: '10.0.0.0/16',
          status: 'failed',
          hostsFound: 0,
          startedAt: new Date(Date.now() - 7200000).toISOString(),
          duration: 120
        }
      ];
    } catch (error) {
      console.error('Failed to load scan history:', error);
    } finally {
      isLoadingHistory.value = false;
    }
  };

  const getScanStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      completed: 'success',
      running: 'warning',
      failed: 'error',
      pending: 'default'
    };
    return colorMap[status] || 'default';
  };

  const getScanStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      completed: 'Завершено',
      running: 'Выполняется',
      failed: 'Ошибка',
      pending: 'Ожидание'
    };
    return statusMap[status] || status;
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds} сек`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} мин`;
  };

  onMounted(() => {
    loadScanHistory();
  });
</script>

<style scoped>
  .network-scan-tab {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--spacing-2xl);
    box-shadow: var(--shadow-sm);
  }

  .scan-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
  }

  .scan-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .scan-icon {
    width: 4rem;
    height: 4rem;
    border-radius: var(--radius-lg);
    background: var(--color-primary-light);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

    .scan-icon .icon {
      width: 2rem;
      height: 2rem;
    }

  .scan-text {
    flex: 1;
  }

  .scan-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--color-text-primary);
  }

  .scan-description {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .scan-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .actions-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }

  .main-action {
    min-width: 250px;
  }

  .scan-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
    width: 100%;
    max-width: 600px;
  }

  .info-item {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    text-align: center;
    padding: var(--spacing-sm);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .scan-history {
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    border: 1px solid var(--color-border);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
  }

  .history-list {
    min-height: 200px;
  }

  .empty-history {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--spacing-2xl);
    color: var(--color-text-secondary);
    font-style: italic;
  }

  .history-items {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    transition: all var(--transition-normal);
  }

    .history-item:hover {
      border-color: var(--color-primary);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

  .scan-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    flex: 1;
  }

  .scan-range {
    font-weight: 600;
    color: var(--color-text-primary);
    font-family: var(--font-family-mono);
  }

  .scan-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .scan-date {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .scan-results {
    display: flex;
    gap: var(--spacing-lg);
  }

  .result-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    background: var(--color-surface-hover);
    border-radius: var(--radius-md);
    min-width: 100px;
  }

  .result-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .result-value {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-primary);
  }

  @media (max-width: 768px) {
    .scan-header {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-md);
    }

    .scan-info {
      grid-template-columns: 1fr;
    }

    .history-item {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
    }

    .scan-results {
      width: 100%;
      justify-content: space-between;
    }

    .result-item {
      min-width: auto;
      flex: 1;
    }
  }
</style>
