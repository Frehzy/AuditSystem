<template>
  <BaseModal :model-value="true"
             title="Экспорт отчетов"
             subtitle="Выберите задачи и формат для генерации отчетов"
             icon="DocumentIcon"
             size="lg"
             :wrapper-class="`report-export-dialog`"
             @close="$emit('close')">

    <div class="export-content">
      <!-- Выбор задач -->
      <div class="selection-section">
        <div class="section-header">
          <h3 class="section-title">Выбор задач</h3>
          <div class="selection-actions">
            <BaseCheckbox :model-value="allTasksSelected"
                          :indeterminate="someTasksSelected"
                          @update:model-value="handleSelectAllTasks"
                          class="select-all-checkbox" />
            <span class="selection-count">{{ selectedTaskIds.length }} выбрано</span>
          </div>
        </div>

        <div class="tasks-list">
          <div v-for="task in tasks"
               :key="task.id"
               class="task-item"
               :class="{ 'task-item--selected': isTaskSelected(task.id) }"
               @click="toggleTaskSelection(task.id)">
            <BaseCheckbox :model-value="isTaskSelected(task.id)"
                          @click.stop
                          class="task-checkbox" />
            <div class="task-info">
              <div class="task-header">
                <h4 class="task-name">{{ task.name }}</h4>
                <BaseChip :color="getTaskStatusColor(task.status)"
                          size="sm">
                  {{ getTaskStatusText(task.status) }}
                </BaseChip>
              </div>

              <div class="task-meta">
                <div class="meta-item">
                  <CalendarIcon class="meta-icon" />
                  <span>{{ formatTaskDate(task.createdAt) }}</span>
                </div>
                <div class="meta-item">
                  <ProgressIcon class="meta-icon" />
                  <span>Прогресс: {{ task.progress }}%</span>
                </div>
                <div class="meta-item">
                  <ServerIcon class="meta-icon" />
                  <span>{{ task.unitIds?.length || 0 }} частей</span>
                </div>
              </div>

              <p v-if="task.description" class="task-description">
                {{ task.description }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="tasks.length === 0" class="empty-state">
          <DocumentIcon class="empty-icon" />
          <p class="empty-title">Нет доступных задач для экспорта</p>
          <p class="empty-description">
            Завершите выполнение задач сканирования чтобы они стали доступны для экспорта
          </p>
        </div>
      </div>

      <!-- Настройки экспорта -->
      <div class="export-settings">
        <div class="section-header">
          <h3 class="section-title">Настройки экспорта</h3>
        </div>

        <div class="settings-grid">
          <div class="setting-group">
            <label class="setting-label required">Формат отчета</label>
            <BaseSelect v-model="exportConfig.format"
                        :options="formatOptions"
                        class="setting-control" />
            <div class="setting-hint">Выберите предпочтительный формат файла</div>
          </div>

          <div class="setting-group">
            <label class="setting-label required">Уровень детализации</label>
            <BaseSelect v-model="exportConfig.detailLevel"
                        :options="detailLevelOptions"
                        class="setting-control" />
            <div class="setting-hint">Определяет объем информации в отчете</div>
          </div>

          <div class="setting-group">
            <label class="setting-label">Включить графики</label>
            <BaseToggle v-model="exportConfig.includeCharts"
                        class="setting-toggle" />
            <div class="setting-hint">Добавить визуализацию данных в отчет</div>
          </div>

          <div class="setting-group">
            <label class="setting-label">Включить рекомендации</label>
            <BaseToggle v-model="exportConfig.includeRecommendations"
                        class="setting-toggle" />
            <div class="setting-hint">Добавить рекомендации по улучшению безопасности</div>
          </div>
        </div>

        <!-- Предпросмотр экспорта -->
        <div class="export-preview" v-if="selectedTaskIds.length > 0">
          <h4 class="preview-title">Предварительный просмотр</h4>
          <div class="preview-content">
            <div v-for="taskId in selectedTaskIds"
                 :key="taskId"
                 class="preview-item">
              <div class="preview-icon" :class="`format--${exportConfig.format}`">
                <DocumentIcon />
              </div>
              <div class="preview-info">
                <span class="preview-name">{{ getTaskName(taskId) }}</span>
                <span class="preview-format">.{{ exportConfig.format }}</span>
              </div>
              <span class="preview-size">~2.5 MB</span>
            </div>
          </div>

          <div class="preview-summary">
            <div class="summary-item">
              <span class="summary-label">Всего файлов:</span>
              <span class="summary-value">{{ selectedTaskIds.length }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Общий размер:</span>
              <span class="summary-value">~{{ (selectedTaskIds.length * 2.5).toFixed(1) }} MB</span>
            </div>
          </div>
        </div>

        <div v-else class="preview-placeholder">
          <DownloadIcon class="placeholder-icon" />
          <p class="placeholder-text">Выберите задачи для предпросмотра</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="export-actions">
        <BaseButton @click="$emit('close')"
                    variant="secondary"
                    class="action-btn">
          Отмена
        </BaseButton>

        <div class="action-info">
          <span class="tasks-count">{{ selectedTaskIds.length }} задач выбрано</span>
        </div>

        <BaseButton @click="handleGenerate"
                    variant="primary"
                    :loading="isGenerating"
                    :disabled="!canGenerate"
                    class="action-btn generate-btn">
          <DownloadIcon class="button-icon" />
          Сгенерировать отчеты
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseModal from '@/framework/ui/components/overlay/BaseModal.vue';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue';
  import BaseCheckbox from '@/framework/ui/components/forms/BaseCheckbox.vue';
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
  import {
    DocumentIcon,
    DownloadIcon,
    CalendarIcon,
    ProgressIcon,
    ServerIcon
  } from '@/assets/icons';

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

  // Computed properties
  const allTasksSelected = computed(() => {
    return (props.tasks?.length || 0) > 0 && selectedTaskIds.value.length === (props.tasks?.length || 0);
  });

  const someTasksSelected = computed(() => {
    return selectedTaskIds.value.length > 0 && selectedTaskIds.value.length < (props.tasks?.length || 0);
  });

  const canGenerate = computed(() => {
    return selectedTaskIds.value.length > 0;
  });

  // Options
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

  // Methods
  const isTaskSelected = (taskId: string): boolean => {
    return selectedTaskIds.value.includes(taskId);
  };

  const toggleTaskSelection = (taskId: string): void => {
    const index = selectedTaskIds.value.indexOf(taskId);
    if (index > -1) {
      selectedTaskIds.value.splice(index, 1);
    } else {
      selectedTaskIds.value.push(taskId);
    }
  };

  const handleSelectAllTasks = (isChecked: boolean): void => {
    if (isChecked) {
      selectedTaskIds.value = props.tasks?.map(task => task.id) || [];
    } else {
      selectedTaskIds.value = [];
    }
  };

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
    /* Custom styles for the modal container */
  }

    .report-export-dialog ::v-deep(.base-modal__container) {
      display: flex;
      flex-direction: column;
      max-height: 85vh;
    }

    .report-export-dialog ::v-deep(.base-modal__content) {
      padding: 0;
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

  .export-content {
    flex: 1;
    padding: var(--space-xl, 1.5rem);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-2xl, 2rem);
  }

  /* Selection Section */
  .selection-section {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-lg, 0.75rem);
    border: 1px solid var(--color-border, #e5e7eb);
    overflow: hidden;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg, 1.25rem);
    background: var(--color-surface-hover, #f8fafc);
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0;
    color: var(--color-text-primary, #111827);
  }

  .selection-actions {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
  }

  .selection-count {
    font-size: 0.875rem;
    color: var(--color-text-muted, #9ca3af);
    font-weight: var(--font-weight-medium, 500);
  }

  /* Tasks List */
  .tasks-list {
    display: flex;
    flex-direction: column;
    max-height: 400px;
    overflow-y: auto;
  }

  .task-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md, 1rem);
    padding: var(--space-lg, 1.25rem);
    border-bottom: 1px solid var(--color-border-light, #f3f4f6);
    cursor: pointer;
    transition: all var(--transition-fast, 0.15s);
  }

    .task-item:hover {
      background: var(--color-surface-hover, #f8fafc);
    }

  .task-item--selected {
    background: var(--color-primary-50, #eff6ff);
    border-left: 3px solid var(--color-primary, #3b82f6);
  }

  .task-item:last-child {
    border-bottom: none;
  }

  .task-checkbox {
    margin-top: 0.125rem;
    flex-shrink: 0;
  }

  .task-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.75rem);
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-md, 1rem);
  }

  .task-name {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0;
    color: var(--color-text-primary, #111827);
    flex: 1;
  }

  .task-meta {
    display: flex;
    gap: var(--space-lg, 1.5rem);
    font-size: 0.875rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 0.5rem);
    color: var(--color-text-muted, #9ca3af);
  }

  .meta-icon {
    width: 1rem;
    height: 1rem;
  }

  .task-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
    line-height: 1.4;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Export Settings */
  .export-settings {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-lg, 0.75rem);
    border: 1px solid var(--color-border, #e5e7eb);
    overflow: hidden;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-xl, 1.5rem);
    padding: var(--space-lg, 1.25rem);
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.75rem);
  }

  .setting-label {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
    font-size: 0.9rem;
  }

    .setting-label.required::after {
      content: '*';
      color: var(--color-error, #ef4444);
      margin-left: var(--space-xs, 0.5rem);
    }

  .setting-hint {
    font-size: 0.75rem;
    color: var(--color-text-muted, #9ca3af);
  }

  .setting-toggle {
    align-self: flex-start;
  }

  /* Export Preview */
  .export-preview {
    padding: var(--space-lg, 1.25rem);
    border-top: 1px solid var(--color-border, #e5e7eb);
    background: var(--color-surface-hover, #f8fafc);
  }

  .preview-title {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-lg, 1.25rem) 0;
    color: var(--color-text-primary, #111827);
  }

  .preview-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.75rem);
    margin-bottom: var(--space-lg, 1.25rem);
  }

  .preview-item {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
    padding: var(--space-md, 1rem);
    background: var(--color-surface, #fff);
    border-radius: var(--radius-md, 0.5rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .preview-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-md, 0.5rem);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .format--pdf .preview-icon {
    background: var(--color-error-light, #fee2e2);
    color: var(--color-error, #ef4444);
  }

  .format--html .preview-icon {
    background: var(--color-primary-light, #dbeafe);
    color: var(--color-primary, #3b82f6);
  }

  .format--json .preview-icon,
  .format--csv .preview-icon,
  .format--txt .preview-icon {
    background: var(--color-success-light, #d1fae5);
    color: var(--color-success, #10b981);
  }

  .preview-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 0.5rem);
  }

  .preview-name {
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-primary, #111827);
  }

  .preview-format {
    font-size: 0.875rem;
    color: var(--color-text-muted, #9ca3af);
    font-family: var(--font-family-mono, monospace);
  }

  .preview-size {
    font-size: 0.875rem;
    color: var(--color-text-muted, #9ca3af);
    font-weight: var(--font-weight-medium, 500);
  }

  .preview-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md, 1rem);
    padding-top: var(--space-md, 1rem);
    border-top: 1px solid var(--color-border, #e5e7eb);
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm, 0.75rem);
    background: var(--color-surface, #fff);
    border-radius: var(--radius-md, 0.5rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .summary-label {
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-primary, #111827);
    font-size: 0.875rem;
  }

  .summary-value {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
    font-size: 0.875rem;
  }

  .preview-placeholder {
    padding: var(--space-2xl, 2rem);
    text-align: center;
    color: var(--color-text-secondary, #6b7280);
  }

  .placeholder-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: var(--space-md, 1rem);
    opacity: 0.5;
  }

  .placeholder-text {
    margin: 0;
    font-size: 0.9rem;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: var(--space-3xl, 3rem) var(--space-2xl, 2rem);
    color: var(--color-text-secondary, #6b7280);
  }

  .empty-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: var(--space-md, 1rem);
    opacity: 0.5;
  }

  .empty-title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-sm, 0.75rem) 0;
  }

  .empty-description {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  /* Actions */
  .export-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: var(--space-lg, 1.25rem);
    border-top: 1px solid var(--color-border, #e5e7eb);
    background: var(--color-surface, #fff);
  }

  .action-info {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
  }

  .tasks-count {
    font-size: 0.875rem;
    color: var(--color-text-muted, #9ca3af);
    font-weight: var(--font-weight-medium, 500);
  }

  .action-btn {
    min-width: 140px;
  }

  .generate-btn {
    min-width: 180px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: var(--space-sm, 0.75rem);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .settings-grid {
      grid-template-columns: 1fr;
    }

    .task-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-sm, 0.75rem);
    }

    .task-meta {
      flex-direction: column;
      gap: var(--space-sm, 0.75rem);
    }

    .preview-summary {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .export-content {
      padding: var(--space-lg, 1.25rem);
      gap: var(--space-xl, 1.5rem);
    }

    .export-actions {
      flex-direction: column;
      gap: var(--space-md, 1rem);
    }

    .action-info {
      order: -1;
    }

    .action-btn {
      width: 100%;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-md, 1rem);
    }

    .selection-actions {
      align-self: flex-end;
    }
  }

  @media (max-width: 480px) {
    .export-content {
      padding: var(--space-md, 1rem);
    }

    .settings-grid {
      gap: var(--space-lg, 1.25rem);
    }

    .preview-item {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-sm, 0.75rem);
    }

    .preview-info {
      width: 100%;
    }
  }
</style>
