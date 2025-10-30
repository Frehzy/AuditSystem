<template>
  <div class="scripts-view">
    <!-- Fixed Header -->
    <div class="scripts-header">
      <div class="header-content">
        <h1 class="scripts-title">Управление скриптами</h1>
        <p class="scripts-subtitle">Создание и настройка скриптов для проверки и исправления</p>
      </div>
    </div>

    <div class="scripts-content">
      <!-- Actions Section -->
      <div class="scripts-actions-section">
        <div class="actions-header">
          <div class="actions-title">
            <CodeIcon class="title-icon" />
            <span>Скрипты проверки и исправления</span>
          </div>
          <BaseButton @click="showCreateScriptDialog = true"
                      variant="primary"
                      class="add-script-btn">
            <PlusIcon class="button-icon" />
            Добавить скрипт
          </BaseButton>
        </div>

        <!-- Filters -->
        <div class="scripts-filters">
          <div class="filter-group">
            <BaseSelect v-model="selectedType"
                        :options="typeOptions"
                        placeholder="Тип скрипта"
                        size="sm" />
          </div>
          <div class="filter-group">
            <BaseSelect v-model="selectedCategory"
                        :options="categoryOptions"
                        placeholder="Категория"
                        size="sm" />
          </div>
          <div class="filter-group">
            <BaseInput v-model="searchQuery"
                       placeholder="Поиск скриптов..."
                       size="sm">
              <template #prefix>
                <SearchIcon class="input-icon" />
              </template>
            </BaseInput>
          </div>
        </div>
      </div>

      <!-- Scripts Grid -->
      <div class="scripts-grid-section">
        <div class="scripts-grid">
          <div v-for="script in filteredScripts"
               :key="script.id"
               class="script-card"
               :class="{
                 'script-card--selected': isScriptSelected(script.id),
                 'script-card--check': script.type === 'check',
                 'script-card--fix': script.type === 'fix'
               }"
               @click="toggleScriptSelection(script.id)">
            <div class="script-card-header">
              <BaseCheckbox :model-value="isScriptSelected(script.id)"
                            @click.stop
                            class="script-checkbox" />
              <div class="script-type-icon" :class="`type--${script.type}`">
                <component :is="getScriptIcon(script.type)" />
              </div>
              <div class="script-actions">
                <BaseButton @click.stop="editScript(script)"
                            variant="text"
                            size="sm"
                            class="action-btn">
                  <EditIcon class="button-icon" />
                </BaseButton>
                <BaseButton @click.stop="testScript(script)"
                            variant="text"
                            size="sm"
                            class="action-btn">
                  <PlayIcon class="button-icon" />
                </BaseButton>
              </div>
            </div>

            <div class="script-card-content">
              <h4 class="script-name">{{ script.name }}</h4>
              <p class="script-description">{{ script.description }}</p>

              <div class="script-meta">
                <div class="meta-tags">
                  <BaseChip :color="getScriptCategoryColor(script.category)"
                            size="sm">
                    {{ getCategoryText(script.category) }}
                  </BaseChip>
                  <BaseChip :color="getScriptTypeColor(script.type)"
                            size="sm">
                    {{ getTypeText(script.type) }}
                  </BaseChip>
                </div>
                <div class="script-stats">
                  <span class="stat">{{ script.parameters.length }} параметров</span>
                  <span v-if="hasFixScript(script.id)" class="fix-available">
                    <CheckCircleIcon class="fix-icon" />
                    Исправление
                  </span>
                </div>
              </div>

              <div v-if="script.parameters.length > 0" class="script-parameters">
                <div class="parameters-title">Параметры:</div>
                <div class="parameters-list">
                  <div v-for="param in script.parameters.slice(0, 3)"
                       :key="param.name"
                       class="parameter-item">
                    <span class="parameter-name">{{ param.name }}</span>
                    <span class="parameter-type">{{ param.type }}</span>
                    <span v-if="param.required" class="parameter-required">*</span>
                  </div>
                  <div v-if="script.parameters.length > 3" class="parameter-more">
                    +{{ script.parameters.length - 3 }} еще
                  </div>
                </div>
              </div>
            </div>

            <div class="script-card-footer">
              <div class="script-info">
                <span class="script-date">
                  Обновлен: {{ formatScriptDate(script.updatedAt) }}
                </span>
              </div>
              <div class="footer-actions">
                <BaseButton @click.stop="deleteScript(script)"
                            variant="text"
                            size="sm"
                            color="error">
                  <DeleteIcon class="button-icon" />
                  Удалить
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredScripts.length === 0" class="empty-state">
          <CodeIcon class="empty-icon" />
          <p class="empty-text">Скрипты не найдены</p>
          <p class="empty-description">
            {{
              searchQuery || selectedType || selectedCategory ?
              'Попробуйте изменить параметры поиска' :
              'Создайте первый скрипт для проверки систем'
            }}
          </p>
          <BaseButton @click="showCreateScriptDialog = true"
                      variant="primary">
            <PlusIcon class="button-icon" />
            Добавить скрипт
          </BaseButton>
        </div>
      </div>

      <!-- Statistics -->
      <div class="scripts-stats-section">
        <h3 class="stats-title">Статистика скриптов</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon check">
              <CheckCircleIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ checkScriptsCount }}</div>
              <div class="stat-label">Скрипты проверки</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon fix">
              <WrenchIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ fixScriptsCount }}</div>
              <div class="stat-label">Скрипты исправления</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon security">
              <ShieldIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ securityScriptsCount }}</div>
              <div class="stat-label">Безопасность</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon compliance">
              <FileCheckIcon />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ complianceScriptsCount }}</div>
              <div class="stat-label">Соответствие</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Scripts Summary -->
      <div v-if="selectedScriptsCount > 0" class="selected-scripts">
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

    <!-- Create/Edit Script Modal -->
    <BaseModal v-if="showCreateScriptDialog"
               :modelValue="showCreateScriptDialog"
               :title="editingScript ? 'Редактирование скрипта' : 'Создание скрипта'"
               size="xxl"
               @update:modelValue="showCreateScriptDialog = $event"
               @close="closeScriptDialog">
      <ScriptForm :script="editingScript"
                  @save="handleSaveScript"
                  @cancel="closeScriptDialog" />
    </BaseModal>

    <!-- Test Script Modal -->
    <BaseModal v-if="showTestScriptDialog"
               :modelValue="showTestScriptDialog"
               title="Тестирование скрипта"
               size="xl"
               @update:modelValue="showTestScriptDialog = $event"
               @close="showTestScriptDialog = false">
      <ScriptTestForm :script="testingScript"
                      @test="handleTestScript"
                      @cancel="showTestScriptDialog = false" />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
  import BaseCheckbox from '@/framework/ui/components/forms/BaseCheckbox.vue';
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
  import BaseModal from '@/framework/ui/components/overlay/BaseModal.vue';
  import ScriptForm from '../forms/ScriptForm.vue';
  import ScriptTestForm from '../forms/ScriptTestForm.vue';
  import {
    PlusIcon,
    SearchIcon,
    EditIcon,
    PlayIcon,
    DeleteIcon,
    CodeIcon,
    CheckCircleIcon,
    WrenchIcon,
    ShieldIcon,
    FileCheckIcon,
    CheckIcon,
    FixIcon
  } from '@/assets/icons';
  import { useScripts } from '../../composables/useScripts';
  import type { Script } from '../../api/audit.types';

  interface Props {
    scripts?: Script[];
    isLoading?: boolean;
  }

  const props = defineProps<Props>();

  const { showToast } = useToast();
  const scriptsManager = useScripts();

  // State
  const showCreateScriptDialog = ref(false);
  const showTestScriptDialog = ref(false);
  const editingScript = ref<Script | null>(null);
  const testingScript = ref<Script | null>(null);
  const selectedType = ref('');
  const selectedCategory = ref('');
  const searchQuery = ref('');

  // Selections
  const selectedScriptIds = ref<string[]>([]);

  // Options
  const typeOptions = [
    { value: '', label: 'Все типы' },
    { value: 'check', label: 'Проверка' },
    { value: 'fix', label: 'Исправление' }
  ];

  const categoryOptions = [
    { value: '', label: 'Все категории' },
    { value: 'security', label: 'Безопасность' },
    { value: 'compliance', label: 'Соответствие' },
    { value: 'performance', label: 'Производительность' },
    { value: 'custom', label: 'Пользовательские' }
  ];

  // Computed properties
  const filteredScripts = computed(() => {
    let scripts = props.scripts || [];

    // Filter by type
    if (selectedType.value) {
      scripts = scripts.filter(script => script.type === selectedType.value);
    }

    // Filter by category
    if (selectedCategory.value) {
      scripts = scripts.filter(script => script.category === selectedCategory.value);
    }

    // Filter by search query
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
    return scriptsManager.checkScripts.value.length;
  });

  const fixScriptsCount = computed(() => {
    return scriptsManager.fixScripts.value.length;
  });

  const securityScriptsCount = computed(() => {
    return scriptsManager.securityScripts.value.length;
  });

  const complianceScriptsCount = computed(() => {
    return scriptsManager.complianceScripts.value.length;
  });

  // Methods
  const isScriptSelected = (scriptId: string): boolean => {
    return selectedScriptIds.value.includes(scriptId);
  };

  const toggleScriptSelection = (scriptId: string): void => {
    const index = selectedScriptIds.value.indexOf(scriptId);
    if (index > -1) {
      selectedScriptIds.value.splice(index, 1);
    } else {
      selectedScriptIds.value.push(scriptId);
    }
  };

  const removeScript = (scriptId: string): void => {
    const index = selectedScriptIds.value.indexOf(scriptId);
    if (index > -1) {
      selectedScriptIds.value.splice(index, 1);
    }
  };

  const getScriptIcon = (type: string) => {
    return type === 'check' ? CheckIcon : FixIcon;
  };

  const getTypeText = (type: string): string => {
    return type === 'check' ? 'Проверка' : 'Исправление';
  };

  const getScriptTypeColor = (type: string): string => {
    return type === 'check' ? 'primary' : 'success';
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

  const getScriptCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      security: 'error',
      compliance: 'warning',
      performance: 'info',
      custom: 'success'
    };
    return colorMap[category] || 'default';
  };

  const getScriptColor = (scriptId: string): string => {
    const script = props.scripts?.find(s => s.id === scriptId);
    if (!script) return 'default';
    return script.type === 'check' ? 'primary' : 'success';
  };

  const getScriptName = (scriptId: string): string => {
    const script = props.scripts?.find(s => s.id === scriptId);
    return script?.name || 'Неизвестный скрипт';
  };

  const hasFixScript = (checkScriptId: string): boolean => {
    return !!scriptsManager.getFixScriptForCheck(checkScriptId);
  };

  const formatScriptDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const editScript = (script: Script): void => {
    editingScript.value = { ...script };
    showCreateScriptDialog.value = true;
  };

  const testScript = (script: Script): void => {
    testingScript.value = { ...script };
    showTestScriptDialog.value = true;
  };

  const deleteScript = async (script: Script): Promise<void> => {
    if (confirm(`Удалить скрипт "${script.name}"?`)) {
      try {
        await scriptsManager.deleteScript(script.id);
        showToast({
          type: 'success',
          title: 'Скрипт удален',
          message: 'Скрипт успешно удален из системы'
        });
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Ошибка',
          message: 'Не удалось удалить скрипт'
        });
      }
    }
  };

  const handleSaveScript = async (scriptData: any): Promise<void> => {
    try {
      if (editingScript.value) {
        await scriptsManager.updateScript(editingScript.value.id, scriptData);
        showToast({
          type: 'success',
          title: 'Скрипт обновлен',
          message: 'Скрипт успешно обновлен'
        });
      } else {
        await scriptsManager.createScript(scriptData);
        showToast({
          type: 'success',
          title: 'Скрипт создан',
          message: 'Новый скрипт успешно создан'
        });
      }
      closeScriptDialog();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось сохранить скрипт'
      });
    }
  };

  const handleTestScript = async (testData: any): Promise<void> => {
    try {
      console.log('Testing script:', testingScript.value, 'with data:', testData);
      showToast({
        type: 'success',
        title: 'Тестирование запущено',
        message: 'Скрипт отправлен на тестирование'
      });
      showTestScriptDialog.value = false;
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось запустить тестирование'
      });
    }
  };

  const closeScriptDialog = (): void => {
    showCreateScriptDialog.value = false;
    editingScript.value = null;
  };

  onMounted(() => {
    scriptsManager.loadScripts();
  });
