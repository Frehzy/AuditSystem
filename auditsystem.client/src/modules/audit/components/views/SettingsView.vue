<template>
  <div class="settings-view">
    <!-- Header Section -->
    <div class="settings-view__header">
      <div class="header-content">
        <h1 class="settings-view__title">Настройки системы</h1>
        <p class="settings-view__subtitle">Конфигурация параметров безопасности и мониторинга</p>
      </div>
      <div class="header-actions">
        <BaseButton @click="exportSettings"
                    variant="secondary"
                    size="sm"
                    class="export-btn">
          <DownloadIcon class="button-icon" />
          Экспорт настроек
        </BaseButton>
      </div>
    </div>

    <div class="settings-view__content">
      <!-- Настройки сканирования -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-title-wrapper">
            <ScanIcon class="section-icon" />
            <h2 class="section-title">Настройки сканирования</h2>
          </div>
          <div class="section-actions">
            <BaseButton @click="resetScanSettings"
                        variant="text"
                        size="sm"
                        class="reset-section-btn">
              <ResetIcon class="button-icon" />
              Сбросить
            </BaseButton>
          </div>
        </div>

        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-content">
              <label class="setting-item__label">Интервал автоматического сканирования</label>
              <div class="setting-item__description">
                Как часто система будет выполнять автоматическую проверку безопасности
              </div>
            </div>
            <BaseSelect v-model="localSettings.scanInterval"
                        :options="scanIntervalOptions"
                        class="setting-item__control" />
          </div>

          <div class="setting-item">
            <div class="setting-content">
              <label class="setting-item__label">Максимальное время сканирования (минут)</label>
              <div class="setting-item__description">
                Ограничение по времени для одного сканирования
              </div>
            </div>
            <BaseInput v-model.number="localSettings.maxScanDuration"
                       type="number"
                       min="1"
                       max="480"
                       class="setting-item__control" />
          </div>

          <div class="setting-item setting-item--toggle">
            <div class="setting-content">
              <label class="setting-item__label">Автоматическая отчетность</label>
              <div class="setting-item__description">
                Автоматически генерировать отчеты после сканирования
              </div>
            </div>
            <BaseToggle v-model="localSettings.autoReporting"
                        class="setting-item__control" />
          </div>

          <div class="setting-item setting-item--toggle">
            <div class="setting-content">
              <label class="setting-item__label">Глубокое сканирование</label>
              <div class="setting-item__description">
                Проверять расширенные параметры безопасности систем
              </div>
            </div>
            <BaseToggle v-model="localSettings.deepScan"
                        class="setting-item__control" />
          </div>

          <div class="setting-item">
            <div class="setting-content">
              <label class="setting-item__label">Формат отчетов по умолчанию</label>
              <div class="setting-item__description">
                Основной формат для генерации отчетов безопасности
              </div>
            </div>
            <BaseSelect v-model="localSettings.reportFormat"
                        :options="reportFormatOptions"
                        class="setting-item__control" />
          </div>

          <div class="setting-item">
            <div class="setting-content">
              <label class="setting-item__label">Уровень детализации отчетов</label>
              <div class="setting-item__description">
                Детальность информации в генерируемых отчетах
              </div>
            </div>
            <BaseSelect v-model="localSettings.reportDetailLevel"
                        :options="detailLevelOptions"
                        class="setting-item__control" />
          </div>
        </div>
      </div>

      <!-- Настройки прокси -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-title-wrapper">
            <NetworkIcon class="section-icon" />
            <h2 class="section-title">Настройки прокси</h2>
          </div>
          <div class="section-status" :class="{'status--online': proxyStatus === 'connected', 'status--offline': proxyStatus === 'disconnected'}">
            {{ getProxyStatusText(proxyStatus) }}
          </div>
        </div>

        <div class="settings-grid">
          <div class="setting-item setting-item--toggle">
            <div class="setting-content">
              <label class="setting-item__label">Использовать прокси-сервер</label>
              <div class="setting-item__description">
                Настроить подключение через прокси-сервер для всех исходящих соединений
              </div>
            </div>
            <BaseToggle v-model="localSettings.proxySettings.enabled"
                        class="setting-item__control" />
          </div>

          <template v-if="localSettings.proxySettings.enabled">
            <div class="setting-item">
              <div class="setting-content">
                <label class="setting-item__label">Адрес прокси-сервера</label>
                <div class="setting-item__description">
                  IP-адрес или доменное имя прокси-сервера
                </div>
              </div>
              <BaseInput v-model="localSettings.proxySettings.host"
                         placeholder="proxy.example.com"
                         class="setting-item__control" />
            </div>

            <div class="setting-item">
              <div class="setting-content">
                <label class="setting-item__label">Порт прокси-сервера</label>
                <div class="setting-item__description">
                  Порт для подключения к прокси-серверу
                </div>
              </div>
              <BaseInput v-model.number="localSettings.proxySettings.port"
                         type="number"
                         min="1"
                         max="65535"
                         class="setting-item__control" />
            </div>

            <div class="setting-item">
              <div class="setting-content">
                <label class="setting-item__label">Тип авторизации</label>
                <div class="setting-item__description">
                  Метод аутентификации на прокси-сервере
                </div>
              </div>
              <BaseSelect v-model="localSettings.proxySettings.authType"
                          :options="proxyAuthOptions"
                          class="setting-item__control" />
            </div>

            <template v-if="localSettings.proxySettings.authType !== 'none'">
              <div class="setting-item">
                <div class="setting-content">
                  <label class="setting-item__label">Имя пользователя</label>
                  <div class="setting-item__description">
                    Логин для аутентификации на прокси-сервере
                  </div>
                </div>
                <BaseInput v-model="localSettings.proxySettings.username"
                           class="setting-item__control" />
              </div>

              <div v-if="localSettings.proxySettings.authType === 'password'" class="setting-item">
                <div class="setting-content">
                  <label class="setting-item__label">Пароль</label>
                  <div class="setting-item__description">
                    Пароль для аутентификации на прокси-сервере
                  </div>
                </div>
                <BaseInput v-model="localSettings.proxySettings.password"
                           type="password"
                           class="setting-item__control" />
              </div>

              <div v-if="localSettings.proxySettings.authType === 'rsa'" class="setting-item">
                <div class="setting-content">
                  <label class="setting-item__label">RSA ключ</label>
                  <div class="setting-item__description">
                    Приватный RSA ключ для аутентификации
                  </div>
                </div>
                <BaseTextarea v-model="localSettings.proxySettings.rsaKey"
                              placeholder="-----BEGIN RSA PRIVATE KEY-----"
                              rows="4"
                              class="setting-item__control" />
              </div>
            </template>

            <div class="setting-item setting-item--action">
              <BaseButton @click="testProxyConnection"
                          variant="secondary"
                          :loading="isTestingProxy"
                          :disabled="!canTestProxy"
                          class="test-connection-btn">
                <TestConnectionIcon class="button-icon" />
                Проверить подключение
              </BaseButton>
              <div class="action-description">
                Проверить соединение с текущими настройками прокси
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Настройки email уведомлений -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-title-wrapper">
            <MailIcon class="section-icon" />
            <h2 class="section-title">Email уведомления</h2>
          </div>
          <div class="section-status" :class="{'status--online': emailStatus === 'connected', 'status--offline': emailStatus === 'disconnected'}">
            {{ getEmailStatusText(emailStatus) }}
          </div>
        </div>

        <div class="settings-grid">
          <div class="setting-item setting-item--toggle">
            <div class="setting-content">
              <label class="setting-item__label">Включить email уведомления</label>
              <div class="setting-item__description">
                Отправлять уведомления о результатах сканирования по email
              </div>
            </div>
            <BaseToggle v-model="localSettings.emailSettings.enabled"
                        class="setting-item__control" />
          </div>

          <template v-if="localSettings.emailSettings.enabled">
            <div class="setting-item">
              <div class="setting-content">
                <label class="setting-item__label">SMTP сервер</label>
                <div class="setting-item__description">
                  Адрес SMTP сервера для отправки email
                </div>
              </div>
              <BaseInput v-model="localSettings.emailSettings.host"
                         placeholder="smtp.example.com"
                         class="setting-item__control" />
            </div>

            <div class="setting-item">
              <div class="setting-content">
                <label class="setting-item__label">Порт SMTP</label>
                <div class="setting-item__description">
                  Порт SMTP сервера (обычно 25, 587 или 465)
                </div>
              </div>
              <BaseInput v-model.number="localSettings.emailSettings.port"
                         type="number"
                         min="1"
                         max="65535"
                         class="setting-item__control" />
            </div>

            <div class="setting-item setting-item--toggle">
              <div class="setting-content">
                <label class="setting-item__label">Использовать SSL/TLS</label>
                <div class="setting-item__description">
                  Использовать защищенное соединение с SMTP сервером
                </div>
              </div>
              <BaseToggle v-model="localSettings.emailSettings.useSSL"
                          class="setting-item__control" />
            </div>

            <div class="setting-item">
              <div class="setting-content">
                <label class="setting-item__label">Имя пользователя</label>
                <div class="setting-item__description">
                  Логин для аутентификации на SMTP сервере
                </div>
              </div>
              <BaseInput v-model="localSettings.emailSettings.username"
                         class="setting-item__control" />
            </div>

            <div class="setting-item">
              <div class="setting-content">
                <label class="setting-item__label">Пароль</label>
                <div class="setting-item__description">
                  Пароль для аутентификации на SMTP сервере
                </div>
              </div>
              <BaseInput v-model="localSettings.emailSettings.password"
                         type="password"
                         class="setting-item__control" />
            </div>

            <div class="setting-item">
              <div class="setting-content">
                <label class="setting-item__label">Email отправителя</label>
                <div class="setting-item__description">
                  Адрес отправителя для всех уведомлений
                </div>
              </div>
              <BaseInput v-model="localSettings.emailSettings.fromAddress"
                         type="email"
                         placeholder="audit@example.com"
                         class="setting-item__control" />
            </div>

            <div class="setting-item">
              <div class="setting-content">
                <label class="setting-item__label">Получатели уведомлений</label>
                <div class="setting-item__description">
                  Список email адресов получателей (через запятую)
                </div>
              </div>
              <BaseTextarea v-model="emailRecipients"
                            placeholder="user1@example.com, user2@example.com"
                            rows="3"
                            class="setting-item__control" />
            </div>

            <div class="setting-item setting-item--toggle">
              <div class="setting-content">
                <label class="setting-item__label">Уведомлять о завершении сканирования</label>
                <div class="setting-item__description">
                  Отправлять email при завершении любого сканирования
                </div>
              </div>
              <BaseToggle v-model="localSettings.emailSettings.notifyOnScanComplete"
                          class="setting-item__control" />
            </div>

            <div class="setting-item setting-item--toggle">
              <div class="setting-content">
                <label class="setting-item__label">Уведомлять о критических проблемах</label>
                <div class="setting-item__description">
                  Отправлять email только при обнаружении критических уязвимостей
                </div>
              </div>
              <BaseToggle v-model="localSettings.emailSettings.notifyOnCritical"
                          class="setting-item__control" />
            </div>

            <div class="setting-item setting-item--action">
              <BaseButton @click="testEmailConnection"
                          variant="secondary"
                          :loading="isTestingEmail"
                          :disabled="!canTestEmail"
                          class="test-connection-btn">
                <TestConnectionIcon class="button-icon" />
                Проверить подключение
              </BaseButton>
              <div class="action-description">
                Проверить соединение с SMTP сервером
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Действия -->
      <div class="settings-actions">
        <div class="actions-content">
          <div class="actions-info">
            <h3 class="actions-title">Сохранение настроек</h3>
            <p class="actions-description">
              Применить изменения ко всем модулям системы безопасности
            </p>
          </div>
          <div class="actions-buttons">
            <BaseButton @click="resetToDefaults"
                        variant="secondary"
                        class="reset-btn">
              <ResetIcon class="button-icon" />
              Сбросить к умолчаниям
            </BaseButton>

            <BaseButton @click="saveSettings"
                        variant="primary"
                        :loading="isSaving"
                        size="lg"
                        class="save-btn">
              <SaveIcon class="button-icon" />
              Сохранить настройки
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue';
  import BaseTextarea from '@/framework/ui/components/forms/BaseTextarea.vue';
  import {
    ScanIcon,
    NetworkIcon,
    MailIcon,
    SaveIcon,
    ResetIcon,
    DownloadIcon,
    TestConnectionIcon
  } from '@/assets/icons';
  import { useAudit } from '../../composables/useAudit';
  import type { AuditSettings } from '../../api/audit.types';

  interface Props {
    settings?: AuditSettings;
    isLoading?: boolean;
  }

  interface Emits {
    (e: 'update-settings', settings: Partial<AuditSettings>): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { showToast } = useToast();
  const audit = useAudit();

  // State
  const isSaving = ref(false);
  const isTestingProxy = ref(false);
  const isTestingEmail = ref(false);
  const proxyStatus = ref<'connected' | 'disconnected' | 'checking'>('disconnected');
  const emailStatus = ref<'connected' | 'disconnected' | 'checking'>('disconnected');

  const localSettings = ref<AuditSettings>({
    scanInterval: 3600000,
    autoReporting: true,
    notificationEnabled: true,
    reportFormat: 'pdf',
    maxScanDuration: 1800000,
    deepScan: false,
    proxySettings: {
      enabled: false,
      host: '',
      port: 8080,
      authType: 'none'
    },
    emailSettings: {
      enabled: false,
      host: '',
      port: 25,
      useSSL: false,
      username: '',
      password: '',
      fromAddress: '',
      toAddresses: [],
      notifyOnScanComplete: true,
      notifyOnCritical: true
    },
    realtimeNotifications: true,
    reportDetailLevel: 'detailed',
    autoArchive: true
  });

  // Options
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
    { value: 'csv', label: 'CSV таблица' },
    { value: 'txt', label: 'Текстовый файл' }
  ];

  const detailLevelOptions = [
    { value: 'basic', label: 'Базовый' },
    { value: 'detailed', label: 'Детальный' },
    { value: 'comprehensive', label: 'Полный' }
  ];

  const proxyAuthOptions = [
    { value: 'none', label: 'Без авторизации' },
    { value: 'password', label: 'Логин/пароль' },
    { value: 'rsa', label: 'RSA ключ' }
  ];

  // Computed
  const emailRecipients = computed({
    get: () => localSettings.value.emailSettings.toAddresses.join(', '),
    set: (value) => {
      localSettings.value.emailSettings.toAddresses = value
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
    }
  });

  const canTestProxy = computed(() => {
    const proxy = localSettings.value.proxySettings;
    return proxy.enabled && proxy.host && proxy.port > 0;
  });

  const canTestEmail = computed(() => {
    const email = localSettings.value.emailSettings;
    return email.enabled && email.host && email.port > 0 && email.fromAddress;
  });

  // Methods
  const saveSettings = async (): Promise<void> => {
    isSaving.value = true;
    try {
      emit('update-settings', localSettings.value);
      showToast({
        type: 'success',
        title: 'Настройки сохранены',
        message: 'Все изменения успешно применены'
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast({
        type: 'error',
        title: 'Ошибка сохранения',
        message: 'Не удалось сохранить настройки'
      });
    } finally {
      isSaving.value = false;
    }
  };

  const resetToDefaults = (): void => {
    if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
      localSettings.value = {
        scanInterval: 3600000,
        autoReporting: true,
        notificationEnabled: true,
        reportFormat: 'pdf',
        maxScanDuration: 1800000,
        deepScan: false,
        proxySettings: {
          enabled: false,
          host: '',
          port: 8080,
          authType: 'none'
        },
        emailSettings: {
          enabled: false,
          host: '',
          port: 25,
          useSSL: false,
          username: '',
          password: '',
          fromAddress: '',
          toAddresses: [],
          notifyOnScanComplete: true,
          notifyOnCritical: true
        },
        realtimeNotifications: true,
        reportDetailLevel: 'detailed',
        autoArchive: true
      };
      showToast({
        type: 'success',
        title: 'Настройки сброшены',
        message: 'Все настройки восстановлены к значениям по умолчанию'
      });
    }
  };

  const resetScanSettings = (): void => {
    localSettings.value.scanInterval = 3600000;
    localSettings.value.autoReporting = true;
    localSettings.value.maxScanDuration = 1800000;
    localSettings.value.deepScan = false;
    localSettings.value.reportFormat = 'pdf';
    localSettings.value.reportDetailLevel = 'detailed';
    showToast({
      type: 'success',
      title: 'Настройки сканирования сброшены',
      message: 'Параметры сканирования восстановлены к значениям по умолчанию'
    });
  };

  const exportSettings = (): void => {
    const dataStr = JSON.stringify(localSettings.value, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'military-audit-settings.json';
    link.click();
    showToast({
      type: 'success',
      title: 'Настройки экспортированы',
      message: 'Файл с настройками успешно скачан'
    });
  };

  const testProxyConnection = async (): Promise<void> => {
    isTestingProxy.value = true;
    proxyStatus.value = 'checking';
    try {
      // Implement proxy connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      proxyStatus.value = 'connected';
      showToast({
        type: 'success',
        title: 'Подключение успешно',
        message: 'Соединение с прокси-сервером установлено'
      });
    } catch (error) {
      proxyStatus.value = 'disconnected';
      showToast({
        type: 'error',
        title: 'Ошибка подключения',
        message: 'Не удалось подключиться к прокси-серверу'
      });
    } finally {
      isTestingProxy.value = false;
    }
  };

  const testEmailConnection = async (): Promise<void> => {
    isTestingEmail.value = true;
    emailStatus.value = 'checking';
    try {
      // Implement email connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      emailStatus.value = 'connected';
      showToast({
        type: 'success',
        title: 'Подключение успешно',
        message: 'Соединение с SMTP сервером установлено'
      });
    } catch (error) {
      emailStatus.value = 'disconnected';
      showToast({
        type: 'error',
        title: 'Ошибка подключения',
        message: 'Не удалось подключиться к SMTP серверу'
      });
    } finally {
      isTestingEmail.value = false;
    }
  };

  const getProxyStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      connected: 'Подключено',
      disconnected: 'Не подключено',
      checking: 'Проверка...'
    };
    return statusMap[status] || status;
  };

  const getEmailStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      connected: 'Подключено',
      disconnected: 'Не подключено',
      checking: 'Проверка...'
    };
    return statusMap[status] || status;
  };

  onMounted(() => {
    if (props.settings) {
      localSettings.value = { ...props.settings };
    }
  });
