<template>
  <div class="script-test-form">
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-content">
        <h3 class="form-title">Тестирование скрипта</h3>

        <div class="script-info">
          <div class="info-item">
            <span class="info-label">Скрипт:</span>
            <span class="info-value">{{ script.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Тип:</span>
            <span class="info-value">{{ scriptTypeLabel }}</span>
          </div>
        </div>

        <!-- Выбор хостов для тестирования -->
        <div class="form-section">
          <h4 class="section-title">Выбор хостов для тестирования</h4>

          <div class="form-group">
            <label class="form-label required">Войсковая часть</label>
            <BaseSelect v-model="selectedUnitId"
                        :options="unitOptions"
                        placeholder="Выберите войсковую часть"
                        required
                        class="form-control"
                        @change="handleUnitChange" />
          </div>

          <div class="form-group">
            <label class="form-label required">Хосты для тестирования</label>
            <BaseSelect v-model="selectedHostIds"
                        :options="hostOptions"
                        placeholder="Выберите хосты"
                        multiple
                        required
                        class="form-control" />
          </div>

          <div class="selected-hosts" v-if="selectedHosts.length > 0">
            <h5 class="selected-title">Выбранные хосты:</h5>
            <div class="hosts-list">
              <div v-for="host in selectedHosts" :key="host.id" class="host-item">
                <HostIcon class="host-icon" />
                <span class="host-name">{{ host.name }}</span>
                <span class="host-ip">({{ host.ipAddress }})</span>
                <span class="host-os">{{ host.osType }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Параметры скрипта -->
        <div class="form-section" v-if="hasParameters">
          <h4 class="section-title">Параметры скрипта</h4>

          <div class="parameters-grid">
            <div v-for="param in script.parameters" :key="param.name" class="form-group">
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

        <!-- Настройки выполнения -->
        <div class="form-section">
          <h4 class="section-title">Настройки выполнения</h4>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Таймаут (сек)</label>
              <BaseInput v-model.number="formData.timeout"
                         type="number"
                         placeholder="300"
                         min="30"
                         max="3600"
                         class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label">Параллельное выполнение</label>
              <BaseToggle v-model="formData.parallelExecution"
                          label="Выполнять на нескольких хостах одновременно" />
            </div>
          </div>

          <div class="form-group">
            <BaseToggle v-model="formData.stopOnError"
                        label="Останавливать при первой ошибке" />
          </div>
        </div>

        <!-- Предварительный просмотр -->
        <div class="preview-section">
          <h4 class="preview-title">Предварительный просмотр</h4>
          <div class="preview-content">
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
          <PlayIcon class="button-icon" />
          Запустить тестирование
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useToast } from '@/framework/ui/composables/useToast'
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue'
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue'
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue'
  import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue'
  import { PlayIcon, HostIcon } from '@/assets/icons'
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

  const isSubmitting = ref(false)
  const selectedUnitId = ref('')
  const selectedHostIds = ref<string[]>([])
  const parameters = ref<Record<string, string>>({})

  const formData = ref<ScriptTestFormData>({
    timeout: 300,
    parallelExecution: true,
    stopOnError: false
  })

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

  const hostOptions = computed(() => {
    if (!selectedUnitId.value) return []

    const unit = militaryUnits.units.value.find((u: MilitaryUnit) => u.id === selectedUnitId.value)
    if (!unit || !unit.hosts) return []

    return unit.hosts.map((host: Host) => ({
      value: host.id,
      label: `${host.name} (${host.ipAddress}) - ${host.osType}`
    }))
  })

  const selectedHosts = computed(() => {
    if (!selectedUnitId.value || selectedHostIds.value.length === 0) return []

    const unit = militaryUnits.units.value.find((u: MilitaryUnit) => u.id === selectedUnitId.value)
    if (!unit || !unit.hosts) return []

    return unit.hosts.filter((host: Host) => selectedHostIds.value.includes(host.id))
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
  const handleUnitChange = () => {
    selectedHostIds.value = []
  }

  const validateForm = (): boolean => {
    if (!selectedUnitId.value) {
      showToast({
        type: 'warning',
        title: 'Выберите войсковую часть',
        message: 'Необходимо выбрать войсковую часть для тестирования'
      })
      return false
    }

    if (selectedHostIds.value.length === 0) {
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

  const handleSubmit = async (): Promise<void> => {
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
  .script-test-form {
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

  /* Script Info */
  .script-info {
    background: var(--color-surface-hover);
    border-radius: 0.75rem;
    padding: 1.25rem;
    border: 1px solid var(--color-border);
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
  }

  .info-label {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .info-value {
    font-weight: 500;
    color: var(--color-primary);
  }

  /* Form Sections */
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

  .selected-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: var(--color-text-primary);
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .parameters-grid {
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

  .parameter-description {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  /* Selected Hosts */
  .selected-hosts {
    margin-top: 1rem;
  }

  .hosts-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .host-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--color-surface);
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
  }

  .host-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-primary);
  }

  .host-name {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .host-ip {
    color: var(--color-text-secondary);
    font-family: 'Fira Code', monospace;
  }

  .host-os {
    color: var(--color-text-muted);
    font-size: 0.8rem;
    margin-left: auto;
    text-transform: capitalize;
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
    .form-grid,
    .parameters-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .script-test-form {
      max-height: 60vh;
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

    .host-item {
      flex-wrap: wrap;
    }

    .host-os {
      margin-left: 0;
      width: 100%;
    }
  }
</style>
