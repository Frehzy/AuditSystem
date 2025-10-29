<template>
  <div class="reports-view">
    <div class="reports-view__header">
      <h1 class="reports-view__title">Отчеты безопасности</h1>
      <p class="reports-view__subtitle">История сканирований и обнаруженных уязвимостей</p>
    </div>

    <div class="reports-view__content">
      <!-- Статистика -->
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

      <!-- Действия с отчетами -->
      <div class="reports-actions">
        <div class="actions-header">
          <h2 class="section-title">Управление отчетами</h2>
          <BaseButton @click="showExportDialog = true"
                      variant="primary">
            <DownloadIcon class="button-icon" />
            Экспорт отчетов
          </BaseButton>
        </div>

        <div class="export-options">
          <div class="export-option">
            <BaseSelect v-model="selectedTask"
                        :options="taskOptions"
                        placeholder="Выберите задачу"
                        class="task-select" />
          </div>
          <div class="export-option">
            <BaseSelect v-model="selectedFormat"
                        :options="formatOptions"
                        placeholder="Формат отчета"
                        class="format-select" />
          </div>
          <div class="export-option">
            <BaseButton @click="generateReport"
                        variant="secondary"
                        :loading="isGeneratingReport"
                        :disabled="!selectedTask || !selectedFormat">
              Сгенерировать отчет
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Список отчетов -->
      <div class="reports-section">
        <div class="section-header">
          <h2 class="section-title">Доступные отчеты</h2>
          <BaseButton @click="refreshReports"
                      variant="secondary"
                      size="sm"
                      class="refresh-btn"
                      :loading="isLoading">
            <RefreshIcon class="button-icon" />
            Обновить
          </BaseButton>
        </div>

        <div class="reports-list">
          <div v-for="report in reports"
               :key="report.id"
               class="report-item">
            <div class="report-item__icon">
              <DocumentIcon />
            </div>

            <div class="report-item__content">
              <div class="report-item__header">
                <h3 class="report-item__title">{{ report.name }}</h3>
                <span class="report-item__format">{{ getFormatText(report.format) }}</span>
              </div>

              <div class="report-item__meta">
                <span class="report-item__date">
                  {{ formatReportDate(report.generatedAt) }}
                </span>
                <span class="report-item__size">
                  {{ formatFileSize(report.fileSize) }}
                </span>
                <span class="report-item__task">
                  Задача: {{ getTaskName(report.taskId) }}
                </span>
              </div>

              <div v-if="report.description" class="report-item__description">
                {{ report.description }}
              </div>
            </div>

            <div class="report-item__actions">
              <BaseButton @click="downloadReport(report)"
                          variant="primary"
                          size="sm">
                <DownloadIcon class="button-icon" />
                Скачать
              </BaseButton>
              <BaseButton @click="deleteReport(report)"
                          variant="text"
                          size="sm"
                          color="error">
                <DeleteIcon class="button-icon" />
                Удалить
              </BaseButton>
            </div>
          </div>
        </div>

        <div v-if="reports.length === 0" class="empty-state">
          <ReportIcon class="empty-state__icon" />
          <p class="empty-state__text">Отчеты не найдены</p>
          <p class="empty-state__description">Сгенерируйте первый отчет из результатов сканирования</p>
        </div>
      </div>

      <!-- Детальная статистика -->
      <div class="stats-section">
        <div class="section-header">
          <h2 class="section-title">Статистика безопасности</h2>
          <BaseSelect v-model="selectedPeriod"
                      :options="periodOptions"
                      size="sm" />
        </div>

        <div class="stats-charts">
          <div class="chart-container">
            <h3 class="chart-title">Уязвимости по типам</h3>
            <div class="chart-placeholder">
              <BarChartIcon class="chart-icon" />
              <p>График уязвимостей по типам</p>
            </div>
          </div>

          <div class="chart-container">
            <h3 class="chart-title">Распределение по войсковым частям</h3>
            <div class="chart-placeholder">
              <PieChartIcon class="chart-icon" />
              <p>Распределение проблем по частям</p>
            </div>
          </div>

          <div class="chart-container">
            <h3 class="chart-title">Тренды безопасности</h3>
            <div class="chart-placeholder">
              <LineChartIcon class="chart-icon" />
              <p>Динамика изменений безопасности</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог экспорта -->
    <ReportExportDialog v-if="showExportDialog"
                        :modelValue="showExportDialog"
                        :tasks="tasks"
                        @update:modelValue="showExportDialog = $event"
                        @generate="handleGenerateReport"
                        @close="showExportDialog = false" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import ReportExportDialog from '../common/ReportExportDialog.vue';
  import {
    ScanIcon,
    ShieldIcon,
    AlertIcon,
    ServerIcon,
    ReportIcon,
    DocumentIcon,
    RefreshIcon,
    DownloadIcon,
    DeleteIcon,
    BarChartIcon,
    PieChartIcon,
    LineChartIcon
  } from '@/assets/icons';
  import { useReports } from '../../composables/useReports';
  import { useMonitoring } from '../../composables/useMonitoring';
  import type { Report } from '../../api/audit.types';

  interface Props {
    reports?: Report[];
    tasks?: any[];
    isLoading?: boolean; // Добавляем isLoading в props
  }

  interface Emits {
    (e: 'generate-report', taskId: string, format: string): void;
    (e: 'download-report', reportId: string): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { showToast } = useToast();
  const reportsManager = useReports();
  const monitoring = useMonitoring();

  const showExportDialog = ref(false);
  const isGeneratingReport = ref(false);
  const selectedTask = ref('');
  const selectedFormat = ref('');
  const selectedPeriod = ref('week');

  // Добавляем локальное состояние для загрузки, если не передано через props
  const isLoadingLocal = ref(false);

  // Используем переданное isLoading или локальное
  const isLoading = computed(() => props.isLoading ?? isLoadingLocal.value);

  const totalScans = computed(() => props.tasks?.length || 0);
  const securedSystems = computed(() => Math.floor((props.tasks?.length || 0) * 0.75));
  const criticalIssues = computed(() => Math.floor((props.tasks?.length || 0) * 0.15));
  const totalDevices = computed(() => {
    return 42;
  });

  const taskOptions = computed(() => {
    return (props.tasks || []).map(task => ({
      value: task.id,
      label: task.name
    }));
  });

  const formatOptions = [
    { value: 'pdf', label: 'PDF документ' },
    { value: 'html', label: 'HTML страница' },
    { value: 'json', label: 'JSON данные' },
    { value: 'csv', label: 'CSV таблица' },
    { value: 'txt', label: 'Текстовый файл' }
  ];

  const periodOptions = [
    { value: 'week', label: 'За неделю' },
    { value: 'month', label: 'За месяц' },
    { value: 'quarter', label: 'За квартал' },
    { value: 'year', label: 'За год' }
  ];

  const generateReport = async (): Promise<void> => {
    if (!selectedTask.value || !selectedFormat.value) {
      showToast({
        type: 'warning',
        title: 'Выберите задачу и формат',
        message: 'Для генерации отчета необходимо выбрать задачу и формат'
      });
      return;
    }

    isGeneratingReport.value = true;
    try {
      emit('generate-report', selectedTask.value, selectedFormat.value);
      selectedTask.value = '';
      selectedFormat.value = '';
      showExportDialog.value = false;
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      isGeneratingReport.value = false;
    }
  };

  const handleGenerateReport = (command: { taskId: string; format: string }): void => {
    emit('generate-report', command.taskId, command.format);
    showExportDialog.value = false;
  };

  const downloadReport = (report: Report): void => {
    emit('download-report', report.id);
  };

  const deleteReport = async (report: Report): Promise<void> => {
    if (confirm(`Удалить отчет "${report.name}"?`)) {
      try {
        await reportsManager.deleteReport(report.id);
        showToast({
          type: 'success',
          title: 'Отчет удален',
          message: 'Отчет успешно удален из системы'
        });
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Ошибка',
          message: 'Не удалось удалить отчет'
        });
      }
    }
  };

  const refreshReports = (): void => {
    isLoadingLocal.value = true;
    Promise.all([
      reportsManager.loadReports(),
      monitoring.loadScanHistory()
    ]).finally(() => {
      isLoadingLocal.value = false;
    });
  };

  const getFormatText = (format: string): string => {
    const formatMap: Record<string, string> = {
      pdf: 'PDF',
      html: 'HTML',
      json: 'JSON',
      csv: 'CSV',
      txt: 'TXT'
    };
    return formatMap[format] || format.toUpperCase();
  };

  const formatReportDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTaskName = (taskId: string): string => {
    const task = props.tasks?.find(t => t.id === taskId);
    return task?.name || 'Неизвестная задача';
  };

  onMounted(() => {
    reportsManager.loadReports();
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

  /* Stats Grid */
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

  /* Reports Actions */
  .reports-actions {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .actions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
  }

  .export-options {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 1rem;
    align-items: end;
  }

  .export-option {
    display: flex;
    flex-direction: column;
  }

  /* Reports List */
  .reports-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.75rem;
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

  .reports-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .report-item {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.5rem;
    background: var(--color-surface-hover);
    border-radius: 1rem;
    transition: all 0.3s ease;
    border: 1px solid transparent;
  }

    .report-item:hover {
      background: var(--color-surface-active);
      border-color: var(--color-border);
      transform: translateX(4px);
    }

  .report-item__icon {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    background: var(--color-primary-light);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    flex-shrink: 0;
  }

  .report-item__content {
    flex: 1;
  }

  .report-item__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .report-item__title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
    flex: 1;
  }

  .report-item__format {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 2rem;
    color: var(--color-text-secondary);
  }

  .report-item__meta {
    display: flex;
    gap: 1.5rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: 0.5rem;
  }

  .report-item__description {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  .report-item__actions {
    display: flex;
    gap: 0.5rem;
  }

  /* Stats Section */
  .stats-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
    padding: 2rem;
  }

  .stats-charts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .chart-container {
    background: var(--color-surface-hover);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
  }

  .chart-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
    text-align: center;
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

  /* Empty State */
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

    .reports-actions,
    .reports-section,
    .stats-section {
      padding: 1.5rem;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .export-options {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .report-item__meta {
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

    .report-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .report-item__actions {
      align-self: flex-end;
    }
  }

  @media (max-width: 800px) {
    .reports-view__title {
      font-size: 1.5rem;
    }

    .reports-view__subtitle {
      font-size: 1rem;
    }

    .reports-actions,
    .reports-section,
    .stats-section {
      padding: 1.25rem;
      border-radius: 1rem;
    }

    .section-title {
      font-size: 1.25rem;
    }

    .stat-card {
      padding: 1.5rem;
    }

    .stat-card__value {
      font-size: 2rem;
    }
  }
</style>
