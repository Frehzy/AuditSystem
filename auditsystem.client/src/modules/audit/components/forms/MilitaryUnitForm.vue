<template>
  <div class="military-unit-form">
    <form @submit.prevent="handleSubmit" class="unit-form">
      <!-- Основная информация -->
      <div class="form-section">
        <h3 class="section-title">Основная информация</h3>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label required">Название части</label>
            <BaseInput v-model="formData.name"
                       placeholder="Введите название войсковой части"
                       required
                       class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label required">Местоположение</label>
            <BaseInput v-model="formData.location"
                       placeholder="Введите местоположение"
                       required
                       class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label required">Статус</label>
            <BaseSelect v-model="formData.status"
                        :options="statusOptions"
                        required
                        class="form-control" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Описание</label>
          <BaseTextarea v-model="formData.description"
                        placeholder="Описание войсковой части..."
                        rows="3"
                        class="form-control" />
        </div>
      </div>

      <!-- Подсети -->
      <div class="form-section">
        <div class="section-header">
          <h3 class="section-title">Подсети</h3>
          <BaseButton @click="addSubnet"
                      variant="text"
                      size="sm">
            <PlusIcon class="button-icon" />
            Добавить подсеть
          </BaseButton>
        </div>

        <div class="subnets-list">
          <div v-for="(subnet, index) in formData.subnets"
               :key="index"
               class="subnet-item">
            <div class="subnet-header">
              <h4 class="subnet-title">Подсеть {{ index + 1 }}</h4>
              <BaseButton @click="removeSubnet(index)"
                          variant="text"
                          size="sm"
                          color="error">
                <DeleteIcon class="button-icon" />
                Удалить
              </BaseButton>
            </div>

            <div class="subnet-form">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label required">Название</label>
                  <BaseInput v-model="subnet.name"
                             placeholder="Название подсети"
                             required
                             class="form-control" />
                </div>

                <div class="form-group">
                  <label class="form-label required">Сеть</label>
                  <BaseInput v-model="subnet.network"
                             placeholder="192.168.1.0"
                             required
                             class="form-control" />
                </div>

                <div class="form-group">
                  <label class="form-label required">Маска</label>
                  <BaseInput v-model="subnet.mask"
                             placeholder="24"
                             required
                             class="form-control" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Описание</label>
                <BaseInput v-model="subnet.description"
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
          <h3 class="section-title">Хосты</h3>
          <BaseButton @click="addHost"
                      variant="text"
                      size="sm">
            <PlusIcon class="button-icon" />
            Добавить хост
          </BaseButton>
        </div>

        <div class="hosts-list">
          <div v-for="(host, index) in formData.hosts"
               :key="index"
               class="host-item">
            <div class="host-header">
              <h4 class="host-title">Хост {{ index + 1 }}</h4>
              <BaseButton @click="removeHost(index)"
                          variant="text"
                          size="sm"
                          color="error">
                <DeleteIcon class="button-icon" />
                Удалить
              </BaseButton>
            </div>

            <div class="host-form">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label required">Имя хоста</label>
                  <BaseInput v-model="host.name"
                             placeholder="server-01"
                             required
                             class="form-control" />
                </div>

                <div class="form-group">
                  <label class="form-label required">IP адрес</label>
                  <BaseInput v-model="host.ipAddress"
                             placeholder="192.168.1.100"
                             required
                             class="form-control" />
                </div>

                <div class="form-group">
                  <label class="form-label required">Операционная система</label>
                  <BaseSelect v-model="host.osType"
                              :options="osOptions"
                              required
                              class="form-control" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Описание</label>
                <BaseInput v-model="host.description"
                           placeholder="Описание хоста..."
                           class="form-control" />
              </div>

              <!-- Учетные данные -->
              <div class="credentials-section">
                <h5 class="subsection-title">Учетные данные</h5>

                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Тип авторизации</label>
                    <BaseSelect v-model="host.credentials.authType"
                                :options="authTypeOptions"
                                class="form-control" />
                  </div>

                  <div class="form-group">
                    <label class="form-label required">Пользователь</label>
                    <BaseInput v-model="host.credentials.username"
                               placeholder="root"
                               required
                               class="form-control" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Порт</label>
                    <BaseInput v-model.number="host.credentials.port"
                               type="number"
                               placeholder="22"
                               class="form-control" />
                  </div>
                </div>

                <div v-if="host.credentials.authType === 'password'" class="form-group">
                  <label class="form-label">Пароль</label>
                  <BaseInput v-model="host.credentials.password"
                             type="password"
                             placeholder="Пароль пользователя"
                             class="form-control" />
                </div>

                <div v-if="host.credentials.authType === 'rsa'" class="form-group">
                  <label class="form-label">RSA ключ</label>
                  <BaseTextarea v-model="host.credentials.rsaKey"
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

      <!-- Действия формы -->
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
  import {
    PlusIcon,
    DeleteIcon,
    SaveIcon,
    NetworkIcon,
    ServerIcon
  } from '@/assets/icons';
  import type { MilitaryUnit, CreateUnitCommand } from '../../api/audit.types';

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

  const addSubnet = (): void => {
    formData.value.subnets.push({
      name: '',
      network: '',
      mask: '',
      description: ''
    });
  };

  const removeSubnet = (index: number): void => {
    formData.value.subnets.splice(index, 1);
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
    formData.value.hosts.splice(index, 1);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    isSubmitting.value = true;

    try {
      const unitData: CreateUnitCommand = {
        name: formData.value.name,
        location: formData.value.location,
        status: formData.value.status,
        description: formData.value.description
      };

      emit('save', unitData);
      showToast({
        type: 'success',
        title: props.unit ? 'Войсковая часть обновлена' : 'Войсковая часть создана',
        message: 'Данные успешно сохранены'
      });
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
    if (!formData.value.name.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните название',
        message: 'Название войсковой части обязательно для заполнения'
      });
      return false;
    }

    if (!formData.value.location.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните местоположение',
        message: 'Местоположение обязательно для заполнения'
      });
      return false;
    }

    // Validate subnets
    for (const subnet of formData.value.subnets) {
      if (!subnet.name.trim() || !subnet.network.trim() || !subnet.mask.trim()) {
        showToast({
          type: 'warning',
          title: 'Заполните данные подсети',
          message: 'Все поля подсети обязательны для заполнения'
        });
        return false;
      }
    }

    // Validate hosts
    for (const host of formData.value.hosts) {
      if (!host.name.trim() || !host.ipAddress.trim()) {
        showToast({
          type: 'warning',
          title: 'Заполните данные хоста',
          message: 'Имя и IP адрес хоста обязательны для заполнения'
        });
        return false;
      }

      if (!host.credentials.username.trim()) {
        showToast({
          type: 'warning',
          title: 'Заполните учетные данные',
          message: 'Имя пользователя обязательно для заполнения'
        });
        return false;
      }
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
    gap: 2rem;
  }

  .form-section {
    background: var(--color-surface-hover);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
  }

  .subsection-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border);
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

  /* Subnets List */
  .subnets-list,
  .hosts-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .subnet-item,
  .host-item {
    background: var(--color-surface);
    border-radius: 0.75rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
  }

  .subnet-header,
  .host-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .subnet-title,
  .host-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
  }

  .subnet-form,
  .host-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Credentials Section */
  .credentials-section {
    background: var(--color-surface-hover);
    border-radius: 0.5rem;
    padding: 1.25rem;
    border: 1px solid var(--color-border);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-secondary);
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
  }

  .empty-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-description {
    margin: 0.5rem 0 0 0;
    font-size: 0.9rem;
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
  @media (max-width: 1024px) {
    .form-grid {
      grid-template-columns: 1fr;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  }

  @media (max-width: 768px) {
    .military-unit-form {
      max-height: 60vh;
    }

    .unit-form {
      gap: 1.5rem;
    }

    .form-section {
      padding: 1.25rem;
    }

    .subnet-item,
    .host-item {
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
