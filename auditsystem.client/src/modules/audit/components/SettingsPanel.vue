<template>

  <div class="settings-panel">
    <div class="settings-panel__header"> <h1 class="settings-panel__title">Настройки аудита</h1> <p class="settings-panel__subtitle">Конфигурация системы безопасности Astra Linux</p> </div>
    <div class="settings-panel__content">
      <!-- Настройки сканирования -->
      <div class="settings-section">
        <h3 class="settings-section__title">
          <ScanIcon class="settings-section__icon" />
          Настройки сканирования
        </h3>

        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-item__label">Интервал сканирования</label>
            <BaseSelect v-model="settings.scanInterval"
                        :options="scanIntervalOptions"
                        class="setting-item__control" />
            <div class="setting-item__description">
              Как часто выполнять автоматическое сканирование системы
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-item__label">Глубина сканирования</label>
            <BaseSelect v-model="settings.scanDepth"
                        :options="scanDepthOptions"
                        class="setting-item__control" />
            <div class="setting-item__description">
              Уровень детализации при проверке системы
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-item__label">Макс. время сканирования</label>
            <BaseInput v-model="settings.maxScanDuration"
                       type="number"
                       suffix="минут"
                       class="setting-item__control" />
            <div class="setting-item__description">
              Максимальное время выполнения одного сканирования
            </div>
          </div>
        </div>
      </div>

      <!-- Уведомления -->
      <div class="settings-section">
        <h3 class="settings-section__title">
          <BellIcon class="settings-section__icon" />
          Уведомления
        </h3>

        <div class="settings-grid">
          <div class="setting-item setting-item--toggle">
            <div class="setting-item__content">
              <label class="setting-item__label">Уведомления по email</label>
              <div class="setting-item__description">
                Отправлять уведомления о критических уязвимостях
              </div>
            </div>
            <BaseToggle v-model="settings.notificationEnabled"
                        class="setting-item__control" />
          </div>

          <div class="setting-item setting-item--toggle">
            <div class="setting-item__content">
              <label class="setting-item__label">Автоматическое исправление</label>
              <div class="setting-item__description">
                Автоматически применять безопасные исправления
              </div>
            </div>
            <BaseToggle v-model="settings.autoRemediation"
                        class="setting-item__control" />
          </div>
        </div>
      </div>

      <!-- Форматы отчетов -->
      <div class="settings-section">
        <h3 class="settings-section__title">
          <ReportIcon class="settings-section__icon" />
          Отчеты
        </h3>

        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-item__label">Формат отчета</label>
            <BaseSelect v-model="settings.reportFormat"
                        :options="reportFormatOptions"
                        class="setting-item__control" />
            <div class="setting-item__description">
              Формат генерируемых отчетов безопасности
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-item__label">Исключенные пути</label>
            <BaseTextarea v-model="excludedPathsText"
                          placeholder="/proc&#10;/sys&#10;/dev"
                          rows="4"
                          class="setting-item__control" />
            <div class="setting-item__description">
              Пути, исключенные из сканирования (по одному на строку)
            </div>
          </div>
        </div>
      </div>

      <!-- Действия -->
      <div class="settings-actions">
        <BaseButton @click="saveSettings" variant="primary" :loading="isSaving">
          Сохранить настройки
        </BaseButton>
        <BaseButton @click="resetToDefaults" variant="text">
          Сбросить к умолчаниям
        </BaseButton>
        <BaseButton @click="exportSettings" variant="secondary">
          Экспорт настроек
        </BaseButton>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">import { ref, computed, onMounted } from 'vue'; import { BaseSelect, BaseInput, BaseTextarea, BaseToggle, BaseButton } from '@/framework/ui'; import { ScanIcon, BellIcon, ReportIcon } from '@/assets/icons'; import { useAudit } from '../composables/useAudit'; import type { AuditSettings } from '../api/audit.types'; const audit = useAudit(); const isSaving = ref(false); const settings = ref<AuditSettings>({ scanInterval: 3600000, autoRemediation: false, notificationEnabled: true, reportFormat: 'pdf', scanDepth: 'standard', excludedPaths: ['/proc', '/sys', '/dev'], maxScanDuration: 1800000 }); const scanIntervalOptions = [ { value: 900000, label: '15 минут' }, { value: 1800000, label: '30 минут' }, { value: 3600000, label: '1 час' }, { value: 7200000, label: '2 часа' }, { value: 21600000, label: '6 часов' } ]; const scanDepthOptions = [ { value: 'basic', label: 'Базовый' }, { value: 'standard', label: 'Стандартный' }, { value: 'deep', label: 'Глубокий' } ]; const reportFormatOptions = [ { value: 'pdf', label: 'PDF' }, { value: 'html', label: 'HTML' }, { value: 'json', label: 'JSON' } ]; const excludedPathsText = computed({ get: () => settings.value.excludedPaths.join('\n'), set: (value: string) => { settings.value.excludedPaths = value.split('\n').filter(path => path.trim()); } }); const saveSettings = async (): Promise<void> => { isSaving.value = true; try { await audit.updateSettings(settings.value); console.log('Settings saved successfully'); } catch (error) { console.error('Failed to save settings:', error); } finally { isSaving.value = false; } }; const resetToDefaults = (): void => { settings.value = { scanInterval: 3600000, autoRemediation: false, notificationEnabled: true, reportFormat: 'pdf', scanDepth: 'standard', excludedPaths: ['/proc', '/sys', '/dev'], maxScanDuration: 1800000 }; }; const exportSettings = (): void => { const dataStr = JSON.stringify(settings.value, null, 2); const dataBlob = new Blob([dataStr], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(dataBlob); link.download = 'astra-audit-settings.json'; link.click(); }; onMounted(() => { // Загрузка текущих настроек settings.value = { ...audit.settings.value }; });</script>
<style scoped>
  .settings-panel {
    max-width: 800px;
  }

  .settings-panel__header {
    margin-bottom: 32px;
  }

  .settings-panel__title {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 8px 0;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .settings-panel__subtitle {
    font-size: 16px;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .settings-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
  }

  .settings-section__title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 20px 0;
  }

  .settings-section__icon {
    width: 20px;
    height: 20px;
    color: var(--color-primary);
  }

  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .setting-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .setting-item--toggle {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .setting-item__content {
    flex: 1;
  }

  .setting-item__label {
    font-weight: 600;
    margin-bottom: 4px;
    display: block;
  }

  .setting-item__description {
    font-size: 14px;
    color: var(--color-text-muted);
    line-height: 1.4;
  }

  .setting-item__control {
    min-width: 200px;
  }

  .settings-actions {
    display: flex;
    gap: 12px;
    padding-top: 24px;
    border-top: 1px solid var(--color-border);
  }
  /* Адаптивность */

  @media (max-width: 768px) {
    .setting-item--toggle {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .settings-actions {
      flex-direction: column;
    }
  }

  @media (max-width: 480px) {
    .settings-section {
      padding: 16px;
    }

    .settings-panel__title {
      font-size: 24px;
    }
  }
</style>
