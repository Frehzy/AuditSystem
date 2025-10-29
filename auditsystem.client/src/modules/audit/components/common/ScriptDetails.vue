<template>
  <div class="script-details">
    <div class="details-header">
      <div class="script-icon">
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

  // В реальном приложении эти функции должны быть импортированы из композабла
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
    // В реальном приложении здесь должна быть логика проверки наличия скрипта исправления
    return Math.random() > 0.5; // Заглушка для демонстрации
  });
</script>

<style scoped>
  .script-details {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-height: 70vh;
    overflow-y: auto;
  }

  .details-header {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .script-icon {
    width: 4rem;
    height: 4rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
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
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
  }

  .script-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .script-type {
    padding: 0.25rem 0.75rem;
    border-radius: 2rem;
    font-size: 0.75rem;
    font-weight: 600;
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
    font-weight: 500;
  }

  .details-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    flex: 1;
  }

  .info-section {
    background: var(--color-surface-hover);
    border-radius: 0.75rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
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
    gap: 1rem;
  }

  .parameter-card {
    background: var(--color-surface);
    border-radius: 0.5rem;
    padding: 1.25rem;
    border: 1px solid var(--color-border);
  }

  .parameter-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .parameter-name {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
  }

  .parameter-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .parameter-type {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: var(--color-info-light);
    color: var(--color-info);
    border-radius: 0.25rem;
    font-weight: 600;
  }

  .parameter-required {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: var(--color-error-light);
    color: var(--color-error);
    border-radius: 0.25rem;
    font-weight: 600;
  }

  .parameter-description {
    color: var(--color-text-secondary);
    line-height: 1.4;
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
  }

  .parameter-default,
  .parameter-options {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin: 0.25rem 0;
  }

  /* Execution Details */
  .execution-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-border);
  }

    .detail-item:last-child {
      border-bottom: none;
    }

  .detail-label {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .detail-value {
    color: var(--color-text-secondary);
  }

  /* Dependencies */
  .dependencies-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  /* Fix Script Info */
  .fix-script-info {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    background: var(--color-success-light);
    border-radius: 0.5rem;
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
    font-weight: 600;
    margin: 0 0 0.5rem 0;
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
    border-radius: 0.5rem;
    padding: 1.25rem;
    border: 1px solid var(--color-border);
    overflow-x: auto;
  }

  .example-code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
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
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
  }

  .close-btn,
  .fix-btn {
    min-width: 140px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: 0.5rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .script-details {
      gap: 1.5rem;
    }

    .details-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1rem;
    }

    .script-meta {
      justify-content: center;
    }

    .info-section {
      padding: 1.25rem;
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
      gap: 0.25rem;
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
</style>
