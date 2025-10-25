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
        <UploadIcon :size="24" class="base-file-input__icon" />
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
        <div v-for="(file, index) in currentFiles" :key="index" class="base-file-input__file">
          <div class="base-file-input__file-info">
            <DocumentIcon :size="16" />
            <span class="base-file-input__file-name">{{ file.name }}</span>
            <span class="base-file-input__file-size">({{ formatFileSize(file.size) }})</span>
          </div>
          <button type="button"
                  class="base-file-input__file-remove"
                  @click="handleRemoveFile(index)"
                  :aria-label="`Удалить файл ${file.name}`">
            <CloseIcon :size="14" />
          </button>
        </div>
      </div>
    </label>

    <div v-if="helpText && !error" class="base-file-input__help">
      {{ helpText }}
    </div>

    <div v-if="error" class="base-file-input__error" role="alert">
      <AlertIcon :size="14" />
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, useId } from 'vue'
  import UploadIcon from '@/assets/icons/actions/UploadIcon.vue'
  import DocumentIcon from '@/assets/icons/files/DocumentIcon.vue'
  import CloseIcon from '@/assets/icons/actions/CloseIcon.vue'
  import AlertIcon from '@/assets/icons/status/AlertIcon.vue'

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
  })

  const emit = defineEmits<{
    'update:modelValue': [files: File[] | File | null]
    'change': [files: File[] | File | null]
    'blur': [event: FocusEvent]
    'focus': [event: FocusEvent]
    'file-add': [file: File]
    'file-remove': [file: File, index: number]
  }>()

  const fileInputRef = ref<HTMLInputElement | null>(null)
  const isFocused = ref(false)
  const currentFiles = ref<File[]>([])

  const computedFileInputId = computed(() => props.id || `file-input-${useId()}`)

  const hasFiles = computed(() => {
    if (Array.isArray(props.modelValue)) {
      return props.modelValue.length > 0
    }
    return props.modelValue !== null
  })

  const computedContainerClasses = computed(() => [
    'base-file-input',
    `base-file-input--${props.size}`,
    {
      'base-file-input--error': !!props.error,
      'base-file-input--disabled': props.disabled,
      'base-file-input--focused': isFocused.value,
      'base-file-input--has-files': hasFiles.value,
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

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const selectedFiles = target.files

    if (!selectedFiles || selectedFiles.length === 0) {
      emit('update:modelValue', null)
      emit('change', null)
      return
    }

    let newFiles: File[] = []
    if (props.multiple) {
      newFiles = Array.from(selectedFiles)
    } else {
      newFiles = [selectedFiles[0]]
    }

    // Validate file size
    if (props.maxSize) {
      const oversizedFiles = newFiles.filter(file => file.size > props.maxSize!)
      if (oversizedFiles.length > 0) {
        console.warn('Some files exceed the maximum size limit')
      }
      newFiles = newFiles.filter(file => file.size <= props.maxSize!)
    }

    // Validate max files
    if (props.maxFiles && props.multiple) {
      const currentFiles = Array.isArray(props.modelValue) ? props.modelValue : []
      if (currentFiles.length + newFiles.length > props.maxFiles) {
        newFiles = newFiles.slice(0, props.maxFiles - currentFiles.length)
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
      emit('file-add', file)
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

  defineExpose({
    focus: () => fileInputRef.value?.focus(),
    blur: () => fileInputRef.value?.blur(),
    clear: () => {
      currentFiles.value = []
      emit('update:modelValue', null)
      emit('change', null)
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
    },
  })
</script>

<style scoped>
  .base-file-input {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: var(--space-md);
  }

  .base-file-input__label {
    display: block;
    margin-bottom: var(--space-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    line-height: 1.25;
  }

  .base-file-input__required {
    color: var(--color-error);
    margin-left: var(--space-xs);
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
    padding: var(--space-2xl);
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 120px;
  }

    .base-file-input__dropzone:hover {
      border-color: var(--color-primary);
      background: var(--color-surface-hover);
    }

  .base-file-input--focused .base-file-input__dropzone {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
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
    gap: var(--space-md);
    text-align: center;
  }

  .base-file-input__icon {
    color: var(--color-text-muted);
  }

  .base-file-input__title {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin-bottom: var(--space-xs);
  }

  .base-file-input__subtitle {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .base-file-input__files {
    width: 100%;
    margin-top: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .base-file-input__file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-sm);
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .base-file-input__file-info {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex: 1;
    min-width: 0;
  }

  .base-file-input__file-name {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .base-file-input__file-size {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .base-file-input__file-remove {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
  }

    .base-file-input__file-remove:hover {
      background: var(--color-error-light);
      color: var(--color-error);
    }

  .base-file-input__help {
    margin-top: var(--space-xs);
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.25;
  }

  .base-file-input__error {
    margin-top: var(--space-xs);
    color: var(--color-error);
    font-size: 0.75rem;
    line-height: 1.25;
    font-weight: var(--font-weight-medium);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  /* Sizes */
  .base-file-input--sm .base-file-input__dropzone {
    padding: var(--space-lg);
    min-height: 100px;
  }

  .base-file-input--lg .base-file-input__dropzone {
    padding: var(--space-3xl);
    min-height: 140px;
  }
</style>
