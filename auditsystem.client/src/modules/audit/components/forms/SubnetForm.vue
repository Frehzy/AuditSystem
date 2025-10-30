<template>
  <div class="subnet-form">
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-content">
        <div class="step-header">
          <h3 class="step-title">Добавление подсети</h3>
          <p class="step-description">Заполните информацию о новой подсети для войсковой части</p>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label required">Название подсети</label>
            <BaseInput v-model="formData.name"
                       placeholder="Основная сеть"
                       required
                       class="form-control"
                       @blur="validateField('name')" />
            <div class="form-hint">{{ formData.name.length }}/50 символов</div>
          </div>

          <div class="form-group">
            <label class="form-label required">IP сети</label>
            <BaseInput v-model="formData.network"
                       placeholder="192.168.1.0"
                       required
                       class="form-control"
                       @blur="validateField('network')" />
            <div class="form-hint">Базовый адрес сети</div>
          </div>

          <div class="form-group">
            <label class="form-label required">Маска подсети</label>
            <BaseSelect v-model="formData.mask"
                        :options="maskOptions"
                        required
                        class="form-control" />
            <div class="form-hint">{{ hostCount }} доступных хостов</div>
          </div>
        </div>

        <div class="form-group full-width">
          <label class="form-label">Описание</label>
          <BaseTextarea v-model="formData.description"
                        placeholder="Описание подсети и её назначение..."
                        :rows="3"
                        :maxlength="200"
                        class="form-control" />
          <div class="form-hint">{{ formData.description.length }}/200 символов</div>
        </div>

        <!-- Предварительный просмотр -->
        <div class="preview-section">
          <h4 class="preview-title">Предварительный просмотр</h4>
          <div class="preview-content">
            <div class="preview-item">
              <div class="preview-icon">
                <NetworkIcon />
              </div>
              <div class="preview-info">
                <span class="preview-label">Диапазон адресов</span>
                <span class="preview-value">{{ networkRange }}</span>
              </div>
            </div>
            <div class="preview-item">
              <div class="preview-icon">
                <HostIcon />
              </div>
              <div class="preview-info">
                <span class="preview-label">Количество хостов</span>
                <span class="preview-value">{{ hostCount }}</span>
              </div>
            </div>
            <div class="preview-item">
              <div class="preview-icon">
                <BroadcastIcon />
              </div>
              <div class="preview-info">
                <span class="preview-label">Широковещательный адрес</span>
                <span class="preview-value">{{ broadcastAddress }}</span>
              </div>
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
                    :disabled="!isFormValid"
                    class="submit-btn">
          <SaveIcon class="button-icon" />
          Добавить подсеть
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
  import BaseTextarea from '@/framework/ui/components/forms/BaseTextarea.vue';
  import { SaveIcon, NetworkIcon, HostIcon, BroadcastIcon } from '@/assets/icons';
  import type { CreateSubnetCommand } from '../../api/audit.types';

  interface Props {
    unitId: string;
  }

  interface Emits {
    (e: 'save', subnet: CreateSubnetCommand): void;
    (e: 'cancel'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { showToast } = useToast();

  const isSubmitting = ref(false);
  const formErrors = ref<Record<string, string>>({});

  const formData = ref({
    name: '',
    network: '',
    mask: '24',
    description: ''
  });

  const maskOptions = [
    { value: '16', label: '255.255.0.0 (/16) - 65534 хостов' },
    { value: '24', label: '255.255.255.0 (/24) - 254 хоста' },
    { value: '25', label: '255.255.255.128 (/25) - 126 хостов' },
    { value: '26', label: '255.255.255.192 (/26) - 62 хоста' },
    { value: '27', label: '255.255.255.224 (/27) - 30 хостов' },
    { value: '28', label: '255.255.255.240 (/28) - 14 хостов' },
    { value: '29', label: '255.255.255.248 (/29) - 6 хостов' },
    { value: '30', label: '255.255.255.252 (/30) - 2 хоста' }
  ];

  // Computed properties
  const networkRange = computed(() => {
    if (!formData.value.network || !formData.value.mask) return '-';

    try {
      const ip = formData.value.network.split('.').map(Number);
      const mask = parseInt(formData.value.mask);

      // Calculate network address
      const network = calculateNetworkAddress(ip, mask);
      // Calculate broadcast address
      const broadcast = calculateBroadcastAddress(ip, mask);

      return `${network.join('.')} - ${broadcast.join('.')}`;
    } catch {
      return '-';
    }
  });

  const hostCount = computed(() => {
    if (!formData.value.mask) return 0;

    const mask = parseInt(formData.value.mask);
    return Math.pow(2, 32 - mask) - 2;
  });

  const broadcastAddress = computed(() => {
    if (!formData.value.network || !formData.value.mask) return '-';

    try {
      const ip = formData.value.network.split('.').map(Number);
      const mask = parseInt(formData.value.mask);
      const broadcast = calculateBroadcastAddress(ip, mask);
      return broadcast.join('.');
    } catch {
      return '-';
    }
  });

  const isFormValid = computed(() => {
    return formData.value.name.trim().length > 0 &&
      formData.value.network.trim().length > 0 &&
      Object.keys(formErrors.value).length === 0;
  });

  // Validation methods
  const validateField = (field: string): void => {
    formErrors.value[field] = '';

    switch (field) {
      case 'name':
        if (!formData.value.name.trim()) {
          formErrors.value.name = 'Название подсети обязательно';
        } else if (formData.value.name.length > 50) {
          formErrors.value.name = 'Название не должно превышать 50 символов';
        }
        break;

      case 'network':
        if (!formData.value.network.trim()) {
          formErrors.value.network = 'IP адрес сети обязателен';
        } else if (!isValidIP(formData.value.network)) {
          formErrors.value.network = 'Введите корректный IP адрес';
        }
        break;
    }
  };

  const isValidIP = (ip: string): boolean => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;

    const parts = ip.split('.').map(Number);
    return parts.every(part => part >= 0 && part <= 255);
  };

  const calculateNetworkAddress = (ip: number[], mask: number): number[] => {
    const maskBinary = Array(32).fill(0);
    for (let i = 0; i < mask; i++) {
      maskBinary[i] = 1;
    }

    const maskBytes = [
      parseInt(maskBinary.slice(0, 8).join(''), 2),
      parseInt(maskBinary.slice(8, 16).join(''), 2),
      parseInt(maskBinary.slice(16, 24).join(''), 2),
      parseInt(maskBinary.slice(24, 32).join(''), 2)
    ];

    return ip.map((byte, index) => byte & maskBytes[index]);
  };

  const calculateBroadcastAddress = (ip: number[], mask: number): number[] => {
    const network = calculateNetworkAddress(ip, mask);
    const wildcard = 32 - mask;
    const wildcardBinary = Array(wildcard).fill(1);
    const wildcardBytes = [
      parseInt(wildcardBinary.slice(0, Math.max(0, wildcard - 24)).join('').padEnd(8, '0'), 2),
      parseInt(wildcardBinary.slice(Math.max(0, wildcard - 24), Math.max(0, wildcard - 16)).join('').padEnd(8, '0'), 2),
      parseInt(wildcardBinary.slice(Math.max(0, wildcard - 16), Math.max(0, wildcard - 8)).join('').padEnd(8, '0'), 2),
      parseInt(wildcardBinary.slice(Math.max(0, wildcard - 8), wildcard).join('').padEnd(8, '0'), 2)
    ];

    return network.map((byte, index) => byte | wildcardBytes[index]);
  };

  const validateForm = (): boolean => {
    validateField('name');
    validateField('network');

    return Object.keys(formErrors.value).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      showToast({
        type: 'warning',
        title: 'Заполните обязательные поля',
        message: 'Проверьте правильность введенных данных'
      });
      return;
    }

    isSubmitting.value = true;

    try {
      const subnetData: CreateSubnetCommand = {
        unitId: props.unitId,
        name: formData.value.name,
        network: formData.value.network,
        mask: formData.value.mask,
        description: formData.value.description
      };

      emit('save', subnetData);
      showToast({
        type: 'success',
        title: 'Подсеть добавлена',
        message: 'Новая подсеть успешно создана'
      });
    } catch (error) {
      console.error('Failed to create subnet:', error);
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось создать подсеть'
      });
    } finally {
      isSubmitting.value = false;
    }
  };

  // Watch for changes to clear errors
  watch(() => formData.value.name, () => {
    if (formErrors.value.name) {
      validateField('name');
    }
  });

  watch(() => formData.value.network, () => {
    if (formErrors.value.network) {
      validateField('network');
    }
  });
