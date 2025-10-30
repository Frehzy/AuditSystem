<template>
  <div class="base-file-input" :class="computedContainerClasses">
    <label v-if="label" :for="computedFileInputId" class="base-file-input__label">
      {{ label }}
      <span v-if="required" class="base-file-input__required">*</span>
    </label>

    <input :id="computedFileInputId"
           ref="fileInputRef"
           type="file"
           :accept="accept"
           :multiple="multiple"
           :disabled="disabled"
           :class="computedInputClasses"
           @change="handleFileChange"
           @blur="handleBlur"
           @focus="handleFocus" />

    <label :for="computedFileInputId" class="base-file-input__dropzone">
      <div class="base-file-input__dropzone-content">
        <div class="base-file-input__icon-wrapper">
          <UploadIcon :size="24" class="base-file-input__icon" />
        </div>
        <div class="base-file-input__text">
          <div class="base-file-input__title">
            {{ dropzoneTitle }}
          </div>
          <div class="base-file-input__subtitle">
            {{ dropzoneSubtitle }}
          </div>
        </div>
      </div>

      <div v-if="hasFiles" class="base-file-input__files">
        <div v-for="(file, index) in currentFiles"
             :key="index"
             class="base-file-input__file"
             :class="{ 'base-file-input__file--error': hasFileError(file) }">
          <div class="base-file-input__file-info">
            <div class="base-file-input__file-icon">
              <DocumentIcon :size="16" />
            </div>
            <div class="base-file-input__file-details">
              <span class="base-file-input__file-name">{{ file.name }}</span>
              <span class="base-file-input__file-meta">
                <span class="base-file-input__file-size">({{ formatFileSize(file.size) }})</span>
                <span v-if="hasFileError(file)" class="base-file-input__file-error">
                  {{ getFileError(file) }}
                </span>
              </span>
            </div>
          </div>
          <button type="button"
                  class="base-file-input__file-remove"
                  @click="handleRemoveFile(index)"
                  :disabled="disabled"
                  :aria-label="`Удалить файл ${file.name}`">
            <CloseIcon :size="14" />
          </button>
        </div>
      </div>
    </label>

    <div v-if="helpText && !error" class="base-file-input__help">
      <InfoIcon :size="14" class="base-file-input__help-icon" />
      {{ helpText }}
    </div>

    <div v-if="error" class="base-file-input__error" role="alert">
      <AlertIcon :size="14" class="base-file-input__error-icon" />
      {{ error }}
    </div>

    <!-- Selection Summary -->
    <div v-if="hasFiles && showSummary" class="base-file-input__summary">
      <div class="base-file-input__summary-cards">
        <div class="base-file-input__summary-card">
          <div class="base-file-input__summary-icon files">
            <DocumentIcon :size="16" />
          </div>
          <div class="base-file-input__summary-content">
            <div class="base-file-input__summary-value">{{ currentFiles.length }}</div>
            <div class="base-file-input__summary-label">Файлов</div>
          </div>
        </div>
        <div class="base-file-input__summary-card">
          <div class="base-file-input__summary-icon size">
            <StorageIcon :size="16" />
          </div>
          <div class="base-file-input__summary-content">
            <div class="base-file-input__summary-value">{{ formatFileSize(totalSize) }}</div>
            <div class="base-file-input__summary-label">Общий размер</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, useId, watch } from 'vue'
  import UploadIcon from '@/assets/icons/actions/UploadIcon.vue'
  import DocumentIcon from '@/assets/icons/files/DocumentIcon.vue'
  import CloseIcon from '@/assets/icons/actions/CloseIcon.vue'
  import AlertIcon from '@/assets/icons/status/AlertIcon.vue'
  import InfoIcon from '@/assets/icons/status/InfoIcon.vue'
  import StorageIcon from '@/assets/icons/files/StorageIcon.vue'

  interface Props {
    id?: string
    modelValue: File[] | File | null
    label?: string
    accept?: string
    multiple?: boolean
    required?: boolean
    disabled?: boolean
    error?: string
    helpText?: string
    maxFiles?: number
    maxSize?: number // in bytes
    dropzoneTitle?: string
    dropzoneSubtitle?: string
    size?: 'sm' | 'md' | 'lg'
    showSummary?: boolean
    validateOnChange?: boolean
  }

  interface FileWithError extends File {
    error?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    multiple: false,
    required: false,
    disabled: false,
    error: undefined,
    helpText: undefined,
    maxFiles: undefined,
    maxSize: undefined,
    dropzoneTitle: 'Перетащите файлы или нажмите для выбора',
    dropzoneSubtitle: 'Поддерживаются файлы до 10MB',
    size: 'md',
    showSummary: true,
    validateOnChange: true
  })

  const emit = defineEmits<{
    'update:modelValue': [files: File[] | File | null]
    'change': [files: File[] | File | null]
    'blur': [event: FocusEvent]
    'focus': [event: FocusEvent]
    'file-add': [file: File]
    'file-remove': [file: File, index: number]
    'file-error': [file: File, error: string]
    'validation-error': [errors: string[]]
  }>()

  const fileInputRef = ref<HTMLInputElement | null>(null)
  const isFocused = ref(false)
  const currentFiles = ref<FileWithError[]>([])
  const validationErrors = ref<string[]>([])

  const computedFileInputId = computed(() => props.id || `file-input-${useId()}`)

  const hasFiles = computed(() => {
    if (Array.isArray(props.modelValue)) {
      return props.modelValue.length > 0
    }
    return props.modelValue !== null
  })

  const totalSize = computed(() => {
    return currentFiles.value.reduce((total, file) => total + file.size, 0)
  })

  const computedContainerClasses = computed(() => [
    'base-file-input',
    `base-file-input--${props.size}`,
    {
      'base-file-input--error': !!props.error,
      'base-file-input--disabled': props.disabled,
      'base-file-input--focused': isFocused.value,
      'base-file-input--has-files': hasFiles.value,
      'base-file-input--has-error': validationErrors.value.length > 0,
    },
  ])

  const computedInputClasses = computed(() => [
    'base-file-input__input',
    {
      'base-file-input__input--error': !!props.error,
      'base-file-input__input--disabled': props.disabled,
    },
  ])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Validate file size
    if (props.maxSize && file.size > props.maxSize) {
      return `Файл превышает максимальный размер ${formatFileSize(props.maxSize)}`
    }

    // Validate file type
    if (props.accept) {
      const acceptTypes = props.accept.split(',').map(type => type.trim())
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      const fileType = file.type.toLowerCase()

      const isValid = acceptTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase()
        } else if (type.includes('/*')) {
          const category = type.split('/*')[0]
          return fileType.startsWith(category)
        } else {
          return fileType === type
        }
      })

      if (!isValid) {
        return `Тип файла не поддерживается. Разрешены: ${props.accept}`
      }
    }

    return null
  }

  const hasFileError = (file: FileWithError): boolean => {
    return !!file.error
  }

  const getFileError = (file: FileWithError): string => {
    return file.error || ''
  }

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const selectedFiles = target.files

    if (!selectedFiles || selectedFiles.length === 0) {
      emit('update:modelValue', null)
      emit('change', null)
      return
    }

    let newFiles: FileWithError[] = []
    if (props.multiple) {
      newFiles = Array.from(selectedFiles) as FileWithError[]
    } else {
      newFiles = [selectedFiles[0] as FileWithError]
    }

    // Validate files
    validationErrors.value = []
    newFiles.forEach(file => {
      if (props.validateOnChange) {
        const error = validateFile(file)
        if (error) {
          file.error = error
          validationErrors.value.push(error)
          emit('file-error', file, error)
        }
      }
    })

    // Filter out invalid files if there are validation errors
    if (validationErrors.value.length > 0) {
      newFiles = newFiles.filter(file => !file.error)
      emit('validation-error', validationErrors.value)
    }

    // Validate max files
    if (props.maxFiles && props.multiple) {
      const currentFilesCount = Array.isArray(props.modelValue) ? props.modelValue.length : 0
      if (currentFilesCount + newFiles.length > props.maxFiles) {
        const availableSlots = props.maxFiles - currentFilesCount
        newFiles = newFiles.slice(0, availableSlots)
      }
    }

    let resultFiles: File[] | File | null
    if (props.multiple) {
      const currentFiles = Array.isArray(props.modelValue) ? props.modelValue : []
      resultFiles = [...currentFiles, ...newFiles]
    } else {
      resultFiles = newFiles[0] || null
    }

    currentFiles.value = Array.isArray(resultFiles) ? resultFiles : resultFiles ? [resultFiles] : []
    emit('update:modelValue', resultFiles)
    emit('change', resultFiles)

    // Emit individual file events
    newFiles.forEach(file => {
      if (!file.error) {
        emit('file-add', file)
      }
    })
  }

  const handleRemoveFile = (index: number) => {
    const fileToRemove = currentFiles.value[index]

    let newFiles: File[] | File | null
    if (props.multiple) {
      newFiles = currentFiles.value.filter((_, i) => i !== index)
      if (newFiles.length === 0) {
        newFiles = null
      }
    } else {
      newFiles = null
    }

    currentFiles.value = Array.isArray(newFiles) ? newFiles : newFiles ? [newFiles] : []
    emit('update:modelValue', newFiles)
    emit('change', newFiles)
    emit('file-remove', fileToRemove, index)

    // Reset input value to allow selecting the same file again
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }

  const handleBlur = (event: FocusEvent) => {
    isFocused.value = false
    emit('blur', event)
  }

  const handleFocus = (event: FocusEvent) => {
    isFocused.value = true
    emit('focus', event)
  }

  // Watch for modelValue changes to update currentFiles
  watch(() => props.modelValue, (newValue) => {
    if (Array.isArray(newValue)) {
      currentFiles.value = newValue as FileWithError[]
    } else if (newValue) {
      currentFiles.value = [newValue as FileWithError]
    } else {
      currentFiles.value = []
    }
  }, { immediate: true })

  defineExpose({
    focus: () => fileInputRef.value?.focus(),
    blur: () => fileInputRef.value?.blur(),
    clear: () => {
      currentFiles.value = []
      validationErrors.value = []
      emit('update:modelValue', null)
      emit('change', null)
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
    },
    validate: (): boolean => {
      validationErrors.value = []
      currentFiles.value.forEach(file => {
        const error = validateFile(file)
        if (error) {
          file.error = error
          validationErrors.value.push(error)
        }
      })
      return validationErrors.value.length === 0
    },
  })
