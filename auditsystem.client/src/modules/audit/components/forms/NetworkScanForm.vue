<template>
  <div class="network-scan-form">
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-content">
        <h3 class="form-title">Настройка сетевого сканирования</h3>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label required">IP-диапазон или сеть</label>
            <BaseInput v-model="formData.ipRange"
                       placeholder="192.168.1.0/24 или 192.168.1.1-192.168.1.254"
                       required
                       class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label">Порты для сканирования</label>
            <BaseInput v-model="formData.ports"
                       placeholder="22,80,443,3389"
                       class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label">Таймаут (сек)</label>
            <BaseInput v-model.number="formData.timeout"
                       type="number"
                       placeholder="5"
                       min="1"
                       max="60"
                       class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label">Параллельные потоки</label>
            <BaseInput v-model.number="formData.threads"
                       type="number"
                       placeholder="10"
                       min="1"
                       max="100"
                       class="form-control" />
          </div>
        </div>

        <div class="form-group">
          <BaseToggle v-model="formData.quickScan"
                      label="Быстрое сканирование (только основные порты)" />
        </div>

        <div class="form-group">
          <BaseToggle v-model="formData.osDetection"
                      label="Определение операционной системы" />
        </div>

        <div class="form-group">
          <BaseToggle v-model="formData.serviceDetection"
                      label="Определение сервисов" />
        </div>

        <!-- Предварительный просмотр -->
        <div class="preview-section" v-if="showPreview">
          <h4 class="preview-title">Предварительный просмотр</h4>
          <div class="preview-content">
            <div class="preview-item">
              <span class="preview-label">Тип сканирования:</span>
              <span class="preview-value">{{ scanType }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Количество портов:</span>
              <span class="preview-value">{{ portCount }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Ожидаемое время:</span>
              <span class="preview-value">{{ estimatedTime }}</span>
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
          <ScanIcon class="button-icon" />
          Начать сканирование
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useToast } from '@/framework/ui/composables/useToast'
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue'
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue'
  import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue'
  import { ScanIcon } from '@/assets/icons'

  interface NetworkScanFormData {
    ipRange: string
    ports: string
    timeout: number
    threads: number
    quickScan: boolean
    osDetection: boolean
    serviceDetection: boolean
  }

  interface Props {
    initialData?: Partial<NetworkScanFormData>
    unitId?: string
  }

  interface Emits {
    (e: 'submit', data: NetworkScanFormData): void
    (e: 'cancel'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    initialData: () => ({}),
    unitId: undefined
  })

  const emit = defineEmits<Emits>()

  const { showToast } = useToast()

  const isSubmitting = ref(false)

  const formData = ref<NetworkScanFormData>({
    ipRange: '',
    ports: '22,80,443,3389,21,23,53,110,135,139,143,993,995,1723,3306,3389,5432,5900,8080',
    timeout: 5,
    threads: 10,
    quickScan: true,
    osDetection: false,
    serviceDetection: false,
    ...props.initialData
  })

  // Computed properties для предварительного просмотра
  const showPreview = computed(() => {
    return formData.value.ipRange.trim().length > 0
  })

  const scanType = computed(() => {
    return formData.value.quickScan ? 'Быстрое' : 'Полное'
  })

  const portCount = computed(() => {
    if (!formData.value.ports.trim()) return 0
    if (formData.value.quickScan) return 10 // Основные порты для быстрого сканирования

    const ports = formData.value.ports.split(',')
    return ports.length
  })

  const estimatedTime = computed(() => {
    if (!formData.value.ipRange) return '-'

    const baseTime = formData.value.quickScan ? 30 : 120
    const threadFactor = Math.max(1, 10 / formData.value.threads)
    const estimatedSeconds = Math.round(baseTime * threadFactor)

    if (estimatedSeconds < 60) {
      return `${estimatedSeconds} сек`
    } else {
      return `${Math.round(estimatedSeconds / 60)} мин`
    }
  })

  const validateForm = (): boolean => {
    if (!formData.value.ipRange.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните IP-диапазон',
        message: 'IP-диапазон обязателен для сканирования'
      })
      return false
    }

    // Basic validation for IP range format
    const ipRangeRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2}|-\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})?$/
    if (!ipRangeRegex.test(formData.value.ipRange)) {
      showToast({
        type: 'warning',
        title: 'Неверный формат IP-диапазона',
        message: 'Введите корректный IP-диапазон (например: 192.168.1.0/24 или 192.168.1.1-192.168.1.254)'
      })
      return false
    }

    if (formData.value.timeout < 1 || formData.value.timeout > 60) {
      showToast({
        type: 'warning',
        title: 'Неверный таймаут',
        message: 'Таймаут должен быть в диапазоне от 1 до 60 секунд'
      })
      return false
    }

    if (formData.value.threads < 1 || formData.value.threads > 100) {
      showToast({
        type: 'warning',
        title: 'Неверное количество потоков',
        message: 'Количество потоков должно быть в диапазоне от 1 до 100'
      })
      return false
    }

    return true
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return
    }

    isSubmitting.value = true

    try {
      // В реальном приложении здесь будет логика отправки данных сканирования
      const scanData: NetworkScanFormData = {
        ipRange: formData.value.ipRange,
        ports: formData.value.ports,
        timeout: formData.value.timeout,
        threads: formData.value.threads,
        quickScan: formData.value.quickScan,
        osDetection: formData.value.osDetection,
        serviceDetection: formData.value.serviceDetection
      }

      emit('submit', scanData)

      showToast({
        type: 'success',
        title: 'Сканирование запущено',
        message: 'Сетевое сканирование успешно начато'
      })
    } catch (error) {
      console.error('Failed to start network scan:', error)
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось запустить сетевое сканирование'
      })
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<style scoped>
  .network-scan-form {
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

  /* Preview Section */
  .preview-section {
    background: var(--color-surface-hover);
    border-radius: 0.75rem;
    padding: 1.25rem;
    border: 1px solid var(--color-border);
  }

  .preview-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
  }

  .preview-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .preview-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: var(--color-surface);
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
  }

  .preview-label {
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .preview-value {
    font-weight: 600;
    color: var(--color-primary);
    font-family: 'Fira Code', monospace;
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
    .network-scan-form {
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
  }
</style>
