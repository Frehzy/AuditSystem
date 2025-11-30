<template>
  <div class="military-unit-form theme-transition">
    <form @submit.prevent="handleSubmit" class="unit-form" novalidate>
      <!-- Основная информация -->
      <div class="form-section">
        <div class="step-header">
          <h3 class="step-title">Основная информация</h3>
          <p class="step-description">Задайте основные параметры войсковой части</p>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="unit-name" class="form-label required">Название части</label>
            <BaseInput id="unit-name"
                       v-model="formData.name"
                       placeholder="Введите название войсковой части"
                       required
                       class="form-control"
                       :error="errors.name"
                       @blur="validateField('name')" />
            <div class="form-hint">Обязательное поле</div>
          </div>

          <div class="form-group">
            <label for="unit-location" class="form-label required">Местоположение</label>
            <BaseInput id="unit-location"
                       v-model="formData.location"
                       placeholder="Введите местоположение"
                       required
                       class="form-control"
                       :error="errors.location"
                       @blur="validateField('location')" />
            <div class="form-hint">Обязательное поле</div>
          </div>

          <div class="form-group">
            <label for="unit-status" class="form-label required">Статус</label>
            <BaseSelect id="unit-status"
                        v-model="formData.status"
                        :options="statusOptions"
                        required
                        class="form-control" />
          </div>
        </div>

        <div class="form-group">
          <label for="unit-description" class="form-label">Описание</label>
          <BaseTextarea id="unit-description"
                        v-model="formData.description"
                        placeholder="Описание войсковой части..."
                        rows="3"
                        :maxlength="500"
                        class="form-control" />
          <div class="form-hint">{{ formData.description.length }}/500 символов</div>
        </div>
      </div>

      <!-- Подсети -->
      <div class="form-section">
        <div class="section-header">
          <div class="section-title">
            <NetworkIcon class="title-icon" />
            <span>Подсети</span>
          </div>
          <BaseButton @click="addSubnet"
                      variant="secondary"
                      size="sm"
                      type="button">
            <PlusIcon class="button-icon" />
            Добавить подсеть
          </BaseButton>
        </div>

        <div class="subnets-list">
          <div v-for="(subnet, index) in formData.subnets"
               :key="index"
               class="subnet-item card">
            <div class="subnet-header">
              <h4 class="subnet-title">Подсеть {{ index + 1 }}</h4>
              <BaseButton @click="removeSubnet(index)"
                          variant="text"
                          size="sm"
                          color="error"
                          type="button"
                          :disabled="formData.subnets.length === 1">
                <DeleteIcon class="button-icon" />
                Удалить
              </BaseButton>
            </div>

            <div class="subnet-form">
              <div class="form-grid">
                <div class="form-group">
                  <label :for="`subnet-name-${index}`" class="form-label required">Название</label>
                  <BaseInput :id="`subnet-name-${index}`"
                             v-model="subnet.name"
                             placeholder="Название подсети"
                             required
                             class="form-control"
                             :error="errors[`subnet-${index}-name`]"
                             @blur="validateSubnet(index, 'name')" />
                </div>

                <div class="form-group">
                  <label :for="`subnet-network-${index}`" class="form-label required">Сеть</label>
                  <BaseInput :id="`subnet-network-${index}`"
                             v-model="subnet.network"
                             placeholder="192.168.1.0"
                             required
                             class="form-control"
                             :error="errors[`subnet-${index}-network`]"
                             @blur="validateSubnet(index, 'network')" />
                </div>

                <div class="form-group">
                  <label :for="`subnet-mask-${index}`" class="form-label required">Маска</label>
                  <BaseInput :id="`subnet-mask-${index}`"
                             v-model="subnet.mask"
                             placeholder="24"
                             required
                             class="form-control"
                             :error="errors[`subnet-${index}-mask`]"
                             @blur="validateSubnet(index, 'mask')" />
                </div>
              </div>

              <div class="form-group">
                <label :for="`subnet-description-${index}`" class="form-label">Описание</label>
                <BaseInput :id="`subnet-description-${index}`"
                           v-model="subnet.description"
                           placeholder="Описание подсети..."
                           class="form-control" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="formData.subnets.length === 0" class="empty-state">
          <NetworkIcon class="empty-icon" />
          <p>Подсети не добавлены</p>
          <p class="empty-description">
            Добавьте подсети для автоматического обнаружения хостов
          </p>
        </div>
      </div>

      <!-- Хосты -->
      <div class="form-section">
        <div class="section-header">
          <div class="section-title">
            <ServerIcon class="title-icon" />
            <span>Хосты</span>
          </div>
          <BaseButton @click="addHost"
                      variant="secondary"
                      size="sm"
                      type="button">
            <PlusIcon class="button-icon" />
            Добавить хост
          </BaseButton>
        </div>

        <div class="hosts-list">
          <div v-for="(host, index) in formData.hosts"
               :key="index"
               class="host-item card">
            <div class="host-header">
              <h4 class="host-title">Хост {{ index + 1 }}</h4>
              <BaseButton @click="removeHost(index)"
                          variant="text"
                          size="sm"
                          color="error"
                          type="button"
                          :disabled="formData.hosts.length === 1">
                <DeleteIcon class="button-icon" />
                Удалить
              </BaseButton>
            </div>

            <div class="host-form">
              <div class="form-grid">
                <div class="form-group">
                  <label :for="`host-name-${index}`" class="form-label required">Имя хоста</label>
                  <BaseInput :id="`host-name-${index}`"
                             v-model="host.name"
                             placeholder="server-01"
                             required
                             class="form-control"
                             :error="errors[`host-${index}-name`]"
                             @blur="validateHost(index, 'name')" />
                </div>

                <div class="form-group">
                  <label :for="`host-ip-${index}`" class="form-label required">IP адрес</label>
                  <BaseInput :id="`host-ip-${index}`"
                             v-model="host.ipAddress"
                             placeholder="192.168.1.100"
                             required
                             class="form-control"
                             :error="errors[`host-${index}-ipAddress`]"
                             @blur="validateHost(index, 'ipAddress')" />
                </div>

                <div class="form-group">
                  <label :for="`host-os-${index}`" class="form-label required">Операционная система</label>
                  <BaseSelect :id="`host-os-${index}`"
                              v-model="host.osType"
                              :options="osOptions"
                              required
                              class="form-control" />
                </div>
              </div>

              <div class="form-group">
                <label :for="`host-description-${index}`" class="form-label">Описание</label>
                <BaseInput :id="`host-description-${index}`"
                           v-model="host.description"
                           placeholder="Описание хоста..."
                           :maxlength="200"
                           class="form-control" />
                <div class="form-hint">{{ host.description?.length || 0 }}/200 символов</div>
              </div>

              <!-- Учетные данные -->
              <div class="credentials-section">
                <h5 class="subsection-title">Учетные данные</h5>

                <div class="form-grid">
                  <div class="form-group">
                    <label :for="`host-auth-type-${index}`" class="form-label">Тип авторизации</label>
                    <BaseSelect :id="`host-auth-type-${index}`"
                                v-model="host.credentials.authType"
                                :options="authTypeOptions"
                                class="form-control" />
                  </div>

                  <div class="form-group">
                    <label :for="`host-username-${index}`" class="form-label required">Пользователь</label>
                    <BaseInput :id="`host-username-${index}`"
                               v-model="host.credentials.username"
                               placeholder="root"
                               required
                               class="form-control"
                               :error="errors[`host-${index}-username`]"
                               @blur="validateHostCredentials(index, 'username')" />
                  </div>

                  <div class="form-group">
                    <label :for="`host-port-${index}`" class="form-label">Порт</label>
                    <BaseInput :id="`host-port-${index}`"
                               v-model.number="host.credentials.port"
                               type="number"
                               placeholder="22"
                               min="1"
                               max="65535"
                               class="form-control" />
                  </div>
                </div>

                <div v-if="host.credentials.authType === 'password'" class="form-group">
                  <label :for="`host-password-${index}`" class="form-label">Пароль</label>
                  <BaseInput :id="`host-password-${index}`"
                             v-model="host.credentials.password"
                             type="password"
                             placeholder="Пароль пользователя"
                             class="form-control" />
                </div>

                <div v-if="host.credentials.authType === 'rsa'" class="form-group">
                  <label :for="`host-rsa-key-${index}`" class="form-label">RSA ключ</label>
                  <BaseTextarea :id="`host-rsa-key-${index}`"
                                v-model="host.credentials.rsaKey"
                                placeholder="-----BEGIN RSA PRIVATE KEY-----"
                                rows="4"
                                class="form-control" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="formData.hosts.length === 0" class="empty-state">
          <ServerIcon class="empty-icon" />
          <p>Хосты не добавлены</p>
          <p class="empty-description">
            Добавьте хосты для ручного управления
          </p>
        </div>
      </div>

      <!-- Summary -->
      <div class="form-summary">
        <h4 class="summary-title">Сводка</h4>
        <div class="summary-content">
          <div class="summary-item">
            <span class="summary-label">Подсети:</span>
            <span class="summary-value">{{ formData.subnets.length }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Хосты:</span>
            <span class="summary-value">{{ formData.hosts.length }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Статус:</span>
            <BaseChip :color="getStatusColor(formData.status)" size="sm">
              {{ getStatusText(formData.status) }}
            </BaseChip>
          </div>
        </div>
      </div>

      <!-- Действия формы -->
      <div class="form-actions">
        <BaseButton @click="$emit('cancel')"
                    variant="secondary"
                    type="button"
                    class="cancel-btn"
                    :disabled="isSubmitting">
          Отмена
        </BaseButton>
        <BaseButton type="submit"
                    variant="primary"
                    :loading="isSubmitting"
                    class="submit-btn"
                    :disabled="!canSubmit">
          <SaveIcon class="button-icon" />
          {{ unit ? 'Обновить' : 'Создать' }} войсковую часть
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseTextarea from '@/framework/ui/components/forms/BaseTextarea.vue';
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
  import {
    PlusIcon,
    DeleteIcon,
    SaveIcon,
    NetworkIcon,
    ServerIcon
  } from '@/assets/icons';
  import type { MilitaryUnit, CreateUnitCommand } from '@/modules/audit/api/audit.types';

  interface Props {
    unit?: MilitaryUnit;
  }

  interface Emits {
    (e: 'save', unit: CreateUnitCommand): void;
    (e: 'cancel'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { showToast } = useToast();

  const isSubmitting = ref(false);
  const errors = ref<Record<string, string>>({});

  const formData = ref({
    name: '',
    location: '',
    status: 'active' as 'active' | 'deployed' | 'headquarters',
    description: '',
    subnets: [] as Array<{
      name: string;
      network: string;
      mask: string;
      description: string;
    }>,
    hosts: [] as Array<{
      name: string;
      ipAddress: string;
      osType: 'linux' | 'windows' | 'unknown';
      description: string;
      credentials: {
        authType: 'password' | 'rsa';
        username: string;
        password: string;
        rsaKey: string;
        port: number;
      };
    }>
  });

  const statusOptions = [
    { value: 'active', label: 'Активна' },
    { value: 'deployed', label: 'На выезде' },
    { value: 'headquarters', label: 'Штаб' }
  ];

  const osOptions = [
    { value: 'linux', label: 'Linux' },
    { value: 'windows', label: 'Windows' },
    { value: 'unknown', label: 'Неизвестно' }
  ];

  const authTypeOptions = [
    { value: 'password', label: 'Пароль' },
    { value: 'rsa', label: 'RSA ключ' }
  ];

  // Computed properties
  const canSubmit = computed(() => {
    return formData.value.name.trim().length > 0 &&
      formData.value.location.trim().length > 0 &&
      Object.keys(errors.value).length === 0;
  });

  // Methods
  const addSubnet = (): void => {
    formData.value.subnets.push({
      name: '',
      network: '',
      mask: '',
      description: ''
    });
  };

  const removeSubnet = (index: number): void => {
    if (formData.value.subnets.length > 1) {
      formData.value.subnets.splice(index, 1);
    }
  };

  const addHost = (): void => {
    formData.value.hosts.push({
      name: '',
      ipAddress: '',
      osType: 'linux',
      description: '',
      credentials: {
        authType: 'password',
        username: '',
        password: '',
        rsaKey: '',
        port: 22
      }
    });
  };

  const removeHost = (index: number): void => {
    if (formData.value.hosts.length > 1) {
      formData.value.hosts.splice(index, 1);
    }
  };

  const validateField = (field: string): void => {
    const value = formData.value[field as keyof typeof formData.value];
    if (!value || (typeof value === 'string' && !value.trim())) {
      errors.value[field] = 'Это поле обязательно для заполнения';
    } else {
      delete errors.value[field];
    }
  };

  const validateSubnet = (index: number, field: string): void => {
    const subnet = formData.value.subnets[index];
    const value = subnet[field as keyof typeof subnet];
    const errorKey = `subnet-${index}-${field}`;

    if (!value || (typeof value === 'string' && !value.trim())) {
      errors.value[errorKey] = 'Это поле обязательно для заполнения';
    } else {
      delete errors.value[errorKey];
    }
  };

  const validateHost = (index: number, field: string): void => {
    const host = formData.value.hosts[index];
    const value = host[field as keyof typeof host];
    const errorKey = `host-${index}-${field}`;

    if (!value || (typeof value === 'string' && !value.trim())) {
      errors.value[errorKey] = 'Это поле обязательно для заполнения';
    } else {
      delete errors.value[errorKey];
    }
  };

  const validateHostCredentials = (index: number, field: string): void => {
    const host = formData.value.hosts[index];
    const value = host.credentials[field as keyof typeof host.credentials];
    const errorKey = `host-${index}-${field}`;

    if (!value || (typeof value === 'string' && !value.trim())) {
      errors.value[errorKey] = 'Это поле обязательно для заполнения';
    } else {
      delete errors.value[errorKey];
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

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      active: 'success',
      deployed: 'warning',
      headquarters: 'primary'
    };
    return colorMap[status] || 'default';
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    isSubmitting.value = true;

    try {
      const unitData: CreateUnitCommand = {
        name: formData.value.name.trim(),
        location: formData.value.location.trim(),
        status: formData.value.status,
        description: formData.value.description.trim(),
        subnets: formData.value.subnets.map(subnet => ({
          ...subnet,
          name: subnet.name.trim(),
          network: subnet.network.trim(),
          mask: subnet.mask.trim(),
          description: subnet.description.trim()
        })),
        hosts: formData.value.hosts.map(host => ({
          ...host,
          name: host.name.trim(),
          ipAddress: host.ipAddress.trim(),
          description: host.description.trim(),
          credentials: {
            ...host.credentials,
            username: host.credentials.username.trim()
          }
        }))
      };

      emit('save', unitData);
    } catch (error) {
      console.error('Failed to save military unit:', error);
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось сохранить войсковую часть'
      });
    } finally {
      isSubmitting.value = false;
    }
  };

  const validateForm = (): boolean => {
    errors.value = {};

    // Validate main fields
    validateField('name');
    validateField('location');

    // Validate subnets
    formData.value.subnets.forEach((subnet, index) => {
      validateSubnet(index, 'name');
      validateSubnet(index, 'network');
      validateSubnet(index, 'mask');
    });

    // Validate hosts
    formData.value.hosts.forEach((host, index) => {
      validateHost(index, 'name');
      validateHost(index, 'ipAddress');
      validateHostCredentials(index, 'username');
    });

    if (Object.keys(errors.value).length > 0) {
      showToast({
        type: 'warning',
        title: 'Заполните обязательные поля',
        message: 'Пожалуйста, проверьте правильность заполнения формы'
      });
      return false;
    }

    return true;
  };

  const initializeForm = (): void => {
    if (props.unit) {
      formData.value = {
        name: props.unit.name,
        location: props.unit.location,
        status: props.unit.status,
        description: props.unit.description || '',
        subnets: props.unit.subnets.map(subnet => ({
          name: subnet.name,
          network: subnet.network,
          mask: subnet.mask,
          description: subnet.description || ''
        })),
        hosts: props.unit.hosts.map(host => ({
          name: host.name,
          ipAddress: host.ipAddress,
          osType: host.osType,
          description: host.description || '',
          credentials: host.credentials ? {
            authType: host.credentials.authType,
            username: host.credentials.username,
            password: host.credentials.password || '',
            rsaKey: host.credentials.rsaKey || '',
            port: host.credentials.port
          } : {
            authType: 'password',
            username: '',
            password: '',
            rsaKey: '',
            port: 22
          }
        }))
      };
    } else {
      // Add empty subnet and host by default
      addSubnet();
      addHost();
    }
  };

  onMounted(() => {
    initializeForm();
  });
</script>

<style scoped>
  .military-unit-form {
    max-height: 70vh;
    overflow-y: auto;
  }

  .unit-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl, 2rem);
  }

  .form-section {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .step-header {
    margin-bottom: var(--spacing-xl);
    text-align: left;
  }

  .step-title {
    font-size: 1.25rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .step-description {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
  }

  .title-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-primary);
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .form-label {
    font-weight: var(--font-weight-semibold, 600);
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
    text-align: right;
  }

  /* Subnets List */
  .subnets-list,
  .hosts-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .subnet-item,
  .host-item {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    border: 1px solid var(--color-border);
    transition: all var(--transition-fast);
  }

    .subnet-item:hover,
    .host-item:hover {
      box-shadow: var(--shadow-md);
      border-color: var(--color-primary);
    }

  .subnet-header,
  .host-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
  }

  .subnet-title,
  .host-title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0;
    color: var(--color-text-primary);
  }

  .subnet-form,
  .host-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  /* Credentials Section */
  .credentials-section {
    background: var(--color-surface-hover);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    border: 1px solid var(--color-border);
  }

  .subsection-title {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--spacing-md) 0;
    color: var(--color-text-primary);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--color-border);
  }

  /* Form Summary */
  .form-summary {
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    border: 1px solid var(--color-border);
  }

  .summary-title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--spacing-lg) 0;
    color: var(--color-text-primary);
  }

  .summary-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .summary-label {
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-primary);
  }

  .summary-value {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--color-text-secondary);
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px dashed var(--color-border);
  }

  .empty-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
    color: var(--color-text-muted);
  }

  .empty-description {
    margin: var(--spacing-sm) 0 0 0;
    font-size: 0.9rem;
  }

  /* Form Actions */
  .form-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-border);
  }

  .cancel-btn,
  .submit-btn {
    min-width: 160px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: var(--spacing-sm);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .form-grid {
      grid-template-columns: 1fr;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
    }

    .summary-content {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .military-unit-form {
      max-height: 60vh;
    }

    .unit-form {
      gap: var(--spacing-xl);
    }

    .form-section {
      padding: var(--spacing-lg);
    }

    .subnet-item,
    .host-item {
      padding: var(--spacing-md);
    }

    .form-actions {
      flex-direction: column;
    }

    .cancel-btn,
    .submit-btn {
      width: 100%;
    }

    .credentials-section {
      padding: var(--spacing-md);
    }
  }

  @media (max-width: 480px) {
    .subnet-header,
    .host-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
    }

    .form-summary {
      padding: var(--spacing-lg);
    }
  }
</style>
