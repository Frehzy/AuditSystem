<template>
  <div class="email-settings-form">
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-content">
        <h3 class="form-title">Настройки электронной почты</h3>

        <!-- Основные настройки -->
        <div class="form-section">
          <h4 class="section-title">Основные параметры</h4>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Включить уведомления</label>
              <BaseToggle v-model="formData.enabled"
                          class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label required">SMTP сервер</label>
              <BaseInput v-model="formData.host"
                         placeholder="smtp.example.com"
                         required
                         class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label required">Порт</label>
              <BaseSelect v-model="formData.port"
                          :options="portOptions"
                          required
                          class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label">Использовать SSL</label>
              <BaseToggle v-model="formData.useSSL"
                          class="form-control" />
            </div>
          </div>
        </div>

        <!-- Учетные данные -->
        <div class="form-section">
          <h4 class="section-title">Учетные данные</h4>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label required">Имя пользователя</label>
              <BaseInput v-model="formData.username"
                         placeholder="user@example.com"
                         required
                         class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label required">Пароль</label>
              <BaseInput v-model="formData.password"
                         type="password"
                         placeholder="Пароль"
                         required
                         class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label required">Отправитель</label>
              <BaseInput v-model="formData.fromAddress"
                         placeholder="noreply@example.com"
                         required
                         class="form-control" />
            </div>
          </div>
        </div>

        <!-- Получатели -->
        <div class="form-section">
          <h4 class="section-title">Получатели уведомлений</h4>

          <div class="recipients-list">
            <div v-for="(recipient, index) in formData.toAddresses"
                 :key="index"
                 class="recipient-item">
              <BaseInput v-model="formData.toAddresses[index]"
                         placeholder="recipient@example.com"
                         class="recipient-input" />
              <BaseButton @click="removeRecipient(index)"
                          variant="text"
                          color="error"
                          class="remove-btn">
                <DeleteIcon class="button-icon" />
              </BaseButton>
            </div>
          </div>

          <BaseButton @click="addRecipient"
                      variant="secondary"
                      class="add-recipient-btn">
            <PlusIcon class="button-icon" />
            Добавить получателя
          </BaseButton>
        </div>

        <!-- Настройки уведомлений -->
        <div class="form-section">
          <h4 class="section-title">Типы уведомлений</h4>

          <div class="notification-options">
            <div class="option-item">
              <BaseToggle v-model="formData.notifyOnScanComplete"
                          class="option-toggle" />
              <div class="option-content">
                <label class="option-label">Уведомлять о завершении сканирования</label>
                <p class="option-description">
                  Отправлять уведомление когда сканирование завершено
                </p>
              </div>
            </div>

            <div class="option-item">
              <BaseToggle v-model="formData.notifyOnCritical"
                          class="option-toggle" />
              <div class="option-content">
                <label class="option-label">Уведомлять о критических проблемах</label>
                <p class="option-description">
                  Отправлять уведомление при обнаружении критических уязвимостей
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Тестирование подключения -->
        <div class="form-section">
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
  import { ref, computed } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue';
  import { SaveIcon, PlusIcon, DeleteIcon, TestConnectionIcon, CheckCircleIcon, XCircleIcon } from '@/assets/icons';
  import type { EmailSettings, ConnectionTestResult } from '../../api/audit.types';

  interface Props {
    settings?: EmailSettings;
  }

  interface Emits {
    (e: 'save', settings: EmailSettings): void;
    (e: 'cancel'): void;
    (e: 'test-connection', settings: any): Promise<ConnectionTestResult>;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { showToast } = useToast();

  const isSubmitting = ref(false);
  const isTesting = ref(false);

  const formData = ref<EmailSettings>({
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
  });

  const testResult = ref<{
    type: 'success' | 'error';
    icon: any;
    message: string;
  } | null>(null);

  const portOptions = [
    { value: 25, label: '25 (SMTP)' },
    { value: 587, label: '587 (SMTP Submission)' },
    { value: 465, label: '465 (SMTPS)' },
    { value: 143, label: '143 (IMAP)' },
    { value: 993, label: '993 (IMAPS)' }
  ];

  const canTestConnection = computed(() => {
    return (
      formData.value.host.trim() !== '' &&
      formData.value.username.trim() !== '' &&
      formData.value.password.trim() !== '' &&
      formData.value.fromAddress.trim() !== ''
    );
  });

  // Инициализация формы
  if (props.settings) {
    formData.value = { ...props.settings };
  }

  const addRecipient = (): void => {
    formData.value.toAddresses.push('');
  };

  const removeRecipient = (index: number): void => {
    formData.value.toAddresses.splice(index, 1);
  };

  const validateForm = (): boolean => {
    if (!formData.value.host.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните SMTP сервер',
        message: 'Адрес SMTP сервера обязателен для заполнения'
      });
      return false;
    }

    if (!formData.value.username.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните имя пользователя',
        message: 'Имя пользователя обязательно для заполнения'
      });
      return false;
    }

    if (!formData.value.password.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните пароль',
        message: 'Пароль обязателен для заполнения'
      });
      return false;
    }

    if (!formData.value.fromAddress.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните адрес отправителя',
        message: 'Адрес отправителя обязателен для заполнения'
      });
      return false;
    }

    // Проверка email формата для отправителя
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.value.fromAddress)) {
      showToast({
        type: 'warning',
        title: 'Неверный формат email',
        message: 'Введите корректный адрес электронной почты отправителя'
      });
      return false;
    }

    // Проверка получателей
    const validRecipients = formData.value.toAddresses.filter(addr =>
      addr.trim() !== '' && emailRegex.test(addr)
    );

    if (validRecipients.length === 0) {
      showToast({
        type: 'warning',
        title: 'Добавьте получателей',
        message: 'Необходимо добавить хотя бы одного корректного получателя'
      });
      return false;
    }

    formData.value.toAddresses = validRecipients;

    return true;
  };

  const testConnection = async (): Promise<void> => {
    if (!canTestConnection.value) {
      showToast({
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
        useSSL: formData.value.useSSL,
        username: formData.value.username,
        password: formData.value.password
      };

      const result = await emit('test-connection', testSettings);

      if (result.success) {
        testResult.value = {
          type: 'success',
          icon: CheckCircleIcon,
          message: result.message
        };
        showToast({
          type: 'success',
          title: 'Подключение успешно',
          message: 'Соединение с почтовым сервером установлено'
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
      showToast({
        type: 'error',
        title: 'Ошибка подключения',
        message: 'Не удалось подключиться к почтовому серверу'
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
      showToast({
        type: 'success',
        title: 'Настройки сохранены',
        message: 'Настройки электронной почты успешно обновлены'
      });
    } catch (error) {
      console.error('Failed to save email settings:', error);
      showToast({
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
  .email-settings-form {
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

  /* Recipients List */
  .recipients-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .recipient-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .recipient-input {
    flex: 1;
  }

  .remove-btn {
    flex-shrink: 0;
  }

  .add-recipient-btn {
    align-self: flex-start;
  }

  /* Notification Options */
  .notification-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .option-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
  }

  .option-toggle {
    margin-top: 0.125rem;
  }

  .option-content {
    flex: 1;
  }

  .option-label {
    font-weight: 600;
    color: var(--color-text-primary);
    display: block;
    margin-bottom: 0.25rem;
  }

  .option-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
    margin: 0;
  }

  /* Test Connection */
  .test-connection {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
    .email-settings-form {
      max-height: 60vh;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .form-section {
      padding: 1.25rem;
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
