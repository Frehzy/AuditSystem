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
          <BaseAlert type="warning">
            Для запуска сканирования необходимо добавить войсковые части и настроить скрипты проверки
          </BaseAlert>
        </div>
      </div>

      <!-- Активные задачи -->
      <div class="active-tasks-section">
        <div class="section-header">
          <h2 class="section-title">Активные задачи</h2>
          <BaseButton @click="refreshTasks"
                      variant="text"
                      size="sm"
                      :loading="isLoadingTasks">
            <RefreshIcon class="button-icon" />
            Обновить
          </BaseButton>
        </div>

        <div class="tasks-grid">
          <div v-for="task in activeTasks"
               :key="task.id"
               class="task-card"
               :class="`task-card--${task.status}`">
            <div class="task-card__header">
              <h3 class="task-card__title">{{ task.name }}</h3>
              <span class="task-card__status">{{ getStatusText(task.status) }}</span>
            </div>

            <div class="task-card__progress">
              <div class="progress-bar">
                <div class="progress-bar__fill"
                     :style="{ width: `${task.progress}%` }"></div>
              </div>
              <span class="progress-text">{{ task.progress }}%</span>
            </div>

            <div class="task-card__details">
              <div class="task-detail">
                <ServerIcon class="detail-icon" />
                <span>{{ getUnitsCount(task.unitIds) }} частей</span>
              </div>
              <div class="task-detail">
                <ScriptIcon class="detail-icon" />
                <span>{{ getScriptsCount(task.scriptIds) }} скриптов</span>
              </div>
              <div class="task-detail">
                <ClockIcon class="detail-icon" />
                <span>{{ formatDuration(task.createdAt) }}</span>
              </div>
            </div>

            <div class="task-card__actions">
              <BaseButton @click="viewTaskDetails(task)"
                          variant="text"
                          size="sm">
                Детали
              </BaseButton>
              <BaseButton v-if="task.status === 'running'"
                          @click="cancelTask(task)"
                          variant="text"
                          size="sm"
                          color="error">
                Отменить
              </BaseButton>
            </div>
          </div>
        </div>

        <div v-if="activeTasks.length === 0" class="empty-state">
          <ScanIcon class="empty-state__icon" />
          <p class="empty-state__text">Нет активных задач</p>
          <p class="empty-state__description">Запустите сканирование для начала мониторинга</p>
        </div>
      </div>

      <!-- История сканирований -->
      <div class="scan-history-section">
        <div class="section-header">
          <h2 class="section-title">История сканирований</h2>
          <BaseSelect v-model="historyFilter"
                      :options="historyFilterOptions"
                      size="sm" />
        </div>

        <div class="history-table">
          <div class="table-header">
            <div class="table-cell">Задача</div>
            <div class="table-cell">Статус</div>
            <div class="table-cell">Прогресс</div>
            <div class="table-cell">Время</div>
            <div class="table-cell">Действия</div>
          </div>

          <div v-for="task in filteredHistory"
               :key="task.id"
               class="table-row">
            <div class="table-cell">
              <div class="task-name">
                <strong>{{ task.name }}</strong>
                <span v-if="task.description" class="task-description">
                  {{ task.description }}
                </span>
              </div>
            </div>

            <div class="table-cell">
              <span class="status-badge" :class="`status--${task.status}`">
                {{ getStatusText(task.status) }}
              </span>
            </div>

            <div class="table-cell">
              <div class="progress-cell">
                <div class="progress-bar--small">
                  <div class="progress-bar__fill"
                       :style="{ width: `${task.progress}%` }"></div>
                </div>
                <span>{{ task.progress }}%</span>
              </div>
            </div>

            <div class="table-cell">
              <span class="task-time">{{ formatTaskTime(task.createdAt) }}</span>
            </div>

            <div class="table-cell">
              <div class="actions">
                <BaseButton @click="viewTaskReport(task)"
                            variant="text"
                            size="sm">
                  Отчет
                </BaseButton>
                <BaseButton @click="rerunTask(task)"
                            variant="text"
                            size="sm">
                  Повторить
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredHistory.length === 0" class="empty-state">
          <HistoryIcon class="empty-state__icon" />
          <p class="empty-state__text">История сканирований пуста</p>
        </div>
      </div>
    </div>

    <!-- Диалог настройки сканирования -->
    <BaseModal v-if="showQuickScanConfig"
               :modelValue="showQuickScanConfig"
               title="Настройка сканирования"
               size="large"
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
  import QuickScanConfig from '../common/QuickScanConfig.vue';
  import {
    ScanIcon,
    ShieldIcon,
    SettingsIcon,
    RefreshIcon,
    ServerIcon,
    ScriptIcon,
    ClockIcon,
    HistoryIcon
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
      name: 'Быстрое сканирование',
      unitIds: militaryUnits.units.value.map(u => u.id),
      hostIds: [],
      scriptIds: scriptsManager.checkScripts.value.slice(0, 3).map(s => s.id),
      autoFix: false
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
      name: 'Полное сканирование',
      unitIds: militaryUnits.units.value.map(u => u.id),
      hostIds: [],
      scriptIds: scriptsManager.checkScripts.value.map(s => s.id),
      autoFix: true
    });
  };

  const startScan = async (command: StartScanCommand): Promise<void> => {
    isStartingScan.value = true;
    try {
      emit('start-scan', command);
      showQuickScanConfig.value = false;
    } catch (error) {
      console.error('Failed to start scan:', error);
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
  };

  const refreshTasks = async (): Promise<void> => {
    isLoadingTasks.value = true;
    try {
      await monitoring.loadScanHistory();
    } finally {
      isLoadingTasks.value = false;
    }
  };

  const viewTaskDetails = (task: ScanTask): void => {
    // Navigate to task details
    console.log('View task details:', task);
  };

  const viewTaskReport = (task: ScanTask): void => {
    // Navigate to report
    console.log('View task report:', task);
  };

  const rerunTask = (task: ScanTask): void => {
    const command: StartScanCommand = {
      name: `Повтор: ${task.name}`,
      unitIds: task.unitIds,
      hostIds: task.hostIds,
      scriptIds: task.scriptIds,
      autoFix: task.autoFix
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

  const formatDuration = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    return `${Math.floor(minutes / 60)} ч назад`;
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
    gap: 2rem;
  }

  .monitoring-view__header {
    text-align: center;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .monitoring-view__title {
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 0.75rem 0;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.025em;
  }

  .monitoring-view__subtitle {
    font-size: 1.25rem;
    color: var(--color-text-secondary);
    margin: 0;
    font-weight: 400;
  }

  /* Sections */
  .quick-scan-section,
  .active-tasks-section,
  .scan-history-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
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

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: 0.5rem;
  }

  /* Quick Scan */
  .quick-scan-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .quick-scan-btn,
  .comprehensive-scan-btn {
    flex: 1;
    transition: all 0.3s ease;
  }

    .quick-scan-btn:hover,
    .comprehensive-scan-btn:hover {
      transform: translateY(-2px);
    }

  .scan-requirements {
    margin-top: 1rem;
  }

  /* Active Tasks */
  .tasks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .task-card {
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }

    .task-card:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

  .task-card--running {
    border-left: 4px solid var(--color-primary);
  }

  .task-card--completed {
    border-left: 4px solid var(--color-success);
  }

  .task-card--failed {
    border-left: 4px solid var(--color-error);
  }

  .task-card--cancelled {
    border-left: 4px solid var(--color-warning);
  }

  .task-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .task-card__title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
    flex: 1;
  }

  .task-card__status {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 2rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status--pending {
    background: var(--color-warning-light);
    color: var(--color-warning);
  }

  .status--running {
    background: var(--color-primary-light);
    color: var(--color-primary);
  }

  .status--completed {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  .status--failed {
    background: var(--color-error-light);
    color: var(--color-error);
  }

  .status--cancelled {
    background: var(--color-warning-light);
    color: var(--color-warning);
  }

  .task-card__progress {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .progress-bar {
    flex: 1;
    height: 0.5rem;
    background: var(--color-border);
    border-radius: 1rem;
    overflow: hidden;
  }

  .progress-bar__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
    border-radius: 1rem;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    min-width: 2.5rem;
  }

  .task-card__details {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .task-detail {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-text-secondary);
  }

  .detail-icon {
    width: 1rem;
    height: 1rem;
  }

  .task-card__actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  /* History Table */
  .history-table {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    overflow: hidden;
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr 1.2fr;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    background: var(--color-surface-hover);
    border-bottom: 1px solid var(--color-border);
    font-weight: 700;
    color: var(--color-text-primary);
    font-size: 0.9rem;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr 1.2fr;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--color-border);
    transition: background-color 0.2s ease;
  }

    .table-row:hover {
      background: var(--color-surface-hover);
    }

    .table-row:last-child {
      border-bottom: none;
    }

  .table-cell {
    display: flex;
    align-items: center;
    color: var(--color-text-primary);
  }

  .task-name {
    display: flex;
    flex-direction: column;
  }

  .task-description {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: 0.25rem;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 2rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .progress-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .progress-bar--small {
    width: 60px;
    height: 0.375rem;
    background: var(--color-border);
    border-radius: 1rem;
    overflow: hidden;
  }

  .task-time {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  /* Empty States */
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
      padding: 1.5rem;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .quick-scan-actions {
      flex-direction: column;
    }

    .table-header,
    .table-row {
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .table-cell:nth-child(3),
    .table-cell:nth-child(4),
    .table-cell:nth-child(5) {
      display: none;
    }
  }

  @media (max-width: 900px) {
    .monitoring-view {
      gap: 1.5rem;
    }

    .task-card__details {
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  @media (max-width: 800px) {
    .monitoring-view__title {
      font-size: 1.5rem;
    }

    .monitoring-view__subtitle {
      font-size: 1rem;
    }

    .quick-scan-section,
    .active-tasks-section,
    .scan-history-section {
      padding: 1.25rem;
      border-radius: 1rem;
    }

    .section-title {
      font-size: 1.25rem;
    }
  }
</style>
