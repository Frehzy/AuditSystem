<!-- src/modules/audit/components/views/SettingsView.vue -->
<template>
  <div class="settings-view">
    <div class="settings-view__header">
      <h1 class="settings-view__title">Настройки системы</h1>
      <p class="settings-view__subtitle">Конфигурация параметров безопасности и мониторинга</p>
    </div>

    <div class="settings-view__content">
      <!-- Настройки сканирования -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <ScanIcon class="section-icon" />
            Настройки сканирования
          </h2>
        </div>

        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-item__label">Интервал автоматического сканирования</label>
            <BaseSelect v-model="settings.scanInterval"
                        :options="scanIntervalOptions"
                        class="setting-item__control" />
            <div class="setting-item__description">
              Как часто система будет выполнять автоматическую проверку безопасности
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-item__label">Максимальное время сканирования</label>
            <BaseInput v-model.number="settings.maxScanDuration"
                       type="number"
                       suffix="минут"
                       class="setting-item__control" />
            <div class="setting-item__description">
              Ограничение по времени для одного сканирования
            </div>
          </div>

          <div class="setting-item setting-item--toggle">
            <div class="setting-item__content">
              <label class="setting-item__label">Автоматическая отчетность</label>
              <div class="setting-item__description">
                Автоматически генерировать отчеты после сканирования
              </div>
            </div>
            <BaseToggle v-model="settings.autoReporting"
                        class="setting-item__control" />
          </div>

          <div class="setting-item setting-item--toggle">
            <div class="setting-item__content">
              <label class="setting-item__label">Глубокое сканирование</label>
              <div class="setting-item__description">
                Проверять расширенные параметры безопасности систем
              </div>
            </div>
            <BaseToggle v-model="settings.deepScan"
                        class="setting-item__control" />
          </div>
        </div>
      </div>

      <!-- Уведомления -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <BellIcon class="section-icon" />
            Уведомления
          </h2>
        </div>

        <div class="settings-grid">
          <div class="setting-item setting-item--toggle">
            <div class="setting-item__content">
              <label class="setting-item__label">Email уведомления</label>
              <div class="setting-item__description">
                Отправлять уведомления о критических уязвимостях по email
              </div>
            </div>
            <BaseToggle v-model="settings.notificationEnabled"
                        class="setting-item__control" />
          </div>

          <div class="setting-item">
            <label class="setting-item__label">Email для уведомлений</label>
            <BaseInput v-model="settings.notificationEmail"
                       type="email"
                       placeholder="audit@military-network.ru"
                       class="setting-item__control" />
            <div class="setting-item__description">
              Адрес для получения уведомлений о безопасности
            </div>
          </div>

          <div class="setting-item setting-item--toggle">
            <div class="setting-item__content">
              <label class="setting-item__label">Уведомления в реальном времени</label>
              <div class="setting-item__description">
                Мгновенные оповещения о критических инцидентах
              </div>
            </div>
            <BaseToggle v-model="settings.realtimeNotifications"
                        class="setting-item__control" />
          </div>
        </div>
      </div>

      <!-- Форматы отчетов -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <ReportIcon class="section-icon" />
            Отчеты
          </h2>
        </div>

        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-item__label">Формат отчетов по умолчанию</label>
            <BaseSelect v-model="settings.reportFormat"
                        :options="reportFormatOptions"
                        class="setting-item__control" />
            <div class="setting-item__description">
              Основной формат для генерации отчетов безопасности
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-item__label">Уровень детализации отчетов</label>
            <BaseSelect v-model="settings.reportDetailLevel"
                        :options="detailLevelOptions"
                        class="setting-item__control" />
            <div class="setting-item__description">
              Детальность информации в генерируемых отчетах
            </div>
          </div>

          <div class="setting-item setting-item--toggle">
            <div class="setting-item__content">
              <label class="setting-item__label">Автоматическая архивация</label>
              <div class="setting-item__description">
                Автоматически архивировать отчеты старше 30 дней
              </div>
            </div>
            <BaseToggle v-model="settings.autoArchive"
                        class="setting-item__control" />
          </div>
        </div>
      </div>

      <!-- Управление войсковыми частями -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <ServerIcon class="section-icon" />
            Управление войсковыми частями
          </h2>
        </div>

        <div class="units-management">
          <div class="units-list">
            <div v-for="unit in units"
                 :key="unit.id"
                 class="unit-management-item">
              <div class="unit-info">
                <h3 class="unit-name">{{ unit.name }}</h3>
                <div class="unit-details">
                  <span class="unit-location">{{ unit.location }}</span>
                  <span class="unit-subnets">{{ unit.subnets.length }} подсетей</span>
                  <span class="unit-status" :class="`status--${unit.status}`">
                    {{ getStatusText(unit.status) }}
                  </span>
                </div>
              </div>

              <div class="unit-actions">
                <BaseButton @click="editUnit(unit)" variant="secondary" size="sm">
                  <EditIcon class="button-icon" />
                  Редактировать
                </BaseButton>
                <BaseButton @click="deleteUnit(unit)" variant="text" size="sm" color="error">
                  <DeleteIcon class="button-icon" />
                  Удалить
                </BaseButton>
              </div>
            </div>
          </div>

          <div class="units-actions">
            <BaseButton @click="showCreateUnitDialog" variant="primary" class="add-unit-btn">
              <PlusIcon class="button-icon" />
              Добавить войсковую часть
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Действия -->
      <div class="settings-actions">
        <BaseButton @click="saveSettings"
                    variant="primary"
                    :loading="isSaving"
                    size="lg"
                    class="save-btn">
          <SaveIcon class="button-icon" />
          Сохранить настройки
        </BaseButton>

        <BaseButton @click="resetToDefaults"
                    variant="secondary"
                    class="reset-btn">
          <ResetIcon class="button-icon" />
          Сбросить к умолчаниям
        </BaseButton>

        <BaseButton @click="exportSettings"
                    variant="text"
                    class="export-btn">
          <DownloadIcon class="button-icon" />
          Экспорт настроек
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import BaseButton from '@/framework/ui/BaseButton.vue';
  import BaseInput from '@/framework/ui/BaseInput.vue';
  import BaseSelect from '@/framework/ui/BaseSelect.vue';
  import BaseToggle from '@/framework/ui/BaseToggle.vue';
  import {
    ScanIcon,
    BellIcon,
    ReportIcon,
    ServerIcon,
    PlusIcon,
    EditIcon,
    DeleteIcon,
    SaveIcon,
    ResetIcon,
    DownloadIcon
  } from '@/assets/icons';
  import { useAudit } from '@/modules/audit/composables/useAudit';
  import type { MilitaryUnit, AuditSettings } from '@/modules/audit/api/audit.types';

  const audit = useAudit();

  const isSaving = ref(false);
  const localSettings = ref<AuditSettings>({
    scanInterval: 3600000,
    autoReporting: true,
    notificationEnabled: true,
    reportFormat: 'pdf',
    maxScanDuration: 1800000,
    deepScan: false,
    notificationEmail: '',
    realtimeNotifications: true,
    reportDetailLevel: 'detailed',
    autoArchive: true
  });

  const settings = computed({
    get: () => localSettings.value,
    set: (value) => {
      localSettings.value = value;
    }
  });

  const units = computed(() => audit.units.value);

  const scanIntervalOptions = [
    { value: 900000, label: '15 минут' },
    { value: 1800000, label: '30 минут' },
    { value: 3600000, label: '1 час' },
    { value: 7200000, label: '2 часа' },
    { value: 21600000, label: '6 часов' },
    { value: 43200000, label: '12 часов' },
    { value: 86400000, label: '24 часа' }
  ];

  const reportFormatOptions = [
    { value: 'pdf', label: 'PDF документ' },
    { value: 'html', label: 'HTML страница' },
    { value: 'json', label: 'JSON данные' },
    { value: 'xml', label: 'XML формат' }
  ];

  const detailLevelOptions = [
    { value: 'basic', label: 'Базовый' },
    { value: 'detailed', label: 'Детальный' },
    { value: 'comprehensive', label: 'Полный' }
  ];

  const saveSettings = async (): Promise<void> => {
    isSaving.value = true;
    try {
      await audit.updateSettings(settings.value);
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      isSaving.value = false;
    }
  };

  const resetToDefaults = (): void => {
    localSettings.value = {
      scanInterval: 3600000,
      autoReporting: true,
      notificationEnabled: true,
      reportFormat: 'pdf',
      maxScanDuration: 1800000,
      deepScan: false,
      notificationEmail: '',
      realtimeNotifications: true,
      reportDetailLevel: 'detailed',
      autoArchive: true
    };
  };

  const exportSettings = (): void => {
    const dataStr = JSON.stringify(settings.value, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'military-audit-settings.json';
    link.click();
  };

  const showCreateUnitDialog = (): void => {
    console.log('Show create unit dialog');
  };

  const editUnit = (unit: MilitaryUnit): void => {
    console.log('Edit unit:', unit);
  };

  const deleteUnit = (unit: MilitaryUnit): void => {
    if (confirm(`Вы уверены, что хотите удалить войсковую часть "${unit.name}"?`)) {
      console.log('Delete unit:', unit);
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      active: 'Активна',
      deployed: 'На выезде',
      headquarters: 'Штаб'
    };
    return statusMap[status] || status;
  };

  onMounted(() => {
    audit.loadMilitaryUnits();
    audit.loadSettings().then(() => {
      localSettings.value = { ...audit.settings.value };
    });
  });
</script>

<style scoped>
  .settings-view {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .settings-view__header {
    text-align: center;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .settings-view__title {
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 0.75rem 0;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.025em;
  }

  .settings-view__subtitle {
    font-size: 1.25rem;
    color: var(--color-text-secondary);
    margin: 0;
    font-weight: 400;
  }

  .settings-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
  }

    .settings-section:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    }

  .section-header {
    margin-bottom: 1.75rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
  }

  .section-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--color-primary);
  }

  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .setting-item {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.5rem;
    background: var(--color-surface-hover);
    border-radius: 1rem;
    border: 1px solid transparent;
    transition: all 0.3s ease;
  }

    .setting-item:hover {
      border-color: var(--color-border);
      transform: translateX(4px);
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
    margin-bottom: 0.375rem;
    display: block;
    color: var(--color-text-primary);
    font-size: 1rem;
  }

  .setting-item__description {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    line-height: 1.5;
  }

  .setting-item__control {
    min-width: 200px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: 0.5rem;
  }

  /* Управление войсковыми частями */
  .units-management {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .units-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .unit-management-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: var(--color-surface-hover);
    border-radius: 1rem;
    border: 1px solid var(--color-border);
    transition: all 0.3s ease;
  }

    .unit-management-item:hover {
      border-color: var(--color-primary);
      transform: translateX(4px);
    }

  .unit-info {
    flex: 1;
  }

  .unit-name {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0 0 0.75rem 0;
    color: var(--color-text-primary);
  }

  .unit-details {
    display: flex;
    gap: 1.5rem;
    font-size: 0.9rem;
  }

  .unit-location {
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .unit-subnets {
    color: var(--color-text-muted);
  }

  .unit-status {
    padding: 0.25rem 0.75rem;
    border-radius: 2rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status--active {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  .status--deployed {
    background: var(--color-warning-light);
    color: var(--color-warning);
  }

  .status--headquarters {
    background: var(--color-primary-light);
    color: var(--color-primary);
  }

  .unit-actions {
    display: flex;
    gap: 0.75rem;
  }

  .units-actions {
    display: flex;
    justify-content: center;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
  }

  .add-unit-btn {
    transition: all 0.3s ease;
  }

    .add-unit-btn:hover {
      transform: translateY(-2px);
    }

  /* Действия с настройками */
  .settings-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
  }

  .save-btn,
  .reset-btn,
  .export-btn {
    transition: all 0.3s ease;
  }

    .save-btn:hover,
    .reset-btn:hover,
    .export-btn:hover {
      transform: translateY(-2px);
    }

  /* Responsive */
  @media (max-width: 1200px) {
    .settings-view__title {
      font-size: 2rem;
    }

    .settings-section {
      padding: 1.75rem;
    }
  }

  @media (max-width: 1024px) {
    .settings-view__title {
      font-size: 1.75rem;
    }

    .settings-view__subtitle {
      font-size: 1.125rem;
    }

    .settings-section {
      padding: 1.5rem;
    }

    .section-title {
      font-size: 1.25rem;
    }

    .setting-item--toggle {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .setting-item__control {
      min-width: auto;
    }
  }

  @media (max-width: 900px) {
    .settings-view {
      gap: 1.5rem;
    }

    .settings-actions {
      flex-direction: column;
    }

    .unit-management-item {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .unit-details {
      flex-direction: column;
      gap: 0.5rem;
    }

    .unit-actions {
      justify-content: flex-end;
    }
  }

  @media (max-width: 800px) {
    .settings-view__title {
      font-size: 1.5rem;
    }

    .settings-view__subtitle {
      font-size: 1rem;
    }

    .settings-section {
      padding: 1.25rem;
      border-radius: 1rem;
    }

    .setting-item {
      padding: 1.25rem;
    }

    .section-title {
      font-size: 1.125rem;
    }
  }
</style>
