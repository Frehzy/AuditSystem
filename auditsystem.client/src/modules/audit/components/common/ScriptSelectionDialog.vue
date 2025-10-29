<template>
  <div class="script-selection-dialog">
    <div class="dialog-header">
      <h2 class="dialog-title">Выбор скриптов проверки</h2>
      <p class="dialog-description">Выберите скрипты для выполнения и настройте параметры</p>
    </div>

    <div class="dialog-content">
      <!-- Фильтры и поиск -->
      <div class="filters-section">
        <div class="filters-grid">
          <div class="filter-group">
            <label class="filter-label">Категория</label>
            <BaseSelect v-model="categoryFilter"
                        :options="categoryOptions"
                        placeholder="Все категории" />
          </div>

          <div class="filter-group">
            <label class="filter-label">Тип скрипта</label>
            <BaseSelect v-model="typeFilter"
                        :options="typeOptions"
                        placeholder="Все типы" />
          </div>

          <div class="filter-group">
            <label class="filter-label">Поиск</label>
            <BaseInput v-model="searchQuery"
                       placeholder="Поиск скриптов...">
              <template #prefix>
                <SearchIcon class="input-icon" />
              </template>
            </BaseInput>
          </div>
        </div>
      </div>

      <!-- Список скриптов -->
      <div class="scripts-section">
        <div class="section-header">
          <div class="selection-info">
            <BaseToggle v-model="selectAllScripts"
                        @change="handleSelectAllScripts"
                        class="select-all-toggle" />
            <span class="selection-label">Доступные скрипты</span>
            <span class="selection-count">Выбрано: {{ selectedScriptsCount }}</span>
          </div>

          <div class="view-controls">
            <BaseButton @click="viewMode = 'grid'"
                        variant="text"
                        size="sm"
                        :class="{ 'active': viewMode === 'grid' }">
              <GridIcon class="button-icon" />
            </BaseButton>
            <BaseButton @click="viewMode = 'list'"
                        variant="text"
                        size="sm"
                        :class="{ 'active': viewMode === 'list' }">
              <ListIcon class="button-icon" />
            </BaseButton>
          </div>
        </div>

        <!-- Сетка скриптов -->
        <div v-if="viewMode === 'grid'" class="scripts-grid">
          <div v-for="script in filteredScripts"
               :key="script.id"
               class="script-card"
               :class="{
              'script-card--selected': isScriptSelected(script.id),
              [`script-card--${script.type}`]: true
            }"
               @click="toggleScriptSelection(script.id)">
            <div class="script-card__header">
              <BaseCheckbox :model-value="isScriptSelected(script.id)"
                            @click.stop
                            class="script-checkbox" />
              <div class="script-type-icon">
                <component :is="getScriptIcon(script.type)" />
              </div>
              <div class="script-actions">
                <BaseButton @click.stop="viewScriptDetails(script)"
                            variant="text"
                            size="sm"
                            class="details-btn">
                  <InfoIcon class="button-icon" />
                </BaseButton>
              </div>
            </div>

            <div class="script-card__content">
              <h4 class="script-name">{{ script.name }}</h4>
              <p class="script-description">{{ script.description }}</p>

              <div class="script-meta">
                <BaseChip :color="getCategoryColor(script.category)"
                          size="sm">
                  {{ getCategoryText(script.category) }}
                </BaseChip>
                <span class="script-params">
                  {{ script.parameters.length }} параметров
                </span>
              </div>

              <div v-if="hasFixScript(script.id)" class="fix-script-info">
                <CheckCircleIcon class="fix-icon" />
                <span>Есть скрипт исправления</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Список скриптов -->
        <div v-else class="scripts-list">
          <div class="list-header">
            <div class="list-cell checkbox-cell"></div>
            <div class="list-cell">Название</div>
            <div class="list-cell">Категория</div>
            <div class="list-cell">Тип</div>
            <div class="list-cell">Параметры</div>
            <div class="list-cell">Исправление</div>
            <div class="list-cell">Действия</div>
          </div>

          <div v-for="script in filteredScripts"
               :key="script.id"
               class="list-row"
               :class="{ 'list-row--selected': isScriptSelected(script.id) }"
               @click="toggleScriptSelection(script.id)">
            <div class="list-cell checkbox-cell">
              <BaseCheckbox :model-value="isScriptSelected(script.id)"
                            @click.stop />
            </div>
            <div class="list-cell">
              <div class="script-info">
                <h4 class="script-name">{{ script.name }}</h4>
                <p class="script-description">{{ script.description }}</p>
              </div>
            </div>
            <div class="list-cell">
              <BaseChip :color="getCategoryColor(script.category)"
                        size="sm">
                {{ getCategoryText(script.category) }}
              </BaseChip>
            </div>
            <div class="list-cell">
              <span class="script-type" :class="`type--${script.type}`">
                {{ getTypeText(script.type) }}
              </span>
            </div>
            <div class="list-cell">
              <span class="params-count">{{ script.parameters.length }}</span>
            </div>
            <div class="list-cell">
              <div v-if="hasFixScript(script.id)" class="has-fix">
                <CheckCircleIcon class="fix-icon" />
                <span>Есть</span>
              </div>
              <span v-else class="no-fix">Нет</span>
            </div>
            <div class="list-cell">
              <div class="script-actions">
                <BaseButton @click.stop="viewScriptDetails(script)"
                            variant="text"
                            size="sm">
                  <InfoIcon class="button-icon" />
                </BaseButton>
                <BaseButton @click.stop="configureScript(script)"
                            variant="text"
                            size="sm">
                  <SettingsIcon class="button-icon" />
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredScripts.length === 0" class="empty-state">
          <CodeIcon class="empty-icon" />
          <p>Скрипты не найдены</p>
          <p class="empty-description">
            {{
 searchQuery || categoryFilter || typeFilter ?
               'Попробуйте изменить параметры поиска' :
               'Добавьте скрипты в систему'
            }}
          </p>
        </div>
      </div>

      <!-- Настройки выполнения -->
      <div class="execution-settings">
        <h3 class="section-title">Настройки выполнения</h3>

        <div class="settings-grid">
          <div class="setting-group">
            <BaseToggle v-model="executionConfig.autoFix"
                        class="setting-toggle" />
            <div class="setting-content">
              <label class="setting-label">Автоматическое исправление</label>
              <p class="setting-description">
                Автоматически применять скрипты исправления при обнаружении проблем
              </p>
            </div>
          </div>

          <div class="setting-group">
            <BaseToggle v-model="executionConfig.stopOnError"
                        class="setting-toggle" />
            <div class="setting-content">
              <label class="setting-label">Останавливать при ошибке</label>
              <p class="setting-description">
                Прекращать выполнение при первой критической ошибке
              </p>
            </div>
          </div>

          <div class="setting-group">
            <BaseToggle v-model="executionConfig.parallelExecution"
                        class="setting-toggle" />
            <div class="setting-content">
              <label class="setting-label">Параллельное выполнение</label>
              <p class="setting-description">
                Выполнять скрипты параллельно на разных хостах
              </p>
            </div>
          </div>
        </div>

        <!-- Параметры скриптов -->
        <div v-if="hasScriptsWithParameters" class="script-parameters">
          <h4 class="parameters-title">Параметры скриптов</h4>

          <div class="parameters-list">
            <div v-for="script in scriptsWithParameters"
                 :key="script.id"
                 class="parameter-group">
              <h5 class="parameter-group-title">{{ script.name }}</h5>

              <div v-for="param in script.parameters"
                   :key="param.name"
                   class="parameter-item">
                <label class="parameter-label">
                  {{ param.name }}
                  <span v-if="param.required" class="required">*</span>
                </label>

                <div class="parameter-control">
                  <BaseInput v-if="param.type === 'string'"
                             v-model="parameterValues[script.id][param.name]"
                             :placeholder="param.description"
                             :required="param.required" />

                  <BaseInput v-else-if="param.type === 'number'"
                             v-model.number="parameterValues[script.id][param.name]"
                             type="number"
                             :placeholder="param.description"
                             :required="param.required" />

                  <BaseToggle v-else-if="param.type === 'boolean'"
                              v-model="parameterValues[script.id][param.name]" />

                  <BaseSelect v-else-if="param.type === 'select'"
                              v-model="parameterValues[script.id][param.name]"
                              :options="param.options?.map(opt => ({ value: opt, label: opt })) || []"
                              :placeholder="param.description"
                              :required="param.required" />
                </div>

                <div class="parameter-info">
                  <span class="parameter-type">{{ param.type }}</span>
                  <span class="parameter-description">{{ param.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Сводка выбора -->
      <div class="selection-summary">
        <h3 class="section-title">Сводка выбора</h3>

        <div class="summary-stats">
          <div class="stat-item">
            <div class="stat-icon check">
              <CheckCircleIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ checkScriptsCount }}</div>
              <div class="stat-label">Скрипты проверки</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon fix">
              <WrenchIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ fixScriptsCount }}</div>
              <div class="stat-label">С исправлением</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon security">
              <ShieldIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ securityScriptsCount }}</div>
              <div class="stat-label">Безопасность</div>
            </div>
          </div>
        </div>

        <div class="selected-scripts">
          <h4 class="scripts-title">Выбранные скрипты:</h4>
          <div class="scripts-tags">
            <BaseChip v-for="scriptId in selectedScriptIds"
                      :key="scriptId"
                      :color="getScriptColor(scriptId)"
                      closable
                      @close="removeScript(scriptId)">
              {{ getScriptName(scriptId) }}
            </BaseChip>
          </div>
        </div>
      </div>
    </div>

    <div class="dialog-actions">
      <BaseButton @click="$emit('cancel')"
                  variant="secondary"
                  class="cancel-btn">
        Отмена
      </BaseButton>
      <BaseButton @click="handleConfirm"
                  variant="primary"
                  :disabled="!canConfirm"
                  class="confirm-btn">
        <CheckIcon class="button-icon" />
        Подтвердить выбор
      </BaseButton>
    </div>

    <!-- Диалог деталей скрипта -->
    <BaseModal v-if="showScriptDetails"
               title="Детали скрипта"
               size="medium"
               @close="showScriptDetails = false">
      <ScriptDetails :script="selectedScript"
                     @close="showScriptDetails = false" />
    </BaseModal>

    <!-- Диалог настройки параметров -->
    <BaseModal v-if="showScriptConfiguration"
               title="Настройка параметров"
               size="large"
               @close="showScriptConfiguration = false">
      <ScriptConfiguration :script="selectedScript"
                           :parameters="parameterValues[selectedScript?.id] || {}"
                           @save="handleSaveParameters"
                           @close="showScriptConfiguration = false" />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from '@/framework/ui/composables/useToast';
