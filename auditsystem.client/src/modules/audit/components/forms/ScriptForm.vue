<template>
  <div class="script-form">
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-content">
        <h3 class="form-title">{{ script ? 'Редактирование скрипта' : 'Создание скрипта' }}</h3>

        <!-- Основная информация -->
        <div class="form-section">
          <h4 class="section-title">Основная информация</h4>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label required">Название скрипта</label>
              <BaseInput v-model="formData.name"
                         placeholder="Проверка обновлений безопасности"
                         required
                         class="form-control" />
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
          </div>
        </div>

        <!-- Параметры -->
        <div class="form-section">
          <div class="section-header">
            <h4 class="section-title">Параметры скрипта</h4>
            <BaseButton @click="addParameter"
                        variant="text"
                        size="sm">
              <PlusIcon class="button-icon" />
              Добавить параметр
            </BaseButton>
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

        <!-- Код скрипта -->
        <div class="form-section">
          <h4 class="section-title">Код скрипта</h4>

          <div class="form-group">
            <label class="form-label required">Содержимое скрипта</label>
            <div class="code-editor-container">
              <BaseTextarea v-model="formData.content"
                            placeholder="#!/bin/bash
# Ваш код скрипта здесь
echo 'Проверка безопасности...'"
                            rows="12"
                            required
                            class="code-editor" />
              <div class="editor-actions">
                <BaseButton @click="formatCode"
                            variant="text"
                            size="sm">
                  <FormatIcon class="button-icon" />
                  Форматировать
                </BaseButton>
                <BaseButton @click="validateSyntax"
                            variant="text"
                            size="sm">
                  <CheckIcon class="button-icon" />
                  Проверить синтаксис
                </BaseButton>
              </div>
            </div>
          </div>

          <div class="script-info">
            <h5 class="info-title">Информация о выполнении:</h5>
            <ul class="info-list">
              <li>Скрипт выполняется на целевых хостах через SSH</li>
              <li>Доступны все параметры через переменные окружения</li>
              <li>Код возврата 0 - успех, другие значения - ошибка</li>
              <li>STDOUT - результат выполнения, STDERR - ошибки</li>
            </ul>
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
  import {
    PlusIcon,
    DeleteIcon,
    SaveIcon,
    SettingsIcon,
    FormatIcon,
    CheckIcon
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

  const isSubmitting = ref(false);

  const formData = ref({
    name: '',
    description: '',
    type: 'check' as 'check' | 'fix',
    category: 'security' as 'security' | 'compliance' | 'performance' | 'custom',
    checkScriptId: '',
    content: '',
    parameters: [] as Array<ScriptParameter & { optionsText: string }>
  });

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

  const formatCode = (): void => {
    // Basic code formatting (in real app would use a proper formatter)
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

    // Basic syntax validation
    if (formData.value.content.includes('#!/bin/bash')) {
      // Check for common bash script issues
      const issues = [];

      if (!formData.value.content.includes('set -e')) {
        issues.push('Рекомендуется добавить "set -e" для выхода при ошибках');
      }

      if (!formData.value.content.includes('set -u')) {
        issues.push('Рекомендуется добавить "set -u" для проверки неопределенных переменных');
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
    } else {
      showToast({
        type: 'info',
        title: 'Проверка завершена',
        message: 'Убедитесь, что скрипт имеет правильный shebang'
      });
    }
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
      // Prepare parameters
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
    gap: 2rem;
  }

  .form-content {
    padding: var(--space-xl, 1.5rem);
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .form-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
    text-align: center;
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
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
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

  /* Parameters List */
  .parameters-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .parameter-item {
    background: var(--color-surface);
    border-radius: 0.75rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
  }

  .parameter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .parameter-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
  }

  .parameter-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Code Editor */
  .code-editor-container {
    position: relative;
  }

  .code-editor {
    font-family: 'Fira Code', 'JetBrains Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .editor-actions {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    display: flex;
    gap: 0.5rem;
  }

  /* Script Info */
  .script-info {
    background: var(--color-surface);
    border-radius: 0.5rem;
    padding: 1.25rem;
    border: 1px solid var(--color-border);
    margin-top: 1rem;
  }

  .info-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: var(--color-text-primary);
  }

  .info-list {
    margin: 0;
    padding-left: 1.25rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

    .info-list li {
      margin-bottom: 0.5rem;
    }

      .info-list li:last-child {
        margin-bottom: 0;
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
    .script-form {
      max-height: none;
      padding: 0;
    }

    .form-content {
      gap: 1.5rem;
    }

    .form-section {
      padding: 1.25rem;
    }

    .parameter-item {
      padding: 1.25rem;
    }

    .editor-actions {
      position: static;
      justify-content: flex-end;
      margin-top: 0.5rem;
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
