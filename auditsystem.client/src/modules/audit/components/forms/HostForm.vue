<template>
  <BaseModal :model-value="true"
             title="Добавление хоста"
             subtitle="Заполните информацию о новом хосте для аудита"
             icon="ServerIcon"
             size="lg"
             :wrapper-class="`host-form-modal`"
             @close="$emit('cancel')">

    <div class="host-form-content">
      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-content">
          <!-- Основная информация -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="section-title">Основная информация</h3>
              <p class="section-description">Введите основные данные о хосте</p>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label required">Имя хоста</label>
                <BaseInput v-model="formData.name"
                           placeholder="server-01"
                           required
                           class="form-control"
                           @blur="validateField('name')" />
                <div class="form-hint">Уникальное имя для идентификации</div>
              </div>

              <div class="form-group">
                <label class="form-label required">IP адрес</label>
                <BaseInput v-model="formData.ipAddress"
                           placeholder="192.168.1.100"
                           required
                           class="form-control"
                           @blur="validateField('ipAddress')" />
                <div class="form-hint">IPv4 адрес в формате 192.168.1.1</div>
              </div>

              <div class="form-group">
                <label class="form-label required">Операционная система</label>
                <BaseSelect v-model="formData.osType"
                            :options="osOptions"
                            required
                            class="form-control" />
                <div class="form-hint">Тип операционной системы хоста</div>
              </div>

              <div class="form-group">
                <label class="form-label">Подсеть</label>
                <BaseSelect v-model="formData.subnetId"
                            :options="subnetOptions"
                            placeholder="Выберите подсеть"
                            class="form-control" />
                <div class="form-hint">Сетевой сегмент для группировки</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Описание</label>
              <BaseTextarea v-model="formData.description"
                            placeholder="Описание хоста и его назначение..."
                            :rows="2"
                            :maxlength="200"
                            class="form-control" />
              <div class="form-hint">{{ formData.description.length }}/200 символов</div>
            </div>
          </div>

          <!-- Учетные данные -->
          <div class="form-section credentials-section">
            <div class="section-header">
              <h3 class="section-title">Учетные данные для подключения</h3>
              <p class="section-description">Настройте параметры аутентификации</p>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label required">Тип авторизации</label>
                <BaseSelect v-model="formData.credentials.authType"
                            :options="authTypeOptions"
                            required
                            class="form-control" />
                <div class="form-hint">Способ аутентификации на хосте</div>
              </div>

              <div class="form-group">
                <label class="form-label required">Имя пользователя</label>
                <BaseInput v-model="formData.credentials.username"
                           placeholder="root"
                           required
                           class="form-control"
                           @blur="validateField('username')" />
                <div class="form-hint">Пользователь для подключения</div>
              </div>

              <div class="form-group">
                <label class="form-label required">Порт</label>
                <BaseInput v-model.number="formData.credentials.port"
                           type="number"
                           placeholder="22"
                           required
                           class="form-control"
                           @blur="validateField('port')" />
                <div class="form-hint">Порт SSH подключения (1-65535)</div>
              </div>
            </div>

            <div v-if="formData.credentials.authType === 'password'" class="form-group">
              <label class="form-label">Пароль</label>
              <BaseInput v-model="formData.credentials.password"
                         type="password"
                         placeholder="Пароль пользователя"
                         class="form-control" />
              <div class="form-hint">Пароль для аутентификации</div>
            </div>

            <div v-if="formData.credentials.authType === 'rsa'" class="form-group">
              <label class="form-label">RSA приватный ключ</label>
              <BaseTextarea v-model="formData.credentials.rsaKey"
                            placeholder="-----BEGIN RSA PRIVATE KEY-----"
                            :rows="4"
                            class="form-control" />
              <div class="form-hint">Приватный ключ в PEM формате</div>
            </div>

            <!-- Тестирование подключения -->
            <div class="test-connection-section">
              <div class="section-header">
                <h4 class="section-title">Проверка подключения</h4>
                <p class="section-description">Убедитесь, что хост доступен с указанными учетными данными</p>
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
                  <span class="result-message">{{ testResult.message }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <BaseButton @click="$emit('cancel')"
                      variant="secondary"
                      class="cancel-btn">
            Отмена
          </BaseButton>
          <BaseButton type="submit"
                      variant="primary"
                      :loading="isSubmitting"
                      :disabled="!canSubmit"
                      class="submit-btn">
            <SaveIcon class="button-icon" />
            Добавить хост
          </BaseButton>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseModal from '@/framework/ui/components/overlay/BaseModal.vue';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseTextarea from '@/framework/ui/components/forms/BaseTextarea.vue';
  import { SaveIcon, TestConnectionIcon, CheckCircleIcon, XCircleIcon } from '@/assets/icons';
  import { useMilitaryUnits } from '../../composables/useMilitaryUnits';
  import type { CreateHostCommand } from '../../api/audit.types';

  interface Props {
    unitId: string;
  }

  interface Emits {
    (e: 'save', host: CreateHostCommand): void;
    (e: 'cancel'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { showToast } = useToast();
  const militaryUnits = useMilitaryUnits();

  const isSubmitting = ref(false);
  const isTesting = ref(false);

  const formData = ref({
    name: '',
    ipAddress: '',
    osType: 'linux' as 'linux' | 'windows' | 'unknown',
    subnetId: '',
    description: '',
    credentials: {
      authType: 'password' as 'password' | 'rsa',
      username: '',
      password: '',
      rsaKey: '',
      port: 22
    }
  });

  const testResult = ref<{
    type: 'success' | 'error';
    icon: any;
    message: string;
  } | null>(null);

  const fieldErrors = ref<Record<string, string>>({});

  // Options
  const osOptions = [
    { value: 'linux', label: 'Linux' },
    { value: 'windows', label: 'Windows' },
    { value: 'unknown', label: 'Неизвестно' }
  ];

  const authTypeOptions = [
    { value: 'password', label: 'Пароль' },
    { value: 'rsa', label: 'RSA ключ' }
  ];

  const subnetOptions = computed(() => {
    const unit = militaryUnits.units.value.find(u => u.id === props.unitId);
    if (!unit) return [];

    return unit.subnets.map(subnet => ({
      value: subnet.id,
      label: `${subnet.name} (${subnet.network}/${subnet.mask})`
    }));
  });

  // Computed properties
  const canTestConnection = computed(() => {
    return formData.value.ipAddress.trim() &&
      formData.value.credentials.username.trim() &&
      formData.value.credentials.port > 0;
  });

  const canSubmit = computed(() => {
    return formData.value.name.trim() &&
      formData.value.ipAddress.trim() &&
      formData.value.credentials.username.trim() &&
      formData.value.credentials.port > 0 &&
      Object.keys(fieldErrors.value).length === 0;
  });

  // Validation
  const validateField = (fieldName: string): void => {
    const errors: string[] = [];

    switch (fieldName) {
      case 'name':
        if (!formData.value.name.trim()) {
          errors.push('Имя хоста обязательно для заполнения');
        }
        break;

      case 'ipAddress':
        if (!formData.value.ipAddress.trim()) {
          errors.push('IP адрес обязателен для заполнения');
        } else {
          const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
          if (!ipRegex.test(formData.value.ipAddress)) {
            errors.push('Введите корректный IP адрес (например: 192.168.1.100)');
          }
        }
        break;

      case 'username':
        if (!formData.value.credentials.username.trim()) {
          errors.push('Имя пользователя обязательно для заполнения');
        }
        break;

      case 'port':
        if (!formData.value.credentials.port || formData.value.credentials.port < 1 || formData.value.credentials.port > 65535) {
          errors.push('Порт должен быть в диапазоне от 1 до 65535');
        }
        break;
    }

    if (errors.length > 0) {
      fieldErrors.value[fieldName] = errors[0];
    } else {
      delete fieldErrors.value[fieldName];
    }
  };

  const validateForm = (): boolean => {
    ['name', 'ipAddress', 'username', 'port'].forEach(field => validateField(field));

    if (formData.value.credentials.authType === 'rsa' && !formData.value.credentials.rsaKey.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните RSA ключ',
        message: 'RSA приватный ключ обязателен для данного типа авторизации'
      });
      return false;
    }

    return Object.keys(fieldErrors.value).length === 0;
  };

  const testConnection = async (): Promise<void> => {
    if (!canTestConnection.value) {
      showToast({
        type: 'warning',
        title: 'Заполните данные',
        message: 'Для тестирования подключения заполните IP адрес, имя пользователя и порт'
      });
      return;
    }

    isTesting.value = true;
    testResult.value = null;

    try {
      // Имитация тестирования подключения
      await new Promise(resolve => setTimeout(resolve, 2000));

      // В реальном приложении здесь будет запрос к API для тестирования подключения
      const success = Math.random() > 0.3; // 70% успеха для демонстрации

      if (success) {
        testResult.value = {
          type: 'success',
          icon: CheckCircleIcon,
          message: 'Подключение успешно установлено'
        };
        showToast({
          type: 'success',
          title: 'Подключение успешно',
          message: 'Соединение с хостом установлено'
        });
      } else {
        throw new Error('Не удалось подключиться к хосту. Проверьте сетевые настройки и учетные данные.');
      }
    } catch (error) {
      testResult.value = {
        type: 'error',
        icon: XCircleIcon,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка подключения'
      };
      showToast({
        type: 'error',
        title: 'Ошибка подключения',
        message: 'Не удалось подключиться к хосту'
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
      const hostData: CreateHostCommand = {
        unitId: props.unitId,
        name: formData.value.name,
        ipAddress: formData.value.ipAddress,
        osType: formData.value.osType,
        subnetId: formData.value.subnetId || undefined,
        description: formData.value.description,
        credentials: formData.value.credentials
      };

      emit('save', hostData);
    } catch (error) {
      console.error('Failed to create host:', error);
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось создать хост'
      });
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(() => {
    militaryUnits.loadUnits();
  });
</script>

<style scoped>
  /* Keep all your existing styles - they are fine */
  .host-form-content {
    flex: 1;
    padding: var(--space-xl, 1.5rem);
    overflow-y: auto;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xl, 2rem);
    height: 100%;
  }

  .form-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xl, 2rem);
  }

  .form-section {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-xl, 0.75rem);
    padding: var(--space-xl, 1.5rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .credentials-section {
    background: var(--color-surface-hover, #f8fafc);
  }

  .section-header {
    margin-bottom: var(--space-xl, 1.5rem);
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
    margin: 0 0 var(--space-sm, 0.75rem) 0;
  }

  .section-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
    margin: 0;
    line-height: 1.4;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-lg, 1.25rem);
    margin-bottom: var(--space-lg, 1.25rem);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.75rem);
  }

  .form-label {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
    font-size: 0.9rem;
  }

    .form-label.required::after {
      content: '*';
      color: var(--color-error, #ef4444);
      margin-left: var(--space-xs, 0.5rem);
    }

  .form-hint {
    font-size: 0.75rem;
    color: var(--color-text-muted, #9ca3af);
  }

  .test-connection-section {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-lg, 1.25rem);
    border: 1px solid var(--color-border, #e5e7eb);
    margin-top: var(--space-lg, 1.25rem);
  }

  .test-connection {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg, 1.25rem);
  }

  .test-btn {
    align-self: flex-start;
    min-width: 200px;
  }

  .test-result {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
    padding: var(--space-lg, 1.25rem);
    border-radius: var(--radius-lg, 0.75rem);
    font-weight: var(--font-weight-medium, 500);
    border: 1px solid;
  }

  .test-result--success {
    background: var(--color-success-light, #d1fae5);
    color: var(--color-success, #10b981);
    border-color: var(--color-success, #10b981);
  }

  .test-result--error {
    background: var(--color-error-light, #fee2e2);
    color: var(--color-error, #ef4444);
    border-color: var(--color-error, #ef4444);
  }

  .result-icon {
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
  }

  .result-message {
    font-weight: var(--font-weight-medium, 500);
  }

  .form-actions {
    display: flex;
    gap: var(--space-md, 1rem);
    justify-content: flex-end;
    padding-top: var(--space-xl, 1.5rem);
    border-top: 1px solid var(--color-border, #e5e7eb);
    flex-shrink: 0;
  }

  .cancel-btn,
  .submit-btn {
    min-width: 140px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: var(--space-sm, 0.75rem);
  }

  @media (max-width: 1024px) {
    .host-form-content {
      padding: var(--space-lg, 1.25rem);
    }

    .form-grid {
      grid-template-columns: 1fr;
      gap: var(--space-md, 1rem);
    }

    .form-section {
      padding: var(--space-lg, 1.25rem);
    }
  }

  @media (max-width: 768px) {
    .host-form-content {
      padding: var(--space-md, 1rem);
    }

    .form {
      gap: var(--space-xl, 1.5rem);
    }

    .form-content {
      gap: var(--space-xl, 1.5rem);
    }

    .form-section {
      padding: var(--space-lg, 1.25rem);
      border-radius: var(--radius-lg, 0.75rem);
    }

    .form-actions {
      flex-direction: column;
    }

    .cancel-btn,
    .submit-btn {
      width: 100%;
    }

    .test-btn {
      align-self: stretch;
    }

    .test-connection {
      gap: var(--space-md, 1rem);
    }

    .test-result {
      padding: var(--space-md, 1rem);
    }
  }

  @media (max-width: 480px) {
    .host-form-content {
      padding: var(--space-md, 1rem);
    }

    .form-section {
      padding: var(--space-md, 1rem);
    }

    .section-header {
      margin-bottom: var(--space-lg, 1.25rem);
    }

    .section-title {
      font-size: 1.125rem;
    }
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .form-section {
    animation: slide-in 0.3s ease-out;
  }
</style>
