<template>
  <div class="scripts-view">
    <div class="scripts-view__header">
      <h1 class="scripts-view__title">Управление скриптами</h1>
      <p class="scripts-view__subtitle">Создание и настройка скриптов для проверки и исправления</p>
    </div>

    <div class="scripts-view__content">
      <!-- Действия -->
      <div class="scripts-actions">
        <div class="actions-header">
          <h2 class="section-title">Скрипты проверки и исправления</h2>
          <BaseButton @click="showCreateScriptDialog = true"
                      variant="primary">
            <PlusIcon class="button-icon" />
            Добавить скрипт
          </BaseButton>
        </div>

        <div class="scripts-filters">
          <div class="filter-group">
            <BaseSelect v-model="selectedType"
                        :options="typeOptions"
                        placeholder="Тип скрипта" />
          </div>
          <div class="filter-group">
            <BaseSelect v-model="selectedCategory"
                        :options="categoryOptions"
                        placeholder="Категория" />
          </div>
          <div class="filter-group">
            <BaseInput v-model="searchQuery"
                       placeholder="Поиск скриптов..."
                       class="search-input">
              <template #prefix>
                <SearchIcon class="input-icon" />
              </template>
            </BaseInput>
          </div>
        </div>
      </div>

      <!-- Сетка скриптов -->
      <div class="scripts-grid">
        <div v-for="script in filteredScripts"
             :key="script.id"
             class="script-card"
             :class="`script-card--${script.type}`">
          <div class="script-card__header">
            <div class="script-card__type-icon">
              <component :is="getScriptIcon(script.type)" />
            </div>
            <div class="script-card__title-section">
              <h3 class="script-card__title">{{ script.name }}</h3>
              <div class="script-card__meta">
                <span class="script-category">{{ getCategoryText(script.category) }}</span>
                <span class="script-type">{{ getTypeText(script.type) }}</span>
              </div>
            </div>
            <div class="script-card__status">
              <BaseChip :color="getStatusColor(script)"
                        size="sm">
                {{ getStatusText(script) }}
              </BaseChip>
            </div>
          </div>

          <div class="script-card__content">
            <p class="script-card__description">{{ script.description }}</p>

            <div v-if="script.parameters.length > 0" class="script-parameters">
              <h4 class="parameters-title">Параметры:</h4>
              <div class="parameters-list">
                <div v-for="param in script.parameters"
                     :key="param.name"
                     class="parameter-item">
                  <span class="parameter-name">{{ param.name }}</span>
                  <span class="parameter-type">{{ param.type }}</span>
                  <span v-if="param.required" class="parameter-required">*</span>
                </div>
              </div>
            </div>

            <div class="script-card__footer">
              <div class="script-info">
                <span class="script-date">
                  Обновлен: {{ formatScriptDate(script.updatedAt) }}
                </span>
              </div>
              <div class="script-card__actions">
                <BaseButton @click="editScript(script)"
                            variant="text"
                            size="sm">
                  <EditIcon class="button-icon" />
                  Редактировать
                </BaseButton>
                <BaseButton @click="testScript(script)"
                            variant="text"
                            size="sm">
                  <PlayIcon class="button-icon" />
                  Тестировать
                </BaseButton>
                <BaseButton @click="deleteScript(script)"
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
      </div>

      <!-- Состояние пустого списка -->
      <div v-if="filteredScripts.length === 0" class="empty-state">
        <CodeIcon class="empty-state__icon" />
        <p class="empty-state__text">Скрипты не найдены</p>
        <p class="empty-state__description">
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

      <!-- Статистика скриптов -->
      <div class="scripts-stats">
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-card__icon check-scripts">
              <CheckCircleIcon />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">{{ checkScriptsCount }}</div>
              <div class="stat-card__label">Скрипты проверки</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card__icon fix-scripts">
              <WrenchIcon />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">{{ fixScriptsCount }}</div>
              <div class="stat-card__label">Скрипты исправления</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card__icon security-scripts">
              <ShieldIcon />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">{{ securityScriptsCount }}</div>
              <div class="stat-card__label">Безопасность</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card__icon compliance-scripts">
              <FileCheckIcon />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">{{ complianceScriptsCount }}</div>
              <div class="stat-card__label">Соответствие</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог создания/редактирования скрипта -->
    <BaseModal v-if="showCreateScriptDialog"
               :modelValue="showCreateScriptDialog"
               :title="editingScript ? 'Редактирование скрипта' : 'Создание скрипта'"
               size="xxl"
               :maxHeight="'90vh'"
               @update:modelValue="showCreateScriptDialog = $event"
               @close="closeScriptDialog">
      <ScriptForm :script="editingScript"
                  @save="handleSaveScript"
                  @cancel="closeScriptDialog" />
    </BaseModal>

    <!-- Диалог тестирования скрипта -->
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

  const showCreateScriptDialog = ref(false);
  const showTestScriptDialog = ref(false);
  const editingScript = ref<Script | null>(null);
  const testingScript = ref<Script | null>(null);
  const selectedType = ref('');
  const selectedCategory = ref('');
  const searchQuery = ref('');

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

  const getScriptIcon = (type: string) => {
    return type === 'check' ? CheckIcon : FixIcon;
  };

  const getTypeText = (type: string): string => {
    return type === 'check' ? 'Проверка' : 'Исправление';
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

  const getStatusText = (script: Script): string => {
    if (script.type === 'check') {
      const hasFix = scriptsManager.getFixScriptForCheck(script.id);
      return hasFix ? 'С исправлением' : 'Только проверка';
    } else {
      return 'Исправление';
    }
  };

  const getStatusColor = (script: Script): string => {
    if (script.type === 'check') {
      const hasFix = scriptsManager.getFixScriptForCheck(script.id);
      return hasFix ? 'success' : 'warning';
    } else {
      return 'info';
    }
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
      // Implement script testing logic here
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
    gap: 2rem;
  }

  .scripts-view__header {
    text-align: center;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .scripts-view__title {
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 0.75rem 0;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.025em;
  }

  .scripts-view__subtitle {
    font-size: 1.25rem;
    color: var(--color-text-secondary);
    margin: 0;
    font-weight: 400;
  }

  /* Scripts Actions */
  .scripts-actions {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .actions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
  }

  .scripts-filters {
    display: grid;
    grid-template-columns: 1fr 1fr 2fr;
    gap: 1rem;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
  }

  /* Scripts Grid */
  .scripts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .script-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
    padding: 1.5rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  }

    .script-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    }

  .script-card--check {
    border-left: 4px solid var(--color-primary);
  }

  .script-card--fix {
    border-left: 4px solid var(--color-success);
  }

  .script-card__header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .script-card__type-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .script-card--check .script-card__type-icon {
    background: var(--color-primary-light);
    color: var(--color-primary);
  }

  .script-card--fix .script-card__type-icon {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  .script-card__title-section {
    flex: 1;
  }

  .script-card__title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: var(--color-text-primary);
  }

  .script-card__meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
  }

  .script-category {
    background: var(--color-surface-hover);
    padding: 0.25rem 0.75rem;
    border-radius: 2rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .script-type {
    color: var(--color-text-muted);
  }

  .script-card__status {
    flex-shrink: 0;
  }

  .script-card__content {
    margin-bottom: 1rem;
  }

  .script-card__description {
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .script-parameters {
    margin-bottom: 1rem;
  }

  .parameters-title {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: var(--color-text-primary);
  }

  .parameters-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .parameter-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    background: var(--color-surface-hover);
    border-radius: 2rem;
    font-size: 0.75rem;
  }

  .parameter-name {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .parameter-type {
    color: var(--color-text-muted);
    font-style: italic;
  }

  .parameter-required {
    color: var(--color-error);
    font-weight: 700;
  }

  .script-card__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
  }

  .script-info {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .script-card__actions {
    display: flex;
    gap: 0.5rem;
  }

  /* Stats Section */
  .scripts-stats {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
    padding: 2rem;
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--color-surface-hover);
    border-radius: 1rem;
    border: 1px solid var(--color-border);
  }

  .stat-card__icon {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .check-scripts {
    background: var(--color-primary);
  }

  .fix-scripts {
    background: var(--color-success);
  }

  .security-scripts {
    background: var(--color-warning);
  }

  .compliance-scripts {
    background: var(--color-info);
  }

  .stat-card__content {
    flex: 1;
  }

  .stat-card__value {
    font-size: 1.75rem;
    font-weight: 800;
    margin-bottom: 0.25rem;
    color: var(--color-text-primary);
  }

  .stat-card__label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--color-text-secondary);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
  }

  .empty-state__icon {
    width: 4rem;
    height: 4rem;
    margin-bottom: 1.5rem;
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  .empty-state__text {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: var(--color-text-primary);
  }

  .empty-state__description {
    margin: 0 0 1.5rem 0;
    font-size: 1rem;
  }

  /* Icons */
  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: 0.5rem;
  }

  .input-icon {
    width: 1.125rem;
    height: 1.125rem;
    color: var(--color-text-muted);
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .scripts-view__title {
      font-size: 2rem;
    }

    .scripts-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 1024px) {
    .scripts-view__title {
      font-size: 1.75rem;
    }

    .scripts-view__subtitle {
      font-size: 1.125rem;
    }

    .scripts-actions,
    .scripts-stats {
      padding: 1.5rem;
    }

    .actions-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .scripts-filters {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .script-card__footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .script-card__actions {
      align-self: flex-end;
    }
  }

  @media (max-width: 900px) {
    .scripts-view {
      gap: 1.5rem;
    }

    .stats-cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 800px) {
    .scripts-view__title {
      font-size: 1.5rem;
    }

    .scripts-view__subtitle {
      font-size: 1rem;
    }

    .scripts-actions,
    .scripts-stats {
      padding: 1.25rem;
      border-radius: 1rem;
    }

    .section-title {
      font-size: 1.25rem;
    }

    .script-card {
      padding: 1.25rem;
    }

    .script-card__header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .script-card__status {
      align-self: flex-start;
    }
  }

  @media (max-width: 640px) {
    .stats-cards {
      grid-template-columns: 1fr;
    }

    .script-card__actions {
      flex-direction: column;
      width: 100%;
    }

      .script-card__actions .base-button {
        justify-content: center;
      }
  }
</style>
