<template>
  <BaseModal :model-value="true"
             title="Тестирование скрипта"
             subtitle="Настройте параметры выполнения скрипта на выбранных хостах"
             icon="CodeIcon"
             size="lg"
             :wrapper-class="`script-test-modal`"
             @close="$emit('cancel')">

    <!-- Progress Steps -->
    <div class="test-header">
      <div class="test-progress">
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

    <div class="test-config-content">
      <!-- Step 1: Host Selection -->
      <div v-if="currentStep === 0" class="config-step">
        <div class="step-header">
          <h3 class="step-title">Выбор целей тестирования</h3>
          <p class="step-description">Выберите войсковую часть и конкретные хосты для выполнения скрипта</p>
        </div>

        <div class="selection-section">
          <!-- Military Unit Selection -->
          <div class="selection-group">
            <div class="selection-header">
              <div class="selection-title">
                <ServerIcon class="title-icon" />
                <span>Войсковая часть</span>
              </div>
            </div>

            <div class="form-group">
              <BaseSelect v-model="selectedUnitId"
                          :options="unitOptions"
                          placeholder="Выберите войсковую часть"
                          required
                          class="form-control"
                          @change="handleUnitChange" />
            </div>
          </div>

          <!-- Hosts Selection -->
          <div class="selection-group">
            <div class="selection-header">
              <div class="selection-title">
                <HostIcon class="title-icon" />
                <span>Хосты для тестирования</span>
              </div>
              <div class="selection-actions">
                <BaseCheckbox :model-value="allHostsSelected"
                              :indeterminate="someHostsSelected"
                              @update:model-value="handleSelectAllHosts"
                              class="select-all-checkbox" />
                <span class="selection-count">{{ selectedHosts.length }} выбрано</span>
              </div>
            </div>

            <div class="hosts-grid">
              <div v-for="host in availableHosts"
                   :key="host.id"
                   class="host-card"
                   :class="{ 'host-card--selected': isHostSelected(host.id) }"
                   @click="toggleHostSelection(host.id)">
                <BaseCheckbox :model-value="isHostSelected(host.id)"
                              @click.stop
                              class="host-checkbox" />
                <div class="host-content">
                  <div class="host-info">
                    <h4 class="host-name">{{ host.name }}</h4>
                    <div class="host-meta">
                      <code class="host-ip">{{ host.ipAddress }}</code>
                      <BaseChip :color="getOsColor(host.osType)" size="xs">
                        {{ getOsText(host.osType) }}
                      </BaseChip>
                    </div>
                  </div>
                  <div class="host-status" :class="`status--${host.status || 'unknown'}`">
                    {{ getHostStatusText(host.status) }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="availableHosts.length === 0" class="empty-state">
              <HostIcon class="empty-icon" />
              <p>Хосты не найдены</p>
              <p class="empty-description">
                Выберите войсковую часть для отображения доступных хостов
              </p>
            </div>
          </div>
        </div>

        <!-- Selection Summary -->
        <div class="selection-summary">
          <div class="summary-cards">
            <div class="summary-card">
              <div class="summary-icon hosts">
                <HostIcon />
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ selectedHosts.length }}</div>
                <div class="summary-label">Выбрано хостов</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Script Parameters -->
      <div v-else-if="currentStep === 1" class="config-step">
        <div class="step-header">
          <h3 class="step-title">Параметры скрипта</h3>
          <p class="step-description" v-if="hasParameters">
            Настройте параметры выполнения скрипта
          </p>
          <p class="step-description" v-else>
            Этот скрипт не требует дополнительных параметров
          </p>
        </div>

        <div v-if="hasParameters" class="parameters-section">
          <div class="parameters-grid">
            <div v-for="param in script.parameters"
                 :key="param.name"
                 class="parameter-group">
              <label class="form-label" :class="{ required: param.required }">
                {{ param.name }}
              </label>
              <BaseInput v-model="parameters[param.name]"
                         :placeholder="param.description || `Введите ${param.name}`"
                         :required="param.required"
                         class="form-control" />
              <div v-if="param.description" class="parameter-description">
                {{ param.description }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-parameters">
          <CodeIcon class="no-params-icon" />
          <p>Дополнительные параметры не требуются</p>
          <p class="no-params-description">
            Скрипт будет выполнен с параметрами по умолчанию
          </p>
        </div>
      </div>

      <!-- Step 3: Execution Settings -->
      <div v-else-if="currentStep === 2" class="config-step">
        <div class="step-header">
          <h3 class="step-title">Настройки выполнения</h3>
          <p class="step-description">Настройте параметры выполнения скрипта на выбранных хостах</p>
        </div>

        <div class="options-section">
          <div class="options-grid">
            <div class="option-group">
              <h4 class="option-group-title">Основные параметры</h4>
              <div class="option-list">
                <div class="option-item">
                  <div class="option-content">
                    <label class="option-label required">Таймаут выполнения</label>
                    <p class="option-description">
                      Максимальное время выполнения скрипта в секундах
                    </p>
                  </div>
                  <BaseInput v-model.number="formData.timeout"
                             type="number"
                             placeholder="300"
                             min="30"
                             max="3600"
                             class="timeout-input" />
                </div>

                <div class="option-item">
                  <BaseToggle v-model="formData.parallelExecution"
                              class="option-toggle" />
                  <div class="option-content">
                    <label class="option-label">Параллельное выполнение</label>
                    <p class="option-description">
                      Выполнять скрипт одновременно на нескольких хостах
                    </p>
                  </div>
                </div>

                <div class="option-item">
                  <BaseToggle v-model="formData.stopOnError"
                              class="option-toggle" />
                  <div class="option-content">
                    <label class="option-label">Останавливать при ошибке</label>
                    <p class="option-description">
                      Прекращать выполнение при первой критической ошибке
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="option-group">
              <h4 class="option-group-title">Предварительный просмотр</h4>
              <div class="preview-content">
                <div class="preview-item">
                  <span class="preview-label">Скрипт:</span>
                  <span class="preview-value">{{ script.name }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Тип:</span>
                  <span class="preview-value">{{ scriptTypeLabel }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Количество хостов:</span>
                  <span class="preview-value">{{ selectedHosts.length }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Ожидаемое время:</span>
                  <span class="preview-value">{{ estimatedTime }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Режим выполнения:</span>
                  <span class="preview-value">{{ executionMode }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <template #footer>
      <div class="test-config-actions">
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
                    @click="handleStartTest"
                    variant="primary"
                    :loading="isSubmitting"
                    :disabled="!canStartTest"
                    class="nav-btn start-btn">
          <PlayIcon class="button-icon" />
          Запустить тестирование
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useToast } from '@/framework/ui/composables/useToast'
  import BaseModal from '@/framework/ui/components/overlay/BaseModal.vue'
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue'
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue'
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue'
  import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue'
  import BaseCheckbox from '@/framework/ui/components/forms/BaseCheckbox.vue'
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue'
  import {
    PlayIcon,
    HostIcon,
    ServerIcon,
    CodeIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckIcon
  } from '@/assets/icons'
  import { useMilitaryUnits } from '../../composables/useMilitaryUnits'
  import type { Script, Host, MilitaryUnit } from '../../api/audit.types'

  interface ScriptTestFormData {
    timeout: number
    parallelExecution: boolean
    stopOnError: boolean
  }

  interface Props {
    script: Script
  }

  interface Emits {
    (e: 'submit', data: {
      scriptId: string
      hostIds: string[]
      parameters: Record<string, string>
      timeout: number
      parallelExecution: boolean
      stopOnError: boolean
    }): void
    (e: 'cancel'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const { showToast } = useToast()
  const militaryUnits = useMilitaryUnits()

  // State
  const currentStep = ref(0)
  const isSubmitting = ref(false)
  const selectedUnitId = ref('')
  const selectedHostIds = ref<string[]>([])
  const parameters = ref<Record<string, string>>({})

  const formData = ref<ScriptTestFormData>({
    timeout: 300,
    parallelExecution: true,
    stopOnError: false
  })

  // Steps configuration
  const steps = ref([
    { id: 'targets', label: 'Выбор целей' },
    { id: 'parameters', label: 'Параметры' },
    { id: 'settings', label: 'Настройки' }
  ])

  // Computed properties
  const scriptTypeLabel = computed(() => {
    const types: Record<string, string> = {
      'check': 'Проверка',
      'fix': 'Исправление',
      'scan': 'Сканирование',
      'custom': 'Пользовательский'
    }
    return types[props.script.type] || props.script.type
  })

  const hasParameters = computed(() => {
    return props.script.parameters && props.script.parameters.length > 0
  })

  const unitOptions = computed(() => {
    return militaryUnits.units.value.map((unit: MilitaryUnit) => ({
      value: unit.id,
      label: `${unit.name} (${unit.location})`
    }))
  })

  const availableHosts = computed(() => {
    if (!selectedUnitId.value) return []
    const unit = militaryUnits.units.value.find((u: MilitaryUnit) => u.id === selectedUnitId.value)
    return unit?.hosts || []
  })

  const selectedHosts = computed(() => {
    if (!selectedUnitId.value || selectedHostIds.value.length === 0) return []
    const unit = militaryUnits.units.value.find((u: MilitaryUnit) => u.id === selectedUnitId.value)
    if (!unit?.hosts) return []
    return unit.hosts.filter((host: Host) => selectedHostIds.value.includes(host.id))
  })

  // Selection states
  const allHostsSelected = computed(() => {
    return availableHosts.value.length > 0 &&
      selectedHostIds.value.length === availableHosts.value.length
  })

  const someHostsSelected = computed(() => {
    return selectedHostIds.value.length > 0 &&
      selectedHostIds.value.length < availableHosts.value.length
  })

  // Validation
  const canProceedToNextStep = computed(() => {
    switch (currentStep.value) {
      case 0: // Host selection
        return selectedHosts.value.length > 0
      case 1: // Parameters
        if (!hasParameters.value) return true

        for (const param of props.script.parameters) {
          if (param.required && !parameters.value[param.name]?.trim()) {
            return false
          }
        }
        return true
      default:
        return true
    }
  })

  const canStartTest = computed(() => {
    return selectedHosts.value.length > 0 &&
      formData.value.timeout >= 30 &&
      formData.value.timeout <= 3600
  })

  const estimatedTime = computed(() => {
    const baseTime = formData.value.parallelExecution ? 60 : selectedHosts.value.length * 30
    const totalSeconds = Math.min(baseTime + formData.value.timeout, 3600)

    if (totalSeconds < 60) {
      return `${totalSeconds} сек`
    } else {
      return `${Math.round(totalSeconds / 60)} мин`
    }
  })

  const executionMode = computed(() => {
    return formData.value.parallelExecution ? 'Параллельный' : 'Последовательный'
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

  const handleUnitChange = () => {
    selectedHostIds.value = []
  }

  const isHostSelected = (hostId: string): boolean => {
    return selectedHostIds.value.includes(hostId)
  }

  const toggleHostSelection = (hostId: string): void => {
    const index = selectedHostIds.value.indexOf(hostId)
    if (index > -1) {
      selectedHostIds.value.splice(index, 1)
    } else {
      selectedHostIds.value.push(hostId)
    }
  }

  const handleSelectAllHosts = (isChecked: boolean): void => {
    if (isChecked) {
      selectedHostIds.value = availableHosts.value.map(host => host.id)
    } else {
      selectedHostIds.value = []
    }
  }

  // Helper methods
  const getHostStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      online: 'В сети',
      offline: 'Не в сети',
      unknown: 'Неизвестно'
    }
    return statusMap[status] || status
  }

  const getOsText = (osType: string): string => {
    const osMap: Record<string, string> = {
      linux: 'Linux',
      windows: 'Windows',
      unknown: 'Неизвестно'
    }
    return osMap[osType] || osType
  }

  const getOsColor = (osType: string): string => {
    const colorMap: Record<string, string> = {
      linux: 'info',
      windows: 'primary',
      unknown: 'default'
    }
    return colorMap[osType] || 'default'
  }

  const validateForm = (): boolean => {
    if (selectedHosts.value.length === 0) {
      showToast({
        type: 'warning',
        title: 'Выберите хосты',
        message: 'Необходимо выбрать хотя бы один хост для тестирования'
      })
      return false
    }

    // Validate parameters
    if (props.script.parameters) {
      for (const param of props.script.parameters) {
        if (param.required && !parameters.value[param.name]?.trim()) {
          showToast({
            type: 'warning',
            title: 'Заполните параметры',
            message: `Параметр "${param.name}" обязателен для заполнения`
          })
          return false
        }
      }
    }

    if (formData.value.timeout < 30 || formData.value.timeout > 3600) {
      showToast({
        type: 'warning',
        title: 'Неверный таймаут',
        message: 'Таймаут должен быть в диапазоне от 30 до 3600 секунд'
      })
      return false
    }

    return true
  }

  const handleStartTest = async (): Promise<void> => {
    if (!validateForm()) {
      return
    }

    isSubmitting.value = true

    try {
      const testData = {
        scriptId: props.script.id,
        hostIds: selectedHostIds.value,
        parameters: parameters.value,
        timeout: formData.value.timeout,
        parallelExecution: formData.value.parallelExecution,
        stopOnError: formData.value.stopOnError
      }

      emit('submit', testData)

      showToast({
        type: 'success',
        title: 'Тестирование запущено',
        message: `Скрипт "${props.script.name}" запущен на ${selectedHosts.value.length} хостах`
      })
    } catch (error) {
      console.error('Failed to start script test:', error)
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось запустить тестирование скрипта'
      })
    } finally {
      isSubmitting.value = false
    }
  }

  // Initialize parameters
  watch(() => props.script, (newScript) => {
    if (newScript.parameters) {
      parameters.value = {}
      newScript.parameters.forEach(param => {
        parameters.value[param.name] = param.defaultValue?.toString() || ''
      })
    }
  }, { immediate: true })
</script>

<style scoped>
  .script-test-modal ::v-deep(.base-modal__container) {
    display: flex;
    flex-direction: column;
    max-height: 80vh;
  }

  .script-test-modal ::v-deep(.base-modal__content) {
    padding: 0;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  /* Header */
  .test-header {
    flex-shrink: 0;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  .test-progress {
    padding: var(--space-xl) var(--space-xl) var(--space-lg);
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
    margin-bottom: var(--space-sm);
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
    font-weight: var(--font-weight-semibold);
  }

  .step-label {
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    text-align: center;
    max-width: 100px;
  }

  .progress-step--active .step-label {
    color: var(--color-primary);
    font-weight: var(--font-weight-semibold);
  }

  .progress-step--completed .step-label {
    color: var(--color-success);
  }

  /* Content */
  .test-config-content {
    flex: 1;
    padding: var(--space-xl);
    overflow-y: auto;
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
    margin-bottom: var(--space-2xl);
    text-align: center;
  }

  .step-title {
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-sm) 0;
  }

  .step-description {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Selection Section */
  .selection-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xl);
  }

  .selection-group {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    overflow: hidden;
  }

  .selection-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg);
    background: var(--color-surface-hover);
    border-bottom: 1px solid var(--color-border);
  }

  .selection-title {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .title-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-primary);
  }

  .selection-actions {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .selection-count {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium);
  }

  .form-group {
    padding: var(--space-lg);
  }

  /* Hosts Grid */
  .hosts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-md);
    padding: var(--space-lg);
  }

  .host-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-lg);
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

    .host-card:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

  .host-card--selected {
    border-color: var(--color-primary);
    background: var(--color-primary-50);
  }

  .host-checkbox {
    margin-top: 0.125rem;
    flex-shrink: 0;
  }

  .host-content {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-md);
  }

  .host-info {
    flex: 1;
  }

  .host-name {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold);
    margin: 0 0 var(--space-sm) 0;
    color: var(--color-text-primary);
  }

  .host-meta {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .host-ip {
    background: var(--color-surface-hover);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    font-family: var(--font-family-mono);
    font-size: 0.875rem;
    color: var(--color-text-primary);
  }

  .host-status {
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .status--online {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  .status--offline {
    background: var(--color-error-light);
    color: var(--color-error);
  }

  .status--unknown {
    background: var(--color-warning-light);
    color: var(--color-warning);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: var(--space-3xl) var(--space-2xl);
    color: var(--color-text-secondary);
  }

  .empty-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: var(--space-md);
    opacity: 0.5;
  }

  .empty-description {
    margin: var(--space-sm) 0 0 0;
    font-size: 0.9rem;
  }

  /* Selection Summary */
  .selection-summary {
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    border: 1px solid var(--color-border);
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-lg);
  }

  .summary-card {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
  }

  .summary-icon {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

    .summary-icon.hosts {
      background: var(--color-primary);
    }

  .summary-content {
    flex: 1;
  }

  .summary-value {
    font-size: 1.75rem;
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--space-xs);
    color: var(--color-text-primary);
  }

  .summary-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  /* Parameters Section */
  .parameters-section {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    border: 1px solid var(--color-border);
  }

  .parameters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-lg);
  }

  .parameter-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .form-label {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    font-size: 0.9rem;
  }

    .form-label.required::after {
      content: '*';
      color: var(--color-error);
      margin-left: var(--space-xs);
    }

  .parameter-description {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  /* No Parameters */
  .no-parameters {
    text-align: center;
    padding: var(--space-3xl) var(--space-2xl);
    color: var(--color-text-secondary);
  }

  .no-params-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: var(--space-md);
    opacity: 0.5;
  }

  .no-params-description {
    margin: var(--space-sm) 0 0 0;
    font-size: 0.9rem;
  }

  /* Options Section */
  .options-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xl);
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2xl);
  }

  .option-group {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    border: 1px solid var(--color-border);
  }

  .option-group-title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold);
    margin: 0 0 var(--space-lg) 0;
    color: var(--color-text-primary);
    padding-bottom: var(--space-md);
    border-bottom: 1px solid var(--color-border);
  }

  .option-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .option-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-md);
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
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    display: block;
    margin-bottom: var(--space-xs);
  }

    .option-label.required::after {
      content: '*';
      color: var(--color-error);
      margin-left: var(--space-xs);
    }

  .option-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
    margin: 0;
  }

  .timeout-input {
    width: 120px;
    flex-shrink: 0;
  }

  /* Preview Content */
  .preview-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .preview-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md);
    background: var(--color-surface-hover);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .preview-label {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .preview-value {
    font-weight: var(--font-weight-semibold);
    color: var(--color-primary);
  }

  /* Navigation */
  .test-config-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
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
    gap: var(--space-md);
  }

  .step-info {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium);
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .options-grid {
      grid-template-columns: 1fr;
    }

    .parameters-grid {
      grid-template-columns: 1fr;
    }

    .hosts-grid {
      grid-template-columns: 1fr;
    }

    .summary-cards {
      grid-template-columns: 1fr;
    }

    .test-progress {
      padding: var(--space-lg) var(--space-lg) var(--space-md);
    }

    .test-config-content {
      padding: var(--space-lg);
    }
  }

  @media (max-width: 768px) {
    .test-progress {
      padding: var(--space-lg) var(--space-lg) var(--space-md);
    }

    .progress-steps::before {
      left: 1.5rem;
      right: 1.5rem;
    }

    .step-label {
      font-size: 0.75rem;
      max-width: 80px;
    }

    .test-config-actions {
      flex-direction: column;
      gap: var(--space-md);
    }

    .step-indicators {
      order: -1;
    }

    .nav-btn {
      width: 100%;
    }
  }
</style>
