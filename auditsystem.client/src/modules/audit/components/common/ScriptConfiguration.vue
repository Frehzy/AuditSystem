<template>
  <div class="script-configuration">
    <!-- Header аналогично QuickScanConfig -->
    <div class="configuration-header">
      <h2 class="configuration-title">Настройка параметров</h2>
      <p class="configuration-description">
        Настройте параметры для скрипта "{{ script.name }}"
      </p>
    </div>

    <div class="configuration-content">
      <!-- Empty State аналогично QuickScanConfig -->
      <div v-if="script.parameters.length === 0" class="empty-state">
        <InfoIcon class="empty-icon" />
        <h3>Параметры не требуются</h3>
        <p class="empty-description">
          Этот скрипт не требует дополнительной настройки параметров.
        </p>
      </div>

      <!-- Parameters Form с улучшенной структурой -->
      <div v-else class="parameters-form">
        <div v-for="param in script.parameters"
             :key="param.name"
             class="parameter-group">
          <div class="parameter-header">
            <label class="parameter-label">
              {{ param.name }}
              <span v-if="param.required" class="required">*</span>
            </label>
            <div class="parameter-type-badge">
              <BaseChip :color="getParameterTypeColor(param.type)" size="xs">
                {{ getParameterTypeText(param.type) }}
              </BaseChip>
            </div>
          </div>

          <div class="parameter-control">
            <BaseInput v-if="param.type === 'string'"
                       v-model="localParameters[param.name]"
                       :placeholder="param.description"
                       :required="param.required"
                       class="parameter-input" />

            <BaseInput v-else-if="param.type === 'number'"
                       v-model.number="localParameters[param.name]"
                       type="number"
                       :placeholder="param.description"
                       :required="param.required"
                       class="parameter-input" />

            <BaseToggle v-else-if="param.type === 'boolean'"
                        v-model="localParameters[param.name]"
                        class="parameter-toggle" />

            <BaseSelect v-else-if="param.type === 'select'"
                        v-model="localParameters[param.name]"
                        :options="param.options?.map(opt => ({ value: opt, label: opt })) || []"
                        :placeholder="param.description"
                        :required="param.required"
                        class="parameter-select" />
          </div>

          <div class="parameter-info">
            <p class="parameter-description">{{ param.description }}</p>
            <div v-if="param.defaultValue !== undefined" class="parameter-default">
              <span class="default-label">По умолчанию:</span>
              <code class="default-value">{{ formatDefaultValue(param.defaultValue, param.type) }}</code>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions с улучшенным стилем -->
    <div class="configuration-actions">
      <BaseButton @click="$emit('close')"
                  variant="secondary"
                  class="action-btn cancel-btn">
        Отмена
      </BaseButton>
      <BaseButton @click="handleSave"
                  variant="primary"
                  :disabled="!isFormValid"
                  class="action-btn save-btn">
        <SaveIcon class="button-icon" />
        Сохранить параметры
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue';
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
  import { InfoIcon, SaveIcon } from '@/assets/icons';
  import type { Script } from '../../api/audit.types';

  interface Props {
    script: Script;
    parameters: Record<string, any>;
  }

  interface Emits {
    (e: 'save', parameters: Record<string, any>): void;
    (e: 'close'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const localParameters = ref<Record<string, any>>({});

  // Инициализация параметров
  watch(() => props.parameters, (newParameters) => {
    localParameters.value = { ...newParameters };
  }, { immediate: true });

  const getParameterTypeText = (type: string): string => {
    const typeMap: Record<string, string> = {
      string: 'Строка',
      number: 'Число',
      boolean: 'Логический',
      select: 'Выбор'
    };
    return typeMap[type] || type;
  };

  const getParameterTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      string: 'primary',
      number: 'info',
      boolean: 'warning',
      select: 'success'
    };
    return colorMap[type] || 'default';
  };

  const formatDefaultValue = (value: any, type: string): string => {
    if (type === 'boolean') {
      return value ? 'Да' : 'Нет';
    }
    return String(value);
  };

  const isFormValid = computed(() => {
    return props.script.parameters.every(param => {
      if (!param.required) return true;
      const value = localParameters.value[param.name];
      return value !== undefined && value !== null && value !== '';
    });
  });

  const handleSave = () => {
    if (!isFormValid.value) return;
    emit('save', localParameters.value);
  };
</script>

