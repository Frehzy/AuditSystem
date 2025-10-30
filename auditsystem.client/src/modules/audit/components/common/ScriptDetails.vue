<template>
  <div class="script-details">
    <div class="details-header">
      <div class="script-icon" :class="`type--${script.type}`">
        <component :is="getScriptIcon(script.type)" />
      </div>
      <div class="script-title">
        <h2 class="script-name">{{ script.name }}</h2>
        <div class="script-meta">
          <BaseChip :color="getCategoryColor(script.category)" size="sm">
            {{ getCategoryText(script.category) }}
          </BaseChip>
          <span class="script-type" :class="`type--${script.type}`">
            {{ getTypeText(script.type) }}
          </span>
          <span class="script-version">v{{ script.version }}</span>
        </div>
      </div>
    </div>

    <div class="details-content">
      <!-- Основная информация -->
      <div class="info-section">
        <h3 class="section-title">Описание</h3>
        <p class="script-description">{{ script.description }}</p>
      </div>

      <!-- Параметры скрипта -->
      <div v-if="script.parameters.length > 0" class="info-section">
        <h3 class="section-title">Параметры</h3>
        <div class="parameters-grid">
          <div v-for="param in script.parameters"
               :key="param.name"
               class="parameter-card">
            <div class="parameter-header">
              <h4 class="parameter-name">{{ param.name }}</h4>
              <div class="parameter-tags">
                <span class="parameter-type">{{ getParameterTypeText(param.type) }}</span>
                <span v-if="param.required" class="parameter-required">Обязательный</span>
              </div>
            </div>
            <p class="parameter-description">{{ param.description }}</p>
            <div v-if="param.defaultValue !== undefined" class="parameter-default">
              <strong>По умолчанию:</strong> {{ formatDefaultValue(param.defaultValue, param.type) }}
            </div>
            <div v-if="param.options" class="parameter-options">
              <strong>Доступные значения:</strong> {{ param.options.join(', ') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Детали выполнения -->
      <div class="info-section">
        <h3 class="section-title">Детали выполнения</h3>
        <div class="execution-details">
          <div class="detail-item">
            <label class="detail-label">Тип скрипта:</label>
            <span class="detail-value">{{ getTypeText(script.type) }}</span>
          </div>
          <div class="detail-item">
            <label class="detail-label">Версия:</label>
            <span class="detail-value">{{ script.version }}</span>
          </div>
          <div class="detail-item">
            <label class="detail-label">Автор:</label>
            <span class="detail-value">{{ script.author || 'Не указан' }}</span>
          </div>
          <div class="detail-item">
            <label class="detail-label">Создан:</label>
            <span class="detail-value">{{ formatDate(script.createdAt) }}</span>
          </div>
          <div v-if="script.updatedAt" class="detail-item">
            <label class="detail-label">Обновлен:</label>
            <span class="detail-value">{{ formatDate(script.updatedAt) }}</span>
          </div>
          <div class="detail-item">
            <label class="detail-label">Таймаут:</label>
            <span class="detail-value">{{ script.timeout || 300 }} секунд</span>
          </div>
        </div>
      </div>

      <!-- Зависимости -->
      <div v-if="script.dependencies && script.dependencies.length > 0" class="info-section">
        <h3 class="section-title">Зависимости</h3>
        <div class="dependencies-list">
          <BaseChip v-for="dep in script.dependencies"
                    :key="dep"
                    color="info"
                    size="sm">
            {{ dep }}
          </BaseChip>
        </div>
      </div>

      <!-- Скрипт исправления -->
      <div v-if="hasFixScript" class="info-section">
        <h3 class="section-title">Скрипт исправления</h3>
        <div class="fix-script-info">
          <CheckCircleIcon class="fix-icon" />
          <div class="fix-content">
            <h4 class="fix-title">Доступно автоматическое исправление</h4>
            <p class="fix-description">
              Для этого скрипта проверки доступен соответствующий скрипт исправления,
              который может автоматически устранить обнаруженные проблемы.
            </p>
          </div>
        </div>
      </div>

      <!-- Пример использования -->
      <div v-if="script.usageExample" class="info-section">
        <h3 class="section-title">Пример использования</h3>
        <div class="usage-example">
          <code class="example-code">{{ script.usageExample }}</code>
        </div>
      </div>

      <!-- Примечания -->
      <div v-if="script.notes" class="info-section">
        <h3 class="section-title">Примечания</h3>
        <div class="notes-content">
          <p>{{ script.notes }}</p>
        </div>
      </div>
    </div>

    <div class="details-actions">
      <BaseButton @click="$emit('close')"
                  variant="secondary"
                  class="close-btn">
        Закрыть
      </BaseButton>
      <BaseButton v-if="script.type === 'check' && hasFixScript"
                  variant="primary"
                  class="fix-btn">
        <WrenchIcon class="button-icon" />
        Перейти к исправлению
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
  import { CheckCircleIcon, WrenchIcon, CheckScriptIcon, FixScriptIcon } from '@/assets/icons';
  import type { Script } from '../../api/audit.types';

  interface Props {
    script: Script;
  }

  interface Emits {
    (e: 'close'): void;
  }

  defineProps<Props>();
  defineEmits<Emits>();

  const getScriptIcon = (type: string) => {
    return type === 'check' ? CheckScriptIcon : FixScriptIcon;
  };

  const getCategoryText = (category: string): string => {
    const categoryMap: Record<string, string> = {
      security: 'Безопасность',
      compliance: 'Соответствие',
      performance: 'Производительность',
      custom: 'Пользовательский'
    };
    return categoryMap[category] || category;
  };

  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      security: 'error',
      compliance: 'warning',
      performance: 'info',
      custom: 'success'
    };
    return colorMap[category] || 'default';
  };

  const getTypeText = (type: string): string => {
    return type === 'check' ? 'Проверка' : 'Исправление';
  };

  const getParameterTypeText = (type: string): string => {
    const typeMap: Record<string, string> = {
      string: 'Строка',
      number: 'Число',
      boolean: 'Логический',
      select: 'Выбор'
    };
    return typeMap[type] || type;
  };

  const formatDefaultValue = (value: any, type: string): string => {
    if (type === 'boolean') {
      return value ? 'Да' : 'Нет';
    }
    return String(value);
  };

  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const hasFixScript = computed(() => {
    return Math.random() > 0.5;
  });
