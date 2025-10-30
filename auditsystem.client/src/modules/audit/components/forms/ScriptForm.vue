<template>
  <div class="script-form">
    <form @submit.prevent="handleSubmit" class="form">
      <!-- Progress Steps -->
      <div class="form-header">
        <div class="form-progress">
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

      <div class="form-content">
        <!-- Step 1: Basic Information -->
        <div v-if="currentStep === 0" class="config-step">
          <div class="step-header">
            <h3 class="step-title">Основная информация</h3>
            <p class="step-description">Задайте базовые параметры и описание скрипта</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label required">Название скрипта</label>
              <BaseInput v-model="formData.name"
                         placeholder="Проверка обновлений безопасности"
                         required
                         class="form-control"
                         @blur="validateStep(0)" />
            </div>

            <div class="form-group">
              <label class="form-label required">Тип скрипта</label>
              <BaseSelect v-model="formData.type"
                          :options="typeOptions"
                          required
                          class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label required">Категория</label>
              <BaseSelect v-model="formData.category"
                          :options="categoryOptions"
                          required
                          class="form-control" />
            </div>

            <div v-if="formData.type === 'fix'" class="form-group">
              <label class="form-label">Скрипт проверки</label>
              <BaseSelect v-model="formData.checkScriptId"
                          :options="checkScriptOptions"
                          placeholder="Выберите скрипт проверки"
                          class="form-control" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label required">Описание</label>
            <BaseTextarea v-model="formData.description"
                          placeholder="Описание назначения и функциональности скрипта..."
                          rows="3"
                          required
                          class="form-control" />
            <div class="form-hint">{{ formData.description.length }}/500 символов</div>
          </div>

          <!-- Script Preview -->
          <div class="script-preview">
            <h4 class="preview-title">Предпросмотр скрипта</h4>
            <div class="preview-card">
              <div class="preview-header">
                <CodeIcon class="preview-icon" />
                <div>
                  <h5 class="preview-name">{{ formData.name || 'Новый скрипт' }}</h5>
                  <p class="preview-description">{{ formData.description || 'Описание не указано' }}</p>
                </div>
              </div>
              <div class="preview-meta">
                <BaseChip :color="getTypeColor(formData.type)" size="sm">
                  {{ getTypeText(formData.type) }}
                </BaseChip>
                <BaseChip :color="getCategoryColor(formData.category)" size="sm">
                  {{ getCategoryText(formData.category) }}
                </BaseChip>
                <span class="preview-params">{{ formData.parameters.length }} параметров</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Parameters -->
        <div v-else-if="currentStep === 1" class="config-step">
          <div class="step-header">
            <h3 class="step-title">Параметры скрипта</h3>
            <p class="step-description">Настройте параметры для настройки выполнения скрипта</p>
          </div>

          <div class="parameters-section">
            <div class="section-header">
              <div class="section-title">
                <SettingsIcon class="title-icon" />
                <span>Параметры выполнения</span>
              </div>
              <div class="section-actions">
                <BaseButton @click="addParameter"
                            variant="secondary"
                            size="sm">
                  <PlusIcon class="button-icon" />
                  Добавить параметр
                </BaseButton>
              </div>
            </div>

            <div class="parameters-list">
              <div v-for="(param, index) in formData.parameters"
                   :key="index"
                   class="parameter-item">
                <div class="parameter-header">
                  <h5 class="parameter-title">Параметр {{ index + 1 }}</h5>
                  <BaseButton @click="removeParameter(index)"
                              variant="text"
                              size="sm"
                              color="error">
                    <DeleteIcon class="button-icon" />
                    Удалить
                  </BaseButton>
                </div>

                <div class="parameter-form">
                  <div class="form-grid">
                    <div class="form-group">
                      <label class="form-label required">Имя параметра</label>
                      <BaseInput v-model="param.name"
                                 placeholder="timeout"
                                 required
                                 class="form-control" />
                    </div>

                    <div class="form-group">
                      <label class="form-label required">Тип</label>
                      <BaseSelect v-model="param.type"
                                  :options="parameterTypeOptions"
                                  required
                                  class="form-control" />
                    </div>

                    <div class="form-group">
                      <label class="form-label">Обязательный</label>
                      <BaseToggle v-model="param.required"
                                  class="form-control" />
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label required">Описание</label>
                    <BaseInput v-model="param.description"
                               placeholder="Описание параметра..."
                               required
                               class="form-control" />
                  </div>

                  <div v-if="param.type === 'select'" class="form-group">
                    <label class="form-label required">Варианты выбора</label>
                    <BaseTextarea v-model="param.optionsText"
                                  placeholder="Каждый вариант с новой строки"
                                  rows="3"
                                  required
                                  class="form-control" />
                    <div class="form-hint">По одному варианту на строку</div>
                  </div>

                  <div v-if="param.type !== 'boolean'" class="form-group">
                    <label class="form-label">Значение по умолчанию</label>
                    <BaseInput v-if="param.type === 'string' || param.type === 'number'"
                               v-model="param.defaultValue"
                               :type="param.type === 'number' ? 'number' : 'text'"
                               :placeholder="getDefaultValuePlaceholder(param.type)"
                               class="form-control" />
                    <BaseSelect v-else-if="param.type === 'select'"
                                v-model="param.defaultValue"
                                :options="getParameterOptions(param)"
                                :placeholder="getDefaultValuePlaceholder(param.type)"
                                class="form-control" />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="formData.parameters.length === 0" class="empty-state">
              <SettingsIcon class="empty-icon" />
              <p>Параметры не добавлены</p>
              <p class="empty-description">
                Добавьте параметры для настройки выполнения скрипта
              </p>
            </div>
          </div>

          <!-- Parameters Summary -->
          <div v-if="formData.parameters.length > 0" class="parameters-summary">
            <h4 class="summary-title">Сводка параметров</h4>
            <div class="summary-cards">
              <div class="summary-card">
                <div class="summary-icon total">
                  <SettingsIcon />
                </div>
                <div class="summary-content">
                  <div class="summary-value">{{ formData.parameters.length }}</div>
                  <div class="summary-label">Всего параметров</div>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-icon required">
                  <AlertCircleIcon />
                </div>
                <div class="summary-content">
                  <div class="summary-value">{{ requiredParametersCount }}</div>
                  <div class="summary-label">Обязательных</div>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-icon types">
                  <CodeIcon />
                </div>
                <div class="summary-content">
                  <div class="summary-value">{{ parameterTypesCount }}</div>
                  <div class="summary-label">Типов параметров</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Script Code -->
        <div v-else-if="currentStep === 2" class="config-step">
          <div class="step-header">
            <h3 class="step-title">Код скрипта</h3>
            <p class="step-description">Напишите или вставьте код скрипта для выполнения</p>
          </div>

          <div class="code-section">
            <div class="section-header">
              <div class="section-title">
                <CodeIcon class="title-icon" />
                <span>Содержимое скрипта</span>
              </div>
              <div class="section-actions">
                <BaseButton @click="formatCode"
                            variant="secondary"
                            size="sm">
                  <FormatIcon class="button-icon" />
                  Форматировать
                </BaseButton>
                <BaseButton @click="validateSyntax"
                            variant="secondary"
                            size="sm">
                  <CheckIcon class="button-icon" />
                  Проверить синтаксис
                </BaseButton>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label required">Код скрипта</label>
              <div class="code-editor-container">
                <BaseTextarea v-model="formData.content"
                              placeholder="#!/bin/bash