<style scoped>
  .script-configuration {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xl, 2rem);
    max-height: 70vh;
  }

  /* Header Styles аналогично QuickScanConfig */
  .configuration-header {
    text-align: center;
    padding-bottom: var(--space-lg, 1.25rem);
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  .configuration-title {
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold, 700);
    margin: 0 0 var(--space-sm, 0.75rem) 0;
    color: var(--color-text-primary, #111827);
  }

  .configuration-description {
    font-size: 1rem;
    color: var(--color-text-secondary, #6b7280);
    margin: 0;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Content Area */
  .configuration-content {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  /* Empty State аналогично QuickScanConfig */
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
    color: var(--color-text-muted, #9ca3af);
  }

  .empty-state h3 {
    font-size: 1.25rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-sm, 0.75rem) 0;
    color: var(--color-text-primary, #111827);
  }

  .empty-description {
    margin: var(--space-sm, 0.75rem) 0 0 0;
    font-size: 0.9rem;
    color: var(--color-text-secondary, #6b7280);
  }

  /* Parameters Form с улучшенным дизайном */
  .parameters-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl, 1.5rem);
  }

  .parameter-group {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-xl, 1.5rem);
    transition: all var(--transition-fast, 0.15s);
  }

    .parameter-group:hover {
      border-color: var(--color-primary, #3b82f6);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    }

  .parameter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-md, 1rem);
    gap: var(--space-md, 1rem);
  }

  .parameter-label {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
    display: block;
  }

  .required {
    color: var(--color-error, #ef4444);
    font-weight: var(--font-weight-bold, 700);
    margin-left: var(--space-xs, 0.5rem);
  }

  .parameter-type-badge {
    flex-shrink: 0;
  }

  .parameter-control {
    margin-bottom: var(--space-md, 1rem);
  }

  .parameter-input,
  .parameter-select {
    width: 100%;
    max-width: 400px;
  }

  .parameter-toggle {
    margin-top: var(--space-xs, 0.5rem);
  }

  .parameter-info {
    border-top: 1px solid var(--color-border-light, #f3f4f6);
    padding-top: var(--space-md, 1rem);
  }

  .parameter-description {
    color: var(--color-text-secondary, #6b7280);
    line-height: 1.4;
    margin: 0 0 var(--space-sm, 0.75rem) 0;
    font-size: 0.875rem;
  }

  .parameter-default {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 0.75rem);
    font-size: 0.75rem;
    color: var(--color-text-muted, #9ca3af);
  }

  .default-label {
    font-weight: var(--font-weight-medium, 500);
  }

  .default-value {
    background: var(--color-surface-hover, #f8fafc);
    padding: var(--space-xs, 0.5rem) var(--space-sm, 0.75rem);
    border-radius: var(--radius-sm, 0.375rem);
    font-family: var(--font-family-mono, 'Fira Code', monospace);
    color: var(--color-text-primary, #111827);
    font-size: 0.75rem;
  }

  /* Actions с улучшенным стилем */
  .configuration-actions {
    display: flex;
    gap: var(--space-md, 1rem);
    justify-content: flex-end;
    padding-top: var(--space-lg, 1.25rem);
    border-top: 1px solid var(--color-border, #e5e7eb);
    flex-shrink: 0;
  }

  .action-btn {
    min-width: 140px;
  }

  .save-btn {
    min-width: 180px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: var(--space-sm, 0.75rem);
  }

  /* Responsive Design аналогично QuickScanConfig */
  @media (max-width: 1024px) {
    .script-configuration {
      gap: var(--space-xl, 1.5rem);
    }

    .parameter-group {
      padding: var(--space-lg, 1.25rem);
    }

    .parameter-input,
    .parameter-select {
      max-width: 100%;
    }
  }

  @media (max-width: 768px) {
    .script-configuration {
      gap: var(--space-lg, 1.25rem);
    }

    .configuration-header {
      padding-bottom: var(--space-md, 1rem);
    }

    .configuration-title {
      font-size: 1.25rem;
    }

    .configuration-description {
      font-size: 0.9rem;
    }

    .parameter-group {
      padding: var(--space-lg, 1.25rem);
    }

    .parameter-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-sm, 0.75rem);
    }

    .configuration-actions {
      flex-direction: column;
    }

    .action-btn {
      width: 100%;
      min-width: auto;
    }

    .empty-state {
      padding: var(--space-2xl, 2rem) var(--space-lg, 1.25rem);
    }
  }

  @media (max-width: 480px) {
    .script-configuration {
      gap: var(--space-lg, 1.25rem);
    }

    .parameter-group {
      padding: var(--space-md, 1rem);
    }

    .parameter-label {
      font-size: 1rem;
    }

    .configuration-actions {
      gap: var(--space-sm, 0.75rem);
    }
  }

  /* Scrollbar styling из theme.css */
  .configuration-content::-webkit-scrollbar {
    width: 6px;
  }

  .configuration-content::-webkit-scrollbar-track {
    background: var(--color-surface-hover, #f8fafc);
    border-radius: var(--radius-sm, 0.375rem);
  }

  .configuration-content::-webkit-scrollbar-thumb {
    background: var(--color-border, #e5e7eb);
    border-radius: var(--radius-sm, 0.375rem);
  }

    .configuration-content::-webkit-scrollbar-thumb:hover {
      background: var(--color-text-muted, #9ca3af);
    }
</style>