</script>

<style scoped>
  .script-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
    max-height: 70vh;
    overflow-y: auto;
  }

  .details-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-xl);
    padding-bottom: var(--spacing-xl);
    border-bottom: 1px solid var(--color-border);
  }

  .script-icon {
    width: 4rem;
    height: 4rem;
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .type--check .script-icon {
    background: var(--color-primary-light);
    color: var(--color-primary);
  }

  .type--fix .script-icon {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  .script-icon :deep(svg) {
    width: 2.5rem;
    height: 2.5rem;
  }

  .script-title {
    flex: 1;
  }

  .script-name {
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold, 700);
    margin: 0 0 var(--spacing-md) 0;
    color: var(--color-text-primary);
    line-height: 1.3;
  }

  .script-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex-wrap: wrap;
  }

  .script-type {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: var(--font-weight-semibold, 600);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .type--check {
    background: var(--color-primary-light);
    color: var(--color-primary);
  }

  .type--fix {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  .script-version {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium, 500);
  }

  .details-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
    flex: 1;
  }

  .info-section {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
  }

    .info-section:hover {
      box-shadow: var(--shadow-md);
    }

  .section-title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--spacing-md) 0;
    color: var(--color-text-primary);
  }

  .script-description {
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0;
    font-size: 1rem;
  }

  /* Parameters Grid */
  .parameters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-md);
  }

  .parameter-card {
    background: var(--color-surface-hover);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    border: 1px solid var(--color-border);
    transition: all var(--transition-fast);
  }

    .parameter-card:hover {
      border-color: var(--color-primary);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

  .parameter-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  .parameter-name {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0;
    color: var(--color-text-primary);
  }

  .parameter-tags {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
  }

  .parameter-type {
    font-size: 0.75rem;
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--color-info-light);
    color: var(--color-info);
    border-radius: var(--radius-sm);
    font-weight: var(--font-weight-semibold, 600);
  }

  .parameter-required {
    font-size: 0.75rem;
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--color-error-light);
    color: var(--color-error);
    border-radius: var(--radius-sm);
    font-weight: var(--font-weight-semibold, 600);
  }

  .parameter-description {
    color: var(--color-text-secondary);
    line-height: 1.4;
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 0.875rem;
  }

  .parameter-default,
  .parameter-options {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin: var(--spacing-xs) 0;
  }

  /* Execution Details */
  .execution-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-md);
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid var(--color-border-light);
  }

    .detail-item:last-child {
      border-bottom: none;
    }

  .detail-label {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
    font-size: 0.9rem;
  }

  .detail-value {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }

  /* Dependencies */
  .dependencies-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  /* Fix Script Info */
  .fix-script-info {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: var(--color-success-light);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-success);
  }

  .fix-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--color-success);
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .fix-content {
    flex: 1;
  }

  .fix-title {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--spacing-xs) 0;
    color: var(--color-success-dark);
  }

  .fix-description {
    font-size: 0.875rem;
    color: var(--color-success-dark);
    line-height: 1.4;
    margin: 0;
    opacity: 0.9;
  }

  /* Usage Example */
  .usage-example {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    border: 1px solid var(--color-border);
    overflow-x: auto;
  }

  .example-code {
    font-family: var(--font-family-mono);
    font-size: 0.875rem;
    color: var(--color-text-primary);
    white-space: pre-wrap;
    word-break: break-all;
  }

  /* Notes */
  .notes-content {
    color: var(--color-text-secondary);
    line-height: 1.6;
    font-size: 0.875rem;
  }

  /* Actions */
  .details-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
    padding-top: var(--spacing-xl);
    border-top: 1px solid var(--color-border);
  }

  .close-btn,
  .fix-btn {
    min-width: 140px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: var(--spacing-sm);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .script-details {
      gap: var(--spacing-xl);
    }

    .details-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--spacing-md);
    }

    .script-meta {
      justify-content: center;
    }

    .info-section {
      padding: var(--spacing-lg);
    }

    .parameters-grid {
      grid-template-columns: 1fr;
    }

    .execution-details {
      grid-template-columns: 1fr;
    }

    .detail-item {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-xs);
    }

    .fix-script-info {
      flex-direction: column;
      text-align: center;
    }

    .details-actions {
      flex-direction: column;
    }

    .close-btn,
    .fix-btn {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .script-name {
      font-size: 1.25rem;
    }

    .script-meta {
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .parameter-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .details-actions {
      gap: var(--spacing-sm);
    }
  }

  /* Scrollbar styling */
  .script-details::-webkit-scrollbar {
    width: 6px;
  }

  .script-details::-webkit-scrollbar-track {
    background: var(--color-surface-hover);
    border-radius: var(--radius-sm);
  }

  .script-details::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: var(--radius-sm);
  }

    .script-details::-webkit-scrollbar-thumb:hover {
      background: var(--color-text-muted);
    }

  /* Selection styling */
  .script-details ::selection {
    background: color-mix(in srgb, var(--color-primary) 30%, transparent);
    color: var(--color-text-primary);
  }

  .script-details ::-moz-selection {
    background: color-mix(in srgb, var(--color-primary) 30%, transparent);
    color: var(--color-text-primary);
  }
</style>
