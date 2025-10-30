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
            <BaseCheckbox :model-value="allScriptsSelected"
                          :indeterminate="someScriptsSelected"
                          @update:model-value="handleSelectAllScripts"
                          class="select-all-checkbox" />
            <span class="selection-label">Доступные скрипты</span>
            <span class="selection-count">{{ selectedScriptsCount }} выбрано</span>
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
                 'script-card--has-fix': hasFixScript(script.id)
               }"
               @click="toggleScriptSelection(script.id)">
            <div class="script-card__header">
              <BaseCheckbox :model-value="isScriptSelected(script.id)"
                            @click.stop
                            class="script-checkbox" />
              <div class="script-type-icon" :class="`type--${script.type}`">
                <component :is="getScriptIcon(script.type)" />
              </div>
              <div class="script-actions">
                <BaseButton @click.stop="viewScriptDetails(script)"
                            variant="text"
                            size="sm"
                            class="action-btn">
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
                <div class="script-stats">
                  <span class="stat">{{ script.parameters.length }} параметров</span>
                  <span v-if="hasFixScript(script.id)" class="fix-available">
                    <CheckCircleIcon class="fix-icon" />
                    Исправление
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Список скриптов -->
        <div v-else class="scripts-list">
          <div class="list-header">
            <div class="list-cell checkbox-cell">
              <BaseCheckbox :model-value="allFilteredScriptsSelected"
                            :indeterminate="someFilteredScriptsSelected"
                            @update:model-value="handleSelectAllFilteredScripts" />
            </div>
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
            <div class="option-item">
              <BaseToggle v-model="executionConfig.autoFix"
                          class="option-toggle" />
              <div class="option-content">
                <label class="option-label">Автоматическое исправление</label>
                <p class="option-description">
                  Автоматически применять скрипты исправления при обнаружении проблем
                </p>
              </div>
            </div>

            <div class="option-item">
              <BaseToggle v-model="executionConfig.stopOnError"
                          class="option-toggle" />
              <div class="option-content">
                <label class="option-label">Останавливать при ошибке</label>
                <p class="option-description">
                  Прекращать выполнение при первой критической ошибке
                </p>
              </div>
            </div>

            <div class="option-item">
              <BaseToggle v-model="executionConfig.parallelExecution"
                          class="option-toggle" />
              <div class="option-content">
                <label class="option-label">Параллельное выполнение</label>
                <p class="option-description">
                  Выполнять скрипты параллельно на разных хостах
                </p>
              </div>
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

        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-icon check">
              <CheckCircleIcon />
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ checkScriptsCount }}</div>
              <div class="summary-label">Скрипты проверки</div>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon fix">
              <WrenchIcon />
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ fixScriptsCount }}</div>
              <div class="summary-label">С исправлением</div>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon security">
              <ShieldIcon />
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ securityScriptsCount }}</div>
              <div class="summary-label">Безопасность</div>
            </div>
          </div>
        </div>

        <div class="selected-scripts">
          <h4 class="selected-title">Выбранные скрипты ({{ selectedScriptsCount }})</h4>
          <div class="scripts-tags">
            <BaseChip v-for="scriptId in selectedScriptIds"
                      :key="scriptId"
                      :color="getScriptColor(scriptId)"
                      closable
                      @close="removeScript(scriptId)"
                      size="sm">
              {{ getScriptName(scriptId) }}
            </BaseChip>
          </div>
        </div>
      </div>
    </div>

    <div class="dialog-actions">
      <BaseButton @click="$emit('cancel')"
                  variant="secondary"
                  class="nav-btn">
        Отмена
      </BaseButton>
      <BaseButton @click="handleConfirm"
                  variant="primary"
                  :disabled="!canConfirm"
                  class="nav-btn confirm-btn">
        <CheckIcon class="button-icon" />
        Подтвердить выбор
      </BaseButton>
    </div>

    <!-- Диалог деталей скрипта -->
    <BaseModal v-if="showScriptDetails"
               :model-value="true"
               title="Детали скрипта"
               size="lg"
               @close="showScriptDetails = false">
      <ScriptDetails :script="selectedScript"
                     @close="showScriptDetails = false" />
    </BaseModal>

    <!-- Диалог настройки параметров -->
    <BaseModal v-if="showScriptConfiguration"
               :model-value="true"
               title="Настройка параметров"
               size="xl"
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

  // State
  const viewMode = ref<'grid' | 'list'>('grid');
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

  // Options
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

  // Computed properties
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

  // Select all states
  const allScriptsSelected = computed(() => {
    return (props.scripts?.length || 0) > 0 && selectedScriptIds.value.length === (props.scripts?.length || 0);
  });

  const someScriptsSelected = computed(() => {
    return selectedScriptIds.value.length > 0 && selectedScriptIds.value.length < (props.scripts?.length || 0);
  });

  const allFilteredScriptsSelected = computed(() => {
    return filteredScripts.value.length > 0 &&
      filteredScripts.value.every(script => selectedScriptIds.value.includes(script.id));
  });

  const someFilteredScriptsSelected = computed(() => {
    const hasSelected = filteredScripts.value.some(script => selectedScriptIds.value.includes(script.id));
    return hasSelected && !allFilteredScriptsSelected.value;
  });

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

  // Methods
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

  const handleSelectAllScripts = (isChecked: boolean): void => {
    if (isChecked) {
      selectedScriptIds.value = props.scripts?.map(script => script.id) || [];
      initializeParameterValues();
    } else {
      selectedScriptIds.value = [];
      parameterValues.value = {};
    }
  };

  const handleSelectAllFilteredScripts = (isChecked: boolean): void => {
    if (isChecked) {
      const filteredScriptIds = filteredScripts.value.map(script => script.id);
      selectedScriptIds.value = [...new Set([...selectedScriptIds.value, ...filteredScriptIds])];
      initializeParameterValues();
    } else {
      const filteredScriptIds = filteredScripts.value.map(script => script.id);
      selectedScriptIds.value = selectedScriptIds.value.filter(id => !filteredScriptIds.includes(id));

      filteredScriptIds.forEach(scriptId => {
        delete parameterValues.value[scriptId];
      });
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
    gap: var(--space-xl, 1.5rem);
    max-height: 80vh;
  }

  .dialog-header {
    text-align: center;
    padding-bottom: var(--space-lg, 1.25rem);
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  .dialog-title {
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold, 700);
    margin: 0 0 var(--space-sm, 0.75rem) 0;
    color: var(--color-text-primary, #111827);
  }

  .dialog-description {
    font-size: 1rem;
    color: var(--color-text-secondary, #6b7280);
    margin: 0;
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl, 1.5rem);
    flex: 1;
    overflow-y: auto;
  }

  /* Filters Section */
  .filters-section {
    background: var(--color-surface-hover, #f8fafc);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-lg, 1.25rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .filters-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 2fr;
    gap: var(--space-md, 1rem);
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.75rem);
  }

  .filter-label {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
    font-size: 0.9rem;
  }

  /* Scripts Section */
  .scripts-section {
    background: var(--color-surface-hover, #f8fafc);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-lg, 1.25rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-lg, 1.25rem);
  }

  .selection-info {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
  }

  .selection-label {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
  }

  .selection-count {
    font-size: 0.875rem;
    color: var(--color-text-muted, #9ca3af);
    font-weight: var(--font-weight-medium, 500);
  }

  .view-controls {
    display: flex;
    gap: var(--space-xs, 0.5rem);
  }

    .view-controls .base-button.active {
      background: var(--color-primary, #3b82f6);
      color: white;
    }

  /* Scripts Grid */
  .scripts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-lg, 1.25rem);
  }

  .script-card {
    background: var(--color-surface, #fff);
    border: 2px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-lg, 1.25rem);
    cursor: pointer;
    transition: all var(--transition-fast, 0.15s);
    position: relative;
    overflow: hidden;
  }

    .script-card:hover {
      border-color: var(--color-primary, #3b82f6);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
    }

  .script-card--selected {
    border-color: var(--color-primary, #3b82f6);
    background: var(--color-primary-50, #eff6ff);
  }

  .script-card--has-fix::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 1rem 1rem 0;
    border-color: transparent var(--color-success, #10b981) transparent transparent;
  }

  .script-card__header {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
    margin-bottom: var(--space-md, 1rem);
  }

  .script-checkbox {
    flex-shrink: 0;
  }

  .script-type-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-md, 0.5rem);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .type--check .script-type-icon {
    background: var(--color-primary-light, #dbeafe);
    color: var(--color-primary, #3b82f6);
  }

  .type--fix .script-type-icon {
    background: var(--color-success-light, #d1fae5);
    color: var(--color-success, #10b981);
  }

  .script-actions {
    margin-left: auto;
    display: flex;
    gap: var(--space-xs, 0.5rem);
  }

  .action-btn {
    padding: var(--space-xs, 0.5rem);
  }

  .script-card__content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 1rem);
  }

  .script-name {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0;
    color: var(--color-text-primary, #111827);
    line-height: 1.3;
  }

  .script-description {
    color: var(--color-text-secondary, #6b7280);
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

  .script-stats {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 0.5rem);
    font-size: 0.875rem;
  }

  .stat {
    color: var(--color-text-muted, #9ca3af);
  }

  .fix-available {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 0.5rem);
    color: var(--color-success, #10b981);
    font-weight: var(--font-weight-medium, 500);
  }

  .fix-icon {
    width: 1rem;
    height: 1rem;
  }

  /* Scripts List */
  .scripts-list {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-lg, 0.75rem);
    border: 1px solid var(--color-border, #e5e7eb);
    overflow: hidden;
    max-height: 400px;
    overflow-y: auto;
  }

  .list-header {
    display: grid;
    grid-template-columns: 60px minmax(200px, 2fr) minmax(120px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) 120px;
    gap: var(--space-md, 1rem);
    padding: var(--space-md, 1rem) var(--space-lg, 1.25rem);
    background: var(--color-surface-hover, #f8fafc);
    border-bottom: 1px solid var(--color-border, #e5e7eb);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
    font-size: 0.9rem;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .list-row {
    display: grid;
    grid-template-columns: 60px minmax(200px, 2fr) minmax(120px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) 120px;
    gap: var(--space-md, 1rem);
    padding: var(--space-md, 1rem) var(--space-lg, 1.25rem);
    border-bottom: 1px solid var(--color-border-light, #f3f4f6);
    transition: background-color var(--transition-fast, 0.15s);
    cursor: pointer;
  }

    .list-row:hover {
      background: var(--color-surface-hover, #f8fafc);
    }

  .list-row--selected {
    background: var(--color-primary-50, #eff6ff);
  }

  .list-row:last-child {
    border-bottom: none;
  }

  .list-cell {
    display: flex;
    align-items: center;
    color: var(--color-text-primary, #111827);
    min-width: 0;
    overflow: hidden;
  }

  .checkbox-cell {
    justify-content: center;
    min-width: 60px;
  }

  .script-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 0.5rem);
    min-width: 0;
  }

  .script-type {
    padding: var(--space-xs, 0.5rem) var(--space-sm, 0.75rem);
    border-radius: var(--radius-full, 9999px);
    font-size: 0.75rem;
    font-weight: var(--font-weight-semibold, 600);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    text-align: center;
  }

  .type--check {
    background: var(--color-primary-light, #dbeafe);
    color: var(--color-primary, #3b82f6);
  }

  .type--fix {
    background: var(--color-success-light, #d1fae5);
    color: var(--color-success, #10b981);
  }

  .params-count {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
  }

  .has-fix {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 0.5rem);
    color: var(--color-success, #10b981);
    font-weight: var(--font-weight-medium, 500);
  }

  .no-fix {
    color: var(--color-text-muted, #9ca3af);
    font-style: italic;
  }

  .script-actions {
    display: flex;
    gap: var(--space-xs, 0.5rem);
  }

  /* Execution Settings */
  .execution-settings {
    background: var(--color-surface-hover, #f8fafc);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-lg, 1.25rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-lg, 1.25rem) 0;
    color: var(--color-text-primary, #111827);
  }

  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg, 1.25rem);
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 1rem);
  }

  .option-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md, 1rem);
    padding: var(--space-md, 1rem);
    background: var(--color-surface, #fff);
    border-radius: var(--radius-md, 0.5rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .option-toggle {
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .option-content {
    flex: 1;
  }

  .option-label {
    display: block;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
    margin-bottom: var(--space-xs, 0.5rem);
  }

  .option-description {
    color: var(--color-text-secondary, #6b7280);
    font-size: 0.875rem;
    line-height: 1.4;
    margin: 0;
  }

  /* Script Parameters */
  .script-parameters {
    margin-top: var(--space-lg, 1.25rem);
    padding-top: var(--space-lg, 1.25rem);
    border-top: 1px solid var(--color-border, #e5e7eb);
  }

  .parameters-title {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-md, 1rem) 0;
    color: var(--color-text-primary, #111827);
  }

  .parameters-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg, 1.25rem);
  }

  .parameter-group {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-md, 0.5rem);
    border: 1px solid var(--color-border, #e5e7eb);
    overflow: hidden;
  }

  .parameter-group-title {
    background: var(--color-surface-hover, #f8fafc);
    padding: var(--space-md, 1rem);
    margin: 0;
    font-size: 1rem;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  .parameter-item {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md, 1rem);
    padding: var(--space-md, 1rem);
    border-bottom: 1px solid var(--color-border-light, #f3f4f6);
  }

    .parameter-item:last-child {
      border-bottom: none;
    }

  .parameter-label {
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-primary, #111827);
    display: flex;
    align-items: center;
    gap: var(--space-xs, 0.5rem);
  }

  .required {
    color: var(--color-error, #ef4444);
    font-weight: var(--font-weight-bold, 700);
  }

  .parameter-control {
    display: flex;
    align-items: center;
  }

  .parameter-info {
    grid-column: 1 / -1;
    display: flex;
    gap: var(--space-md, 1rem);
    font-size: 0.875rem;
  }

  .parameter-type {
    color: var(--color-text-muted, #9ca3af);
    font-family: var(--font-family-mono, monospace);
  }

  .parameter-description {
    color: var(--color-text-secondary, #6b7280);
    margin: 0;
  }

  /* Selection Summary */
  .selection-summary {
    background: var(--color-surface-hover, #f8fafc);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-lg, 1.25rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-md, 1rem);
    margin-bottom: var(--space-lg, 1.25rem);
  }

  .summary-card {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
    padding: var(--space-md, 1rem);
    background: var(--color-surface, #fff);
    border-radius: var(--radius-md, 0.5rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .summary-icon {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-full, 9999px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

    .summary-icon.check {
      background: var(--color-primary-light, #dbeafe);
      color: var(--color-primary, #3b82f6);
    }

    .summary-icon.fix {
      background: var(--color-success-light, #d1fae5);
      color: var(--color-success, #10b981);
    }

    .summary-icon.security {
      background: var(--color-error-light, #fee2e2);
      color: var(--color-error, #ef4444);
    }

  .summary-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 0.5rem);
  }

  .summary-value {
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary, #111827);
  }

  .summary-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
    font-weight: var(--font-weight-medium, 500);
  }

  .selected-scripts {
    padding-top: var(--space-lg, 1.25rem);
    border-top: 1px solid var(--color-border, #e5e7eb);
  }

  .selected-title {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-md, 1rem) 0;
    color: var(--color-text-primary, #111827);
  }

  .scripts-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm, 0.75rem);
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-3xl, 3rem);
    text-align: center;
    color: var(--color-text-muted, #9ca3af);
  }

  .empty-icon {
    width: 4rem;
    height: 4rem;
    margin-bottom: var(--space-md, 1rem);
    opacity: 0.5;
  }

  .empty-description {
    font-size: 0.875rem;
    margin-top: var(--space-xs, 0.5rem);
  }

  /* Dialog Actions */
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-md, 1rem);
    padding-top: var(--space-lg, 1.25rem);
    border-top: 1px solid var(--color-border, #e5e7eb);
  }

  .nav-btn {
    min-width: 120px;
  }

  .confirm-btn {
    background: var(--color-primary, #3b82f6);
    color: white;
    border: none;
  }

    .confirm-btn:hover:not(:disabled) {
      background: var(--color-primary-dark, #2563eb);
    }

    .confirm-btn:disabled {
      background: var(--color-disabled, #9ca3af);
      cursor: not-allowed;
    }

  /* Icons */
  .button-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .input-icon {
    width: 1rem;
    height: 1rem;
    color: var(--color-text-muted, #9ca3af);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .filters-grid {
      grid-template-columns: 1fr;
    }

    .scripts-grid {
      grid-template-columns: 1fr;
    }

    .list-header,
    .list-row {
      grid-template-columns: 1fr;
      gap: var(--space-sm, 0.75rem);
    }

    .parameter-item {
      grid-template-columns: 1fr;
    }

    .summary-cards {
      grid-template-columns: 1fr;
    }

    .dialog-actions {
      flex-direction: column;
    }

    .nav-btn {
      min-width: auto;
      width: 100%;
    }
  }
</style>