import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue';
import BaseCheckbox from '@/framework/ui/components/forms/BaseCheckbox.vue';
import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
import BaseModal from '@/framework/ui/components/overlay/BaseModal.vue';
import ScriptDetails from './ScriptDetails.vue';
import ScriptConfiguration from './ScriptConfiguration.vue';
import {
  SearchIcon,
  GridIcon,
  ListIcon,
  InfoIcon,
  SettingsIcon,
  CheckIcon,
  CheckCircleIcon,
  WrenchIcon,
  ShieldIcon,
  CodeIcon,
  CheckScriptIcon,
  FixScriptIcon
} from '@/assets/icons';
import { useScripts } from '../../composables/useScripts';
import type { Script } from '../../api/audit.types';

interface Props {
  scripts?: Script[];
}

interface Emits {
  (e: 'confirm', selection: ScriptSelection): void;
  (e: 'cancel'): void;
}

interface ScriptSelection {
  scriptIds: string[];
  autoFix: boolean;
  stopOnError: boolean;
  parallelExecution: boolean;
  parameters: Record<string, Record<string, any>>;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { showToast } = useToast();
const scriptsManager = useScripts();

const viewMode = ref<'grid' | 'list'>('grid');
const selectAllScripts = ref(false);
const categoryFilter = ref('');
const typeFilter = ref('');
const searchQuery = ref('');
const showScriptDetails = ref(false);
const showScriptConfiguration = ref(false);

const selectedScriptIds = ref<string[]>([]);
const selectedScript = ref<Script | null>(null);
const parameterValues = ref<Record<string, Record<string, any>>>({});

const executionConfig = ref({
  autoFix: true,
  stopOnError: false,
  parallelExecution: true
});

const categoryOptions = [
  { value: '', label: 'Все категории' },
  { value: 'security', label: 'Безопасность' },
  { value: 'compliance', label: 'Соответствие' },
  { value: 'performance', label: 'Производительность' },
  { value: 'custom', label: 'Пользовательские' }
];

const typeOptions = [
  { value: '', label: 'Все типы' },
  { value: 'check', label: 'Проверка' },
  { value: 'fix', label: 'Исправление' }
];

const filteredScripts = computed(() => {
  let scripts = props.scripts || [];

  if (categoryFilter.value) {
    scripts = scripts.filter(script => script.category === categoryFilter.value);
  }

  if (typeFilter.value) {
    scripts = scripts.filter(script => script.type === typeFilter.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    scripts = scripts.filter(script =>
      script.name.toLowerCase().includes(query) ||
      script.description.toLowerCase().includes(query)
    );
  }

  return scripts;
});

const selectedScriptsCount = computed(() => selectedScriptIds.value.length);

const checkScriptsCount = computed(() => {
  return selectedScriptIds.value.filter(id => {
    const script = props.scripts?.find(s => s.id === id);
    return script?.type === 'check';
  }).length;
});

const fixScriptsCount = computed(() => {
  return selectedScriptIds.value.filter(id => {
    const script = props.scripts?.find(s => s.id === id);
    return script?.type === 'fix';
  }).length;
});

const securityScriptsCount = computed(() => {
  return selectedScriptIds.value.filter(id => {
    const script = props.scripts?.find(s => s.id === id);
    return script?.category === 'security';
  }).length;
});

const scriptsWithParameters = computed(() => {
  return props.scripts?.filter(script =>
    selectedScriptIds.value.includes(script.id) && script.parameters.length > 0
  ) || [];
});

const hasScriptsWithParameters = computed(() => scriptsWithParameters.value.length > 0);

const canConfirm = computed(() => selectedScriptIds.value.length > 0);

const isScriptSelected = (scriptId: string): boolean => {
  return selectedScriptIds.value.includes(scriptId);
};

const getScriptIcon = (type: string) => {
  return type === 'check' ? CheckScriptIcon : FixScriptIcon;
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

const getTypeText = (type: string): string => {
  return type === 'check' ? 'Проверка' : 'Исправление';
};

const getScriptColor = (scriptId: string): string => {
  const script = props.scripts?.find(s => s.id === scriptId);
  if (!script) return 'default';

  if (script.type === 'check') {
    return hasFixScript(scriptId) ? 'success' : 'primary';
  } else {
    return 'info';
  }
};

const getScriptName = (scriptId: string): string => {
  const script = props.scripts?.find(s => s.id === scriptId);
  return script?.name || 'Неизвестный скрипт';
};

const hasFixScript = (checkScriptId: string): boolean => {
  return !!scriptsManager.getFixScriptForCheck(checkScriptId);
};

const handleSelectAllScripts = (): void => {
  if (selectAllScripts.value) {
    selectedScriptIds.value = filteredScripts.value.map(script => script.id);
    initializeParameterValues();
  } else {
    selectedScriptIds.value = [];
    parameterValues.value = {};
  }
};

const toggleScriptSelection = (scriptId: string): void => {
  const index = selectedScriptIds.value.indexOf(scriptId);
  if (index > -1) {
    selectedScriptIds.value.splice(index, 1);
    delete parameterValues.value[scriptId];
  } else {
    selectedScriptIds.value.push(scriptId);
    initializeScriptParameters(scriptId);
  }
};

const removeScript = (scriptId: string): void => {
  const index = selectedScriptIds.value.indexOf(scriptId);
  if (index > -1) {
    selectedScriptIds.value.splice(index, 1);
    delete parameterValues.value[scriptId];
  }
};

const viewScriptDetails = (script: Script): void => {
  selectedScript.value = script;
  showScriptDetails.value = true;
};

const configureScript = (script: Script): void => {
  selectedScript.value = script;
  showScriptConfiguration.value = true;
};

const initializeParameterValues = (): void => {
  filteredScripts.value.forEach(script => {
    initializeScriptParameters(script.id);
  });
};

const initializeScriptParameters = (scriptId: string): void => {
  const script = props.scripts?.find(s => s.id === scriptId);
  if (!script) return;

  if (!parameterValues.value[scriptId]) {
    parameterValues.value[scriptId] = {};
  }

  script.parameters.forEach(param => {
    if (parameterValues.value[scriptId][param.name] === undefined) {
      parameterValues.value[scriptId][param.name] = param.defaultValue;
    }
  });
};

const handleSaveParameters = (parameters: Record<string, any>): void => {
  if (selectedScript.value) {
    parameterValues.value[selectedScript.value.id] = { ...parameters };
    showScriptConfiguration.value = false;
    showToast({
      type: 'success',
      title: 'Параметры сохранены',
      message: 'Параметры скрипта успешно обновлены'
    });
  }
};

const handleConfirm = (): void => {
  if (!canConfirm.value) {
    showToast({
      type: 'warning',
      title: 'Выберите скрипты',
      message: 'Для продолжения необходимо выбрать хотя бы один скрипт'
    });
    return;
  }

  const selection: ScriptSelection = {
    scriptIds: selectedScriptIds.value,
    autoFix: executionConfig.value.autoFix,
    stopOnError: executionConfig.value.stopOnError,
    parallelExecution: executionConfig.value.parallelExecution,
    parameters: parameterValues.value
  };

  emit('confirm', selection);
  showToast({
    type: 'success',
    title: 'Скрипты выбраны',
    message: `Выбрано ${selectedScriptsCount.value} скриптов для выполнения`
  });
};

onMounted(() => {
  scriptsManager.loadScripts();
});
</script>

<style scoped>
  .script-selection-dialog {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-height: 80vh;
  }

  .dialog-header {
    text-align: center;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .dialog-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: var(--color-text-primary);
  }

  .dialog-description {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    flex: 1;
    overflow-y: auto;
  }

  /* Filters Section */
  .filters-section {
    background: var(--color-surface-hover);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
  }

  .filters-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 2fr;
    gap: 1rem;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-label {
    font-weight: 600;
    color: var(--color-text-primary);
    font-size: 0.9rem;
  }

  /* Scripts Section */
  .scripts-section {
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

  .selection-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .selection-label {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .selection-count {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .view-controls {
    display: flex;
    gap: 0.5rem;
  }

    .view-controls .base-button.active {
      background: var(--color-primary);
      color: white;
    }

  /* Scripts Grid */
  .scripts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .script-card {
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: 1rem;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

    .script-card:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

  .script-card--selected {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
  }

  .script-card--check {
    border-left: 4px solid var(--color-primary);
  }

  .script-card--fix {
    border-left: 4px solid var(--color-success);
  }

  .script-card__header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .script-checkbox {
    flex-shrink: 0;
  }

  .script-type-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .script-card--check .script-type-icon {
    background: var(--color-primary-light);
    color: var(--color-primary);
  }

  .script-card--fix .script-type-icon {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  .script-actions {
    margin-left: auto;
    display: flex;
    gap: 0.25rem;
  }

  .script-card__content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .script-name {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
  }

  .script-description {
    color: var(--color-text-secondary);
    line-height: 1.4;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .script-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .script-params {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .fix-script-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-success-light);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-success);
  }

  .fix-icon {
    width: 1rem;
    height: 1rem;
  }

  /* Scripts List */
  .scripts-list {
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
    overflow: hidden;
  }

  .list-header {
    display: grid;
    grid-template-columns: 60px 2fr 1fr 1fr 1fr 1fr 120px;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: var(--color-surface-hover);
    border-bottom: 1px solid var(--color-border);
    font-weight: 700;
    color: var(--color-text-primary);
    font-size: 0.9rem;
  }

  .list-row {
    display: grid;
    grid-template-columns: 60px 2fr 1fr 1fr 1fr 1fr 120px;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-border);
    transition: background-color 0.2s ease;
    cursor: pointer;
  }

    .list-row:hover {
      background: var(--color-surface-hover);
    }

  .list-row--selected {
    background: var(--color-primary-light);
  }

  .list-row:last-child {
    border-bottom: none;
  }

  .list-cell {
    display: flex;
    align-items: center;
    color: var(--color-text-primary);
  }

  .checkbox-cell {
    justify-content: center;
  }

  .script-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .script-type {
    padding: 0.25rem 0.75rem;
    border-radius: 2rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .type--check {
    background: var(--color-primary-light);
    color: var(--color-primary);
  }

  .type--fix {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  .params-count {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .has-fix {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-success);
    font-weight: 500;
  }

  .no-fix {
    color: var(--color-text-muted);
    font-style: italic;
  }

  .script-actions {
    display: flex;
    gap: 0.25rem;
  }

  /* Execution Settings */
  .execution-settings {
    background: var(--color-surface-hover);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
  }

  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .setting-group {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
  }

  .setting-toggle {
    margin-top: 0.125rem;
  }

  .setting-content {
    flex: 1;
  }

  .setting-label {
    font-weight: 600;
    color: var(--color-text-primary);
    display: block;
    margin-bottom: 0.25rem;
  }

  .setting-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
    margin: 0;
  }

  /* Script Parameters */
  .script-parameters {
    background: var(--color-surface);
    border-radius: 0.75rem;
    padding: 1.25rem;
    border: 1px solid var(--color-border);
  }

  .parameters-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
  }

  .parameters-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .parameter-group {
    padding: 1rem;
    background: var(--color-surface-hover);
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
  }

  .parameter-group-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
  }

  .parameter-item {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
    align-items: start;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-border);
  }

    .parameter-item:last-child {
      border-bottom: none;
    }

  .parameter-label {
    font-weight: 600;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .required {
    color: var(--color-error);
    font-weight: 700;
  }

  .parameter-control {
    display: flex;
    align-items: center;
  }

  .parameter-info {
    grid-column: 1 / -1;
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .parameter-type {
    font-style: italic;
  }

  /* Selection Summary */
  .selection-summary {
    background: var(--color-surface-hover);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
  }

  .summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
  }

  .stat-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

    .stat-icon.check {
      background: var(--color-primary);
    }

    .stat-icon.fix {
      background: var(--color-success);
    }

    .stat-icon.security {
      background: var(--color-warning);
    }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 800;
    margin-bottom: 0.25rem;
    color: var(--color-text-primary);
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .selected-scripts {
    background: var(--color-surface);
    border-radius: 0.75rem;
    padding: 1.25rem;
    border: 1px solid var(--color-border);
  }

  .scripts-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
  }

  .scripts-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--color-text-secondary);
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

  /* Icons */
  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  .input-icon {
    width: 1.125rem;
    height: 1.125rem;
    color: var(--color-text-muted);
  }

  /* Dialog Actions */
  .dialog-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
  }

  .cancel-btn,
  .confirm-btn {
    min-width: 160px;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .scripts-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }

  @media (max-width: 1024px) {
    .filters-grid {
      grid-template-columns: 1fr;
    }

    .list-header,
    .list-row {
      grid-template-columns: 50px 2fr 1fr;
      gap: 0.75rem;
    }

    .list-cell:nth-child(4),
    .list-cell:nth-child(5),
    .list-cell:nth-child(6),
    .list-cell:nth-child(7) {
      display: none;
    }

    .parameter-item {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .summary-stats {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .script-selection-dialog {
      gap: 1.5rem;
    }

    .scripts-section,
    .execution-settings,
    .selection-summary {
      padding: 1.25rem;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .scripts-grid {
      grid-template-columns: 1fr;
    }

    .dialog-actions {
      flex-direction: column;
    }

    .cancel-btn,
    .confirm-btn {
      width: 100%;
    }
  }
</style>
