<template>
  <div class="report-export-dialog">
    <div class="dialog-header">
      <h2 class="dialog-title">Экспорт отчетов</h2>
      <p class="dialog-description">Выберите задачи и формат для генерации отчетов</p>
    </div>

    <div class="dialog-content">
      <!-- Выбор задач -->
      <div class="selection-section">
        <h3 class="section-title">Выбор задач</h3>

        <div class="tasks-list">
          <div v-for="task in tasks"
               :key="task.id"
               class="task-item">
            <BaseCheckbox v-model="selectedTaskIds"
                          :value="task.id"
                          class="task-checkbox" />
            <div class="task-info">
              <div class="task-header">
                <span class="task-name">{{ task.name }}</span>
                <BaseChip :color="getTaskStatusColor(task.status)"
                          size="sm">
                  {{ getTaskStatusText(task.status) }}
                </BaseChip>
              </div>
              <div class="task-meta">
                <span class="task-date">
                  {{ formatTaskDate(task.createdAt) }}
                </span>
                <span class="task-progress">
                  Прогресс: {{ task.progress }}%
                </span>
                <span class="task-units">
                  {{ task.unitIds.length }} частей
                </span>
              </div>
              <p v-if="task.description" class="task-description">
                {{ task.description }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="tasks.length === 0" class="empty-state">
          <DocumentIcon class="empty-icon" />
          <p>Нет доступных задач для экспорта</p>
        </div>
      </div>

      <!-- Настройки экспорта -->
      <div class="export-settings">
        <h3 class="section-title">Настройки экспорта</h3>

        <div class="settings-grid">
          <div class="setting-group">
            <label class="setting-label">Формат отчета</label>
            <BaseSelect v-model="exportConfig.format"
                        :options="formatOptions"
                        class="setting-control" />
          </div>

          <div class="setting-group">
            <label class="setting-label">Уровень детализации</label>
            <BaseSelect v-model="exportConfig.detailLevel"
                        :options="detailLevelOptions"
                        class="setting-control" />
          </div>

          <div class="setting-group">
            <label class="setting-label">Включить графики</label>
            <BaseToggle v-model="exportConfig.includeCharts"
                        class="setting-control" />
          </div>

          <div class="setting-group">
            <label class="setting-label">Включить рекомендации</label>
            <BaseToggle v-model="exportConfig.includeRecommendations"
                        class="setting-control" />
          </div>
        </div>

        <div class="export-preview">
          <h4 class="preview-title">Предварительный просмотр</h4>
          <div class="preview-content">
            <div class="preview-item" v-for="taskId in selectedTaskIds" :key="taskId">
              <DocumentIcon class="preview-icon" />
              <span class="preview-text">
                {{ getTaskName(taskId) }}.{{ exportConfig.format }}
              </span>
              <span class="preview-size">~2.5 MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dialog-actions">
      <BaseButton @click="$emit('close')"
                  variant="secondary"
                  class="cancel-btn">
        Отмена
      </BaseButton>
      <BaseButton @click="handleGenerate"
                  variant="primary"
                  :loading="isGenerating"
                  :disabled="!canGenerate"
                  class="generate-btn">
        <DownloadIcon class="button-icon" />
        Сгенерировать отчеты
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useToast } from '@/framework/ui/composables/useToast';
import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue';
import BaseCheckbox from '@/framework/ui/components/forms/BaseCheckbox.vue';
import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
import { DocumentIcon, DownloadIcon } from '@/assets/icons';

interface Props {
  tasks?: any[];
}

interface Emits {
  (e: 'generate', config: ExportConfig): void;
  (e: 'close'): void;
}