</script>

<style scoped>
  .scripts-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-background);
  }

  /* Fixed Header */
  .scripts-header {
    flex-shrink: 0;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-xl, 1.5rem) var(--space-xl, 1.5rem) var(--space-lg, 1.25rem);
  }

  .header-content {
    text-align: center;
  }

  .scripts-title {
    font-size: 1.875rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-sm, 0.75rem) 0;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .scripts-subtitle {
    font-size: 1.125rem;
    color: var(--color-text-secondary);
    margin: 0;
    font-weight: var(--font-weight-normal, 400);
  }

  /* Scrollable Content */
  .scripts-content {
    flex: 1;
    padding: var(--space-xl, 1.5rem);
    overflow-y: auto;
  }

  /* Actions Section */
  .scripts-actions-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-xl, 1.5rem);
    margin-bottom: var(--space-2xl, 2rem);
  }

  .actions-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-lg, 1.25rem);
  }

  .actions-title {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 0.75rem);
    font-size: 1.25rem;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
  }

  .title-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--color-primary);
  }

  .add-script-btn {
    min-width: 140px;
  }

  .scripts-filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-md, 1rem);
  }

  /* Scripts Grid Section */
  .scripts-grid-section {
    margin-bottom: var(--space-2xl, 2rem);
  }

  .scripts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: var(--space-lg, 1.25rem);
  }

  .script-card {
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-lg, 1.25rem);
    cursor: pointer;
    transition: all var(--transition-fast, 0.15s);
    position: relative;
    overflow: hidden;
  }

    .script-card:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
    }

  .script-card--selected {
    border-color: var(--color-primary);
    background: var(--color-primary-50, #eff6ff);
  }

  .script-card--check {
    border-left: 4px solid var(--color-primary);
  }

  .script-card--fix {
    border-left: 4px solid var(--color-success);
  }

  .script-card-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md, 1rem);
    margin-bottom: var(--space-md, 1rem);
  }

  .script-checkbox {
    margin-top: 0.125rem;
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

  .script-card-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 1rem);
    margin-bottom: var(--space-md, 1rem);
  }

  .script-name {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0;
    color: var(--color-text-primary);
    line-height: 1.3;
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

  .meta-tags {
    display: flex;
    gap: var(--space-sm, 0.75rem);
  }

  .script-stats {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 0.5rem);
    font-size: 0.875rem;
    text-align: right;
  }

  .stat {
    color: var(--color-text-muted);
  }

  .fix-available {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 0.5rem);
    color: var(--color-success);
    font-weight: var(--font-weight-medium, 500);
  }

  .fix-icon {
    width: 1rem;
    height: 1rem;
  }

  .script-parameters {
    background: var(--color-surface-hover);
    border-radius: var(--radius-md, 0.5rem);
    padding: var(--space-md, 1rem);
  }

  .parameters-title {
    font-size: 0.875rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-sm, 0.75rem) 0;
    color: var(--color-text-primary);
  }

  .parameters-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm, 0.75rem);
  }

  .parameter-item {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 0.5rem);
    padding: var(--space-xs, 0.5rem) var(--space-sm, 0.75rem);
    background: var(--color-surface);
    border-radius: var(--radius-full, 9999px);
    border: 1px solid var(--color-border);
    font-size: 0.75rem;
  }

  .parameter-name {
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-primary);
  }

  .parameter-type {
    color: var(--color-text-muted);
    font-style: italic;
  }

  .parameter-required {
    color: var(--color-error);
    font-weight: var(--font-weight-bold, 700);
  }

  .parameter-more {
    padding: var(--space-xs, 0.5rem) var(--space-sm, 0.75rem);
    background: var(--color-surface);
    border-radius: var(--radius-full, 9999px);
    border: 1px solid var(--color-border);
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium, 500);
  }

  .script-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--space-md, 1rem);
    border-top: 1px solid var(--color-border);
  }

  .script-info {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .footer-actions {
    display: flex;
    gap: var(--space-sm, 0.75rem);
  }

  /* Statistics Section */
  .scripts-stats-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-xl, 1.5rem);
    margin-bottom: var(--space-xl, 1.5rem);
  }

  .stats-title {
    font-size: 1.25rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-lg, 1.25rem) 0;
    color: var(--color-text-primary);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-lg, 1.25rem);
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
    padding: var(--space-lg, 1.25rem);
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg, 0.75rem);
    border: 1px solid var(--color-border);
  }

  .stat-icon {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-md, 0.5rem);
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

    .stat-icon.compliance {
      background: var(--color-info);
    }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: var(--font-weight-bold, 700);
    margin-bottom: var(--space-xs, 0.5rem);
    color: var(--color-text-primary);
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium, 500);
  }

  /* Selected Scripts */
  .selected-scripts {
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-lg, 1.25rem);
    border: 1px solid var(--color-border);
  }

  .selected-title {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-md, 1rem) 0;
    color: var(--color-text-primary);
  }

  .scripts-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm, 0.75rem);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: var(--space-3xl, 3rem) var(--space-2xl, 2rem);
    color: var(--color-text-secondary);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg, 0.75rem);
  }

  .empty-icon {
    width: 4rem;
    height: 4rem;
    margin-bottom: var(--space-lg, 1.25rem);
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  .empty-text {
    font-size: 1.25rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-sm, 0.75rem) 0;
    color: var(--color-text-primary);
  }

  .empty-description {
    margin: 0 0 var(--space-lg, 1.25rem) 0;
    font-size: 1rem;
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

  /* Responsive */
  @media (max-width: 1024px) {
    .scripts-content {
      padding: var(--space-lg, 1.25rem);
    }

    .scripts-header {
      padding: var(--space-lg, 1.25rem) var(--space-lg, 1.25rem) var(--space-md, 1rem);
    }

    .scripts-title {
      font-size: 1.5rem;
    }

    .scripts-subtitle {
      font-size: 1rem;
    }

    .scripts-actions-section {
      padding: var(--space-lg, 1.25rem);
    }

    .actions-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-md, 1rem);
    }

    .scripts-filters {
      grid-template-columns: 1fr;
    }

    .scripts-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .scripts-content {
      padding: var(--space-md, 1rem);
    }

    .scripts-header {
      padding: var(--space-lg, 1.25rem) var(--space-md, 1rem) var(--space-sm, 0.75rem);
    }

    .scripts-actions-section,
    .scripts-stats-section {
      padding: var(--space-lg, 1.25rem);
    }

    .script-card {
      padding: var(--space-md, 1rem);
    }

    .script-card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-sm, 0.75rem);
    }

    .script-actions {
      margin-left: 0;
      align-self: flex-end;
    }

    .script-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-sm, 0.75rem);
    }

    .script-stats {
      text-align: left;
    }

    .script-card-footer {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-md, 1rem);
    }

    .footer-actions {
      align-self: flex-end;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .scripts-title {
      font-size: 1.25rem;
    }

    .scripts-subtitle {
      font-size: 0.9rem;
    }

    .scripts-actions-section,
    .scripts-stats-section {
      padding: var(--space-md, 1rem);
      border-radius: var(--radius-md, 0.5rem);
    }

    .script-card {
      padding: var(--space-md, 1rem);
    }

    .stat-card {
      flex-direction: column;
      text-align: center;
      gap: var(--space-sm, 0.75rem);
    }

    .footer-actions {
      flex-direction: column;
      width: 100%;
    }

      .footer-actions .base-button {
        justify-content: center;
      }
  }
</style>