</script>

<style scoped>
  .subnet-form {
    max-height: 70vh;
    overflow-y: auto;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl, 2rem);
  }

  .form-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl, 1.5rem);
  }

  /* Step Header */
  .step-header {
    margin-bottom: var(--spacing-lg, 1.25rem);
    text-align: center;
  }

  .step-title {
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-sm, 0.75rem) 0;
  }

  .step-description {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Form Styles */
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl, 1.5rem);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 0.75rem);
  }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

  .form-label {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
    font-size: 0.9rem;
  }

    .form-label.required::after {
      content: '*';
      color: var(--color-error);
      margin-left: var(--spacing-xs, 0.25rem);
    }

  .form-hint {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-align: right;
  }

  /* Preview Section */
  .preview-section {
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    border: 1px solid var(--color-border);
  }

  .preview-title {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--spacing-md, 1rem) 0;
    color: var(--color-text-primary);
  }

  .preview-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md, 1rem);
  }

  .preview-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md, 1rem);
    padding: var(--spacing-md, 1rem);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    transition: all var(--transition-fast);
  }

    .preview-item:hover {
      border-color: var(--color-primary);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

  .preview-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary-light);
    color: var(--color-primary);
    flex-shrink: 0;
  }

  .preview-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs, 0.25rem);
    flex: 1;
  }

  .preview-label {
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  .preview-value {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
    font-family: var(--font-family-mono);
    font-size: 0.9rem;
  }

  /* Form Actions */
  .form-actions {
    display: flex;
    gap: var(--spacing-md, 1rem);
    justify-content: flex-end;
    padding-top: var(--spacing-lg, 1.25rem);
    border-top: 1px solid var(--color-border);
  }

  .cancel-btn,
  .submit-btn {
    min-width: 140px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: var(--spacing-sm, 0.5rem);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .subnet-form {
      max-height: 60vh;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column;
    }

    .cancel-btn,
    .submit-btn {
      width: 100%;
    }

    .preview-item {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-sm, 0.75rem);
    }

    .preview-info {
      align-items: center;
    }
  }

  @media (max-width: 480px) {
    .step-title {
      font-size: 1.25rem;
    }

    .step-description {
      font-size: 0.9rem;
    }

    .form-content {
      gap: var(--spacing-lg, 1.25rem);
    }

    .preview-section {
      padding: var(--spacing-md, 1rem);
    }
  }

  /* Animation */
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

  .subnet-form {
    animation: slide-in 0.3s ease-out;
  }

  /* Focus styles */
  .form-control:focus {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-focus);
  }

  /* Error states */
  .form-control.error {
    border-color: var(--color-error);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 40%, transparent);
  }
</style>
