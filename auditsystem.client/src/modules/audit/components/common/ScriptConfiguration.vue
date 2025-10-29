<template>
  <div class="script-configuration">
    <div class="configuration-header">
      <h2 class="configuration-title">Настройка параметров</h2>
      <p class="configuration-description">
        Настройте параметры для скрипта "{{ script.name }}"
      </p>
    </div>

    <div class="configuration-content">
      <div v-if="script.parameters.length === 0" class="no-parameters">
        <InfoIcon class="no-params-icon" />
        <h3>Параметры не требуются</h3>
        <p>Этот скрипт не требует дополнительной настройки параметров.</p>
      </div>

      <div v-else class="parameters-form">
        <div v-for="param in script.parameters"
             :key="param.name"
             class="parameter-field">
          <label class="parameter-label">
            {{ param.name }}
            <span v-if="param.required" class="required">*</span>
          </label>

          <div class="parameter-control">
            <BaseInput v-if="param.type === 'string'"
                       v-model="localParameters[param.name]"
                       :placeholder="param.description"
                       :required="param.required"
                       class="parameter-input" />

            <BaseInput v-else-if="param.type === 'number'"
                       v-model.number="localParameters[param.name]"
                       type="number"
                       :placeholder="param.description"
                       :required="param.required"
                       class="parameter-input" />

            <BaseToggle v-else-if="param.type === 'boolean'"
                        v-model="localParameters[param.name]"
                        class="parameter-toggle" />

            <BaseSelect v-else-if="param.type === 'select'"
                        v-model="localParameters[param.name]"
                        :options="param.options?.map(opt => ({ value: opt, label: opt })) || []"
                        :placeholder="param.description"
                        :required="param.required"
                        class="parameter-select" />
          </div>

          <div class="parameter-info">
            <p class="parameter-description">{{ param.description }}</p>
            <div class="parameter-meta">
              <span class="parameter-type">{{ getParameterTypeText(param.type) }}</span>
              <span v-if="param.defaultValue !== undefined" class="parameter-default">
                По умолчанию: {{ formatDefaultValue(param.defaultValue, param.type) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="configuration-actions">
      <BaseButton @click="$emit('close')"
                  variant="secondary"
                  class="cancel-btn">
        Отмена
      </BaseButton>
      <BaseButton @click="handleSave"
                  variant="primary"
                  :disabled="!isFormValid"
                  class="save-btn">
        <SaveIcon class="button-icon" />
        Сохранить параметры
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue';
import { InfoIcon, SaveIcon } from '@/assets/icons';
import type { Script } from '../../api/audit.types';

interface Props {
  script: Script;
  parameters: Record<string, any>;
}

interface Emits {
  (e: 'save', parameters: Record<string, any>): void;
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localParameters = ref<Record<string, any>>({});

// Инициализация параметров
watch(() => props.parameters, (newParameters) => {
  localParameters.value = { ...newParameters };
}, { immediate: true });

const getParameterTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    string: 'Строка',
    number: 'Число',
    boolean: 'Логический',
    select: 'Выбор'
  };
  return typeMap[type] || type;
};

const formatDefaultValue = (value: any, type: string): string => {
  if (type === 'boolean') {
    return value ? 'Да' : 'Нет';
  }
  return String(value);
};

const isFormValid = computed(() => {
  return props.script.parameters.every(param => {
    if (!param.required) return true;
    const value = localParameters.value[param.name];
    return value !== undefined && value !== null && value !== '';
  });
});

const handleSave = () => {
  if (!isFormValid.value) return;

  emit('save', localParameters.value);
};
</script>

<style scoped>
  .script-configuration {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-height: 70vh;
  }

  .configuration-header {
    text-align: center;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .configuration-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: var(--color-text-primary);
  }

  .configuration-description {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .configuration-content {
    flex: 1;
    overflow-y: auto;
  }

  /* No Parameters State */
  .no-parameters {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--color-text-secondary);
  }

  .no-params-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .no-parameters h3 {
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
    color: var(--color-text-primary);
  }

  .no-parameters p {
    margin: 0;
    font-size: 0.9rem;
  }

  /* Parameters Form */
  .parameters-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .parameter-field {
    background: var(--color-surface-hover);
    border-radius: 0.75rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
  }

  .parameter-label {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
    display: block;
    margin-bottom: 1rem;
  }

  .required {
    color: var(--color-error);
    font-weight: 700;
  }

  .parameter-control {
    margin-bottom: 1rem;
  }

  .parameter-input,
  .parameter-select {
    width: 100%;
    max-width: 400px;
  }

  .parameter-toggle {
    margin-top: 0.5rem;
  }

  .parameter-info {
    border-top: 1px solid var(--color-border);
    padding-top: 1rem;
  }

  .parameter-description {
    color: var(--color-text-secondary);
    line-height: 1.4;
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
  }

  .parameter-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .parameter-type {
    font-style: italic;
  }

  .parameter-default {
    font-weight: 500;
  }

  /* Actions */
  .configuration-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
  }

  .cancel-btn,
  .save-btn {
    min-width: 160px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: 0.5rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .script-configuration {
      gap: 1.5rem;
    }

    .parameter-field {
      padding: 1.25rem;
    }

    .parameter-input,
    .parameter-select {
      max-width: 100%;
    }

    .configuration-actions {
      flex-direction: column;
    }

    .cancel-btn,
    .save-btn {
      width: 100%;
    }
  }
</style>
