<template>
  <div class="host-form">
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-content">
        <h3 class="form-title">Добавление хоста</h3>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label required">Имя хоста</label>
            <BaseInput v-model="formData.name"
                       placeholder="server-01"
                       required
                       class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label required">IP адрес</label>
            <BaseInput v-model="formData.ipAddress"
                       placeholder="192.168.1.100"
                       required
                       class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label required">Операционная система</label>
            <BaseSelect v-model="formData.osType"
                        :options="osOptions"
                        required
                        class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label">Подсеть</label>
            <BaseSelect v-model="formData.subnetId"
                        :options="subnetOptions"
                        placeholder="Выберите подсеть"
                        class="form-control" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Описание</label>
          <BaseTextarea v-model="formData.description"
                        placeholder="Описание хоста и его назначение..."
                        rows="2"
                        class="form-control" />
        </div>

        <!-- Учетные данные -->
        <div class="credentials-section">
          <h4 class="section-title">Учетные данные для подключения</h4>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label required">Тип авторизации</label>
              <BaseSelect v-model="formData.credentials.authType"
                          :options="authTypeOptions"
                          required
                          class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label required">Имя пользователя</label>
              <BaseInput v-model="formData.credentials.username"
                         placeholder="root"
                         required
                         class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label required">Порт</label>
              <BaseInput v-model.number="formData.credentials.port"
                         type="number"
                         placeholder="22"
                         required
                         class="form-control" />
            </div>
          </div>

          <div v-if="formData.credentials.authType === 'password'" class="form-group">
            <label class="form-label">Пароль</label>
            <BaseInput v-model="formData.credentials.password"
                       type="password"
                       placeholder="Пароль пользователя"
                       class="form-control" />
          </div>

          <div v-if="formData.credentials.authType === 'rsa'" class="form-group">
            <label class="form-label">RSA приватный ключ</label>
            <BaseTextarea v-model="formData.credentials.rsaKey"
                          placeholder="-----BEGIN RSA PRIVATE KEY-----"
                          rows="6"
                          class="form-control" />
          </div>

          <!-- Тестирование подключения -->
          <div class="test-connection">
            <BaseButton @click="testConnection"
                        variant="secondary"
                        :loading="isTesting"
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
          Добавить хост
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

  const validateForm = (): boolean => {
    if (!formData.value.name.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните имя хоста',
        message: 'Имя хоста обязательно для заполнения'
      });
      return false;
    }

    if (!formData.value.ipAddress.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните IP адрес',
        message: 'IP адрес обязателен для заполнения'
      });
      return false;
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(formData.value.ipAddress)) {
      showToast({
        type: 'warning',
        title: 'Неверный формат IP',
        message: 'Введите корректный IP адрес (например: 192.168.1.100)'
      });
      return false;
    }

    if (!formData.value.credentials.username.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните имя пользователя',
        message: 'Имя пользователя обязательно для заполнения'
      });
      return false;
    }

    if (!formData.value.credentials.port || formData.value.credentials.port < 1 || formData.value.credentials.port > 65535) {
      showToast({
        type: 'warning',
        title: 'Неверный порт',
        message: 'Порт должен быть в диапазоне от 1 до 65535'
      });
      return false;
    }

    if (formData.value.credentials.authType === 'rsa' && !formData.value.credentials.rsaKey.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните RSA ключ',
        message: 'RSA приватный ключ обязателен для данного типа авторизации'
      });
      return false;
    }

    return true;
  };

  const testConnection = async (): Promise<void> => {
    if (!formData.value.ipAddress.trim() || !formData.value.credentials.username.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните данные',
        message: 'Для тестирования подключения заполните IP адрес и имя пользователя'
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
        throw new Error('Не удалось подключиться к хосту');
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
      showToast({
        type: 'success',
        title: 'Хост добавлен',
        message: 'Новый хост успешно создан'
      });
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
</script>

<style scoped>
  .host-form {
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
    gap: 1.5rem;
  }

  .form-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
    text-align: center;
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

  /* Credentials Section */
  .credentials-section {
    background: var(--color-surface-hover);
    border-radius: 0.75rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
  }

  /* Test Connection */
  .test-connection {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
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
    min-width: 140px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: 0.5rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .host-form {
      max-height: 60vh;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .credentials-section {
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
