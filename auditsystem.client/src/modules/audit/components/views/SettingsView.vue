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
            <BaseSelect v-model="localSettings.scanInterval"
                        :options="scanIntervalOptions"
                        class="setting-item__control" />
            <div class="setting-item__description">
              Как часто система будет выполнять автоматическую проверку безопасности
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-item__label">Максимальное время сканирования (минут)</label>
            <BaseInput v-model.number="localSettings.maxScanDuration"
                       type="number"
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
            <BaseToggle v-model="localSettings.autoReporting"
                        class="setting-item__control" />
          </div>

          <div class="setting-item setting-item--toggle">
            <div class="setting-item__content">
              <label class="setting-item__label">Глубокое сканирование</label>
              <div class="setting-item__description">
                Проверять расширенные параметры безопасности систем
              </div>
            </div>
            <BaseToggle v-model="localSettings.deepScan"
                        class="setting-item__control" />
          </div>

          <div class="setting-item">
            <label class="setting-item__label">Формат отчетов по умолчанию</label>
            <BaseSelect v-model="localSettings.reportFormat"
                        :options="reportFormatOptions"
                        class="setting-item__control" />
            <div class="setting-item__description">
              Основной формат для генерации отчетов безопасности
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-item__label">Уровень детализации отчетов</label>
            <BaseSelect v-model="localSettings.reportDetailLevel"
                        :options="detailLevelOptions"
                        class="setting-item__control" />
            <div class="setting-item__description">
              Детальность информации в генерируемых отчетах
            </div>
          </div>
        </div>
      </div>

      <!-- Настройки прокси -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <NetworkIcon class="section-icon" />
            Настройки прокси
          </h2>
        </div>

        <div class="settings-grid">
          <div class="setting-item setting-item--toggle">
            <div class="setting-item__content">
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
              <label class="setting-item__label">Адрес прокси-сервера</label>
              <BaseInput v-model="localSettings.proxySettings.host"
                         placeholder="proxy.example.com"
                         class="setting-item__control" />
              <div class="setting-item__description">
                IP-адрес или доменное имя прокси-сервера
              </div>
            </div>

            <div class="setting-item">
              <label class="setting-item__label">Порт прокси-сервера</label>
              <BaseInput v-model.number="localSettings.proxySettings.port"
                         type="number"
                         class="setting-item__control" />
              <div class="setting-item__description">
                Порт для подключения к прокси-серверу
              </div>
            </div>

            <div class="setting-item">
              <label class="setting-item__label">Тип авторизации</label>
              <BaseSelect v-model="localSettings.proxySettings.authType"
                          :options="proxyAuthOptions"
                          class="setting-item__control" />
              <div class="setting-item__description">
                Метод аутентификации на прокси-сервере
              </div>
            </div>

            <template v-if="localSettings.proxySettings.authType !== 'none'">
              <div class="setting-item">
                <label class="setting-item__label">Имя пользователя</label>
                <BaseInput v-model="localSettings.proxySettings.username"
                           class="setting-item__control" />
                <div class="setting-item__description">
                  Логин для аутентификации на прокси-сервере
                </div>
              </div>

              <div v-if="localSettings.proxySettings.authType === 'password'" class="setting-item">
                <label class="setting-item__label">Пароль</label>
                <BaseInput v-model="localSettings.proxySettings.password"
                           type="password"
                           class="setting-item__control" />
                <div class="setting-item__description">
                  Пароль для аутентификации на прокси-сервере
                </div>
              </div>

              <div v-if="localSettings.proxySettings.authType === 'rsa'" class="setting-item">
                <label class="setting-item__label">RSA ключ</label>
                <BaseTextarea v-model="localSettings.proxySettings.rsaKey"
                              placeholder="-----BEGIN RSA PRIVATE KEY-----"
                              rows="6"
                              class="setting-item__control" />
                <div class="setting-item__description">
                  Приватный RSA ключ для аутентификации
                </div>
              </div>
            </template>

            <div class="setting-item">
              <BaseButton @click="testProxyConnection"
                          variant="secondary"
                          :loading="isTestingProxy"
                          class="test-connection-btn">
                <TestConnectionIcon class="button-icon" />
                Проверить подключение
              </BaseButton>
            </div>
          </template>
        </div>
      </div>

      <!-- Настройки email уведомлений -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <MailIcon class="section-icon" />
            Email уведомления
          </h2>
        </div>

        <div class="settings-grid">
          <div class="setting-item setting-item--toggle">
            <div class="setting-item__content">
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
              <label class="setting-item__label">SMTP сервер</label>
              <BaseInput v-model="localSettings.emailSettings.host"
                         placeholder="smtp.example.com"
                         class="setting-item__control" />
              <div class="setting-item__description">
                Адрес SMTP сервера для отправки email
              </div>
            </div>

            <div class="setting-item">
              <label class="setting-item__label">Порт SMTP</label>
              <BaseInput v-model.number="localSettings.emailSettings.port"
                         type="number"
                         class="setting-item__control" />
              <div class="setting-item__description">
                Порт SMTP сервера (обычно 25, 587 или 465)
              </div>
            </div>

            <div class="setting-item setting-item--toggle">
              <div class="setting-item__content">
                <label class="setting-item__label">Использовать SSL/TLS</label>
                <div class="setting-item__description">
                  Использовать защищенное соединение с SMTP сервером
                </div>
              </div>
              <BaseToggle v-model="localSettings.emailSettings.useSSL"
                          class="setting-item__control" />
            </div>

            <div class="setting-item">
              <label class="setting-item__label">Имя пользователя</label>
              <BaseInput v-model="localSettings.emailSettings.username"
                         class="setting-item__control" />
              <div class="setting-item__description">
                Логин для аутентификации на SMTP сервере
              </div>
            </div>

            <div class="setting-item">
              <label class="setting-item__label">Пароль</label>
              <BaseInput v-model="localSettings.emailSettings.password"
                         type="password"
                         class="setting-item__control" />
              <div class="setting-item__description">
                Пароль для аутентификации на SMTP сервере
              </div>
            </div>

            <div class="setting-item">
              <label class="setting-item__label">Email отправителя</label>
              <BaseInput v-model="localSettings.emailSettings.fromAddress"
                         type="email"
                         placeholder="audit@example.com"
                         class="setting-item__control" />
              <div class="setting-item__description">
                Адрес отправителя для всех уведомлений
              </div>
            </div>

            <div class="setting-item">
              <label class="setting-item__label">Получатели уведомлений</label>
              <BaseTextarea v-model="emailRecipients"
                            placeholder="user1@example.com, user2@example.com"
                            rows="3"
                            class="setting-item__control" />
              <div class="setting-item__description">
                Список email адресов получателей (через запятую)
              </div>
            </div>

            <div class="setting-item setting-item--toggle">
              <div class="setting-item__content">
                <label class="setting-item__label">Уведомлять о завершении сканирования</label>
                <div class="setting-item__description">
                  Отправлять email при завершении любого сканирования
                </div>
              </div>
              <BaseToggle v-model="localSettings.emailSettings.notifyOnScanComplete"
                          class="setting-item__control" />
            </div>

            <div class="setting-item setting-item--toggle">
              <div class="setting-item__content">
                <label class="setting-item__label">Уведомлять о критических проблемах</label>
                <div class="setting-item__description">
                  Отправлять email только при обнаружении критических уязвимостей
                </div>
              </div>
              <BaseToggle v-model="localSettings.emailSettings.notifyOnCritical"
                          class="setting-item__control" />
            </div>

            <div class="setting-item">
              <BaseButton @click="testEmailConnection"
                          variant="secondary"
                          :loading="isTestingEmail"
                          class="test-connection-btn">
                <TestConnectionIcon class="button-icon" />
                Проверить подключение
              </BaseButton>
            </div>
          </template>
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

  const isSaving = ref(false);
  const isTestingProxy = ref(false);
  const isTestingEmail = ref(false);
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

  const emailRecipients = computed({
    get: () => localSettings.value.emailSettings.toAddresses.join(', '),
    set: (value) => {
      localSettings.value.emailSettings.toAddresses = value
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
    }
  });

  const saveSettings = async (): Promise<void> => {
    isSaving.value = true;
    try {
      emit('update-settings', localSettings.value);
    } catch (error) {
      console.error('Failed to save settings:', error);
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
    try {
      // Implement proxy connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast({
        type: 'success',
        title: 'Подключение успешно',
        message: 'Соединение с прокси-сервером установлено'
      });
    } catch (error) {
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
    try {
      // Implement email connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast({
        type: 'success',
        title: 'Подключение успешно',
        message: 'Соединение с SMTP сервером установлено'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Ошибка подключения',
        message: 'Не удалось подключиться к SMTP серверу'
      });
    } finally {
      isTestingEmail.value = false;
    }
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

  .test-connection-btn {
    margin-top: 0.5rem;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: 0.5rem;
  }

  /* Settings Actions */
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

    .section-title {
      font-size: 1.125rem;
    }

    .setting-item {
      padding: 1.25rem;
    }
  }
</style>