# Ваш код скрипта здесь
echo 'Проверка безопасности...'"
                              rows="12"
                              required
                              class="code-editor" />
                <div class="editor-actions">
                  <BaseButton @click="insertParameterTemplate"
                              variant="text"
                              size="sm">
                    <PlusIcon class="button-icon" />
                    Шаблон параметров
                  </BaseButton>
                </div>
              </div>
              <div class="form-hint">{{ formData.content.length }}/10000 символов</div>
            </div>

            <div class="script-info">
              <h4 class="info-title">Информация о выполнении</h4>
              <div class="info-content">
                <div class="info-item">
                  <CheckCircleIcon class="info-icon" />
                  <div class="info-text">Скрипт выполняется на целевых хостах через SSH</div>
                </div>
                <div class="info-item">
                  <CheckCircleIcon class="info-icon" />
                  <div class="info-text">Доступны все параметры через переменные окружения</div>
                </div>
                <div class="info-item">
                  <CheckCircleIcon class="info-icon" />
                  <div class="info-text">Код возврата 0 - успех, другие значения - ошибка</div>
                </div>
                <div class="info-item">
                  <CheckCircleIcon class="info-icon" />
                  <div class="info-text">STDOUT - результат выполнения, STDERR - ошибки</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Code Validation -->
          <div v-if="formData.content" class="validation-section">
            <h4 class="validation-title">Проверка кода</h4>
            <div class="validation-stats">
              <div class="stat-item">
                <span class="stat-label">Строк кода:</span>
                <span class="stat-value">{{ codeLinesCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Размер:</span>
                <span class="stat-value">{{ codeSize }} KB</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Shebang:</span>
                <span class="stat-value" :class="hasShebang ? 'stat-valid' : 'stat-invalid'">
                  {{ hasShebang ? 'Присутствует' : 'Отсутствует' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="form-actions">
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
                    type="submit"
                    variant="primary"
                    :loading="isSubmitting"
                    :disabled="!canSubmit"
                    class="nav-btn submit-btn">
          <SaveIcon class="button-icon" />
          {{ script ? 'Обновить' : 'Создать' }} скрипт
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
  import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue';
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
  import {
    PlusIcon,
    DeleteIcon,
    SaveIcon,
    SettingsIcon,
    FormatIcon,
    CheckIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CodeIcon,
    AlertCircleIcon,
    CheckCircleIcon
  } from '@/assets/icons';
  import { useScripts } from '../../composables/useScripts';
  import type { Script, CreateScriptCommand, ScriptParameter } from '../../api/audit.types';

  interface Props {
    script?: Script;
  }

  interface Emits {
    (e: 'save', script: CreateScriptCommand): void;
    (e: 'cancel'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { showToast } = useToast();
  const scriptsManager = useScripts();

  // State
  const currentStep = ref(0);
  const isSubmitting = ref(false);

  // Steps configuration
  const steps = ref([
    { id: 'basic', label: 'Основная информация' },
    { id: 'parameters', label: 'Параметры' },
    { id: 'code', label: 'Код скрипта' }
  ]);

  const formData = ref({
    name: '',
    description: '',
    type: 'check' as 'check' | 'fix',
    category: 'security' as 'security' | 'compliance' | 'performance' | 'custom',
    checkScriptId: '',
    content: '',
    parameters: [] as Array<ScriptParameter & { optionsText: string }>
  });

  // Options
  const typeOptions = [
    { value: 'check', label: 'Проверка' },
    { value: 'fix', label: 'Исправление' }
  ];

  const categoryOptions = [
    { value: 'security', label: 'Безопасность' },
    { value: 'compliance', label: 'Соответствие' },
    { value: 'performance', label: 'Производительность' },
    { value: 'custom', label: 'Пользовательский' }
  ];

  const parameterTypeOptions = [
    { value: 'string', label: 'Строка' },
    { value: 'number', label: 'Число' },
    { value: 'boolean', label: 'Логический' },
    { value: 'select', label: 'Выбор' }
  ];

  const checkScriptOptions = computed(() => {
    return scriptsManager.checkScripts.value.map(script => ({
      value: script.id,
      label: script.name
    }));
  });

  // Computed properties
  const canProceedToNextStep = computed(() => {
    switch (currentStep.value) {
      case 0: // Basic information
        return formData.value.name.trim().length > 0 &&
          formData.value.description.trim().length > 0;
      case 1: // Parameters
        // All parameters must be valid
        return formData.value.parameters.every(param =>
          param.name.trim() && param.description.trim()
        );
      case 2: // Code
        return formData.value.content.trim().length > 0;
      default:
        return true;
    }
  });

  const canSubmit = computed(() => {
    return formData.value.name.trim().length > 0 &&
      formData.value.description.trim().length > 0 &&
      formData.value.content.trim().length > 0;
  });

  const requiredParametersCount = computed(() => {
    return formData.value.parameters.filter(param => param.required).length;
  });

  const parameterTypesCount = computed(() => {
    const types = new Set(formData.value.parameters.map(param => param.type));
    return types.size;
  });

  const codeLinesCount = computed(() => {
    return formData.value.content.split('\n').length;
  });

  const codeSize = computed(() => {
    return (new Blob([formData.value.content]).size / 1024).toFixed(2);
  });

  const hasShebang = computed(() => {
    return formData.value.content.trim().startsWith('#!');
  });

  // Methods
  const setStep = (stepIndex: number) => {
    if (stepIndex <= currentStep.value) {
      currentStep.value = stepIndex;
    }
  };

  const handleNextStep = () => {
    if (canProceedToNextStep.value && currentStep.value < steps.value.length - 1) {
      currentStep.value++;
    }
  };

  const handlePreviousStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  };

  const validateStep = (stepIndex: number) => {
    console.log('Validating step:', stepIndex);
  };

  // Parameter methods
  const addParameter = (): void => {
    formData.value.parameters.push({
      name: '',
      type: 'string',
      required: false,
      description: '',
      optionsText: '',
      defaultValue: ''
    });
  };

  const removeParameter = (index: number): void => {
    formData.value.parameters.splice(index, 1);
  };

  const getParameterOptions = (param: any) => {
    if (!param.optionsText) return [];
    return param.optionsText.split('\n')
      .filter((opt: string) => opt.trim())
      .map((opt: string) => ({ value: opt.trim(), label: opt.trim() }));
  };

  const getDefaultValuePlaceholder = (type: string): string => {
    const placeholders: Record<string, string> = {
      string: 'Значение по умолчанию',
      number: '0',
      boolean: '',
      select: 'Выберите значение'
    };
    return placeholders[type] || '';
  };

  // Code methods
  const formatCode = (): void => {
    if (formData.value.content.includes('#!/bin/bash')) {
      formData.value.content = formData.value.content
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\s+$/gm, '');
      showToast({
        type: 'success',
        title: 'Код отформатирован',
        message: 'Синтаксис скрипта улучшен'
      });
    }
  };

  const validateSyntax = (): void => {
    if (!formData.value.content.trim()) {
      showToast({
        type: 'warning',
        title: 'Код отсутствует',
        message: 'Введите код скрипта для проверки синтаксиса'
      });
      return;
    }

    const issues = [];
    if (formData.value.content.includes('#!/bin/bash')) {
      if (!formData.value.content.includes('set -e')) {
        issues.push('Рекомендуется добавить "set -e" для выхода при ошибках');
      }
      if (!formData.value.content.includes('set -u')) {
        issues.push('Рекомендуется добавить "set -u" для проверки неопределенных переменных');
      }
    }

    if (issues.length === 0) {
      showToast({
        type: 'success',
        title: 'Синтаксис корректен',
        message: 'Основные проверки пройдены успешно'
      });
    } else {
      showToast({
        type: 'warning',
        title: 'Рекомендации',
        message: issues.join(', ')
      });
    }
  };

  const insertParameterTemplate = (): void => {
    if (formData.value.parameters.length === 0) {
      showToast({
        type: 'info',
        title: 'Нет параметров',
        message: 'Сначала добавьте параметры в шаге 2'
      });
      return;
    }

    let template = '\n# Доступные параметры:\n';
    formData.value.parameters.forEach(param => {
      template += `# ${param.name}: ${param.description}\n`;
      if (param.defaultValue) {
        template += `# По умолчанию: ${param.defaultValue}\n`;
      }
    });

    formData.value.content += template;
    showToast({
      type: 'success',
      title: 'Шаблон добавлен',
      message: 'Комментарии с параметрами добавлены в код'
    });
  };

  // Helper methods
  const getTypeText = (type: string): string => {
    const typeMap: Record<string, string> = {
      check: 'Проверка',
      fix: 'Исправление'
    };
    return typeMap[type] || type;
  };

  const getTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      check: 'primary',
      fix: 'success'
    };
    return colorMap[type] || 'default';
  };

  const getCategoryText = (category: string): string => {
    const categoryMap: Record<string, string> = {
      security: 'Безопасность',
      compliance: 'Соответствие',
      performance: 'Производительность',
      custom: 'Пользовательский'
    };
    return categoryMap[category] || category;
  };

  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      security: 'error',
      compliance: 'warning',
      performance: 'info',
      custom: 'success'
    };
    return colorMap[category] || 'default';
  };

  const validateForm = (): boolean => {
    if (!formData.value.name.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните название',
        message: 'Название скрипта обязательно для заполнения'
      });
      return false;
    }

    if (!formData.value.description.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните описание',
        message: 'Описание скрипта обязательно для заполнения'
      });
      return false;
    }

    if (!formData.value.content.trim()) {
      showToast({
        type: 'warning',
        title: 'Заполните код',
        message: 'Код скрипта обязателен для заполнения'
      });
      return false;
    }

    // Validate parameters
    for (const param of formData.value.parameters) {
      if (!param.name.trim()) {
        showToast({
          type: 'warning',
          title: 'Заполните имя параметра',
          message: 'Имя параметра обязательно для заполнения'
        });
        return false;
      }

      if (!param.description.trim()) {
        showToast({
          type: 'warning',
          title: 'Заполните описание параметра',
          message: 'Описание параметра обязательно для заполнения'
        });
        return false;
      }

      if (param.type === 'select' && !param.optionsText.trim()) {
        showToast({
          type: 'warning',
          title: 'Заполните варианты выбора',
          message: 'Для параметра типа "Выбор" необходимо указать варианты'
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    isSubmitting.value = true;

    try {
      const parameters: ScriptParameter[] = formData.value.parameters.map(param => {
        const preparedParam: ScriptParameter = {
          name: param.name,
          type: param.type as any,
          required: param.required,
          description: param.description,
          defaultValue: param.defaultValue
        };

        if (param.type === 'select' && param.optionsText) {
          preparedParam.options = param.optionsText.split('\n')
            .filter(opt => opt.trim())
            .map(opt => opt.trim());
        }

        return preparedParam;
      });

      const scriptData: CreateScriptCommand = {
        name: formData.value.name,
        description: formData.value.description,
        type: formData.value.type,
        category: formData.value.category,
        checkScriptId: formData.value.checkScriptId || undefined,
        content: formData.value.content,
        parameters: parameters
      };

      emit('save', scriptData);
      showToast({
        type: 'success',
        title: props.script ? 'Скрипт обновлен' : 'Скрипт создан',
        message: 'Данные успешно сохранены'
      });
    } catch (error) {
      console.error('Failed to save script:', error);
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось сохранить скрипт'
      });
    } finally {
      isSubmitting.value = false;
    }
  };

  const initializeForm = (): void => {
    if (props.script) {
      formData.value = {
        name: props.script.name,
        description: props.script.description,
        type: props.script.type,
        category: props.script.category,
        checkScriptId: props.script.checkScriptId || '',
        content: props.script.content,
        parameters: props.script.parameters.map(param => ({
          ...param,
          optionsText: param.options?.join('\n') || ''
        }))
      };
    }
  };

  onMounted(() => {
    scriptsManager.loadScripts();
    initializeForm();
  });
</script>

<style scoped>
  .script-form {
    max-height: none;
    padding: 0;
    overflow-y: auto;
  }

  .form {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-background, #f8fafc);
  }

  /* Fixed Header */
  .form-header {
    flex-shrink: 0;
    background: var(--color-surface, #fff);
    border-bottom: 1px solid var(--color-border, #e2e8f0);
  }

  .form-progress {
    padding: var(--space-xl, 1.5rem) var(--space-xl, 1.5rem) var(--space-lg, 1.25rem);
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
      background: var(--color-border, #e2e8f0);
      z-index: 1;
    }

  .progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
    cursor: pointer;
    transition: all var(--transition-fast, 0.15s);
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
    background: var(--color-surface, #fff);
    border: 2px solid var(--color-border, #e2e8f0);
    transition: all var(--transition-fast, 0.15s);
    margin-bottom: var(--space-sm, 0.75rem);
  }

  .progress-step--active .step-indicator {
    border-color: var(--color-primary, #0ea5e9);
    background: var(--color-primary, #0ea5e9);
    color: white;
    transform: scale(1.1);
  }

  .progress-step--completed .step-indicator {
    border-color: var(--color-success, #10b981);
    background: var(--color-success, #10b981);
    color: white;
  }

  .step-check ::v-deep(svg) {
    width: 1rem;
    height: 1rem;
  }

  .step-number {
    font-size: 0.875rem;
    font-weight: var(--font-weight-semibold, 600);
  }

  .step-label {
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-secondary, #475569);
    text-align: center;
    max-width: 100px;
  }

  .progress-step--active .step-label {
    color: var(--color-primary, #0ea5e9);
    font-weight: var(--font-weight-semibold, 600);
  }

  .progress-step--completed .step-label {
    color: var(--color-success, #10b981);
  }

  /* Scrollable Content */
  .form-content {
    flex: 1;
    padding: var(--space-xl, 1.5rem);
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
    margin-bottom: var(--space-2xl, 2rem);
    text-align: center;
  }

  .step-title {
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary, #1e293b);
    margin: 0 0 var(--space-sm, 0.75rem) 0;
  }

  .step-description {
    font-size: 1rem;
    color: var(--color-text-secondary, #475569);
    margin: 0;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Form Styles */
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl, 1.5rem);
    margin-bottom: var(--space-2xl, 2rem);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.75rem);
  }

  .form-label {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #1e293b);
    font-size: 0.9rem;
  }

    .form-label.required::after {
      content: '*';
      color: var(--color-error, #ef4444);
      margin-left: var(--space-xs, 0.5rem);
    }

  .form-hint {
    font-size: 0.75rem;
    color: var(--color-text-muted, #64748b);
    text-align: right;
  }

  /* Script Preview */
  .script-preview {
    background: var(--color-surface-hover, #f1f5f9);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-lg, 1.25rem);
    border: 1px solid var(--color-border, #e2e8f0);
  }

  .preview-title {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-md, 1rem) 0;
    color: var(--color-text-primary, #1e293b);
  }

  .preview-card {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-md, 0.5rem);
    padding: var(--space-lg, 1.25rem);
    border: 1px solid var(--color-border, #e2e8f0);
  }

  .preview-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md, 1rem);
    margin-bottom: var(--space-md, 1rem);
  }

  .preview-icon {
    width: 2rem;
    height: 2rem;
    color: var(--color-primary, #0ea5e9);
    flex-shrink: 0;
  }

  .preview-name {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-xs, 0.5rem) 0;
    color: var(--color-text-primary, #1e293b);
  }

  .preview-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #475569);
    margin: 0;
    line-height: 1.4;
  }

  .preview-meta {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
    flex-wrap: wrap;
  }

  .preview-params {
    font-size: 0.875rem;
    color: var(--color-text-muted, #64748b);
    font-weight: var(--font-weight-medium, 500);
  }

  /* Section Headers */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-xl, 1.5rem);
    padding-bottom: var(--space-md, 1rem);
    border-bottom: 1px solid var(--color-border, #e2e8f0);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 0.75rem);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #1e293b);
    font-size: 1.125rem;
  }

  .title-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-primary, #0ea5e9);
  }

  .section-actions {
    display: flex;
    gap: var(--space-sm, 0.75rem);
  }

  /* Parameters */
  .parameters-section {
    margin-bottom: var(--space-2xl, 2rem);
  }

  .parameters-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl, 1.5rem);
  }

  .parameter-item {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-xl, 1.5rem);
    transition: all var(--transition-fast, 0.15s);
  }

    .parameter-item:hover {
      border-color: var(--color-primary-light, #7dd3fc);
      box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
    }

  .parameter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-lg, 1.25rem);
  }

  .parameter-title {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #1e293b);
    margin: 0;
  }

  .parameter-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg, 1.25rem);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: var(--space-3xl, 3rem) var(--space-xl, 1.5rem);
    color: var(--color-text-muted, #64748b);
  }

  .empty-icon {
    width: 3rem;
    height: 3rem;
    margin: 0 auto var(--space-md, 1rem);
    color: var(--color-border, #e2e8f0);
  }

  .empty-description {
    font-size: 0.875rem;
    margin-top: var(--space-sm, 0.75rem);
  }

  /* Summary Cards */
  .parameters-summary {
    background: var(--color-surface-hover, #f1f5f9);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-xl, 1.5rem);
    border: 1px solid var(--color-border, #e2e8f0);
  }

  .summary-title {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-lg, 1.25rem) 0;
    color: var(--color-text-primary, #1e293b);
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-lg, 1.25rem);
  }

  .summary-card {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-md, 0.5rem);
    padding: var(--space-lg, 1.25rem);
    text-align: center;
    border: 1px solid var(--color-border, #e2e8f0);
  }

  .summary-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--space-sm, 0.75rem);
  }

    .summary-icon.total {
      background: var(--color-primary-light, #e0f2fe);
      color: var(--color-primary, #0ea5e9);
    }

    .summary-icon.required {
      background: var(--color-error-light, #fee2e2);
      color: var(--color-error, #ef4444);
    }

    .summary-icon.types {
      background: var(--color-success-light, #d1fae5);
      color: var(--color-success, #10b981);
    }

  .summary-value {
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary, #1e293b);
    line-height: 1;
  }

  .summary-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #475569);
    margin-top: var(--space-xs, 0.5rem);
  }

  /* Code Section */
  .code-section {
    margin-bottom: var(--space-2xl, 2rem);
  }

  .code-editor-container {
    position: relative;
  }

  .code-editor {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    resize: vertical;
  }

  .editor-actions {
    position: absolute;
    top: var(--space-sm, 0.75rem);
    right: var(--space-sm, 0.75rem);
  }

  /* Script Info */
  .script-info {
    background: var(--color-success-light, #d1fae5);
    border: 1px solid var(--color-success-border, #a7f3d0);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-xl, 1.5rem);
    margin-top: var(--space-2xl, 2rem);
  }

  .info-title {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-md, 1rem) 0;
    color: var(--color-success-dark, #065f46);
  }

  .info-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.75rem);
  }

  .info-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm, 0.75rem);
  }

  .info-icon {
    width: 1rem;
    height: 1rem;
    color: var(--color-success, #10b981);
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .info-text {
    font-size: 0.875rem;
    color: var(--color-success-dark, #065f46);
    line-height: 1.4;
    margin: 0;
  }

  /* Validation Section */
  .validation-section {
    background: var(--color-surface-hover, #f1f5f9);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-xl, 1.5rem);
    border: 1px solid var(--color-border, #e2e8f0);
  }

  .validation-title {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-lg, 1.25rem) 0;
    color: var(--color-text-primary, #1e293b);
  }

  .validation-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-lg, 1.25rem);
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md, 1rem);
    background: var(--color-surface, #fff);
    border-radius: var(--radius-md, 0.5rem);
    border: 1px solid var(--color-border, #e2e8f0);
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #475569);
  }

  .stat-value {
    font-size: 0.875rem;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #1e293b);
  }

  .stat-valid {
    color: var(--color-success, #10b981);
  }

  .stat-invalid {
    color: var(--color-warning, #f59e0b);
  }

  /* Form Actions */
  .form-actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-xl, 1.5rem);
    background: var(--color-surface, #fff);
    border-top: 1px solid var(--color-border, #e2e8f0);
  }

  .nav-btn {
    min-width: 120px;
  }

  .submit-btn {
    min-width: 160px;
  }

  .step-indicators {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
  }

  .step-info {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #475569);
    font-weight: var(--font-weight-medium, 500);
  }

  /* Button Icons */
  .button-icon {
    width: 1rem;
    height: 1rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
      gap: var(--space-lg, 1.25rem);
    }

    .progress-steps {
      flex-direction: column;
      gap: var(--space-lg, 1.25rem);
    }

      .progress-steps::before {
        display: none;
      }

    .progress-step {
      flex-direction: row;
      gap: var(--space-md, 1rem);
    }

    .step-indicator {
      margin-bottom: 0;
    }

    .form-actions {
      flex-direction: column;
      gap: var(--space-md, 1rem);
    }

    .step-indicators {
      order: -1;
    }

    .summary-cards {
      grid-template-columns: 1fr;
    }

    .validation-stats {
      grid-template-columns: 1fr;
    }
  }
</style>
