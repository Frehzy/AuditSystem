<template>
  <div class="reports-view">
    <!-- Header Section -->
    <div class="reports-header">
      <div class="header-content">
        <div class="header-icon">
          <ReportIcon />
        </div>
        <div class="header-text">
          <h1 class="reports-title">Отчеты безопасности</h1>
          <p class="reports-subtitle">История сканирований и обнаруженных уязвимостей</p>
        </div>
      </div>
    </div>

    <div class="reports-content">
      <!-- Statistics Cards -->
      <div class="stats-section">
        <div class="section-header">
          <h2 class="section-title">Общая статистика</h2>
          <div class="section-actions">
            <BaseButton @click="refreshReports"
                        variant="secondary"
                        size="sm"
                        :loading="isLoading"
                        class="refresh-btn">
              <RefreshIcon class="button-icon" />
              Обновить
            </BaseButton>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--primary">
              <ScanIcon />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">{{ totalScans }}</div>
              <div class="stat-card__label">Всего сканирований</div>
              <div class="stat-card__trend trend--positive">
                <TrendUpIcon class="trend-icon" />
                <span>+12% за месяц</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--success">
              <ShieldIcon />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">{{ securedSystems }}</div>
              <div class="stat-card__label">Защищенных систем</div>
              <div class="stat-card__trend trend--positive">
                <TrendUpIcon class="trend-icon" />
                <span>+8% за месяц</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--warning">
              <AlertIcon />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">{{ criticalIssues }}</div>
              <div class="stat-card__label">Критических проблем</div>
              <div class="stat-card__trend trend--negative">
                <TrendDownIcon class="trend-icon" />
                <span>-5% за месяц</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--info">
              <ServerIcon />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">{{ totalDevices }}</div>
              <div class="stat-card__label">Всего устройств</div>
              <div class="stat-card__trend trend--neutral">
                <MinusIcon class="trend-icon" />
                <span>Без изменений</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="actions-section">
        <div class="section-header">
          <h2 class="section-title">Быстрые действия</h2>
        </div>

        <div class="actions-grid">
          <div class="action-card" @click="showExportDialog = true">
            <div class="action-icon action-icon--primary">
              <DownloadIcon />
            </div>
            <div class="action-content">
              <h3 class="action-title">Экспорт отчетов</h3>
              <p class="action-description">Сгенерируйте и экспортируйте отчеты в различных форматах</p>
            </div>
            <div class="action-arrow">
              <ArrowRightIcon />
            </div>
          </div>

          <div class="action-card" @click="generateQuickReport">
            <div class="action-icon action-icon--success">
              <FileTextIcon />
            </div>
            <div class="action-content">
              <h3 class="action-title">Быстрый отчет</h3>
              <p class="action-description">Создайте сводный отчет по последним сканированиям</p>
            </div>
            <div class="action-arrow">
              <ArrowRightIcon />
            </div>
          </div>

          <div class="action-card" @click="showStatistics = true">
            <div class="action-icon action-icon--info">
              <BarChartIcon />
            </div>
            <div class="action-content">
              <h3 class="action-title">Детальная статистика</h3>
              <p class="action-description">Анализ тенденций и распределения уязвимостей</p>
            </div>
            <div class="action-arrow">
              <ArrowRightIcon />
            </div>
          </div>
        </div>
      </div>

      <!-- Reports Management -->
      <div class="reports-section">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">Управление отчетами</h2>
            <span class="section-badge">{{ reports.length }} отчетов</span>
          </div>
          <div class="section-controls">
            <BaseSelect v-model="reportFilter"
                        :options="reportFilterOptions"
                        placeholder="Все отчеты"
                        size="sm" />
            <BaseSelect v-model="sortBy"
                        :options="sortOptions"
                        placeholder="Сортировка"
                        size="sm" />
          </div>
        </div>

        <!-- Reports List -->
        <div class="reports-list">
          <div v-for="report in filteredReports"
               :key="report.id"
               class="report-item"
               :class="`report-item--${report.format}`">
            <div class="report-item__icon">
              <DocumentIcon />
              <div class="format-badge">{{ getFormatText(report.format) }}</div>
            </div>

            <div class="report-item__content">
              <div class="report-item__header">
                <h3 class="report-item__title">{{ report.name }}</h3>
                <div class="report-item__status" :class="`status--${report.status || 'completed'}`">
                  {{ getStatusText(report.status) }}
                </div>
              </div>

              <div class="report-item__meta">
                <div class="meta-item">
                  <CalendarIcon class="meta-icon" />
                  <span>{{ formatReportDate(report.generatedAt) }}</span>
                </div>
                <div class="meta-item">
                  <FileIcon class="meta-icon" />
                  <span>{{ formatFileSize(report.fileSize) }}</span>
                </div>
                <div class="meta-item">
                  <ServerIcon class="meta-icon" />
                  <span>Задача: {{ getTaskName(report.taskId) }}</span>
                </div>
              </div>

              <div v-if="report.description" class="report-item__description">
                {{ report.description }}
              </div>

              <div class="report-item__tags">
                <BaseChip v-if="report.isCritical" color="error" size="xs">
                  Критический
                </BaseChip>
                <BaseChip v-if="report.hasFix" color="success" size="xs">
                  Исправления доступны
                </BaseChip>
                <BaseChip :color="getFormatColor(report.format)" size="xs">
                  {{ getFormatText(report.format) }}
                </BaseChip>
              </div>
            </div>

            <div class="report-item__actions">
              <BaseButton @click="downloadReport(report)"
                          variant="primary"
                          size="sm"
                          class="action-btn">
                <DownloadIcon class="button-icon" />
                Скачать
              </BaseButton>
              <BaseButton @click="previewReport(report)"
                          variant="secondary"
                          size="sm"
                          class="action-btn">
                <EyeIcon class="button-icon" />
                Просмотр
              </BaseButton>
              <BaseButton @click="deleteReport(report)"
                          variant="text"
                          size="sm"
                          color="error"
                          class="action-btn">
                <DeleteIcon class="button-icon" />
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="reports.length === 0" class="empty-state">
          <div class="empty-icon">
            <ReportIcon />
          </div>
          <div class="empty-content">
            <h3 class="empty-title">Отчеты не найдены</h3>
            <p class="empty-description">Сгенерируйте первый отчет из результатов сканирования</p>
            <BaseButton @click="showExportDialog = true"
                        variant="primary"
                        class="empty-action">
              <FileTextIcon class="button-icon" />
              Создать отчет
            </BaseButton>
          </div>
        </div>

        <!-- Load More -->
        <div v-if="hasMoreReports" class="load-more">
          <BaseButton @click="loadMoreReports"
                      variant="secondary"
                      :loading="isLoadingMore"
                      class="load-more-btn">
            <PlusIcon class="button-icon" />
            Загрузить еще
          </BaseButton>
        </div>
      </div>

      <!-- Statistics Charts -->
      <div class="charts-section">
        <div class="section-header">
          <h2 class="section-title">Статистика безопасности</h2>
          <div class="section-controls">
            <BaseSelect v-model="selectedPeriod"
                        :options="periodOptions"
                        size="sm" />
          </div>
        </div>

        <div class="charts-grid">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Уязвимости по типам</h3>
              <BaseButton variant="text" size="sm">
                <InfoIcon class="button-icon" />
              </BaseButton>
            </div>
            <div class="chart-container">
              <div class="chart-placeholder">
                <BarChartIcon class="chart-icon" />
                <p>График уязвимостей по типам</p>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Распределение по войсковым частям</h3>
              <BaseButton variant="text" size="sm">
                <InfoIcon class="button-icon" />
              </BaseButton>
            </div>
            <div class="chart-container">
              <div class="chart-placeholder">
                <PieChartIcon class="chart-icon" />
                <p>Распределение проблем по частям</p>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Тренды безопасности</h3>
              <BaseButton variant="text" size="sm">
                <InfoIcon class="button-icon" />
              </BaseButton>
            </div>
            <div class="chart-container">
              <div class="chart-placeholder">
                <LineChartIcon class="chart-icon" />
                <p>Динамика изменений безопасности</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Dialog -->
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
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
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
    LineChartIcon,
    ArrowRightIcon,
    FileTextIcon,
    EyeIcon,
    CalendarIcon,
    FileIcon,
    InfoIcon,
    TrendUpIcon,
    TrendDownIcon,
    MinusIcon,
    PlusIcon
  } from '@/assets/icons';
  import { useReports } from '../../composables/useReports';
  import { useMonitoring } from '../../composables/useMonitoring';
  import type { Report } from '../../api/audit.types';

  interface Props {
    reports?: Report[];
    tasks?: any[];
    isLoading?: boolean;
  }

  interface Emits {
    (e: 'generate-report', taskId: string, format: string): void;
    (e: 'download-report', reportId: string): void;
    (e: 'preview-report', reportId: string): void;
    (e: 'load-more'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { showToast } = useToast();
  const reportsManager = useReports();
  const monitoring = useMonitoring();

  // State
  const showExportDialog = ref(false);
  const showStatistics = ref(false);
  const isLoadingLocal = ref(false);
  const isLoadingMore = ref(false);
  const reportFilter = ref('all');
  const sortBy = ref('newest');
  const selectedPeriod = ref('week');
  const hasMoreReports = ref(true);

  // Computed
  const isLoading = computed(() => props.isLoading ?? isLoadingLocal.value);

  const totalScans = computed(() => props.tasks?.length || 0);
  const securedSystems = computed(() => Math.floor((props.tasks?.length || 0) * 0.75));
  const criticalIssues = computed(() => Math.floor((props.tasks?.length || 0) * 0.15));
  const totalDevices = computed(() => 42);

  const filteredReports = computed(() => {
    let reports = props.reports || [];

    // Apply filters
    if (reportFilter.value !== 'all') {
      reports = reports.filter(report => report.format === reportFilter.value);
    }

    // Apply sorting
    if (sortBy.value === 'newest') {
      reports = [...reports].sort((a, b) =>
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      );
    } else if (sortBy.value === 'oldest') {
      reports = [...reports].sort((a, b) =>
        new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime()
      );
    } else if (sortBy.value === 'size') {
      reports = [...reports].sort((a, b) => b.fileSize - a.fileSize);
    }

    return reports;
  });

  // Options
  const reportFilterOptions = [
    { value: 'all', label: 'Все отчеты' },
    { value: 'pdf', label: 'PDF документы' },
    { value: 'html', label: 'HTML страницы' },
    { value: 'json', label: 'JSON данные' },
    { value: 'csv', label: 'CSV таблицы' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Сначала новые' },
    { value: 'oldest', label: 'Сначала старые' },
    { value: 'size', label: 'По размеру' }
  ];

  const periodOptions = [
    { value: 'week', label: 'За неделю' },
    { value: 'month', label: 'За месяц' },
    { value: 'quarter', label: 'За квартал' },
    { value: 'year', label: 'За год' }
  ];

  // Methods
  const generateReport = async (): Promise<void> => {
    showExportDialog.value = true;
  };

  const generateQuickReport = (): void => {
    emit('generate-report', 'quick', 'pdf');
    showToast({
      type: 'success',
      title: 'Быстрый отчет',
      message: 'Сводный отчет будет сгенерирован в течение нескольких минут'
    });
  };

  const handleGenerateReport = (command: { taskId: string; format: string }): void => {
    emit('generate-report', command.taskId, command.format);
    showExportDialog.value = false;
  };

  const downloadReport = (report: Report): void => {
    emit('download-report', report.id);
  };

  const previewReport = (report: Report): void => {
    emit('preview-report', report.id);
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

  const loadMoreReports = (): void => {
    isLoadingMore.value = true;
    emit('load-more');
    // Simulate loading
    setTimeout(() => {
      isLoadingMore.value = false;
      hasMoreReports.value = false; // In real app, this would be based on API response
    }, 1000);
  };

  // Helper methods
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

  const getFormatColor = (format: string): string => {
    const colorMap: Record<string, string> = {
      pdf: 'error',
      html: 'primary',
      json: 'warning',
      csv: 'success',
      txt: 'info'
    };
    return colorMap[format] || 'default';
  };

  const getStatusText = (status?: string): string => {
    const statusMap: Record<string, string> = {
      completed: 'Завершен',
      generating: 'Генерация',
      failed: 'Ошибка',
      queued: 'В очереди'
    };
    return statusMap[status || 'completed'] || status || 'Завершен';
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
    gap: var(--spacing-2xl, 2rem);
    min-height: 100vh;
  }

  /* Header Section */
  .reports-header {
    background: var(--color-surface, #fff);
    border-bottom: 1px solid var(--color-border, #e2e8f0);
    padding: var(--spacing-2xl, 2rem) 0;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg, 1.5rem);
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-xl, 1.5rem);
  }

  .header-icon {
    width: 4rem;
    height: 4rem;
    border-radius: var(--radius-xl, 0.75rem);
    background: var(--gradient-primary, linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .header-text {
    flex: 1;
  }

  .reports-title {
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 var(--spacing-sm, 0.5rem) 0;
    background: var(--gradient-primary, linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.025em;
  }

  .reports-subtitle {
    font-size: 1.25rem;
    color: var(--color-text-secondary, #475569);
    margin: 0;
    font-weight: 400;
  }

  /* Content Layout */
  .reports-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl, 2rem);
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-xl, 1.5rem);
    width: 100%;
  }

  /* Common Section Styles */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xl, 1.5rem);
  }

  .section-title-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-md, 1rem);
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary, #1e293b);
  }

  .section-badge {
    background: var(--color-primary-light, #dbeafe);
    color: var(--color-primary, #3b82f6);
    padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
    border-radius: var(--radius-full, 9999px);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .section-controls {
    display: flex;
    gap: var(--spacing-md, 1rem);
    align-items: center;
  }

  .section-actions {
    display: flex;
    gap: var(--spacing-md, 1rem);
    align-items: center;
  }

  /* Stats Section */
  .stats-section {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-xl, 1rem);
    padding: var(--spacing-2xl, 2rem);
    border: 1px solid var(--color-border, #e2e8f0);
    box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-lg, 1.5rem);
  }

  .stat-card {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--spacing-xl, 1.5rem);
    display: flex;
    align-items: center;
    gap: var(--spacing-lg, 1.5rem);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
      border-color: var(--color-primary, #3b82f6);
    }

  .stat-card__icon {
    width: 4rem;
    height: 4rem;
    border-radius: var(--radius-lg, 0.75rem);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  }

  .stat-card__icon--primary {
    background: var(--gradient-primary, linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%));
  }

  .stat-card__icon--success {
    background: var(--gradient-success, linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%));
  }

  .stat-card__icon--warning {
    background: var(--gradient-warning, linear-gradient(135deg, var(--color-warning) 0%, var(--color-warning-dark) 100%));
  }

  .stat-card__icon--info {
    background: var(--gradient-info, linear-gradient(135deg, var(--color-info) 0%, var(--color-info-dark) 100%));
  }

  .stat-card__content {
    flex: 1;
  }

  .stat-card__value {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: var(--spacing-xs, 0.25rem);
    color: var(--color-text-primary, #1e293b);
  }

  .stat-card__label {
    font-size: 0.95rem;
    color: var(--color-text-secondary, #475569);
    font-weight: 500;
    margin-bottom: var(--spacing-sm, 0.5rem);
  }

  .stat-card__trend {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 0.25rem);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .trend--positive {
    color: var(--color-success, #10b981);
  }

  .trend--negative {
    color: var(--color-error, #ef4444);
  }

  .trend--neutral {
    color: var(--color-text-muted, #64748b);
  }

  .trend-icon {
    width: 1rem;
    height: 1rem;
  }

  /* Actions Section */
  .actions-section {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-xl, 1rem);
    padding: var(--spacing-2xl, 2rem);
    border: 1px solid var(--color-border, #e2e8f0);
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg, 1.5rem);
  }

  .action-card {
    background: var(--color-surface, #fff);
    border: 2px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--spacing-xl, 1.5rem);
    display: flex;
    align-items: center;
    gap: var(--spacing-lg, 1.5rem);
    cursor: pointer;
    transition: all 0.3s ease;
  }

    .action-card:hover {
      border-color: var(--color-primary, #3b82f6);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
    }

  .action-icon {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-md, 0.5rem);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .action-icon--primary {
    background: var(--gradient-primary, linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%));
  }

  .action-icon--success {
    background: var(--gradient-success, linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%));
  }

  .action-icon--info {
    background: var(--gradient-info, linear-gradient(135deg, var(--color-info) 0%, var(--color-info-dark) 100%));
  }

  .action-content {
    flex: 1;
  }

  .action-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 var(--spacing-xs, 0.25rem) 0;
    color: var(--color-text-primary, #1e293b);
  }

  .action-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #475569);
    margin: 0;
    line-height: 1.4;
  }

  .action-arrow {
    color: var(--color-text-muted, #64748b);
    transition: transform 0.3s ease;
  }

  .action-card:hover .action-arrow {
    transform: translateX(4px);
    color: var(--color-primary, #3b82f6);
  }

  /* Reports Section */
  .reports-section {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-xl, 1rem);
    padding: var(--spacing-2xl, 2rem);
    border: 1px solid var(--color-border, #e2e8f0);
  }

  .reports-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md, 1rem);
  }

  .report-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg, 1.5rem);
    padding: var(--spacing-xl, 1.5rem);
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-lg, 0.75rem);
    transition: all 0.3s ease;
  }

    .report-item:hover {
      background: var(--color-surface-hover, #f8fafc);
      border-color: var(--color-primary, #3b82f6);
      transform: translateX(4px);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    }

  .report-item__icon {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-md, 0.5rem);
    background: var(--color-primary-light, #dbeafe);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary, #3b82f6);
    flex-shrink: 0;
    position: relative;
  }

  .format-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-full, 9999px);
    padding: 2px 6px;
    font-size: 0.625rem;
    font-weight: 600;
    color: var(--color-text-muted, #64748b);
  }

  .report-item__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 0.5rem);
  }

  .report-item__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-md, 1rem);
  }

  .report-item__title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary, #1e293b);
    flex: 1;
  }

  .report-item__status {
    padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
    border-radius: var(--radius-full, 9999px);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .status--completed {
    background: var(--color-success-light, #d1fae5);
    color: var(--color-success, #10b981);
  }

  .status--generating {
    background: var(--color-warning-light, #fef3c7);
    color: var(--color-warning, #f59e0b);
  }

  .status--failed {
    background: var(--color-error-light, #fee2e2);
    color: var(--color-error, #ef4444);
  }

  .status--queued {
    background: var(--color-info-light, #dbeafe);
    color: var(--color-info, #3b82f6);
  }

  .report-item__meta {
    display: flex;
    gap: var(--spacing-lg, 1.5rem);
    font-size: 0.875rem;
    color: var(--color-text-muted, #64748b);
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 0.25rem);
  }

  .meta-icon {
    width: 1rem;
    height: 1rem;
  }

  .report-item__description {
    font-size: 0.9rem;
    color: var(--color-text-secondary, #475569);
    line-height: 1.5;
    margin: 0;
  }

  .report-item__tags {
    display: flex;
    gap: var(--spacing-sm, 0.5rem);
    flex-wrap: wrap;
  }

  .report-item__actions {
    display: flex;
    gap: var(--spacing-sm, 0.5rem);
    align-items: center;
  }

  .action-btn {
    white-space: nowrap;
  }

  /* Charts Section */
  .charts-section {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-xl, 1rem);
    padding: var(--spacing-2xl, 2rem);
    border: 1px solid var(--color-border, #e2e8f0);
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--spacing-xl, 1.5rem);
  }

  .chart-card {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--spacing-xl, 1.5rem);
    transition: all 0.3s ease;
  }

    .chart-card:hover {
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
      border-color: var(--color-primary, #3b82f6);
    }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg, 1.5rem);
  }

  .chart-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary, #1e293b);
  }

  .chart-container {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-secondary, #f8fafc);
    border-radius: var(--radius-md, 0.5rem);
    border: 1px dashed var(--color-border, #e2e8f0);
  }

  .chart-placeholder {
    text-align: center;
    color: var(--color-text-muted, #64748b);
  }

  .chart-icon {
    width: 3rem;
    height: 3rem;
    margin: 0 auto var(--spacing-sm, 0.5rem);
    color: var(--color-text-muted, #64748b);
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-3xl, 3rem);
    text-align: center;
    background: var(--color-surface-secondary, #f8fafc);
    border-radius: var(--radius-lg, 0.75rem);
    border: 2px dashed var(--color-border, #e2e8f0);
  }

  .empty-icon {
    width: 6rem;
    height: 6rem;
    margin-bottom: var(--spacing-xl, 1.5rem);
    color: var(--color-text-muted, #64748b);
    opacity: 0.5;
  }

  .empty-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 var(--spacing-sm, 0.5rem) 0;
    color: var(--color-text-primary, #1e293b);
  }

  .empty-description {
    font-size: 1rem;
    color: var(--color-text-secondary, #475569);
    margin: 0 0 var(--spacing-xl, 1.5rem) 0;
    max-width: 400px;
  }

  .empty-action {
    margin-top: var(--spacing-md, 1rem);
  }

  /* Load More */
  .load-more {
    display: flex;
    justify-content: center;
    margin-top: var(--spacing-xl, 1.5rem);
  }

  .load-more-btn {
    min-width: 200px;
  }

  /* Button Icons */
  .button-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-md, 1rem);
    }

    .section-header {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-md, 1rem);
    }

    .section-controls {
      justify-content: flex-start;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .actions-grid {
      grid-template-columns: 1fr;
    }

    .charts-grid {
      grid-template-columns: 1fr;
    }

    .report-item {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }

    .report-item__header {
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm, 0.5rem);
    }

    .report-item__meta {
      justify-content: center;
      flex-wrap: wrap;
    }

    .report-item__actions {
      justify-content: center;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .reports-view {
      background: var(--color-background, #0f172a);
    }

    .reports-header {
      background: var(--color-surface, #1e293b);
      border-bottom-color: var(--color-border, #334155);
    }

    .reports-subtitle {
      color: var(--color-text-secondary, #94a3b8);
    }

    .section-title {
      color: var(--color-text-primary, #f1f5f9);
    }

    .stat-card,
    .action-card,
    .report-item,
    .chart-card {
      background: var(--color-surface, #1e293b);
      border-color: var(--color-border, #334155);
    }

    .stat-card__value {
      color: var(--color-text-primary, #f1f5f9);
    }

    .stat-card__label {
      color: var(--color-text-secondary, #94a3b8);
    }

    .action-title {
      color: var(--color-text-primary, #f1f5f9);
    }

    .action-description {
      color: var(--color-text-secondary, #94a3b8);
    }

    .report-item__title {
      color: var(--color-text-primary, #f1f5f9);
    }

    .report-item__description {
      color: var(--color-text-secondary, #94a3b8);
    }

    .chart-container {
      background: var(--color-surface-secondary, #1e293b);
      border-color: var(--color-border, #334155);
    }

    .empty-state {
      background: var(--color-surface-secondary, #1e293b);
      border-color: var(--color-border, #334155);
    }

    .empty-title {
      color: var(--color-text-primary, #f1f5f9);
    }

    .empty-description {
      color: var(--color-text-secondary, #94a3b8);
    }
  }
</style>