interface ExportConfig {
  taskIds: string[];
  format: string;
  detailLevel: string;
  includeCharts: boolean;
  includeRecommendations: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { showToast } = useToast();

const isGenerating = ref(false);
const selectedTaskIds = ref<string[]>([]);

const exportConfig = ref<ExportConfig>({
  taskIds: [],
  format: 'pdf',
  detailLevel: 'detailed',
  includeCharts: true,
  includeRecommendations: true
});

const formatOptions = [
  { value: 'pdf', label: 'PDF документ' },
  { value: 'html', label: 'HTML страница' },
  { value: 'json', label: 'JSON данные' },
  { value: 'csv', label: 'CSV таблица' },
  { value: 'txt', label: 'Текстовый файл' }
];

const detailLevelOptions = [
  { value: 'basic', label: 'Базовый' },
  { value: 'detailed', label: 'Детальный' },
  { value: 'comprehensive', label: 'Полный' }
];

const canGenerate = computed(() => {
  return selectedTaskIds.value.length > 0;
});

const getTaskStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    completed: 'Завершено',
    running: 'Выполняется',
    failed: 'Ошибка',
    cancelled: 'Отменено',
    pending: 'Ожидание'
  };
  return statusMap[status] || status;
};

const getTaskStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    completed: 'success',
    running: 'primary',
    failed: 'error',
    cancelled: 'warning',
    pending: 'default'
  };
  return colorMap[status] || 'default';
};

const formatTaskDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getTaskName = (taskId: string): string => {
  const task = props.tasks?.find(t => t.id === taskId);
  return task?.name || 'Неизвестная задача';
};

const handleGenerate = async (): Promise<void> => {
  if (!canGenerate.value) {
    showToast({
      type: 'warning',
      title: 'Выберите задачи',
      message: 'Для генерации отчетов необходимо выбрать хотя бы одну задачу'
    });
    return;
  }

  isGenerating.value = true;

  const config: ExportConfig = {
    ...exportConfig.value,
    taskIds: selectedTaskIds.value
  };

  try {
    emit('generate', config);
    showToast({
      type: 'success',
      title: 'Отчеты создаются',
      message: 'Запущен процесс генерации отчетов'
    });
  } catch (error) {
    console.error('Failed to generate reports:', error);
    showToast({
      type: 'error',
      title: 'Ошибка',
      message: 'Не удалось создать отчеты'
    });
  } finally {
    isGenerating.value = false;
  }
};
</script>

<style scoped>
  .report-export-dialog {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-height: 80vh;
  }

  .dialog-header {
    text-align: center;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .dialog-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
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
    gap: 2rem;
    flex: 1;
    overflow-y: auto;
  }

  .selection-section,
  .export-settings {
    background: var(--color-surface-hover);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
  }

  /* Tasks List */
  .tasks-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 300px;
    overflow-y: auto;
  }

  .task-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
    transition: all 0.2s ease;
  }

    .task-item:hover {
      border-color: var(--color-primary);
    }

  .task-checkbox {
    margin-top: 0.25rem;
  }

  .task-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .task-name {
    font-weight: 600;
    color: var(--color-text-primary);
    flex: 1;
  }

  .task-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .task-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
    margin: 0;
  }

  /* Export Settings */
  .settings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .setting-label {
    font-weight: 600;
    color: var(--color-text-primary);
    font-size: 0.9rem;
  }

  .export-preview {
    background: var(--color-surface);
    border-radius: 0.75rem;
    padding: 1rem;
    border: 1px solid var(--color-border);
  }

  .preview-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
  }

  .preview-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .preview-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--color-surface-hover);
    border-radius: 0.5rem;
  }

  .preview-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-primary);
  }

  .preview-text {
    flex: 1;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .preview-size {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-secondary);
  }

  .empty-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  /* Dialog Actions */
  .dialog-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
  }

  .cancel-btn,
  .generate-btn {
    min-width: 140px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: 0.5rem;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .settings-grid {
      grid-template-columns: 1fr;
    }

    .task-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .task-meta {
      flex-direction: column;
      gap: 0.25rem;
    }
  }

  @media (max-width: 768px) {
    .report-export-dialog {
      gap: 1.5rem;
    }

    .selection-section,
    .export-settings {
      padding: 1.25rem;
    }

    .dialog-actions {
      flex-direction: column;
    }

    .cancel-btn,
    .generate-btn {
      width: 100%;
    }
  }
</style>
