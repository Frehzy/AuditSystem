<template>
  <BaseModal :model-value="true"
             title="Настройка сетевого сканирования"
             subtitle="Настройте параметры для поиска хостов в сети"
             icon="ScanIcon"
             size="lg"
             :wrapper-class="`network-scan-form-modal`"
             @close="$emit('cancel')">

    <!-- Progress Steps -->
    <div class="scan-header">
      <div class="scan-progress">
        <div class="progress-steps">
          <div v-for="(step, index) in steps"
               :key="step.id"
               class="progress-step"
               :class="{
               'progress-step--completed' : currentStep>
            index,
            'progress-step--active': currentStep === index,
            'progress-step--disabled': currentStep < index
            }"
            @click="setStep(index)">
            <div class="step-indicator">
              <span v-if="currentStep > index" class="step-check">
                <CheckIcon size="16" />
              </span>
              <span v-else class="step-number">{{ index + 1 }}</span>
            </div>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="scan-config-content">
      <!-- Step 1: Basic Settings -->
      <div v-if="currentStep === 0" class="config-step">
        <div class="step-header">
          <h3 class="step-title">Основные параметры сканирования</h3>
          <p class="step-description">Задайте диапазон IP-адресов и основные параметры сканирования</p>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label required">IP-диапазон или сеть</label>
            <BaseInput v-model="formData.ipRange"
                       placeholder="192.168.1.0/24 или 192.168.1.1-192.168.1.254"
                       required
                       class="form-control"
                       @blur="validateStep(0)" />
            <div class="form-hint">
              Поддерживаются форматы CIDR (192.168.1.0/24) и диапазоны (192.168.1.1-192.168.1.254)
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Порты для сканирования</label>
            <BaseInput v-model="formData.ports"
                       placeholder="22,80,443,3389"
                       class="form-control" />
            <div class="form-hint">
              Список портов через запятую. Оставьте пустым для сканирования всех портов
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Таймаут (сек)</label>
            <BaseInput v-model.number="formData.timeout"
                       type="number"
                       placeholder="5"
                       min="1"
                       max="60"
                       class="form-control" />
            <div class="form-hint">Время ожидания ответа от хоста (1-60 секунд)</div>
          </div>

          <div class="form-group">
            <label class="form-label">Параллельные потоки</label>
            <BaseInput v-model.number="formData.threads"
                       type="number"
                       placeholder="10"
                       min="1"
                       max="100"
                       class="form-control" />
            <div class="form-hint">Количество одновременных подключений (1-100)</div>
          </div>
        </div>

        <!-- Scan Options -->
        <div class="options-section">
          <div class="option-group">
            <h4 class="option-group-title">Опции сканирования</h4>
            <div class="option-list">
              <div class="option-item">
                <BaseToggle v-model="formData.quickScan"
                            class="option-toggle" />
                <div class="option-content">
                  <label class="option-label">Быстрое сканирование</label>
                  <p class="option-description">
                    Сканировать только основные порты для ускорения процесса
                  </p>
                </div>
              </div>

              <div class="option-item">
                <BaseToggle v-model="formData.osDetection"
                            class="option-toggle" />
                <div class="option-content">
                  <label class="option-label">Определение ОС</label>
                  <p class="option-description">
                    Определять операционные системы найденных хостов
                  </p>
                </div>
              </div>

              <div class="option-item">
                <BaseToggle v-model="formData.serviceDetection"
                            class="option-toggle" />
                <div class="option-content">
                  <label class="option-label">Определение сервисов</label>
                  <p class="option-description">
                    Определять версии сервисов на открытых портах
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Preview & Summary -->
      <div v-else-if="currentStep === 1" class="config-step">
        <div class="step-header">
          <h3 class="step-title">Предварительный просмотр</h3>
          <p class="step-description">Проверьте параметры сканирования перед запуском</p>
        </div>

        <div class="preview-section">
          <div class="preview-grid">
            <div class="preview-card">
              <div class="preview-icon">
                <ScanIcon />
              </div>
              <div class="preview-content">
                <div class="preview-value">{{ scanType }}</div>
                <div class="preview-label">Тип сканирования</div>
              </div>
            </div>

            <div class="preview-card">
              <div class="preview-icon">
                <PortIcon />
              </div>
              <div class="preview-content">
                <div class="preview-value">{{ portCount }}</div>
                <div class="preview-label">Количество портов</div>
              </div>
            </div>

            <div class="preview-card">
              <div class="preview-icon">
                <TimeIcon />
              </div>
              <div class="preview-content">
                <div class="preview-value">{{ estimatedTime }}</div>
                <div class="preview-label">Ожидаемое время</div>
              </div>
            </div>

            <div class="preview-card">
              <div class="preview-icon">
                <ThreadsIcon />
              </div>
              <div class="preview-content">
                <div class="preview-value">{{ formData.threads }}</div>
                <div class="preview-label">Параллельных потоков</div>
              </div>
            </div>
          </div>

          <!-- Detailed Preview -->
          <div class="detailed-preview">
            <h4 class="preview-title">Детали сканирования</h4>
            <div class="preview-content">
              <div class="preview-item">
                <span class="preview-label">Диапазон сканирования:</span>
                <span class="preview-value">{{ formData.ipRange || 'Не указан' }}</span>
              </div>
              <div class="preview-item">
                <span class="preview-label">Порты:</span>
                <span class="preview-value">{{ formData.ports || 'Все порты' }}</span>
              </div>
              <div class="preview-item">
                <span class="preview-label">Таймаут:</span>
                <span class="preview-value">{{ formData.timeout }} сек</span>
              </div>
              <div class="preview-item">
                <span class="preview-label">Определение ОС:</span>
                <span class="preview-value">{{ formData.osDetection ? 'Включено' : 'Выключено' }}</span>
              </div>
              <div class="preview-item">
                <span class="preview-label">Определение сервисов:</span>
                <span class="preview-value">{{ formData.serviceDetection ? 'Включено' : 'Выключено' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <template #footer>
      <div class="scan-config-actions">
        <BaseButton @click="handlePreviousStep"
                    variant="secondary"
                    :disabled="currentStep === 0"
                    class="nav-btn">
          <ArrowLeftIcon class="button-icon" />
          Назад
        </BaseButton>

        <div class="step-indicators">
          <span class="step-info">Шаг {{ currentStep + 1 }} из {{ steps.length }}</span>
        </div>

        <BaseButton v-if="currentStep < steps.length - 1"
                    @click="handleNextStep"
                    variant="primary"
                    :disabled="!canProceedToNextStep"
                    class="nav-btn">
          Далее
          <ArrowRightIcon class="button-icon" />
        </BaseButton>

        <BaseButton v-else
                    @click="handleStartScan"
                    variant="primary"
                    :loading="isSubmitting"
                    :disabled="!canStartScan"
                    class="nav-btn start-btn">
          <ScanIcon class="button-icon" />
          Начать сканирование
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useToast } from '@/framework/ui/composables/useToast'
  import BaseModal from '@/framework/ui/components/overlay/BaseModal.vue'
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue'
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue'
  import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue'
  import {
    ScanIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckIcon,
    PortIcon,
    TimeIcon,
    ThreadsIcon
  } from '@/assets/icons'

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
  const currentStep = ref(0)

  // Steps configuration
  const steps = ref([
    { id: 'basic', label: 'Параметры сканирования' },
    { id: 'preview', label: 'Предпросмотр' }
  ])

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

  // Computed properties
  const canProceedToNextStep = computed(() => {
    switch (currentStep.value) {
      case 0: // Basic settings
        return formData.value.ipRange.trim().length > 0 && validateIpRange()
      case 1: // Preview
        return true
      default:
        return true
    }
  })

  const canStartScan = computed(() => {
    return formData.value.ipRange.trim().length > 0 && validateIpRange()
  })

  const scanType = computed(() => {
    return formData.value.quickScan ? 'Быстрое' : 'Полное'
  })

  const portCount = computed(() => {
    if (!formData.value.ports.trim()) return 'Все'
    if (formData.value.quickScan) return 'Основные (10)'

    const ports = formData.value.ports.split(',')
    return ports.length.toString()
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

  // Methods
  const setStep = (stepIndex: number) => {
    if (stepIndex <= currentStep.value) {
      currentStep.value = stepIndex
    }
  }

  const handleNextStep = () => {
    if (canProceedToNextStep.value && currentStep.value < steps.value.length - 1) {
      currentStep.value++
    }
  }

  const handlePreviousStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  const validateStep = (stepIndex: number) => {
    console.log('Validating step:', stepIndex)
  }

  const validateIpRange = (): boolean => {
    if (!formData.value.ipRange.trim()) return false

    const ipRangeRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2}|-\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})?$/
    return ipRangeRegex.test(formData.value.ipRange)
  }

  const validateForm = (): boolean => {
    if (!formData.value.ipRange.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните IP-диапазон',
        message: 'IP-диапазон обязателен для сканирования'
      })
      return false
    }

    if (!validateIpRange()) {
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

  const handleStartScan = async (): Promise<void> => {
    if (!validateForm()) {
      return
    }

    isSubmitting.value = true

    try {
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
  .network-scan-form-modal {
    /* Custom styles for the modal container */
  }

    .network-scan-form-modal ::v-deep(.base-modal__container) {
      display: flex;
      flex-direction: column;
      max-height: 80vh;
    }

    .network-scan-form-modal ::v-deep(.base-modal__content) {
      padding: 0;
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

  /* Fixed Header */
  .scan-header {
    flex-shrink: 0;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  .scan-progress {
    padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
  }

  .progress-steps {
    display: flex;
    justify-content: space-between;
    position: relative;
  }

    .progress-steps::before {
      content: '';
      position: absolute;
      top: 1rem;
      left: 2rem;
      right: 2rem;
      height: 2px;
      background: var(--color-border);
      z-index: 1;
    }

  .progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .progress-step--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .step-indicator {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    transition: all var(--transition-fast);
    margin-bottom: var(--spacing-sm);
  }

  .progress-step--active .step-indicator {
    border-color: var(--color-primary);
    background: var(--color-primary);
    color: white;
    transform: scale(1.1);
  }

  .progress-step--completed .step-indicator {
    border-color: var(--color-success);
    background: var(--color-success);
    color: white;
  }

  .step-check ::v-deep(svg) {
    width: 1rem;
    height: 1rem;
  }

  .step-number {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .step-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-align: center;
    max-width: 120px;
  }

  .progress-step--active .step-label {
    color: var(--color-primary);
    font-weight: 600;
  }

  .progress-step--completed .step-label {
    color: var(--color-success);
  }

  /* Scrollable Content */
  .scan-config-content {
    flex: 1;
    padding: var(--spacing-xl);
    overflow-y: auto;
    max-height: none;
  }

  .config-step {
    animation: slide-in 0.3s ease-out;
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(20px);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Step Header */
  .step-header {
    margin-bottom: var(--spacing-2xl);
    text-align: center;
  }

  .step-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-sm) 0;
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
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-2xl);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .form-label {
    font-weight: 600;
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
    line-height: 1.4;
  }

  /* Options Section */
  .options-section {
    margin-bottom: var(--spacing-xl);
  }

  .option-group {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    border: 1px solid var(--color-border);
  }

  .option-group-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 var(--spacing-lg) 0;
    color: var(--color-text-primary);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
  }

  .option-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .option-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-surface-hover);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .option-toggle {
    margin-top: 0.125rem;
    flex-shrink: 0;
  }

  .option-content {
    flex: 1;
  }

  .option-label {
    font-weight: 600;
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

  /* Preview Section */
  .preview-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
  }

  .preview-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    transition: all var(--transition-fast);
  }

    .preview-card:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

  .preview-icon {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary);
    color: white;
    flex-shrink: 0;
  }

  .preview-content {
    flex: 1;
  }

  .preview-value {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: var(--spacing-xs);
    color: var(--color-text-primary);
  }

  .preview-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  /* Detailed Preview */
  .detailed-preview {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    border: 1px solid var(--color-border);
  }

  .preview-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 var(--spacing-lg) 0;
    color: var(--color-text-primary);
  }

  .preview-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .preview-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--color-surface-hover);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .preview-label {
    font-weight: 500;
    color: var(--color-text-primary);
    font-size: 0.9rem;
  }

  .preview-value {
    font-weight: 600;
    color: var(--color-primary);
    font-family: var(--font-family-mono);
    font-size: 0.9rem;
  }

  /* Navigation */
  .scan-config-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    flex-shrink: 0;
  }

  .nav-btn {
    min-width: 120px;
  }

  .start-btn {
    min-width: 180px;
  }

  .step-indicators {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .step-info {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-weight: 500;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .form-grid {
      grid-template-columns: 1fr;
    }

    .preview-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .scan-progress {
      padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
    }

    .progress-steps::before {
      left: 1.5rem;
      right: 1.5rem;
    }

    .step-label {
      font-size: 0.75rem;
      max-width: 80px;
    }

    .scan-config-actions {
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .scan-config-content {
      padding: var(--spacing-lg);
    }

    .preview-grid {
      grid-template-columns: 1fr;
    }

    .nav-btn {
      width: 100%;
    }

    .step-indicators {
      order: -1;
    }
  }

  @media (max-width: 480px) {
    .progress-steps {
      flex-direction: column;
      gap: var(--spacing-lg);
    }

      .progress-steps::before {
        display: none;
      }

    .progress-step {
      flex-direction: row;
      text-align: left;
      gap: var(--spacing-md);
    }

    .step-indicator {
      margin-bottom: 0;
    }

    .step-label {
      max-width: none;
      text-align: left;
    }

    .option-item {
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .preview-card {
      flex-direction: column;
      text-align: center;
    }
  }
</style>
