<template>
  <div class="settings-tab">
    <div class="tab-header">
      <h2 class="tab-title">
        <ScanIcon class="tab-title-icon" />
        Сканирование и отчеты
      </h2>
      <p class="tab-description">Настройки сканирования и генерации отчетов</p>
    </div>

    <div class="settings-grid">
      <div class="setting-card">
        <div class="setting-header">
          <ReportIcon class="setting-icon" />
          <div class="setting-info">
            <h3 class="setting-title">Автоматические отчеты</h3>
            <p class="setting-description">Генерация отчетов после завершения сканирования</p>
          </div>
          <BaseToggle v-model="settings.autoReporting" class="setting-toggle" />
        </div>

        <div v-if="settings.autoReporting" class="setting-details">
          <div class="setting-row">
            <label class="setting-label">Формат отчета</label>
            <BaseSelect v-model="settings.reportFormat"
                        :options="reportFormatOptions"
                        size="sm" />
          </div>
          <div class="setting-row">
            <label class="setting-label">Уровень детализации</label>
            <BaseSelect v-model="settings.reportDetailLevel"
                        :options="detailLevelOptions"
                        size="sm" />
          </div>
        </div>
      </div>

      <div class="setting-card">
        <div class="setting-header">
          <ClockIcon class="setting-icon" />
          <div class="setting-info">
            <h3 class="setting-title">Ограничение времени сканирования</h3>
            <p class="setting-description">Максимальное время выполнения одного сканирования</p>
          </div>
        </div>
        <div class="setting-details">
          <div class="setting-row">
            <label class="setting-label">Максимальное время (минут)</label>
            <BaseInput v-model.number="settings.maxScanDuration"
                       type="number"
                       min="1"
                       max="480"
                       size="sm" />
          </div>
        </div>
      </div>

      <div class="setting-card">
        <div class="setting-header">
          <ArchiveIcon class="setting-icon" />
          <div class="setting-info">
            <h3 class="setting-title">Автоархивация отчетов</h3>
            <p class="setting-description">Автоматическое архивирование старых отчетов для экономии места</p>
          </div>
          <BaseToggle v-model="settings.autoArchive" class="setting-toggle" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue';
import { ScanIcon, ReportIcon, ClockIcon, ArchiveIcon } from '@/assets/icons';
import type { AuditSettings } from '../../../api/audit.types';

interface Props {
  settings: AuditSettings;
}

defineProps<Props>();

const reportFormatOptions = [
  { value: 'pdf', label: 'PDF документ' },
  { value: 'html', label: 'HTML страница' },
  { value: 'json', label: 'JSON данные' },
  { value: 'csv', label: 'CSV таблица' }
];

const detailLevelOptions = [
  { value: 'basic', label: 'Базовый' },
  { value: 'detailed', label: 'Детальный' },
  { value: 'comprehensive', label: 'Полный' }
];
</script>

<style scoped>
  .settings-tab {
    animation: fadeIn 0.3s ease-out;
  }

  .tab-header {
    margin-bottom: var(--spacing-2xl);
  }

  .tab-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--color-text-primary);
  }

  .tab-title-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--color-primary);
  }

  .tab-description {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .setting-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--spacing-xl);
    transition: all var(--transition-normal);
  }

    .setting-card:hover {
      box-shadow: var(--shadow-md);
      border-color: var(--color-primary-light);
    }

  .setting-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .setting-icon {
    width: 2rem;
    height: 2rem;
    color: var(--color-primary);
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .setting-info {
    flex: 1;
  }

  .setting-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 var(--spacing-xs) 0;
    color: var(--color-text-primary);
  }

  .setting-description {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .setting-toggle {
    flex-shrink: 0;
  }

  .setting-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-border);
  }

  .setting-row {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--spacing-lg);
    align-items: start;
  }

  .setting-label {
    font-weight: 500;
    color: var(--color-text-primary);
    padding-top: var(--spacing-xs);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 1024px) {
    .setting-row {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }
  }

  @media (max-width: 768px) {
    .setting-header {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-md);
    }

    .setting-info {
      text-align: center;
    }
  }
</style>
