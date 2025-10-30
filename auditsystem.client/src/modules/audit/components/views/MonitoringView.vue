<template>
  <div class="monitoring-view">
    <div class="monitoring-view__header">
      <h1 class="monitoring-view__title">Мониторинг безопасности</h1>
      <p class="monitoring-view__subtitle">Управление сканированием и отслеживание состояния систем</p>
    </div>

    <div class="monitoring-view__content">
      <!-- Быстрый запуск сканирования -->
      <div class="quick-scan-section">
        <div class="section-header">
          <h2 class="section-title">Быстрый запуск</h2>
          <BaseButton @click="showQuickScanConfig = true"
                      variant="primary"
                      size="md"
                      class="configure-scan-btn">
            <SettingsIcon class="button-icon" />
            Настроить сканирование
          </BaseButton>
        </div>

        <div class="quick-scan-actions">
          <BaseButton @click="startQuickScan"
                      variant="primary"
                      :loading="isStartingScan"
                      :disabled="!canStartScan"
                      size="lg"
                      class="quick-scan-btn">
            <ScanIcon class="button-icon" />
            Быстрое сканирование
          </BaseButton>

          <BaseButton @click="startComprehensiveScan"
                      variant="secondary"
                      :loading="isStartingScan"
                      :disabled="!canStartScan"
                      size="lg"
                      class="comprehensive-scan-btn">
            <ShieldIcon class="button-icon" />
            Полное сканирование
          </BaseButton>
        </div>

        <div v-if="!canStartScan" class="scan-requirements">
          <BaseAlert type="warning" class="requirements-alert">
            <template #title>
              Недостаточно данных
            </template>
            Для запуска сканирования необходимо добавить войсковые части и настроить скрипты проверки
          </BaseAlert>
        </div>
      </div>

      <!-- Активные задачи -->
      <div class="active-tasks-section">
        <div class="section-header">
          <h2 class="section-title">Активные задачи</h2>
          <div class="section-actions">
            <BaseButton @click="refreshTasks"
                        variant="text"
                        size="sm"
                        :loading="isLoadingTasks"
                        class="refresh-btn">
              <RefreshIcon class="button-icon" />
              Обновить
            </BaseButton>
          </div>
        </div>

        <div class="tasks-container">
          <div v-if="activeTasks.length > 0" class="tasks-grid">
            <div v-for="task in activeTasks"
                 :key="task.id"
                 class="task-card"
                 :class="`task-card--${task.status}`">
              <div class="task-card__header">
                <div class="task-info">
                  <h3 class="task-card__title">{{ task.name }}</h3>
                  <span class="task-card__status" :class="`status--${task.status}`">
                    {{ getStatusText(task.status) }}
                  </span>
                </div>
                <div class="task-actions">
                  <BaseButton @click="viewTaskDetails(task)"
                              variant="text"
                              size="sm"
                              class="action-btn">
                    <InfoIcon class="button-icon" />
                    Детали
                  </BaseButton>
                  <BaseButton v-if="task.status === 'running'"
                              @click="cancelTask(task)"
                              variant="text"
                              size="sm"
                              color="error"
                              class="action-btn">
                    <StopIcon class="button-icon" />
                    Отменить
                  </BaseButton>
                </div>
              </div>

              <div class="task-card__progress">
                <div class="progress-info">
                  <span class="progress-label">Прогресс выполнения</span>
                  <span class="progress-value">{{ task.progress }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar__fill"
                       :style="{ width: `${task.progress}%` }"
                       :class="`progress--${task.status}`"></div>
                </div>
              </div>

              <div class="task-card__details">
                <div class="detail-grid">
                  <div class="task-detail">
                    <ServerIcon class="detail-icon" />
                    <div class="detail-content">
                      <span class="detail-value">{{ getUnitsCount(task.unitIds) }}</span>
                      <span class="detail-label">частей</span>
                    </div>
                  </div>
                  <div class="task-detail">
                    <ScriptIcon class="detail-icon" />
                    <div class="detail-content">
                      <span class="detail-value">{{ getScriptsCount(task.scriptIds) }}</span>
                      <span class="detail-label">скриптов</span>
                    </div>
                  </div>
                  <div class="task-detail">
                    <ClockIcon class="detail-icon" />
                    <div class="detail-content">
                      <span class="detail-value">{{ formatDuration(task.createdAt) }}</span>
                      <span class="detail-label">назад</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-state__content">
              <ScanIcon class="empty-state__icon" />
              <div class="empty-state__text">
                <h3 class="empty-state__title">Нет активных задач</h3>
                <p class="empty-state__description">Запустите сканирование для начала мониторинга</p>
              </div>
              <BaseButton @click="showQuickScanConfig = true"
                          variant="primary"
                          size="md"
                          class="empty-state__action">
                Начать сканирование
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- История сканирований -->
      <div class="scan-history-section">
        <div class="section-header">
          <h2 class="section-title">История сканирований</h2>
          <div class="section-actions">
            <BaseSelect v-model="historyFilter"
                        :options="historyFilterOptions"
                        size="sm"
                        class="history-filter" />
          </div>
        </div>

        <div class="history-container">
          <div v-if="filteredHistory.length > 0" class="history-table">
            <div class="table-header">
              <div class="table-cell">Задача</div>
              <div class="table-cell">Статус</div>
              <div class="table-cell">Прогресс</div>
              <div class="table-cell">Время запуска</div>
              <div class="table-cell">Действия</div>
            </div>

            <div v-for="task in filteredHistory"
                 :key="task.id"
                 class="table-row">
              <div class="table-cell">
                <div class="task-info">
                  <strong class="task-name">{{ task.name }}</strong>
                  <span v-if="task.description" class="task-description">
                    {{ task.description }}
                  </span>
                </div>
              </div>

              <div class="table-cell">
                <BaseChip :color="getStatusColor(task.status)" size="sm">
                  {{ getStatusText(task.status) }}
                </BaseChip>
              </div>

              <div class="table-cell">
                <div class="progress-cell">
                  <div class="progress-bar--compact">
                    <div class="progress-bar__fill"
                         :style="{ width: `${task.progress}%` }"
                         :class="`progress--${task.status}`"></div>
                  </div>
                  <span class="progress-text">{{ task.progress }}%</span>
                </div>
              </div>

              <div class="table-cell">
                <div class="time-info">
                  <span class="task-time">{{ formatTaskTime(task.createdAt) }}</span>
                  <span class="task-duration">{{ formatDuration(task.createdAt) }}</span>
                </div>
              </div>

              <div class="table-cell">
                <div class="actions">
                  <BaseButton @click="viewTaskReport(task)"
                              variant="text"
                              size="sm"
                              class="action-btn">
                    <ReportIcon class="button-icon" />
                    Отчет
                  </BaseButton>
                  <BaseButton @click="rerunTask(task)"
                              variant="text"
                              size="sm"
                              class="action-btn">
                    <RefreshIcon class="button-icon" />
                    Повторить
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-state__content">
              <HistoryIcon class="empty-state__icon" />
              <div class="empty-state__text">
                <h3 class="empty-state__title">История сканирований пуста</h3>
                <p class="empty-state__description">Завершенные задачи появятся здесь</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог настройки сканирования -->
    <BaseModal v-if="showQuickScanConfig"
               :modelValue="showQuickScanConfig"
               title="Настройка сканирования"
               size="xl"
               @update:modelValue="showQuickScanConfig = $event"
               @close="showQuickScanConfig = false">
      <QuickScanConfig :units="units"
                       :scripts="scripts"
                       @start-scan="handleStartScan"
                       @cancel="showQuickScanConfig = false" />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseAlert from '@/framework/ui/components/feedback/BaseAlert.vue';
  import BaseModal from '@/framework/ui/components/overlay/BaseModal.vue';
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
  import QuickScanConfig from '../common/QuickScanConfig.vue';
  import {
    ScanIcon,
    ShieldIcon,
    SettingsIcon,
    RefreshIcon,
    ServerIcon,
    ScriptIcon,
    ClockIcon,
    HistoryIcon,
    InfoIcon,
    StopIcon,
    ReportIcon
  } from '@/assets/icons';
  import { useMonitoring } from '../../composables/useMonitoring';
  import { useMilitaryUnits } from '../../composables/useMilitaryUnits';
  import { useScripts } from '../../composables/useScripts';
  import type { StartScanCommand, ScanTask } from '../../api/audit.types';

  interface Props {
    units?: any[];
    scripts?: any[];
    tasks?: any[];
    currentScan?: any;
    isLoading?: boolean;
  }

  interface Emits {
    (e: 'start-scan', command: StartScanCommand): void;
    (e: 'cancel-scan', taskId: string): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { showToast } = useToast();
  const monitoring = useMonitoring();
  const militaryUnits = useMilitaryUnits();
  const scriptsManager = useScripts();

  const showQuickScanConfig = ref(false);
  const isStartingScan = ref(false);
  const historyFilter = ref('all');
  const isLoadingTasks = ref(false);

  const historyFilterOptions = [
    { value: 'all', label: 'Все задачи' },
    { value: 'completed', label: 'Завершенные' },
    { value: 'failed', label: 'Неудачные' },
    { value: 'cancelled', label: 'Отмененные' }
  ];

  const canStartScan = computed(() => {
    return militaryUnits.units.value.length > 0 && scriptsManager.scripts.value.length > 0;
  });

  const activeTasks = computed(() => {
    return (props.tasks || []).filter(task =>
      task.status === 'running' || task.status === 'pending'
    );
  });

  const taskHistory = computed(() => {
    return (props.tasks || []).filter(task =>
      task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled'
    );
  });

  const filteredHistory = computed(() => {
    if (historyFilter.value === 'all') return taskHistory.value;
    return taskHistory.value.filter(task => task.status === historyFilter.value);
  });

  const startQuickScan = async (): Promise<void> => {
    if (!canStartScan.value) {
      showToast({
        type: 'warning',
        title: 'Невозможно запустить сканирование',
        message: 'Добавьте войсковые части и скрипты для проверки'
      });
      return;
    }

    await startScan({
      name: 'Быстрое сканирование ' + new Date().toLocaleDateString('ru-RU'),
      description: 'Автоматически созданное быстрое сканирование',
      unitIds: militaryUnits.units.value.map(u => u.id),
      hostIds: [],
      scriptIds: scriptsManager.checkScripts.value.slice(0, 3).map(s => s.id),
      autoFix: false,
      parallelExecution: true,
      generateReport: true,
      notifyOnComplete: true
    });
  };

  const startComprehensiveScan = async (): Promise<void> => {
    if (!canStartScan.value) {
      showToast({
        type: 'warning',
        title: 'Невозможно запустить сканирование',
        message: 'Добавьте войсковые части и скрипты для проверки'
      });
      return;
    }

    await startScan({
      name: 'Полное сканирование ' + new Date().toLocaleDateString('ru-RU'),
      description: 'Автоматически созданное полное сканирование всех систем',
      unitIds: militaryUnits.units.value.map(u => u.id),
      hostIds: [],
      scriptIds: scriptsManager.checkScripts.value.map(s => s.id),
      autoFix: true,
      parallelExecution: true,
      generateReport: true,
      notifyOnComplete: true
    });
  };

  const startScan = async (command: StartScanCommand): Promise<void> => {
    isStartingScan.value = true;
    try {
      emit('start-scan', command);
      showQuickScanConfig.value = false;
      showToast({
        type: 'success',
        title: 'Сканирование запущено',
        message: 'Задача успешно создана и добавлена в очередь'
      });
    } catch (error) {
      console.error('Failed to start scan:', error);
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось запустить сканирование'
      });
    } finally {
      isStartingScan.value = false;
    }
  };

  const handleStartScan = (command: StartScanCommand): void => {
    emit('start-scan', command);
    showQuickScanConfig.value = false;
  };

  const cancelTask = (task: ScanTask): void => {
    emit('cancel-scan', task.id);
    showToast({
      type: 'info',
      title: 'Задача отменена',
      message: `Задача "${task.name}" была отменена`
    });
  };

  const refreshTasks = async (): Promise<void> => {
    isLoadingTasks.value = true;
    try {
      await monitoring.loadScanHistory();
      showToast({
        type: 'success',
        title: 'Данные обновлены',
        message: 'Список задач успешно обновлен'
      });
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось обновить список задач'
      });
    } finally {
      isLoadingTasks.value = false;
    }
  };

  const viewTaskDetails = (task: ScanTask): void => {
    console.log('View task details:', task);
    // Navigate to task details
  };

  const viewTaskReport = (task: ScanTask): void => {
    console.log('View task report:', task);
    // Navigate to report
  };

  const rerunTask = (task: ScanTask): void => {
    const command: StartScanCommand = {
      name: `Повтор: ${task.name}`,
      description: task.description,
      unitIds: task.unitIds,
      hostIds: task.hostIds,
      scriptIds: task.scriptIds,
      autoFix: task.autoFix,
      parallelExecution: true,
      generateReport: true,
      notifyOnComplete: true
    };
    emit('start-scan', command);
  };

  const getUnitsCount = (unitIds: string[]): number => {
    return unitIds.length;
  };

  const getScriptsCount = (scriptIds: string[]): number => {
    return scriptIds.length;
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'Ожидание',
      running: 'Выполняется',
      completed: 'Завершено',
      failed: 'Ошибка',
      cancelled: 'Отменено'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      pending: 'warning',
      running: 'primary',
      completed: 'success',
      failed: 'error',
      cancelled: 'default'
    };
    return colorMap[status] || 'default';
  };

  const formatDuration = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч`;
    return `${Math.floor(hours / 24)} д`;
  };

  const formatTaskTime = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  onMounted(() => {
    militaryUnits.loadUnits();
    scriptsManager.loadScripts();
    monitoring.loadScanHistory();
  });
</script>

<style scoped>
  .monitoring-view {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xl, 2rem);
    min-height: 100%;
  }

  .monitoring-view__header {
    text-align: center;
    padding-bottom: var(--space-xl, 1.5rem);
    border-bottom: 1px solid var(--color-border, #e2e8f0);
  }

  .monitoring-view__title {
    font-size: 2.25rem;
    font-weight: var(--font-weight-bold, 700);
    margin: 0 0 var(--space-sm, 0.75rem) 0;
    background: var(--gradient-primary, linear-gradient(135deg, var(--color-primary, #0ea5e9) 0%, var(--color-primary-dark, #0284c7) 100%));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.025em;
    line-height: 1.1;
  }

  .monitoring-view__subtitle {
    font-size: 1.25rem;
    color: var(--color-text-secondary, #475569);
    margin: 0;
    font-weight: var(--font-weight-normal, 400);
    line-height: 1.4;
  }

  .monitoring-view__content {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xl, 2rem);
    flex: 1;
  }

  /* Sections */
  .quick-scan-section,
  .active-tasks-section,
  .scan-history-section {
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-xl, 0.75rem);
    padding: var(--space-2xl, 2rem);
    box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
    transition: all var(--transition-fast, 0.15s);
  }

    .quick-scan-section:hover,
    .active-tasks-section:hover,
    .scan-history-section:hover {
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-xl, 1.5rem);
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0;
    color: var(--color-text-primary, #1e293b);
    line-height: 1.2;
  }

  .section-actions {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: var(--space-sm, 0.75rem);
  }

  /* Quick Scan Section */
  .quick-scan-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-lg, 1.25rem);
    margin-bottom: var(--space-lg, 1.25rem);
  }

  .quick-scan-btn,
  .comprehensive-scan-btn {
    transition: all var(--transition-fast, 0.15s);
  }

    .quick-scan-btn:hover,
    .comprehensive-scan-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
    }

  .scan-requirements {
    margin-top: var(--space-lg, 1.25rem);
  }

  .requirements-alert {
    border-radius: var(--radius-lg, 0.5rem);
  }

  /* Active Tasks Section */
  .tasks-container {
    min-height: 200px;
  }

  .tasks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: var(--space-lg, 1.25rem);
  }

  .task-card {
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-lg, 0.5rem);
    padding: var(--space-lg, 1.25rem);
    transition: all var(--transition-fast, 0.15s);
    position: relative;
    overflow: hidden;
  }

    .task-card:hover {
      border-color: var(--color-primary, #0ea5e9);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    }

  .task-card--running {
    border-left: 4px solid var(--color-primary, #0ea5e9);
  }

  .task-card--completed {
    border-left: 4px solid var(--color-success, #10b981);
  }

  .task-card--failed {
    border-left: 4px solid var(--color-error, #ef4444);
  }

  .task-card--cancelled {
    border-left: 4px solid var(--color-warning, #f59e0b);
  }

  .task-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-md, 1rem);
    gap: var(--space-md, 1rem);
  }

  .task-info {
    flex: 1;
    min-width: 0;
  }

  .task-card__title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-xs, 0.5rem) 0;
    color: var(--color-text-primary, #1e293b);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .task-card__status {
    font-size: 0.75rem;
    font-weight: var(--font-weight-semibold, 600);
    padding: var(--space-xs, 0.5rem) var(--space-sm, 0.75rem);
    border-radius: var(--radius-full, 9999px);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: inline-block;
  }

  .status--pending {
    background: var(--color-warning-light, #fef3c7);
    color: var(--color-warning, #f59e0b);
  }

  .status--running {
    background: var(--color-primary-light, #dbeafe);
    color: var(--color-primary, #0ea5e9);
  }

  .status--completed {
    background: var(--color-success-light, #d1fae5);
    color: var(--color-success, #10b981);
  }

  .status--failed {
    background: var(--color-error-light, #fee2e2);
    color: var(--color-error, #ef4444);
  }

  .status--cancelled {
    background: var(--color-warning-light, #fef3c7);
    color: var(--color-warning, #f59e0b);
  }

  .task-actions {
    display: flex;
    gap: var(--space-xs, 0.5rem);
    flex-shrink: 0;
  }

  .action-btn {
    padding: var(--space-xs, 0.5rem);
  }

  .task-card__progress {
    margin-bottom: var(--space-lg, 1.25rem);
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm, 0.75rem);
  }

  .progress-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #475569);
    font-weight: var(--font-weight-medium, 500);
  }

  .progress-value {
    font-size: 0.875rem;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #1e293b);
  }

  .progress-bar {
    height: 0.5rem;
    background: var(--color-border, #e2e8f0);
    border-radius: var(--radius-full, 9999px);
    overflow: hidden;
    position: relative;
  }

  .progress-bar__fill {
    height: 100%;
    border-radius: var(--radius-full, 9999px);
    transition: width var(--transition-normal, 0.3s) ease;
  }

  .progress--pending {
    background: var(--color-warning, #f59e0b);
  }

  .progress--running {
    background: linear-gradient(90deg, var(--color-primary, #0ea5e9), var(--color-primary-light, #7dd3fc));
  }

  .progress--completed {
    background: var(--color-success, #10b981);
  }

  .progress--failed {
    background: var(--color-error, #ef4444);
  }

  .progress--cancelled {
    background: var(--color-warning, #f59e0b);
  }

  .task-card__details {
    margin-top: var(--space-lg, 1.25rem);
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-md, 1rem);
  }

  .task-detail {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 0.75rem);
    padding: var(--space-sm, 0.75rem);
    background: var(--color-surface-hover, #f8fafc);
    border-radius: var(--radius-md, 0.375rem);
    border: 1px solid var(--color-border, #e2e8f0);
  }

  .detail-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-primary, #0ea5e9);
    flex-shrink: 0;
  }

  .detail-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 0.5rem);
  }

  .detail-value {
    font-size: 1.125rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary, #1e293b);
    line-height: 1;
  }

  .detail-label {
    font-size: 0.75rem;
    color: var(--color-text-muted, #64748b);
    font-weight: var(--font-weight-medium, 500);
    text-transform: lowercase;
  }

  /* History Section */
  .history-container {
    min-height: 200px;
  }

  .history-table {
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-lg, 0.5rem);
    overflow: hidden;
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr 1.2fr;
    gap: var(--space-md, 1rem);
    padding: var(--space-lg, 1.25rem) var(--space-xl, 1.5rem);
    background: var(--color-surface-hover, #f8fafc);
    border-bottom: 1px solid var(--color-border, #e2e8f0);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #1e293b);
    font-size: 0.9rem;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr 1.2fr;
    gap: var(--space-md, 1rem);
    padding: var(--space-lg, 1.25rem) var(--space-xl, 1.5rem);
    border-bottom: 1px solid var(--color-border-light, #f1f5f9);
    transition: background-color var(--transition-fast, 0.15s);
  }

    .table-row:hover {
      background: var(--color-surface-hover, #f8fafc);
    }

    .table-row:last-child {
      border-bottom: none;
    }

  .table-cell {
    display: flex;
    align-items: center;
    color: var(--color-text-primary, #1e293b);
    min-width: 0;
  }

  .task-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 0.5rem);
    min-width: 0;
  }

  .task-name {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #1e293b);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .task-description {
    font-size: 0.8rem;
    color: var(--color-text-muted, #64748b);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .progress-cell {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
  }

  .progress-bar--compact {
    width: 60px;
    height: 0.375rem;
    background: var(--color-border, #e2e8f0);
    border-radius: var(--radius-full, 9999px);
    overflow: hidden;
    flex-shrink: 0;
  }

  .progress-text {
    font-size: 0.875rem;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #1e293b);
    min-width: 2.5rem;
  }

  .time-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 0.5rem);
  }

  .task-time {
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-primary, #1e293b);
  }

  .task-duration {
    font-size: 0.75rem;
    color: var(--color-text-muted, #64748b);
  }

  .actions {
    display: flex;
    gap: var(--space-xs, 0.5rem);
  }

  /* Empty States */
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-3xl, 3rem) var(--space-2xl, 2rem);
    color: var(--color-text-secondary, #475569);
  }

  .empty-state__content {
    text-align: center;
    max-width: 400px;
  }

  .empty-state__icon {
    width: 4rem;
    height: 4rem;
    margin-bottom: var(--space-lg, 1.25rem);
    color: var(--color-text-muted, #64748b);
    opacity: 0.5;
  }

  .empty-state__text {
    margin-bottom: var(--space-lg, 1.25rem);
  }

  .empty-state__title {
    font-size: 1.25rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-sm, 0.75rem) 0;
    color: var(--color-text-primary, #1e293b);
  }

  .empty-state__description {
    font-size: 1rem;
    margin: 0;
    color: var(--color-text-secondary, #475569);
    line-height: 1.4;
  }

  .empty-state__action {
    margin-top: var(--space-lg, 1.25rem);
  }

  /* Responsive Design */
  @media (max-width: 1200px) {
    .monitoring-view__title {
      font-size: 2rem;
    }

    .tasks-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 1024px) {
    .monitoring-view__title {
      font-size: 1.75rem;
    }

    .monitoring-view__subtitle {
      font-size: 1.125rem;
    }

    .quick-scan-section,
    .active-tasks-section,
    .scan-history-section {
      padding: var(--space-xl, 1.5rem);
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-md, 1rem);
    }

    .quick-scan-actions {
      grid-template-columns: 1fr;
    }

    .table-header,
    .table-row {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-sm, 0.75rem);
    }

    .table-cell:nth-child(3),
    .table-cell:nth-child(4),
    .table-cell:nth-child(5) {
      display: none;
    }

    .detail-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .monitoring-view {
      gap: var(--space-xl, 1.5rem);
    }

    .monitoring-view__header {
      padding-bottom: var(--space-lg, 1.25rem);
    }

    .monitoring-view__title {
      font-size: 1.5rem;
    }

    .monitoring-view__subtitle {
      font-size: 1rem;
    }

    .quick-scan-section,
    .active-tasks-section,
    .scan-history-section {
      padding: var(--space-lg, 1.25rem);
      border-radius: var(--radius-lg, 0.5rem);
    }

    .section-title {
      font-size: 1.25rem;
    }

    .task-card {
      padding: var(--space-md, 1rem);
    }

    .task-card__header {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-sm, 0.75rem);
    }

    .task-actions {
      justify-content: flex-end;
    }

    .table-header,
    .table-row {
      grid-template-columns: 1fr;
      gap: var(--space-sm, 0.75rem);
    }

    .table-cell:nth-child(2) {
      display: none;
    }
  }
</style>