</script>

<style scoped>
  .base-file-input {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: var(--spacing-md);
  }

  .base-file-input__label {
    display: block;
    margin-bottom: var(--spacing-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    line-height: 1.25;
  }

  .base-file-input__required {
    color: var(--color-error);
    margin-left: var(--spacing-xs);
  }

  .base-file-input__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .base-file-input__dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-2xl);
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    cursor: pointer;
    transition: all var(--transition-normal);
    min-height: 120px;
    position: relative;
    overflow: hidden;
  }

    .base-file-input__dropzone:hover {
      border-color: var(--color-primary);
      background: var(--color-surface-hover);
    }

    .base-file-input__dropzone:focus-within {
      border-color: var(--color-primary);
      box-shadow: var(--shadow-focus);
    }

  .base-file-input--focused .base-file-input__dropzone {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-focus);
  }

  .base-file-input--error .base-file-input__dropzone {
    border-color: var(--color-error);
    background: var(--color-error-light);
  }

  .base-file-input--disabled .base-file-input__dropzone {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--color-surface-disabled);
  }

    .base-file-input--disabled .base-file-input__dropzone:hover {
      border-color: var(--color-border);
      background: var(--color-surface-disabled);
    }

  .base-file-input__dropzone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    text-align: center;
  }

  .base-file-input__icon-wrapper {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-full);
    background: var(--color-primary-light);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    transition: all var(--transition-normal);
  }

  .base-file-input__dropzone:hover .base-file-input__icon-wrapper {
    background: var(--color-primary);
    color: white;
    transform: scale(1.05);
  }

  .base-file-input__icon {
    transition: all var(--transition-normal);
  }

  .base-file-input__title {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-xs);
    font-size: 1.125rem;
  }

  .base-file-input__subtitle {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    line-height: 1.4;
  }

  .base-file-input__files {
    width: 100%;
    margin-top: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .base-file-input__file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    animation: slide-in 0.2s ease-out;
  }

    .base-file-input__file:hover {
      background: var(--color-surface-hover);
      border-color: var(--color-primary-light);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

  .base-file-input__file--error {
    border-color: var(--color-error);
    background: var(--color-error-light);
  }

  .base-file-input__file-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex: 1;
    min-width: 0;
  }

  .base-file-input__file-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-sm);
    background: var(--color-surface-hover);
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .base-file-input__file--error .base-file-input__file-icon {
    background: var(--color-error-light);
    color: var(--color-error);
  }

  .base-file-input__file-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    min-width: 0;
    flex: 1;
  }

  .base-file-input__file-name {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .base-file-input__file-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 0.75rem;
  }

  .base-file-input__file-size {
    color: var(--color-text-muted);
  }

  .base-file-input__file-error {
    color: var(--color-error);
    font-weight: var(--font-weight-medium);
  }

  .base-file-input__file-remove {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
  }

    .base-file-input__file-remove:hover:not(:disabled) {
      background: var(--color-error-light);
      color: var(--color-error);
      transform: scale(1.1);
    }

    .base-file-input__file-remove:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

  .base-file-input__help {
    margin-top: var(--spacing-sm);
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.25;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .base-file-input__help-icon {
    color: var(--color-info);
    flex-shrink: 0;
  }

  .base-file-input__error {
    margin-top: var(--spacing-sm);
    color: var(--color-error);
    font-size: 0.75rem;
    line-height: 1.25;
    font-weight: var(--font-weight-medium);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .base-file-input__error-icon {
    color: var(--color-error);
    flex-shrink: 0;
  }

  /* Summary Section - аналогично QuickScanConfig */
  .base-file-input__summary {
    margin-top: var(--spacing-lg);
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    border: 1px solid var(--color-border);
  }

  .base-file-input__summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-md);
  }

  .base-file-input__summary-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .base-file-input__summary-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

    .base-file-input__summary-icon.files {
      background: var(--color-primary);
    }

    .base-file-input__summary-icon.size {
      background: var(--color-info);
    }

  .base-file-input__summary-content {
    flex: 1;
  }

  .base-file-input__summary-value {
    font-size: 1.25rem;
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--spacing-xs);
    color: var(--color-text-primary);
  }

  .base-file-input__summary-label {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
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

  /* Sizes */
  .base-file-input--sm .base-file-input__dropzone {
    padding: var(--spacing-lg);
    min-height: 100px;
  }

  .base-file-input--sm .base-file-input__icon-wrapper {
    width: 2.5rem;
    height: 2.5rem;
  }

  .base-file-input--sm .base-file-input__title {
    font-size: 1rem;
  }

  .base-file-input--lg .base-file-input__dropzone {
    padding: var(--spacing-3xl);
    min-height: 140px;
  }

  .base-file-input--lg .base-file-input__icon-wrapper {
    width: 3.5rem;
    height: 3.5rem;
  }

  .base-file-input--lg .base-file-input__title {
    font-size: 1.25rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .base-file-input__summary-cards {
      grid-template-columns: 1fr;
    }

    .base-file-input__dropzone {
      padding: var(--spacing-xl);
    }

    .base-file-input__file-info {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-xs);
    }

    .base-file-input__file-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-xs);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .base-file-input__dropzone,
    .base-file-input__file,
    .base-file-input__file-remove,
    .base-file-input__icon-wrapper {
      transition: none;
    }

    @keyframes slide-in {
      from {
        opacity: 0;
      }

      to {
        opacity: 1;
      }
    }
  }
</style>
