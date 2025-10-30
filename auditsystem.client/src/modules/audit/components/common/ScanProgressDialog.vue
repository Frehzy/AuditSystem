<template>
  <div class="scan-progress-dialog theme-transition">
    <div class="dialog-header">
      <h2 class="dialog-title">Прогресс сканирования</h2>
      <p class="dialog-description">Отслеживание выполнения задачи сканирования</p>
    </div>

    <div class="dialog-content">
      <!-- Информация о задаче -->
      <div class="task-info card" v-if="scanTask">
        <div class="task-header">
          <h3 class="task-name">{{ scanTask.name }}</h3>
          <BaseChip :color="getStatusColor(scanTask.status)" size="sm">
            {{ getStatusText(scanTask.status) }}
          </BaseChip>
        </div>

        <p v-if="scanTask.description" class="task-description">
          {{ scanTask.description }}
        </p>

        <div class="task-meta">
          <div class="meta-item">
            <CalendarIcon class="meta-icon" />
            <span>Запущено: {{ formatStartTime(scanTask.startedAt) }}</span>
          </div>
          <div class="meta-item">
            <ClockIcon class="meta-icon" />
            <span>Длительность: {{ formatDuration(scanTask.startedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Прогресс -->
      <div class="progress-section card">
        <div class="progress-header">
          <span class="progress-label">Общий прогресс</span>
          <span class="progress-percent">{{ scanTask?.progress || 0 }}%</span>
        </div>

        <div class="progress-bar">
          <div class="progress-fill"
               :style="{ width: `${scanTask?.progress || 0}%` }"
               :class="{ 'progress-fill--complete': (scanTask?.progress || 0) === 100 }"></div>
        </div>

        <div class="progress-details">
          <div class="detail-item">
            <div class="detail-content">
              <span class="detail-label">Обработано хостов:</span>
              <span class="detail-value">{{ processedHosts }}/{{ totalHosts }}</span>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-content">
              <span class="detail-label">Выполнено скриптов:</span>
              <span class="detail-value">{{ executedScripts }}/{{ totalScripts }}</span>
            </div>
          </div>
          <div class="detail-item" v-if="estimatedTime">
            <div class="detail-content">
              <span class="detail-label">Примерное время до завершения:</span>
              <span class="detail-value">{{ estimatedTime }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Детали выполнения -->
      <div class="execution-details card">
        <div class="card-header">
          <h3 class="details-title">Детали выполнения</h3>
          <div class="header-actions">
            <BaseButton @click="clearDetails"
                        variant="text"
                        size="sm"
                        class="action-btn">
              <TrashIcon class="button-icon" />
              Очистить
            </BaseButton>
          </div>
        </div>

        <div class="details-list">
          <div v-for="(detail, index) in executionDetails"
               :key="index"
               class="detail-item table-row"
               :class="`status--${detail.status}`">
            <div class="detail-icon">
              <component :is="getDetailIcon(detail.status)" />
            </div>
            <div class="detail-content">
              <div class="detail-header">
                <span class="detail-host">{{ detail.host }}</span>
                <span class="detail-script">{{ detail.script }}</span>
                <span class="detail-time">{{ detail.time }}</span>
              </div>
              <p class="detail-message">{{ detail.message }}</p>
            </div>
          </div>
        </div>

        <div v-if="executionDetails.length === 0" class="empty-state">
          <InfoIcon class="empty-icon" />
          <p>Информация о выполнении появится здесь</p>
          <p class="empty-description">
            Детали выполнения скриптов будут отображаться в реальном времени
          </p>
        </div>
      </div>

      <!-- Результаты в реальном времени -->
      <div class="live-results card">
        <h3 class="results-title">Результаты в реальном времени</h3>

        <div class="results-stats">
          <div class="stat-card">
            <div class="stat-icon" :class="`stat-icon--success`">
              <CheckCircleIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ successCount }}</div>
              <div class="stat-label">Успешно</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" :class="`stat-icon--warning`">
              <AlertTriangleIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ warningCount }}</div>
              <div class="stat-label">Предупреждения</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" :class="`stat-icon--error`">
              <XCircleIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ errorCount }}</div>
              <div class="stat-label">Ошибки</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" :class="`stat-icon--info`">
              <ClockIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ pendingCount }}</div>
              <div class="stat-label">В ожидании</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dialog-actions">
      <BaseButton @click="handleCancel"
                  variant="secondary"
                  :disabled="!canCancel"
                  class="cancel-btn btn-secondary">
        <StopIcon class="button-icon" />
        Отменить сканирование
      </BaseButton>

      <BaseButton @click="$emit('close')"
                  variant="text"
                  class="close-btn">
        Закрыть
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
  import {
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    AlertTriangleIcon,
    XCircleIcon,
    InfoIcon,
    StopIcon,
    TrashIcon
  } from '@/assets/icons';

  interface Props {
    scanTask?: any;
  }

  interface Emits {
    (e: 'cancel'): void;
    (e: 'close'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { showToast } = useToast();

  const executionDetails = ref<any[]>([]);
  const progressInterval = ref<NodeJS.Timeout | null>(null);

  const processedHosts = computed(() => {
    return Math.floor((props.scanTask?.progress || 0) / 100 * 42);
  });

  const totalHosts = computed(() => 42);

  const executedScripts = computed(() => {
    return Math.floor((props.scanTask?.progress || 0) / 100 * 15);
  });

  const totalScripts = computed(() => 15);

  const estimatedTime = computed(() => {
    const progress = props.scanTask?.progress || 0;
    if (progress === 0 || progress === 100) return null;

    const elapsed = new Date().getTime() - new Date(props.scanTask.startedAt).getTime();
    const totalEstimated = elapsed / (progress / 100);
    const remaining = totalEstimated - elapsed;

    return formatTimeRemaining(remaining);
  });

  const successCount = computed(() => {
    return executionDetails.value.filter(d => d.status === 'success').length;
  });

  const warningCount = computed(() => {
    return executionDetails.value.filter(d => d.status === 'warning').length;
  });

  const errorCount = computed(() => {
    return executionDetails.value.filter(d => d.status === 'error').length;
  });

  const pendingCount = computed(() => {
    return Math.max(0, totalHosts.value * totalScripts.value -
      successCount.value - warningCount.value - errorCount.value);
  });

  const canCancel = computed(() => {
    return props.scanTask?.status === 'running' || props.scanTask?.status === 'pending';
  });

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      running: 'Выполняется',
      pending: 'Ожидание',
      completed: 'Завершено',
      failed: 'Ошибка',
      cancelled: 'Отменено'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      running: 'primary',
      pending: 'warning',
      completed: 'success',
      failed: 'error',
      cancelled: 'default'
    };
    return colorMap[status] || 'default';
  };

  const getDetailIcon = (status: string) => {
    const iconMap: Record<string, any> = {
      success: CheckCircleIcon,
      warning: AlertTriangleIcon,
      error: XCircleIcon,
      pending: ClockIcon
    };
    return iconMap[status] || InfoIcon;
  };

  const formatStartTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startTime: string): string => {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diff = now - start;

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (hours > 0) {
      return `${hours}ч ${minutes}м ${seconds}с`;
    } else if (minutes > 0) {
      return `${minutes}м ${seconds}с`;
    } else {
      return `${seconds}с`;
    }
  };

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}м ${seconds}с`;
    } else {
      return `${seconds}с`;
    }
  };

  const clearDetails = (): void => {
    executionDetails.value = [];
  };

  const handleCancel = (): void => {
    if (confirm('Вы уверены, что хотите отменить сканирование?')) {
      emit('cancel');
      showToast({
        type: 'warning',
        title: 'Сканирование отменено',
        message: 'Процесс сканирования был остановлен'
      });
    }
  };

  // Имитация обновления прогресса
  const updateProgress = (): void => {
    if (Math.random() > 0.7 && executionDetails.value.length < 20) {
      const statuses = ['success', 'warning', 'error', 'pending'];
      const hosts = ['192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.4'];
      const scripts = ['Проверка обновлений', 'Аудит безопасности', 'Проверка конфигурации'];
      const messages = [
        'Проверка завершена успешно',
        'Обнаружены предупреждения',
        'Критические ошибки безопасности',
        'Проверка параметров системы',
        'Сканирование портов',
        'Проверка уязвимостей'
      ];

      executionDetails.value.unshift({
        host: hosts[Math.floor(Math.random() * hosts.length)],
        script: scripts[Math.floor(Math.random() * scripts.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        time: new Date().toLocaleTimeString('ru-RU')
      });

      // Ограничиваем количество записей
      if (executionDetails.value.length > 50) {
        executionDetails.value = executionDetails.value.slice(0, 50);
      }
    }
  };

  onMounted(() => {
    progressInterval.value = setInterval(updateProgress, 2000);
  });

  onUnmounted(() => {
    if (progressInterval.value) {
      clearInterval(progressInterval.value);
    }
  });
</script>

<style scoped>
  .scan-progress-dialog {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
    max-height: 80vh;
    background: var(--color-background);
  }

  .dialog-header {
    text-align: center;
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--color-border);
  }

  .dialog-title {
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold, 700);
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--color-text-primary);
  }

  .dialog-description {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
    flex: 1;
    overflow-y: auto;
  }

  /* Card Styles */
  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-normal);
  }

    .card:hover {
      box-shadow: var(--shadow-md);
    }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
  }

  /* Task Info */
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);
  }

  .task-name {
    font-size: 1.25rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0;
    color: var(--color-text-primary);
    flex: 1;
  }

  .task-description {
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin-bottom: var(--spacing-md);
  }

  .task-meta {
    display: flex;
    gap: var(--spacing-lg);
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .meta-icon {
    width: 1rem;
    height: 1rem;
  }

  /* Progress Section */
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  .progress-label {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
  }

  .progress-percent {
    font-size: 1.25rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-primary);
  }

  .progress-bar {
    height: 0.75rem;
    background: var(--color-border);
    border-radius: var(--radius-full);
    overflow: hidden;
    margin-bottom: var(--spacing-lg);
  }

  .progress-fill {
    height: 100%;
    background: var(--gradient-primary);
    border-radius: var(--radius-full);
    transition: width var(--transition-slow);
  }

  .progress-fill--complete {
    background: var(--gradient-primary);
  }

  .progress-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--color-surface-hover);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .detail-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .detail-label {
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-primary);
  }

  .detail-value {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
  }

  /* Execution Details */
  .details-title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0;
    color: var(--color-text-primary);
  }

  .details-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    max-height: 300px;
    overflow-y: auto;
  }

  .detail-item.table-row {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    transition: all var(--transition-fast);
    cursor: default;
  }

    .detail-item.table-row:hover {
      background: var(--color-surface-hover);
    }

    .detail-item.table-row.status--success {
      border-left: 4px solid var(--color-success);
    }

    .detail-item.table-row.status--warning {
      border-left: 4px solid var(--color-warning);
    }

    .detail-item.table-row.status--error {
      border-left: 4px solid var(--color-error);
    }

    .detail-item.table-row.status--pending {
      border-left: 4px solid var(--color-info);
    }

  .detail-icon {
    width: 1.5rem;
    height: 1.5rem;
    margin-top: 0.125rem;
    flex-shrink: 0;
  }

  .detail-item.table-row.status--success .detail-icon {
    color: var(--color-success);
  }

  .detail-item.table-row.status--warning .detail-icon {
    color: var(--color-warning);
  }

  .detail-item.table-row.status--error .detail-icon {
    color: var(--color-error);
  }

  .detail-item.table-row.status--pending .detail-icon {
    color: var(--color-info);
  }

  .detail-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .detail-host {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
    font-family: var(--font-family-mono);
    font-size: 0.875rem;
  }

  .detail-script {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium, 500);
    flex: 1;
  }

  .detail-time {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium, 500);
  }

  .detail-message {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
    margin: 0;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--color-text-secondary);
  }

  .empty-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
  }

  .empty-description {
    margin: var(--spacing-sm) 0 0 0;
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }

  /* Live Results */
  .results-title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--spacing-lg) 0;
    color: var(--color-text-primary);
  }

  .results-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-lg);
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    transition: all var(--transition-fast);
  }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

  .stat-icon {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .stat-icon--success {
    background: var(--color-success);
  }

  .stat-icon--warning {
    background: var(--color-warning);
  }

  .stat-icon--error {
    background: var(--color-error);
  }

  .stat-icon--info {
    background: var(--color-info);
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold, 700);
    margin-bottom: var(--spacing-xs);
    color: var(--color-text-primary);
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium, 500);
  }

  /* Dialog Actions */
  .dialog-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: space-between;
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-border);
  }

  .cancel-btn,
  .close-btn {
    min-width: 160px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  .action-btn {
    padding: var(--spacing-xs);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .progress-details {
      grid-template-columns: 1fr;
    }

    .results-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .detail-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-xs);
    }

    .task-meta {
      flex-direction: column;
      gap: var(--spacing-sm);
    }
  }

  @media (max-width: 768px) {
    .scan-progress-dialog {
      gap: var(--spacing-lg);
    }

    .card {
      padding: var(--spacing-lg);
    }

    .dialog-actions {
      flex-direction: column;
    }

    .cancel-btn,
    .close-btn {
      width: 100%;
    }

    .results-stats {
      grid-template-columns: 1fr;
    }

    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
    }

    .header-actions {
      align-self: flex-end;
    }
  }

  @media (max-width: 480px) {
    .task-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }

    .stat-card {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-sm);
    }

    .progress-details {
      gap: var(--spacing-sm);
    }

    .detail-item {
      padding: var(--spacing-sm);
    }
  }

  /* Scrollbar Styling */
  .details-list::-webkit-scrollbar {
    width: 6px;
  }

  .details-list::-webkit-scrollbar-track {
    background: var(--color-surface-hover);
    border-radius: var(--radius-sm);
  }

  .details-list::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: var(--radius-sm);
  }

    .details-list::-webkit-scrollbar-thumb:hover {
      background: var(--color-text-muted);
    }
</style>
