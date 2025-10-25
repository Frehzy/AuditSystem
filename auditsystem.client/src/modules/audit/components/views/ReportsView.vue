<!-- src/modules/audit/components/views/ReportsView.vue -->
<template>
  <div class="reports-view">
    <div class="reports-view__header">
      <h1 class="reports-view__title">Отчеты безопасности</h1>
      <p class="reports-view__subtitle">История сканирований и обнаруженных уязвимостей</p>
    </div>

    <div class="reports-view__content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--primary">
            <ScanIcon />
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ totalScans }}</div>
            <div class="stat-card__label">Всего сканирований</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--success">
            <ShieldIcon />
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ securedSystems }}</div>
            <div class="stat-card__label">Защищенных систем</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--warning">
            <AlertIcon />
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ criticalIssues }}</div>
            <div class="stat-card__label">Критических проблем</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--info">
            <ServerIcon />
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ totalDevices }}</div>
            <div class="stat-card__label">Всего устройств</div>
          </div>
        </div>
      </div>

      <div class="reports-section">
        <div class="section-header">
          <h2 class="section-title">Последние сканирования</h2>
          <BaseButton @click="loadScanHistory" variant="secondary" size="sm" class="refresh-btn">
            <RefreshIcon class="button-icon" />
            Обновить
          </BaseButton>
        </div>

        <div class="scans-list">
          <div v-for="scan in recentScans" :key="scan.id" class="scan-item">
            <div class="scan-item__status" :class="`status--${scan.status}`"></div>
            <div class="scan-item__content">
              <div class="scan-item__title">Сканирование подсети {{ scan.subnetName }}</div>
              <div class="scan-item__meta">
                <span class="scan-item__date">{{ formatDate(scan.timestamp) }}</span>
                <span class="scan-item__devices">{{ scan.devicesFound }} устройств</span>
                <span class="scan-item__vulnerabilities">{{ scan.vulnerabilitiesFound }} уязвимостей</span>
              </div>
            </div>
            <div class="scan-item__duration">
              {{ formatDuration(scan.scanDuration) }}
            </div>
            <div class="scan-item__actions">
              <BaseButton @click="downloadReport(scan.id)" variant="text" size="sm">
                <DownloadIcon class="button-icon" />
                Отчет
              </BaseButton>
            </div>
          </div>
        </div>

        <div class="empty-state" v-if="recentScans.length === 0">
          <ReportIcon class="empty-state__icon" />
          <p class="empty-state__text">Сканирования не найдены</p>
          <p class="empty-state__description">Запустите первое сканирование в разделе Мониторинг</p>
        </div>
      </div>

      <!-- Детальная статистика -->
      <div class="reports-section">
        <div class="section-header">
          <h2 class="section-title">Статистика безопасности</h2>
          <BaseSelect v-model="selectedPeriod" :options="periodOptions" size="sm" />
        </div>

        <div class="stats-charts">
          <div class="chart-container">
            <div class="chart-placeholder">
              <BarChartIcon class="chart-icon" />
              <p>График уязвимостей по типам</p>
            </div>
          </div>
          <div class="chart-container">
            <div class="chart-placeholder">
              <PieChartIcon class="chart-icon" />
              <p>Распределение по войсковым частям</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import BaseButton from '@/framework/ui/BaseButton.vue';
  import BaseSelect from '@/framework/ui/BaseSelect.vue';
  import {
    ScanIcon,
    ShieldIcon,
    AlertIcon,
    ServerIcon,
    ReportIcon,
    RefreshIcon,
    DownloadIcon,
    BarChartIcon,
    PieChartIcon
  } from '@/assets/icons';
  import { useAudit } from '@/modules/audit/composables/useAudit';

  const audit = useAudit();

  const totalScans = ref(24);
  const securedSystems = ref(18);
  const criticalIssues = ref(3);
  const selectedPeriod = ref('week');

  const recentScans = computed(() => audit.scanHistory.value.slice(0, 5));
  const totalDevices = computed(() => audit.totalDevices.value);

  const periodOptions = [
    { value: 'week', label: 'За неделю' },
    { value: 'month', label: 'За месяц' },
    { value: 'quarter', label: 'За квартал' }
  ];

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes} мин` : `${seconds} сек`;
  };

  const loadScanHistory = (): void => {
    audit.loadScanHistory(10);
  };

  const downloadReport = (scanId: string): void => {
    console.log('Download report for scan:', scanId);
    // Реализация скачивания отчета
  };

  onMounted(() => {
    audit.loadScanHistory(10);
  });
</script>

<style scoped>
  .reports-view {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .reports-view__header {
    text-align: center;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .reports-view__title {
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 0.75rem 0;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.025em;
  }

  .reports-view__subtitle {
    font-size: 1.25rem;
    color: var(--color-text-secondary);
    margin: 0;
    font-weight: 400;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
    padding: 1.75rem;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    }

  .stat-card__icon {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .stat-card__icon--primary {
    background: var(--gradient-primary);
  }

  .stat-card__icon--success {
    background: var(--gradient-success);
  }

  .stat-card__icon--warning {
    background: var(--gradient-warning);
  }

  .stat-card__icon--info {
    background: var(--gradient-info);
  }

  .stat-card__content {
    flex: 1;
  }

  .stat-card__value {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.375rem;
    color: var(--color-text-primary);
  }

  .stat-card__label {
    font-size: 0.95rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .reports-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
  }

    .reports-section:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.75rem;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
  }

  .refresh-btn {
    transition: all 0.3s ease;
  }

    .refresh-btn:hover {
      transform: translateY(-1px);
    }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: 0.5rem;
  }

  .scans-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .scan-item {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.5rem;
    background: var(--color-surface-hover);
    border-radius: 1rem;
    transition: all 0.3s ease;
    border: 1px solid transparent;
  }

    .scan-item:hover {
      background: var(--color-surface-active);
      border-color: var(--color-border);
      transform: translateX(4px);
    }

  .scan-item__status {
    width: 0.5rem;
    height: 3rem;
    border-radius: 0.5rem;
    flex-shrink: 0;
  }

  .status--completed {
    background: var(--color-success);
  }

  .status--in_progress {
    background: var(--color-warning);
  }

  .status--failed {
    background: var(--color-error);
  }

  .scan-item__content {
    flex: 1;
  }

  .scan-item__title {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--color-text-primary);
  }

  .scan-item__meta {
    display: flex;
    gap: 1.5rem;
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }

  .scan-item__duration {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    font-weight: 600;
    min-width: 80px;
    text-align: center;
  }

  .scan-item__actions {
    display: flex;
    gap: 0.5rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--color-text-secondary);
  }

  .empty-state__icon {
    width: 4rem;
    height: 4rem;
    margin-bottom: 1.5rem;
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  .empty-state__text {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: var(--color-text-primary);
  }

  .empty-state__description {
    margin: 0 0 1.5rem 0;
    font-size: 1rem;
  }

  /* Статистические графики */
  .stats-charts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  .chart-container {
    background: var(--color-surface-hover);
    border-radius: 1rem;
    padding: 2rem;
    border: 1px solid var(--color-border);
  }

  .chart-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--color-text-muted);
    text-align: center;
  }

  .chart-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .reports-view__title {
      font-size: 2rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .stats-charts {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 1024px) {
    .reports-view__title {
      font-size: 1.75rem;
    }

    .reports-view__subtitle {
      font-size: 1.125rem;
    }

    .reports-section {
      padding: 1.5rem;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .scan-item__meta {
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  @media (max-width: 900px) {
    .reports-view {
      gap: 1.5rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .stat-card {
      padding: 1.5rem;
    }
  }

  @media (max-width: 800px) {
    .reports-view__title {
      font-size: 1.5rem;
    }

    .reports-view__subtitle {
      font-size: 1rem;
    }

    .reports-section {
      padding: 1.25rem;
      border-radius: 1rem;
    }

    .section-title {
      font-size: 1.25rem;
    }

    .scan-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .scan-item__status {
      width: 100%;
      height: 0.375rem;
    }

    .scan-item__duration {
      align-self: flex-end;
    }
  }
</style>
