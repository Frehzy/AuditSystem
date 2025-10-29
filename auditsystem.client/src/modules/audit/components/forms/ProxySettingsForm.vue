<template>
  <div class="proxy-settings-form">
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-content">
        <h3 class="form-title">Настройки прокси-сервера</h3>

        <!-- Основные настройки -->
        <div class="form-section">
          <h4 class="section-title">Основные параметры</h4>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Использовать прокси</label>
              <BaseToggle v-model="formData.enabled"
                          class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label" :class="{ 'required': formData.enabled }">Хост прокси</label>
              <BaseInput v-model="formData.host"
                         placeholder="proxy.example.com"
                         :disabled="!formData.enabled"
                         class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label" :class="{ 'required': formData.enabled }">Порт</label>
              <BaseInput v-model.number="formData.port"
                         type="number"
                         placeholder="8080"
                         :disabled="!formData.enabled"
                         class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label">Тип авторизации</label>
              <BaseSelect v-model="formData.authType"
                          :options="authTypeOptions"
                          :disabled="!formData.enabled"
                          class="form-control" />
            </div>
          </div>
        </div>

        <!-- Учетные данные -->
        <div v-if="formData.enabled && formData.authType !== 'none'" class="form-section">
          <h4 class="section-title">Учетные данные прокси</h4>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label" :class="{ 'required': formData.authType !== 'none' }">
                Имя пользователя
              </label>
              <BaseInput v-model="formData.username"
                         placeholder="proxy-user"
                         :disabled="!formData.enabled"
                         class="form-control" />
            </div>

            <div v-if="formData.authType === 'password'" class="form-group">
              <label class="form-label required">Пароль</label>
              <BaseInput v-model="formData.password"
                         type="password"
                         placeholder="Пароль"
                         :disabled="!formData.enabled"
                         class="form-control" />
            </div>

            <div v-if="formData.authType === 'rsa'" class="form-group full-width">
              <label class="form-label required">RSA приватный ключ</label>
              <BaseTextarea v-model="formData.rsaKey"
                            placeholder="-----BEGIN RSA PRIVATE KEY-----"
                            rows="6"
                            :disabled="!formData.enabled"
                            class="form-control" />
            </div>
          </div>
        </div>

        <!-- Тестирование подключения -->
        <div v-if="formData.enabled" class="form-section">
          <h4 class="section-title">Проверка подключения</h4>

          <div class="test-connection">
            <BaseButton @click="testConnection"
                        variant="secondary"
                        :loading="isTesting"
                        :disabled="!canTestConnection"
                        class="test-btn">
              <TestConnectionIcon class="button-icon" />
              Проверить подключение
            </BaseButton>

            <div v-if="testResult" class="test-result" :class="`test-result--${testResult.type}`">
              <component :is="testResult.icon" class="result-icon" />
              <span class="result-message">{{ testResult.message }}</span>
            </div>
          </div>

          <div class="connection-info">
            <h5 class="info-title">Информация о подключении:</h5>
            <ul class="info-list">
              <li class="info-item">
                <CheckCircleIcon class="info-icon" />
                <span>Прокси будет использоваться для всех исходящих подключений</span>
              </li>
              <li class="info-item">
                <CheckCircleIcon class="info-icon" />
                <span>Поддерживаются протоколы HTTP и SOCKS5</span>
              </li>
              <li class="info-item">
                <CheckCircleIcon class="info-icon" />
                <span>Автоматическое определение настроек из переменных окружения</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Предупреждение при отключении -->
        <div v-else class="form-section warning-section">
          <div class="warning-content">
            <AlertIcon class="warning-icon" />
            <div class="warning-text">
              <h5 class="warning-title">Прокси отключен</h5>
              <p class="warning-description">
                Все подключения будут устанавливаться напрямую. Убедитесь, что это соответствует политике безопасности вашей организации.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <BaseButton @click="$emit('cancel')"
                    variant="secondary"
                    class="cancel-btn">
          Отмена
        </BaseButton>
        <BaseButton type="submit"
                    variant="primary"
                    :loading="isSubmitting"
                    class="submit-btn">
          <SaveIcon class="button-icon" />
          Сохранить настройки
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue';
  import BaseTextarea from '@/framework/ui/components/forms/BaseTextarea.vue';
  import {
    SaveIcon,
    TestConnectionIcon,
    CheckCircleIcon,
    XCircleIcon,
    AlertIcon
  } from '@/assets/icons';
  import type { ProxySettings, ConnectionTestResult } from '../../api/audit.types';

  interface Props {
    settings?: ProxySettings;
  }

  interface Emits {
    (e: 'save', settings: ProxySettings): void;
    (e: 'cancel'): void;
    (e: 'test-connection', settings: any): Promise<ConnectionTestResult>;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const toast = useToast(); // ИЗМЕНЕНО: используем объект toast вместо деструктуризации

  const isSubmitting = ref(false);
  const isTesting = ref(false);

  // ИЗМЕНЕНО: Добавляем типизацию для полей формы
  const formData = ref<ProxySettings>({
    enabled: false,
    host: '',
    port: 8080,
    authType: 'none',
    username: '',
    password: '',
    rsaKey: ''
  });

  const testResult = ref<{
    type: 'success' | 'error';
    icon: any;
    message: string;
  } | null>(null);

  const authTypeOptions = [
    { value: 'none', label: 'Без авторизации' },
    { value: 'password', label: 'Логин/пароль' },
    { value: 'rsa', label: 'RSA ключ' }
  ];

  const canTestConnection = computed(() => {
    if (!formData.value.enabled) return false;

    const hasHost = formData.value.host.trim() !== '';
    const hasPort = formData.value.port > 0 && formData.value.port <= 65535;

    if (formData.value.authType === 'password') {
      return hasHost && hasPort &&
        formData.value.username?.trim() !== '' && // ИЗМЕНЕНО: используем optional chaining
        formData.value.password?.trim() !== '';
    } else if (formData.value.authType === 'rsa') {
      return hasHost && hasPort &&
        formData.value.username?.trim() !== '' &&
        formData.value.rsaKey?.trim() !== '';
    }

    return hasHost && hasPort;
  });

  // Инициализация формы
  if (props.settings) {
    formData.value = { ...props.settings };
  }

  // Сброс полей при отключении прокси
  watch(() => formData.value.enabled, (enabled) => {
    if (!enabled) {
      formData.value.host = '';
      formData.value.port = 8080;
      formData.value.authType = 'none';
      formData.value.username = '';
      formData.value.password = '';
      formData.value.rsaKey = '';
      testResult.value = null;
    }
  });

  // Сброс полей при смене типа авторизации
  watch(() => formData.value.authType, (newAuthType) => {
    if (newAuthType === 'none') {
      formData.value.username = '';
      formData.value.password = '';
      formData.value.rsaKey = '';
    } else if (newAuthType === 'password') {
      formData.value.rsaKey = '';
    } else if (newAuthType === 'rsa') {
      formData.value.password = '';
    }
  });

  const validateForm = (): boolean => {
    if (!formData.value.enabled) {
      return true; // Прокси отключен - валидация не требуется
    }

    if (!formData.value.host.trim()) {
      toast.showToast({
        type: 'warning',
        title: 'Заполните хост прокси',
        message: 'Адрес прокси-сервера обязателен для заполнения'
      });
      return false;
    }

    if (!formData.value.port || formData.value.port < 1 || formData.value.port > 65535) {
      toast.showToast({
        type: 'warning',
        title: 'Неверный порт',
        message: 'Порт должен быть в диапазоне от 1 до 65535'
      });
      return false;
    }

    if (formData.value.authType === 'password') {
      if (!formData.value.username?.trim()) { // ИЗМЕНЕНО: optional chaining
        toast.showToast({
          type: 'warning',
          title: 'Заполните имя пользователя',
          message: 'Имя пользователя обязательно для данного типа авторизации'
        });
        return false;
      }
      if (!formData.value.password?.trim()) { // ИЗМЕНЕНО: optional chaining
        toast.showToast({
          type: 'warning',
          title: 'Заполните пароль',
          message: 'Пароль обязателен для данного типа авторизации'
        });
        return false;
      }
    } else if (formData.value.authType === 'rsa') {
      if (!formData.value.username?.trim()) { // ИЗМЕНЕНО: optional chaining
        toast.showToast({
          type: 'warning',
          title: 'Заполните имя пользователя',
          message: 'Имя пользователя обязательно для данного типа авторизации'
        });
        return false;
      }
      if (!formData.value.rsaKey?.trim()) { // ИЗМЕНЕНО: optional chaining
        toast.showToast({
          type: 'warning',
          title: 'Заполните RSA ключ',
          message: 'RSA приватный ключ обязателен для данного типа авторизации'
        });
        return false;
      }
    }

    return true;
  };

  const testConnection = async (): Promise<void> => {
    if (!canTestConnection.value) {
      toast.showToast({
        type: 'warning',
        title: 'Заполните данные',
        message: 'Для тестирования подключения заполните все обязательные поля'
      });
      return;
    }

    isTesting.value = true;
    testResult.value = null;

    try {
      const testSettings = {
        host: formData.value.host,
        port: formData.value.port,
        authType: formData.value.authType,
        username: formData.value.username,
        password: formData.value.password,
        rsaKey: formData.value.rsaKey
      };

      const result = await emit('test-connection', testSettings);

      if (result.success) {
        testResult.value = {
          type: 'success',
          icon: CheckCircleIcon,
          message: result.message
        };
        toast.showToast({
          type: 'success',
          title: 'Подключение успешно',
          message: 'Соединение с прокси-сервером установлено'
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      testResult.value = {
        type: 'error',
        icon: XCircleIcon,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
      toast.showToast({
        type: 'error',
        title: 'Ошибка подключения',
        message: 'Не удалось подключиться к прокси-серверу'
      });
    } finally {
      isTesting.value = false;
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    isSubmitting.value = true;

    try {
      emit('save', formData.value);
      toast.showToast({
        type: 'success',
        title: 'Настройки сохранены',
        message: 'Настройки прокси-сервера успешно обновлены'
      });
    } catch (error) {
      console.error('Failed to save proxy settings:', error);
      toast.showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось сохранить настройки'
      });
    } finally {
      isSubmitting.value = false;
    }
  };
</script>

<style scoped>
  /* Стили остаются без изменений */
  .proxy-settings-form {
    max-height: 70vh;
    overflow-y: auto;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .form-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .form-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
    text-align: center;
  }

  .form-section {
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

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .full-width {
    grid-column: 1 / -1;
  }

  .form-label {
    font-weight: 600;
    color: var(--color-text-primary);
    font-size: 0.9rem;
  }

    .form-label.required::after {
      content: '*';
      color: var(--color-error);
      margin-left: 0.25rem;
    }

  /* Test Connection */
  .test-connection {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .test-result {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
  }

  .test-result--success {
    background: var(--color-success-light);
    color: var(--color-success);
    border: 1px solid var(--color-success);
  }

  .test-result--error {
    background: var(--color-error-light);
    color: var(--color-error);
    border: 1px solid var(--color-error);
  }

  .result-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  /* Connection Info */
  .connection-info {
    background: var(--color-surface);
    border-radius: 0.5rem;
    padding: 1.25rem;
    border: 1px solid var(--color-border);
  }

  .info-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
  }

  .info-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .info-icon {
    width: 1rem;
    height: 1rem;
    color: var(--color-success);
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  /* Warning Section */
  .warning-section {
    background: var(--color-warning-light);
    border-color: var(--color-warning);
  }

  .warning-content {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .warning-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--color-warning);
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .warning-text {
    flex: 1;
  }

  .warning-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: var(--color-warning-dark);
  }

  .warning-description {
    font-size: 0.875rem;
    color: var(--color-warning-dark);
    margin: 0;
    line-height: 1.4;
  }

  /* Form Actions */
  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
  }

  .cancel-btn,
  .submit-btn {
    min-width: 160px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: 0.5rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .proxy-settings-form {
      max-height: 60vh;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .form-section {
      padding: 1.25rem;
    }

    .warning-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .form-actions {
      flex-direction: column;
    }

    .cancel-btn,
    .submit-btn {
      width: 100%;
    }
  }
</style>
