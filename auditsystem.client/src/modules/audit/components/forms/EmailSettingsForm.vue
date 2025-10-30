<template>
  <BaseModal :model-value="true"
             title="Настройки электронной почты"
             subtitle="Настройте параметры SMTP сервера и уведомлений"
             icon="MailIcon"
             size="lg"
             :wrapper-class="'email-settings-modal'"
             @close="$emit('cancel')">

    <div class="email-settings-content">
      <form @submit.prevent="handleSubmit" class="form">
        <!-- Основные настройки -->
        <div class="form-section">
          <div class="section-header">
            <ServerIcon class="section-icon" />
            <div>
              <h3 class="section-title">Основные параметры</h3>
              <p class="section-description">Настройте подключение к SMTP серверу</p>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label required">SMTP сервер</label>
              <BaseInput v-model="formData.host"
                         placeholder="smtp.example.com"
                         required
                         class="form-control"
                         @blur="validateField('host')" />
              <div class="form-hint">Адрес вашего SMTP сервера</div>
            </div>

            <div class="form-group">
              <label class="form-label required">Порт</label>
              <BaseSelect v-model="formData.port"
                          :options="portOptions"
                          required
                          class="form-control" />
              <div class="form-hint">Порт для подключения</div>
            </div>

            <div class="form-group">
              <label class="form-label">Использовать SSL</label>
              <div class="toggle-group">
                <BaseToggle v-model="formData.useSSL"
                            class="form-control" />
                <span class="toggle-label">{{ formData.useSSL ? 'Включено' : 'Выключено' }}</span>
              </div>
              <div class="form-hint">Рекомендуется для безопасного соединения</div>
            </div>

            <div class="form-group">
              <label class="form-label">Включить уведомления</label>
              <div class="toggle-group">
                <BaseToggle v-model="formData.enabled"
                            class="form-control" />
                <span class="toggle-label">{{ formData.enabled ? 'Включено' : 'Выключено' }}</span>
              </div>
              <div class="form-hint">Активировать отправку уведомлений</div>
            </div>
          </div>
        </div>

        <!-- Учетные данные -->
        <div class="form-section">
          <div class="section-header">
            <LockIcon class="section-icon" />
            <div>
              <h3 class="section-title">Учетные данные</h3>
              <p class="section-description">Данные для аутентификации на сервере</p>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label required">Имя пользователя</label>
              <BaseInput v-model="formData.username"
                         placeholder="user@example.com"
                         required
                         class="form-control"
                         @blur="validateField('username')" />
              <div class="form-hint">Обычно ваш email адрес</div>
            </div>

            <div class="form-group">
              <label class="form-label required">Пароль</label>
              <BaseInput v-model="formData.password"
                         type="password"
                         placeholder="Пароль"
                         required
                         class="form-control"
                         @blur="validateField('password')" />
              <div class="form-hint">Пароль для SMTP аутентификации</div>
            </div>

            <div class="form-group">
              <label class="form-label required">Адрес отправителя</label>
              <BaseInput v-model="formData.fromAddress"
                         placeholder="noreply@example.com"
                         required
                         class="form-control"
                         @blur="validateEmailField('fromAddress')" />
              <div class="form-hint">Email, который будет указан как отправитель</div>
            </div>
          </div>
        </div>

        <!-- Получатели -->
        <div class="form-section">
          <div class="section-header">
            <UsersIcon class="section-icon" />
            <div>
              <h3 class="section-title">Получатели уведомлений</h3>
              <p class="section-description">Добавьте email адреса для получения уведомлений</p>
            </div>
          </div>

          <div class="recipients-section">
            <div class="recipients-list">
              <div v-for="(recipient, index) in formData.toAddresses"
                   :key="index"
                   class="recipient-item"
                   :class="{ 'recipient-item--error': hasEmailError(index) }">
                <BaseInput v-model="formData.toAddresses[index]"
                           placeholder="recipient@example.com"
                           class="recipient-input"
                           @blur="validateRecipient(index)" />
                <BaseButton @click="removeRecipient(index)"
                            variant="text"
                            color="error"
                            size="sm"
                            class="remove-btn">
                  <DeleteIcon class="button-icon" />
                </BaseButton>
              </div>
            </div>

            <BaseButton @click="addRecipient"
                        variant="secondary"
                        size="sm"
                        class="add-recipient-btn">
              <PlusIcon class="button-icon" />
              Добавить получателя
            </BaseButton>

            <div v-if="validRecipientsCount > 0" class="recipients-summary">
              <div class="summary-badge">
                <UsersIcon class="badge-icon" />
                <span>{{ validRecipientsCount }} получателей</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Настройки уведомлений -->
        <div class="form-section">
          <div class="section-header">
            <BellIcon class="section-icon" />
            <div>
              <h3 class="section-title">Типы уведомлений</h3>
              <p class="section-description">Выберите события для отправки уведомлений</p>
            </div>
          </div>

          <div class="notification-options">
            <div class="option-item">
              <BaseToggle v-model="formData.notifyOnScanComplete"
                          class="option-toggle" />
              <div class="option-content">
                <label class="option-label">Завершение сканирования</label>
                <p class="option-description">
                  Отправлять уведомление когда сканирование завершено
                </p>
              </div>
            </div>

            <div class="option-item">
              <BaseToggle v-model="formData.notifyOnCritical"
                          class="option-toggle" />
              <div class="option-content">
                <label class="option-label">Критические проблемы</label>
                <p class="option-description">
                  Отправлять уведомление при обнаружении критических уязвимостей
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Тестирование подключения -->
        <div class="form-section">
          <div class="section-header">
            <TestConnectionIcon class="section-icon" />
            <div>
              <h3 class="section-title">Проверка подключения</h3>
              <p class="section-description">Проверьте корректность настроек перед сохранением</p>
            </div>
          </div>

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
              <div class="result-content">
                <span class="result-title">{{ testResult.title }}</span>
                <span class="result-message">{{ testResult.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>

    <template #footer>
      <div class="form-actions">
        <BaseButton @click="$emit('cancel')"
                    variant="secondary"
                    class="cancel-btn">
          Отмена
        </BaseButton>
        <BaseButton type="submit"
                    variant="primary"
                    :loading="isSubmitting"
                    :disabled="!canSave"
                    @click="handleSubmit"
                    class="submit-btn">
          <SaveIcon class="button-icon" />
          Сохранить настройки
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseModal from '@/framework/ui/components/overlay/BaseModal.vue';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue';
  import {
    SaveIcon,
    PlusIcon,
    DeleteIcon,
    TestConnectionIcon,
    CheckCircleIcon,
    XCircleIcon,
    ServerIcon,
    LockIcon,
    UsersIcon,
    BellIcon,
    MailIcon
  } from '@/assets/icons';
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
  const fieldErrors = ref<Record<string, string>>({});
  const recipientErrors = ref<Record<number, string>>({});

  const formData = ref<EmailSettings>({
    enabled: false,
    host: '',
    port: 587,
    useSSL: true,
    username: '',
    password: '',
    fromAddress: '',
    toAddresses: [''],
    notifyOnScanComplete: true,
    notifyOnCritical: true
  });

  const testResult = ref<{
    type: 'success' | 'error';
    icon: any;
    title: string;
    message: string;
  } | null>(null);

  const portOptions = [
    { value: 25, label: '25 (SMTP)' },
    { value: 587, label: '587 (SMTP Submission)' },
    { value: 465, label: '465 (SMTPS)' },
    { value: 143, label: '143 (IMAP)' },
    { value: 993, label: '993 (IMAPS)' }
  ];

  // Computed properties
  const validRecipientsCount = computed(() => {
    return formData.value.toAddresses.filter(addr =>
      addr.trim() !== '' && validateEmail(addr)
    ).length;
  });

  const canTestConnection = computed(() => {
    const basicFieldsValid =
      formData.value.host.trim() !== '' &&
      formData.value.username.trim() !== '' &&
      formData.value.password.trim() !== '' &&
      formData.value.fromAddress.trim() !== '' &&
      validateEmail(formData.value.fromAddress);

    const hasValidRecipients = validRecipientsCount.value > 0;

    return basicFieldsValid && hasValidRecipients && !isTesting.value;
  });

  const canSave = computed(() => {
    return canTestConnection.value && Object.keys(fieldErrors.value).length === 0;
  });

  // Methods
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (fieldName: keyof EmailSettings): void => {
    const value = formData.value[fieldName] as string;

    if (!value.trim()) {
      fieldErrors.value[fieldName] = 'Это поле обязательно для заполнения';
    } else {
      delete fieldErrors.value[fieldName];
    }
  };

  const validateEmailField = (fieldName: keyof EmailSettings): void => {
    const value = formData.value[fieldName] as string;

    if (!value.trim()) {
      fieldErrors.value[fieldName] = 'Это поле обязательно для заполнения';
    } else if (!validateEmail(value)) {
      fieldErrors.value[fieldName] = 'Введите корректный email адрес';
    } else {
      delete fieldErrors.value[fieldName];
    }
  };

  const validateRecipient = (index: number): void => {
    const email = formData.value.toAddresses[index];

    if (!email.trim()) {
      recipientErrors.value[index] = 'Email обязателен для заполнения';
    } else if (!validateEmail(email)) {
      recipientErrors.value[index] = 'Неверный формат email';
    } else {
      delete recipientErrors.value[index];
    }
  };

  const hasEmailError = (index: number): boolean => {
    return recipientErrors.value[index] !== undefined;
  };

  // Инициализация формы
  onMounted(() => {
    if (props.settings) {
      formData.value = { ...props.settings };
      // Валидация начальных данных
      validateField('host');
      validateField('username');
      validateField('password');
      validateEmailField('fromAddress');
      formData.value.toAddresses.forEach((_, index) => validateRecipient(index));
    }
  });

  const addRecipient = (): void => {
    formData.value.toAddresses.push('');
  };

  const removeRecipient = (index: number): void => {
    formData.value.toAddresses.splice(index, 1);
    delete recipientErrors.value[index];
    // Обновить индексы ошибок
    const newErrors: Record<number, string> = {};
    Object.entries(recipientErrors.value).forEach(([key, value]) => {
      const oldIndex = parseInt(key);
      if (oldIndex > index) {
        newErrors[oldIndex - 1] = value;
      } else if (oldIndex < index) {
        newErrors[oldIndex] = value;
      }
    });
    recipientErrors.value = newErrors;
  };

  const validateForm = (): boolean => {
    // Валидация основных полей
    validateField('host');
    validateField('username');
    validateField('password');
    validateEmailField('fromAddress');

    // Валидация получателей
    formData.value.toAddresses.forEach((_, index) => validateRecipient(index));

    // Проверка наличия хотя бы одного валидного получателя
    const hasValidRecipients = validRecipientsCount.value > 0;

    if (!hasValidRecipients) {
      showToast({
        type: 'warning',
        title: 'Добавьте получателей',
        message: 'Необходимо добавить хотя бы одного корректного получателя'
      });
      return false;
    }

    return Object.keys(fieldErrors.value).length === 0 && hasValidRecipients;
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
        password: formData.value.password,
        fromAddress: formData.value.fromAddress,
        toAddresses: formData.value.toAddresses.filter(addr => validateEmail(addr))
      };

      const result = await emit('test-connection', testSettings);

      if (result.success) {
        testResult.value = {
          type: 'success',
          icon: CheckCircleIcon,
          title: 'Подключение успешно',
          message: result.message
        };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      testResult.value = {
        type: 'error',
        icon: XCircleIcon,
        title: 'Ошибка подключения',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка при подключении'
      };
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
      // Очистка пустых получателей
      const cleanSettings = {
        ...formData.value,
        toAddresses: formData.value.toAddresses.filter(addr =>
          addr.trim() !== '' && validateEmail(addr)
        )
      };

      emit('save', cleanSettings);
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
  .email-settings-modal ::v-deep(.base-modal__container) {
    display: flex;
    flex-direction: column;
    max-height: 85vh;
  }

  .email-settings-modal ::v-deep(.base-modal__content) {
    padding: 0;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  .email-settings-content {
    flex: 1;
    padding: var(--spacing-xl);
    overflow-y: auto;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
  }

  /* Section Styles */
  .form-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
  }

    .form-section:hover {
      box-shadow: var(--shadow-md);
    }

  .section-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }

  .section-icon {
    width: 2rem;
    height: 2rem;
    color: var(--color-primary);
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-xs) 0;
  }

  .section-description {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  /* Form Grid */
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .form-label {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    font-size: 0.9rem;
  }

    .form-label.required::after {
      content: '*';
      color: var(--color-error);
      margin-left: var(--spacing-xs);
    }

  .form-hint {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    line-height: 1.3;
  }

  /* Toggle Group */
  .toggle-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .toggle-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  /* Recipients Section */
  .recipients-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .recipients-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .recipient-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .recipient-item--error {
    border-color: var(--color-error);
    background: var(--color-error-light);
  }

  .recipient-item:hover {
    border-color: var(--color-primary);
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

  .recipients-summary {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .summary-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-md);
    background: var(--color-primary-light);
    color: var(--color-primary);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: var(--font-weight-semibold);
  }

  .badge-icon {
    width: 0.875rem;
    height: 0.875rem;
  }

  /* Notification Options */
  .notification-options {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .option-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

    .option-item:hover {
      border-color: var(--color-primary);
    }

  .option-toggle {
    margin-top: 0.125rem;
    flex-shrink: 0;
  }

  .option-content {
    flex: 1;
  }

  .option-label {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    display: block;
    margin-bottom: var(--spacing-xs);
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
    gap: var(--spacing-lg);
  }

  .test-btn {
    align-self: flex-start;
  }

  .test-result {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    border: 1px solid;
  }

  .test-result--success {
    background: var(--color-success-light);
    border-color: var(--color-success);
    color: var(--color-success);
  }

  .test-result--error {
    background: var(--color-error-light);
    border-color: var(--color-error);
    color: var(--color-error);
  }

  .result-icon {
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .result-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .result-title {
    font-weight: var(--font-weight-semibold);
    font-size: 0.9rem;
  }

  .result-message {
    font-size: 0.875rem;
    line-height: 1.3;
  }

  /* Form Actions */
  .form-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    flex-shrink: 0;
    padding: var(--spacing-lg) var(--spacing-xl);
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .cancel-btn {
    min-width: 120px;
  }

  .submit-btn {
    min-width: 180px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .email-settings-content {
      padding: var(--spacing-lg);
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .form-section {
      padding: var(--spacing-lg);
    }
  }

  @media (max-width: 768px) {
    .email-settings-content {
      padding: var(--spacing-md);
    }

    .form-section {
      padding: var(--spacing-lg);
    }

    .section-header {
      flex-direction: column;
      gap: var(--spacing-sm);
      text-align: center;
    }

    .section-icon {
      align-self: center;
    }

    .form-actions {
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .cancel-btn,
    .submit-btn {
      width: 100%;
    }

    .recipient-item {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-sm);
    }

    .remove-btn {
      align-self: flex-end;
    }
  }

  @media (max-width: 480px) {
    .email-settings-content {
      padding: var(--spacing-md);
    }

    .form-section {
      padding: var(--spacing-md);
    }

    .option-item {
      flex-direction: column;
      gap: var(--spacing-md);
      text-align: center;
    }

    .test-result {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-sm);
    }

    .result-icon {
      align-self: center;
    }
  }
</style>