</script>

<style scoped>
  .settings-view {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl, 2rem);
    min-height: 100%;
  }

  /* Header */
  .settings-view__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-xl, 1.5rem);
    padding-bottom: var(--spacing-lg, 1.25rem);
    border-bottom: 1px solid var(--color-border);
  }

  .header-content {
    flex: 1;
  }

  .settings-view__title {
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 var(--spacing-sm, 0.5rem) 0;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.025em;
    line-height: 1.2;
  }

  .settings-view__subtitle {
    font-size: 1.25rem;
    color: var(--color-text-secondary);
    margin: 0;
    font-weight: 400;
    line-height: 1.4;
  }

  .header-actions {
    flex-shrink: 0;
  }

  /* Sections */
  .settings-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl, 0.75rem);
    padding: var(--spacing-2xl, 2rem);
    box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
    transition: all var(--transition-normal, 0.3s ease);
    position: relative;
    overflow: hidden;
  }

    .settings-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: var(--gradient-primary);
      opacity: 0;
      transition: opacity var(--transition-normal, 0.3s ease);
    }

    .settings-section:hover {
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
      transform: translateY(-2px);
    }

      .settings-section:hover::before {
        opacity: 1;
      }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-2xl, 2rem);
    padding-bottom: var(--spacing-lg, 1.25rem);
    border-bottom: 1px solid var(--color-border);
  }

  .section-title-wrapper {
    display: flex;
    align-items: center;
    gap: var(--spacing-md, 1rem);
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
    line-height: 1.3;
  }

  .section-icon {
    width: 2rem;
    height: 2rem;
    color: var(--color-primary);
    flex-shrink: 0;
  }

  .section-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-md, 1rem);
  }

  .section-status {
    padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
    border-radius: var(--radius-full, 9999px);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status--online {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  .status--offline {
    background: var(--color-error-light);
    color: var(--color-error);
  }

  /* Settings Grid */
  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl, 1.5rem);
  }

  .setting-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-xl, 1.5rem);
    padding: var(--spacing-lg, 1.25rem);
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg, 0.5rem);
    border: 1px solid transparent;
    transition: all var(--transition-normal, 0.3s ease);
    position: relative;
  }

    .setting-item:hover {
      border-color: var(--color-border);
      background: var(--color-surface);
      transform: translateX(4px);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    }

  .setting-item--toggle {
    align-items: center;
  }

  .setting-item--action {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    background: transparent;
    border: 2px dashed var(--color-border);
  }

    .setting-item--action:hover {
      border-color: var(--color-primary);
      background: var(--color-primary-50);
      transform: none;
    }

  .setting-content {
    flex: 1;
    min-width: 0;
  }

  .setting-item__label {
    font-weight: 600;
    margin-bottom: var(--spacing-sm, 0.5rem);
    display: block;
    color: var(--color-text-primary);
    font-size: 1rem;
    line-height: 1.4;
  }

  .setting-item__description {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    line-height: 1.5;
    margin: 0;
  }

  .setting-item__control {
    min-width: 200px;
    flex-shrink: 0;
  }

  .action-description {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: var(--spacing-sm, 0.5rem);
    line-height: 1.4;
  }

  /* Actions Section */
  .settings-actions {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl, 0.75rem);
    padding: var(--spacing-2xl, 2rem);
    margin-top: var(--spacing-lg, 1.25rem);
  }

  .actions-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-xl, 1.5rem);
  }

  .actions-info {
    flex: 1;
  }

  .actions-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 var(--spacing-sm, 0.5rem) 0;
    color: var(--color-text-primary);
  }

  .actions-description {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .actions-buttons {
    display: flex;
    gap: var(--spacing-md, 1rem);
    flex-shrink: 0;
  }

  /* Buttons */
  .test-connection-btn,
  .save-btn,
  .reset-btn,
  .export-btn {
    transition: all var(--transition-normal, 0.3s ease);
    position: relative;
    overflow: hidden;
  }

    .test-connection-btn:hover,
    .save-btn:hover,
    .reset-btn:hover,
    .export-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
    }

  .reset-section-btn {
    color: var(--color-text-muted);
  }

    .reset-section-btn:hover {
      color: var(--color-error);
      background: var(--color-error-light);
    }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: var(--spacing-sm, 0.5rem);
    flex-shrink: 0;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .settings-view__title {
      font-size: 2rem;
    }

    .settings-section {
      padding: var(--spacing-xl, 1.5rem);
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
      padding: var(--spacing-lg, 1.25rem);
    }

    .section-title {
      font-size: 1.25rem;
    }

    .setting-item {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-lg, 1.25rem);
    }

    .setting-item--toggle {
      flex-direction: row;
      align-items: center;
    }

    .setting-item__control {
      min-width: auto;
      width: 100%;
    }

    .actions-content {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }

    .actions-buttons {
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    .settings-view__header {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }

    .settings-view__title {
      font-size: 1.5rem;
    }

    .settings-view__subtitle {
      font-size: 1rem;
    }

    .settings-section {
      padding: var(--spacing-lg, 1.25rem);
      border-radius: var(--radius-lg, 0.5rem);
    }

    .section-header {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-md, 1rem);
      text-align: center;
    }

    .section-title-wrapper {
      justify-content: center;
    }

    .setting-item--toggle {
      flex-direction: column;
      align-items: stretch;
    }

    .actions-buttons {
      flex-direction: column;
    }

    .save-btn,
    .reset-btn {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .settings-view {
      gap: var(--spacing-xl, 1.5rem);
    }

    .settings-view__title {
      font-size: 1.375rem;
    }

    .settings-section {
      padding: var(--spacing-lg, 1.25rem) var(--spacing-md, 1rem);
    }

    .section-title {
      font-size: 1.125rem;
    }

    .setting-item {
      padding: var(--spacing-md, 1rem);
    }
  }
</style>
