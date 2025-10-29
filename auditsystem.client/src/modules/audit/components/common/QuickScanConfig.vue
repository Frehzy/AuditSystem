<template>
  <BaseModal :model-value="true"
             title="Настройка быстрого сканирования"
             subtitle="Выберите цели и параметры для сканирования"
             icon="ScanIcon"
             size="xl"
             :wrapper-class="['quick-scan-config-modal', `step-${currentStep + 1}`]"
             @close="$emit('cancel')">

    <!-- Progress Steps -->
    <div class="scan-header">
      <div class="scan-progress">
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

    <div class="scan-config-content">
      <!-- Step 1: Basic Settings -->
      <div v-if="currentStep === 0" class="config-step">
        <div class="step-header">
          <h3 class="step-title">Основные параметры</h3>
          <p class="step-description">Задайте название и описание задачи сканирования</p>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label required">Название задачи</label>
            <BaseInput v-model="scanConfig.name"
                       placeholder="Быстрое сканирование"
                       :maxlength="100"
                       class="form-control"
                       @blur="validateStep(0)" />
            <div class="form-hint">{{ scanConfig.name.length }}/100 символов</div>
          </div>

          <div class="form-group">
            <label class="form-label">Описание</label>
            <BaseTextarea v-model="scanConfig.description"
                          placeholder="Опишите цель и особенности этого сканирования..."
                          :rows="3"
                          :maxlength="500"
                          class="form-control" />
            <div class="form-hint">{{ scanConfig.description.length }}/500 символов</div>
          </div>
        </div>

        <div class="scan-preview">
          <h4 class="preview-title">Предпросмотр задачи</h4>
          <div class="preview-card">
            <div class="preview-header">
              <ScanIcon class="preview-icon" />
              <div>
                <h5 class="preview-name">{{ scanConfig.name || 'Новая задача сканирования' }}</h5>
                <p class="preview-description">{{ scanConfig.description || 'Описание не указано' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Target Selection -->
      <div v-else-if="currentStep === 1" class="config-step">
        <div class="step-header">
          <h3 class="step-title">Цели сканирования</h3>
          <p class="step-description">Выберите войсковые части и конкретные хосты для проверки</p>
        </div>

        <div class="targets-section">
          <!-- Military Units Selection -->
          <div class="selection-group">
            <div class="selection-header">
              <div class="selection-title">
                <ServerIcon class="title-icon" />
                <span>Войсковые части</span>
              </div>
              <div class="selection-actions">
                <BaseCheckbox :model-value="allUnitsSelected"
                              :indeterminate="someUnitsSelected"
                              @update:model-value="handleSelectAllUnits"
                              class="select-all-checkbox" />
                <span class="selection-count">{{ selectedUnitsCount }} выбрано</span>
              </div>
            </div>

            <div class="targets-grid">
              <div v-for="unit in units"
                   :key="unit.id"
                   class="target-card"
                   :class="{ 'target-card--selected': isUnitSelected(unit.id) }"
                   @click="toggleUnitSelection(unit.id)">
                <BaseCheckbox :model-value="getUnitSelectionState(unit.id) === 'checked'"
                              :indeterminate="getUnitSelectionState(unit.id) === 'indeterminate'"
                              @click.stop
                              class="target-checkbox" />
                <div class="target-content">
                  <h4 class="target-name">{{ unit.name }}</h4>
                  <div class="target-meta">
                    <span class="target-location">{{ unit.location }}</span>
                    <span class="target-status" :class="`status--${unit.status}`">
                      {{ getUnitStatusText(unit.status) }}
                    </span>
                  </div>
                  <div class="target-stats">
                    <div class="stat">
                      <NetworkIcon class="stat-icon" />
                      <span>{{ unit.subnets.length }} подсетей</span>
                    </div>
                    <div class="stat">
                      <HostIcon class="stat-icon" />
                      <span>{{ unit.hosts.length }} хостов</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Specific Hosts Selection -->
          <div class="selection-group">
            <div class="selection-header">
              <div class="selection-title">
                <HostIcon class="title-icon" />
                <span>Конкретные хосты</span>
              </div>
              <div class="selection-actions">
                <BaseCheckbox :model-value="allHostsSelected"
                              :indeterminate="someHostsSelected"
                              @update:model-value="handleSelectAllHosts"
                              class="select-all-checkbox" />
                <span class="selection-count">{{ selectedHostsCount }} выбрано</span>
              </div>
            </div>

            <div class="hosts-table-container">
              <div class="table-filters">
                <BaseSelect v-model="hostsUnitFilter"
                            :options="hostsUnitOptions"
                            placeholder="Все части"
                            size="sm" />
                <BaseInput v-model="hostsSearchQuery"
                           placeholder="Поиск хостов..."
                           size="sm">
                  <template #prefix>
                    <SearchIcon class="input-icon" />
                  </template>
                </BaseInput>
              </div>

              <div class="hosts-table">
                <div class="table-header">
                  <div class="table-cell checkbox-cell">
                    <BaseCheckbox :model-value="allFilteredHostsSelected"
                                  :indeterminate="someFilteredHostsSelected"
                                  @update:model-value="handleSelectAllFilteredHosts" />
                  </div>
                  <div class="table-cell">Имя хоста</div>
                  <div class="table-cell">IP адрес</div>
                  <div class="table-cell">Часть</div>
                  <div class="table-cell">ОС</div>
                  <div class="table-cell">Статус</div>
                </div>

                <div v-for="host in filteredHosts"
                     :key="host.id"
                     class="table-row"
                     :class="{ 'table-row--selected': isHostSelected(host.id) }"
                     @click="toggleHostSelection(host.id)">
                  <div class="table-cell checkbox-cell">
                    <BaseCheckbox :model-value="isHostSelected(host.id)"
                                  @click.stop />
                  </div>
                  <div class="table-cell">
                    <div class="host-info">
                      <span class="host-name">{{ host.name }}</span>
                      <span v-if="host.description" class="host-description">
                        {{ host.description }}
                      </span>
                    </div>
                  </div>
                  <div class="table-cell">
                    <code class="host-ip">{{ host.ipAddress }}</code>
                  </div>
                  <div class="table-cell">
                    <span class="unit-name">{{ getUnitName(host.unitId) }}</span>
                  </div>
                  <div class="table-cell">
                    <BaseChip :color="getOsColor(host.osType)" size="xs">
                      {{ getOsText(host.osType) }}
                    </BaseChip>
                  </div>
                  <div class="table-cell">
                    <div class="status-indicator" :class="`status--${host.status}`">
                      {{ getHostStatusText(host.status) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selection Summary -->
        <div class="selection-summary">
          <div class="summary-cards">
            <div class="summary-card">
              <div class="summary-icon units">
                <ServerIcon />
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ selectedUnitsCount }}</div>
                <div class="summary-label">Войсковых частей</div>
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-icon hosts">
                <HostIcon />
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ selectedHostsCount }}</div>
                <div class="summary-label">Хостов</div>
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-icon total">
                <ScanIcon />
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ totalTargets }}</div>
                <div class="summary-label">Всего целей</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Scripts Selection -->
      <div v-else-if="currentStep === 2" class="config-step">
        <div class="step-header">
          <h3 class="step-title">Скрипты проверки</h3>
          <p class="step-description">Выберите скрипты для выполнения проверки безопасности</p>
        </div>

        <div class="scripts-section">
          <div class="scripts-filters">
            <div class="filter-group">
              <BaseSelect v-model="scriptCategoryFilter"
                          :options="scriptCategoryOptions"
                          placeholder="Все категории"
                          size="sm" />
            </div>
            <div class="filter-group">
              <BaseInput v-model="scriptSearchQuery"
                         placeholder="Поиск скриптов..."
                         size="sm">
                <template #prefix>
                  <SearchIcon class="input-icon" />
                </template>
              </BaseInput>
            </div>
            <div class="filter-group">
              <BaseButton @click="showScriptDetails = true"
                          variant="secondary"
                          size="sm">
                <InfoIcon class="button-icon" />
                Справка
              </BaseButton>
            </div>
          </div>

          <div class="scripts-grid">
            <div v-for="script in filteredScripts"
                 :key="script.id"
                 class="script-card"
                 :class="{
                   'script-card--selected': isScriptSelected(script.id),
                   'script-card--has-fix': hasFixScript(script.id)
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
                  <BaseButton @click.stop="viewScriptDetails(script)"
                              variant="text"
                              size="sm"
                              class="action-btn">
                    <InfoIcon class="button-icon" />
                  </BaseButton>
                </div>
              </div>

              <div class="script-card-content">
                <h4 class="script-name">{{ script.name }}</h4>
                <p class="script-description">{{ script.description }}</p>

                <div class="script-meta">
                  <BaseChip :color="getScriptCategoryColor(script.category)"
                            size="sm">
                    {{ getScriptCategoryText(script.category) }}
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

          <div v-if="filteredScripts.length === 0" class="empty-state">
            <CodeIcon class="empty-icon" />
            <p>Скрипты не найдены</p>
            <p class="empty-description">
              Попробуйте изменить параметры поиска или сбросить фильтры
            </p>
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

      <!-- Step 4: Additional Options -->
      <div v-else-if="currentStep === 3" class="config-step">
        <div class="step-header">
          <h3 class="step-title">Дополнительные настройки</h3>
          <p class="step-description">Настройте параметры выполнения и уведомления</p>
        </div>

        <div class="options-section">
          <div class="options-grid">
            <div class="option-group">
              <h4 class="option-group-title">Параметры выполнения</h4>
              <div class="option-list">
                <div class="option-item">
                  <BaseToggle v-model="scanConfig.autoFix"
                              class="option-toggle" />
                  <div class="option-content">
                    <label class="option-label">Автоматическое исправление</label>
                    <p class="option-description">
                      Автоматически применять скрипты исправления при обнаружении проблем
                    </p>
                  </div>
                </div>

                <div class="option-item">
                  <BaseToggle v-model="scanConfig.stopOnError"
                              class="option-toggle" />
                  <div class="option-content">
                    <label class="option-label">Останавливать при ошибке</label>
                    <p class="option-description">
                      Прекращать выполнение при первой критической ошибке
                    </p>
                  </div>
                </div>

                <div class="option-item">
                  <BaseToggle v-model="scanConfig.parallelExecution"
                              class="option-toggle" />
                  <div class="option-content">
                    <label class="option-label">Параллельное выполнение</label>
                    <p class="option-description">
                      Выполнять скрипты параллельно на разных хостах для ускорения
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="option-group">
              <h4 class="option-group-title">Уведомления и отчеты</h4>
              <div class="option-list">
                <div class="option-item">
                  <BaseToggle v-model="scanConfig.generateReport"
                              class="option-toggle" />
                  <div class="option-content">
                    <label class="option-label">Генерация отчета</label>
                    <p class="option-description">
                      Создать подробный отчет после завершения сканирования
                    </p>
                  </div>
                </div>

                <div class="option-item">
                  <BaseToggle v-model="scanConfig.notifyOnComplete"
                              class="option-toggle" />
                  <div class="option-content">
                    <label class="option-label">Уведомление о завершении</label>
                    <p class="option-description">
                      Отправить уведомление когда сканирование будет завершено
                    </p>
                  </div>
                </div>

                <div class="option-item">
                  <BaseToggle v-model="scanConfig.emailReport"
                              class="option-toggle" />
                  <div class="option-content">
                    <label class="option-label">Отправка отчета по email</label>
                    <p class="option-description">
                      Отправить сгенерированный отчет на указанный email адрес
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Final Summary -->
          <div class="final-summary">
            <h4 class="summary-title">Сводка сканирования</h4>
            <div class="summary-content">
              <div class="summary-item">
                <span class="summary-label">Название задачи:</span>
                <span class="summary-value">{{ scanConfig.name }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Войсковых частей:</span>
                <span class="summary-value">{{ selectedUnitsCount }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Хостов:</span>
                <span class="summary-value">{{ selectedHostsCount }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Скриптов проверки:</span>
                <span class="summary-value">{{ selectedScriptsCount }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Автоисправление:</span>
                <span class="summary-value">{{ scanConfig.autoFix ? 'Включено' : 'Выключено' }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Параллельное выполнение:</span>
                <span class="summary-value">{{ scanConfig.parallelExecution ? 'Включено' : 'Выключено' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <template #footer>
      <div class="scan-config-actions">
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
                    @click="handleStartScan"
                    variant="primary"
                    :loading="isStarting"
                    :disabled="!canStartScan"
                    class="nav-btn start-btn">
          <ScanIcon class="button-icon" />
          Запустить сканирование
        </BaseButton>
      </div>
    </template>
  </BaseModal>

  <!-- Script Details Modal -->
  <BaseModal v-if="showScriptDetails"
             :model-value="true"
             title="Детали скрипта"
             size="lg"
             @close="showScriptDetails = false">
    <ScriptDetails :script="selectedScript"
                   @close="showScriptDetails = false" />
  </BaseModal>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseModal from '@/framework/ui/components/overlay/BaseModal.vue';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
  import BaseTextarea from '@/framework/ui/components/forms/BaseTextarea.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue';
  import BaseCheckbox from '@/framework/ui/components/forms/BaseCheckbox.vue';
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
  import ScriptDetails from './ScriptDetails.vue';
  import {
    ScanIcon,
    SearchIcon,
    InfoIcon,
    CheckCircleIcon,
    ServerIcon,
    HostIcon,
    NetworkIcon,
    CodeIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckIcon,
    CheckScriptIcon,
    FixScriptIcon
  } from '@/assets/icons';
  import { useMilitaryUnits } from '../../composables/useMilitaryUnits';
  import { useScripts } from '../../composables/useScripts';
  import type { StartScanCommand, Host } from '../../api/audit.types';

  interface Props {
    units?: any[];
    scripts?: any[];
  }

  interface Emits {
    (e: 'start-scan', command: StartScanCommand): void;
    (e: 'cancel'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { showToast } = useToast();
  const militaryUnits = useMilitaryUnits();
  const scriptsManager = useScripts();

  // State
  const currentStep = ref(0);
  const isStarting = ref(false);
  const showScriptDetails = ref(false);
  const selectedScript = ref(null);

  // Filters
  const scriptCategoryFilter = ref('');
  const scriptSearchQuery = ref('');
  const hostsUnitFilter = ref('');
  const hostsSearchQuery = ref('');

  // Selections
  const selectedUnitIds = ref<string[]>([]);
  const selectedHostIds = ref<string[]>([]);
  const selectedScriptIds = ref<string[]>([]);

  // Configuration
  const scanConfig = ref({
    name: 'Быстрое сканирование ' + new Date().toLocaleDateString('ru-RU'),
    description: '',
    autoFix: true,
    stopOnError: false,
    parallelExecution: true,
    generateReport: true,
    notifyOnComplete: true,
    emailReport: false
  });

  // Steps configuration
  const steps = ref([
    { id: 'basic', label: 'Основные настройки' },
    { id: 'targets', label: 'Выбор целей' },
    { id: 'scripts', label: 'Скрипты проверки' },
    { id: 'options', label: 'Дополнительно' }
  ]);

  // Computed properties
  const allHosts = computed(() => {
    return props.units?.flatMap(unit => unit.hosts || []) || [];
  });

  const filteredHosts = computed(() => {
    let hosts = allHosts.value;

    if (hostsUnitFilter.value) {
      hosts = hosts.filter(host => host.unitId === hostsUnitFilter.value);
    }

    if (hostsSearchQuery.value) {
      const query = hostsSearchQuery.value.toLowerCase();
      hosts = hosts.filter(host =>
        host.name?.toLowerCase().includes(query) ||
        host.ipAddress?.toLowerCase().includes(query) ||
        host.description?.toLowerCase().includes(query)
      );
    }

    return hosts;
  });

  const filteredScripts = computed(() => {
    let scripts = props.scripts?.filter(script => script.type === 'check') || [];

    if (scriptCategoryFilter.value) {
      scripts = scripts.filter(script => script.category === scriptCategoryFilter.value);
    }

    if (scriptSearchQuery.value) {
      const query = scriptSearchQuery.value.toLowerCase();
      scripts = scripts.filter(script =>
        script.name?.toLowerCase().includes(query) ||
        script.description?.toLowerCase().includes(query)
      );
    }

    return scripts;
  });

  // Selection counts
  const selectedUnitsCount = computed(() => selectedUnitIds.value.length);
  const selectedHostsCount = computed(() => selectedHostIds.value.length);
  const selectedScriptsCount = computed(() => selectedScriptIds.value.length);

  // Select all states
  const allUnitsSelected = computed(() => {
    return (props.units?.length || 0) > 0 && selectedUnitIds.value.length === (props.units?.length || 0);
  });

  const someUnitsSelected = computed(() => {
    return selectedUnitIds.value.length > 0 && selectedUnitIds.value.length < (props.units?.length || 0);
  });

  const allHostsSelected = computed(() => {
    return allHosts.value.length > 0 && selectedHostIds.value.length === allHosts.value.length;
  });

  const someHostsSelected = computed(() => {
    return selectedHostIds.value.length > 0 && selectedHostIds.value.length < allHosts.value.length;
  });

  const allFilteredHostsSelected = computed(() => {
    return filteredHosts.value.length > 0 &&
      filteredHosts.value.every(host => selectedHostIds.value.includes(host.id));
  });

  const someFilteredHostsSelected = computed(() => {
    const hasSelected = filteredHosts.value.some(host => selectedHostIds.value.includes(host.id));
    return hasSelected && !allFilteredHostsSelected.value;
  });

  // Validation - ИСПРАВЛЕННАЯ ЛОГИКА
  const canProceedToNextStep = computed(() => {
    console.log('Validating step:', currentStep.value);

    switch (currentStep.value) {
      case 0: // Basic settings
        const nameValid = scanConfig.value.name.trim().length > 0;
        console.log('Step 0 validation - name valid:', nameValid);
        return nameValid;

      case 1: // Targets
        const hasTargets = selectedUnitsCount.value > 0 || selectedHostsCount.value > 0;
        console.log('Step 1 validation - has targets:', hasTargets,
          'units:', selectedUnitsCount.value,
          'hosts:', selectedHostsCount.value);
        return hasTargets;

      case 2: // Scripts
        const hasScripts = selectedScriptsCount.value > 0;
        console.log('Step 2 validation - has scripts:', hasScripts,
          'scripts count:', selectedScriptsCount.value);
        return hasScripts;

      default:
        return true;
    }
  });

  const canStartScan = computed(() => {
    const canStart = (selectedUnitsCount.value > 0 || selectedHostsCount.value > 0) &&
      selectedScriptsCount.value > 0;
    console.log('Can start scan:', canStart);
    return canStart;
  });

  const totalTargets = computed(() => {
    let total = 0;
    selectedUnitIds.value.forEach(unitId => {
      const unit = props.units?.find(u => u.id === unitId);
      if (unit) total += (unit.hosts || []).length;
    });
    total += selectedHostIds.value.length;
    return total;
  });

  // Options
  const hostsUnitOptions = computed(() => {
    const options = [{ value: '', label: 'Все части' }];
    props.units?.forEach(unit => {
      options.push({ value: unit.id, label: unit.name });
    });
    return options;
  });

  const scriptCategoryOptions = ref([
    { value: '', label: 'Все категории' },
    { value: 'security', label: 'Безопасность' },
    { value: 'compliance', label: 'Соответствие' },
    { value: 'performance', label: 'Производительность' },
    { value: 'custom', label: 'Пользовательские' }
  ]);

  // Methods
  const setStep = (stepIndex: number) => {
    if (stepIndex <= currentStep.value) {
      currentStep.value = stepIndex;
    }
  };

  const handleNextStep = () => {
    console.log('Next step clicked. Current step:', currentStep.value, 'Can proceed:', canProceedToNextStep.value);

    if (canProceedToNextStep.value && currentStep.value < steps.value.length - 1) {
      currentStep.value++;
      console.log('Moving to step:', currentStep.value);
    } else {
      console.log('Cannot proceed to next step');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  };

  const validateStep = (stepIndex: number) => {
    // Validation logic for each step
    console.log('Validating step:', stepIndex);
  };

  // Selection methods
  const isUnitSelected = (unitId: string): boolean => {
    return selectedUnitIds.value.includes(unitId);
  };

  const isHostSelected = (hostId: string): boolean => {
    return selectedHostIds.value.includes(hostId);
  };

  const isScriptSelected = (scriptId: string): boolean => {
    return selectedScriptIds.value.includes(scriptId);
  };

  const toggleUnitSelection = (unitId: string): void => {
    const index = selectedUnitIds.value.indexOf(unitId);
    const unit = props.units?.find(u => u.id === unitId);

    if (index > -1) {
      selectedUnitIds.value.splice(index, 1);

      if (unit?.hosts) {
        unit.hosts.forEach((host: Host) => {
          const hostIndex = selectedHostIds.value.indexOf(host.id);
          if (hostIndex > -1) {
            selectedHostIds.value.splice(hostIndex, 1);
          }
        });
      }
    } else {
      selectedUnitIds.value.push(unitId);

      if (unit?.hosts) {
        unit.hosts.forEach((host: Host) => {
          if (!selectedHostIds.value.includes(host.id)) {
            selectedHostIds.value.push(host.id);
          }
        });
      }
    }
    console.log('Units selected:', selectedUnitIds.value);
    console.log('Hosts selected:', selectedHostIds.value);
  };

  const getUnitSelectionState = (unitId: string): 'checked' | 'indeterminate' | 'unchecked' => {
    const unit = props.units?.find(u => u.id === unitId);
    if (!unit?.hosts) return 'unchecked';

    const unitHosts = unit.hosts || [];
    const selectedHostsCount = unitHosts.filter((host: Host) =>
      selectedHostIds.value.includes(host.id)
    ).length;

    if (selectedHostsCount === 0) return 'unchecked';
    if (selectedHostsCount === unitHosts.length) return 'checked';
    return 'indeterminate';
  };

  // Обновите метод toggleHostSelection чтобы он обновлял состояние частей
  const toggleHostSelection = (hostId: string): void => {
    const index = selectedHostIds.value.indexOf(hostId);
    const host: Host | undefined = allHosts.value.find((h: Host) => h.id === hostId);

    if (index > -1) {
      selectedHostIds.value.splice(index, 1);
    } else {
      selectedHostIds.value.push(hostId);
    }

    // После изменения выбора хоста обновляем состояние его части
    if (host?.unitId) {
      const unitSelectionState = getUnitSelectionState(host.unitId);

      if (unitSelectionState === 'checked') {
        // Если все хосты части выбраны - добавляем часть в selectedUnitIds
        if (!selectedUnitIds.value.includes(host.unitId)) {
          selectedUnitIds.value.push(host.unitId);
        }
      } else if (unitSelectionState === 'unchecked') {
        // Если ни одного хоста не выбрано - убираем часть
        const unitIndex = selectedUnitIds.value.indexOf(host.unitId);
        if (unitIndex > -1) {
          selectedUnitIds.value.splice(unitIndex, 1);
        }
      } else {
        // indeterminate состояние - часть остается в selectedUnitIds
        // но чекбокс будет отображаться как indeterminate
        if (!selectedUnitIds.value.includes(host.unitId)) {
          selectedUnitIds.value.push(host.unitId);
        }
      }
    }

    console.log('Hosts selected:', selectedHostIds.value);
    console.log('Units selected:', selectedUnitIds.value);
  };

  const toggleScriptSelection = (scriptId: string): void => {
    const index = selectedScriptIds.value.indexOf(scriptId);
    if (index > -1) {
      selectedScriptIds.value.splice(index, 1);
    } else {
      selectedScriptIds.value.push(scriptId);
    }
    console.log('Scripts selected:', selectedScriptIds.value);
  };

  const handleSelectAllUnits = (isChecked: boolean): void => {
    if (isChecked) {
      selectedUnitIds.value = props.units?.map(unit => unit.id) || [];
      selectedHostIds.value = allHosts.value.map(host => host.id);
    } else {
      selectedUnitIds.value = [];
      selectedHostIds.value = [];
    }
    console.log('All units selected:', isChecked, 'Units:', selectedUnitIds.value, 'Hosts:', selectedHostIds.value);
  };

  const handleSelectAllHosts = (isChecked: boolean): void => {
    if (isChecked) {
      selectedHostIds.value = allHosts.value.map(host => host.id);

      selectedUnitIds.value = props.units?.map(unit => unit.id) || [];
    } else {
      selectedHostIds.value = [];
      selectedUnitIds.value = [];
    }
    console.log('All hosts selected:', isChecked, 'Hosts:', selectedHostIds.value, 'Units:', selectedUnitIds.value);
  };

  const handleSelectAllFilteredHosts = (isChecked: boolean): void => {
    if (isChecked) {
      const filteredHostIds = filteredHosts.value.map((host: Host) => host.id);
      selectedHostIds.value = [...new Set([...selectedHostIds.value, ...filteredHostIds])];

      filteredHosts.value.forEach((host: Host) => {
        if (host.unitId && !selectedUnitIds.value.includes(host.unitId)) {
          selectedUnitIds.value.push(host.unitId);
        }
      });
    } else {
      const filteredHostIds = filteredHosts.value.map((host: Host) => host.id);
      selectedHostIds.value = selectedHostIds.value.filter(id => !filteredHostIds.includes(id));

      const remainingUnitIds = new Set();
      selectedHostIds.value.forEach(hostId => {
        const host: Host | undefined = allHosts.value.find((h: Host) => h.id === hostId);
        if (host?.unitId) {
          remainingUnitIds.add(host.unitId);
        }
      });

      selectedUnitIds.value = Array.from(remainingUnitIds) as string[];
    }
    console.log('Filtered hosts selected:', isChecked, 'Hosts:', selectedHostIds.value, 'Units:', selectedUnitIds.value);
  };

  const removeScript = (scriptId: string): void => {
    const index = selectedScriptIds.value.indexOf(scriptId);
    if (index > -1) {
      selectedScriptIds.value.splice(index, 1);
    }
  };

  // Helper methods
  const getUnitName = (unitId: string): string => {
    const unit = props.units?.find(u => u.id === unitId);
    return unit?.name || 'Неизвестно';
  };

  const getUnitStatusText = (status: string): string => {
    const statusMap: Record<string, string> = { active: 'Активна', deployed: 'На выезде', headquarters: 'Штаб' };
    return statusMap[status] || status;
  };

  const getHostStatusText = (status: string): string => {
    const statusMap: Record<string, string> = { online: 'В сети', offline: 'Не в сети', unknown: 'Неизвестно' };
    return statusMap[status] || status;
  };

  const getOsText = (osType: string): string => {
    const osMap: Record<string, string> = { linux: 'Linux', windows: 'Windows', unknown: 'Неизвестно' };
    return osMap[osType] || osType;
  };

  const getOsColor = (osType: string): string => {
    const colorMap: Record<string, string> = { linux: 'info', windows: 'primary', unknown: 'default' };
    return colorMap[osType] || 'default';
  };

  const getScriptIcon = (type: string) => {
    return type === 'check' ? CheckScriptIcon : FixScriptIcon;
  };

  const getScriptCategoryText = (category: string): string => {
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

  const viewScriptDetails = (script: any): void => {
    selectedScript.value = script;
    showScriptDetails.value = true;
  };

  const handleStartScan = async (): Promise<void> => {
    if (!canStartScan.value) {
      showToast({
        type: 'warning',
        title: 'Недостаточно данных',
        message: 'Выберите цели для сканирования и скрипты проверки'
      });
      return;
    }

    isStarting.value = true;

    const command: StartScanCommand = {
      name: scanConfig.value.name,
      description: scanConfig.value.description,
      unitIds: selectedUnitIds.value,
      hostIds: selectedHostIds.value,
      scriptIds: selectedScriptIds.value,
      autoFix: scanConfig.value.autoFix,
      stopOnError: scanConfig.value.stopOnError,
      parallelExecution: scanConfig.value.parallelExecution,
      generateReport: scanConfig.value.generateReport,
      notifyOnComplete: scanConfig.value.notifyOnComplete,
      emailReport: scanConfig.value.emailReport
    };

    try {
      emit('start-scan', command);
      showToast({
        type: 'success',
        title: 'Сканирование запущено',
        message: 'Задача сканирования успешно создана и запущена'
      });
    } catch (error) {
      console.error('Failed to start scan:', error);
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось запустить сканирование'
      });
    } finally {
      isStarting.value = false;
    }
  };

  onMounted(() => {
    militaryUnits.loadUnits();
    scriptsManager.loadScripts();
    console.log('QuickScanConfig mounted, units:', props.units, 'scripts:', props.scripts);
  });
</script>

<style scoped>
  .quick-scan-config-modal {
    /* Custom styles for the modal container */
  }

    .quick-scan-config-modal :deep(.base-modal__container) {
      display: flex;
      flex-direction: column;
      max-height: 85vh;
    }

    .quick-scan-config-modal :deep(.base-modal__content) {
      padding: 0;
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

  /* Fixed Header */
  .scan-header {
    flex-shrink: 0;
    background: var(--color-surface, #fff);
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  .scan-progress {
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
      background: var(--color-border, #e5e7eb);
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
    border: 2px solid var(--color-border, #e5e7eb);
    transition: all var(--transition-fast, 0.15s);
    margin-bottom: var(--space-sm, 0.75rem);
  }

  .progress-step--active .step-indicator {
    border-color: var(--color-primary, #3b82f6);
    background: var(--color-primary, #3b82f6);
    color: white;
    transform: scale(1.1);
  }

  .progress-step--completed .step-indicator {
    border-color: var(--color-success, #10b981);
    background: var(--color-success, #10b981);
    color: white;
  }

  .step-check :deep(svg) {
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
    color: var(--color-text-secondary, #6b7280);
    text-align: center;
    max-width: 100px;
  }

  .progress-step--active .step-label {
    color: var(--color-primary, #3b82f6);
    font-weight: var(--font-weight-semibold, 600);
  }

  .progress-step--completed .step-label {
    color: var(--color-success, #10b981);
  }

  /* Scrollable Content */
  .scan-config-content {
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

  /* Step Header внутри контента */
  .step-header {
    margin-bottom: var(--space-2xl, 2rem);
    text-align: center;
  }

  .step-title {
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary, #111827);
    margin: 0 0 var(--space-sm, 0.75rem) 0;
  }

  .step-description {
    font-size: 1rem;
    color: var(--color-text-secondary, #6b7280);
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
    color: var(--color-text-primary, #111827);
    font-size: 0.9rem;
  }

    .form-label.required::after {
      content: '*';
      color: var(--color-error, #ef4444);
      margin-left: var(--space-xs, 0.5rem);
    }

  .form-hint {
    font-size: 0.75rem;
    color: var(--color-text-muted, #9ca3af);
    text-align: right;
  }

  .scan-preview {
    background: var(--color-surface-hover, #f8fafc);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-lg, 1.25rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .preview-title {
    font-size: 1rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-md, 1rem) 0;
    color: var(--color-text-primary, #111827);
  }

  .preview-card {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-md, 0.5rem);
    padding: var(--space-lg, 1.25rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .preview-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md, 1rem);
  }

  .preview-icon {
    width: 2rem;
    height: 2rem;
    color: var(--color-primary, #3b82f6);
    flex-shrink: 0;
  }

  .preview-name {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-xs, 0.5rem) 0;
    color: var(--color-text-primary, #111827);
  }

  .preview-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
    margin: 0;
    line-height: 1.4;
  }

  /* Targets Section */
  .targets-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xl, 2rem);
    min-width: 0;
  }

  .selection-group {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-lg, 0.75rem);
    border: 1px solid var(--color-border, #e5e7eb);
    overflow: hidden;
  }

  .selection-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg, 1.25rem);
    background: var(--color-surface-hover, #f8fafc);
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  .selection-title {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 0.75rem);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
  }

  .title-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-primary, #3b82f6);
  }

  .selection-actions {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
  }

  .selection-count {
    font-size: 0.875rem;
    color: var(--color-text-muted, #9ca3af);
    font-weight: var(--font-weight-medium, 500);
  }

  /* Targets Grid */
  .targets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-md, 1rem);
    padding: var(--space-lg, 1.25rem);
  }

  .target-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md, 1rem);
    padding: var(--space-lg, 1.25rem);
    background: var(--color-surface, #fff);
    border: 2px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-md, 0.5rem);
    cursor: pointer;
    transition: all var(--transition-fast, 0.15s);
  }

    .target-card:hover {
      border-color: var(--color-primary, #3b82f6);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    }

  .target-card--selected {
    border-color: var(--color-primary, #3b82f6);
    background: var(--color-primary-50, #eff6ff);
  }

  .target-checkbox {
    margin-top: 0.125rem;
    flex-shrink: 0;
  }

  .target-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.75rem);
  }

  .target-name {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0;
    color: var(--color-text-primary, #111827);
  }

  .target-meta {
    display: flex;
    gap: var(--space-md, 1rem);
    font-size: 0.875rem;
  }

  .target-location {
    color: var(--color-text-secondary, #6b7280);
    font-weight: var(--font-weight-medium, 500);
  }

  .target-status {
    padding: var(--space-xs, 0.5rem) var(--space-sm, 0.75rem);
    border-radius: var(--radius-full, 9999px);
    font-size: 0.75rem;
    font-weight: var(--font-weight-semibold, 600);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
    text-align: center;
  }

  .status--active {
    background: var(--color-success-light, #d1fae5);
    color: var(--color-success, #10b981);
  }

  .status--deployed {
    background: var(--color-warning-light, #fef3c7);
    color: var(--color-warning, #f59e0b);
  }

  .status--headquarters {
    background: var(--color-primary-light, #dbeafe);
    color: var(--color-primary, #3b82f6);
  }

  .target-stats {
    display: flex;
    gap: var(--space-lg, 1.5rem);
  }

  .stat {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 0.5rem);
    font-size: 0.875rem;
    color: var(--color-text-muted, #9ca3af);
  }

  .stat-icon {
    width: 1rem;
    height: 1rem;
  }

  /* Hosts Table */
  .hosts-table-container {
    padding: var(--space-lg, 1.25rem);
    min-width: 0;
    overflow-x: auto;
  }

    .hosts-table-container::-webkit-scrollbar {
      height: 8px;
    }

    .hosts-table-container::-webkit-scrollbar-track {
      background: var(--color-surface-hover, #f8fafc);
      border-radius: var(--radius-sm, 0.375rem);
    }

    .hosts-table-container::-webkit-scrollbar-thumb {
      background: var(--color-border, #e5e7eb);
      border-radius: var(--radius-sm, 0.375rem);
    }

      .hosts-table-container::-webkit-scrollbar-thumb:hover {
        background: var(--color-text-muted, #9ca3af);
      }

  .table-filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md, 1rem);
    margin-bottom: var(--space-lg, 1.25rem);
    min-width: 0;
  }

  .hosts-table {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-md, 0.5rem);
    border: 1px solid var(--color-border, #e5e7eb);
    overflow: hidden;
    max-height: 400px;
    overflow-y: auto;
    min-width: 800px;
  }

  .table-header {
    display: grid;
    grid-template-columns: 60px minmax(200px, 2fr) minmax(120px, 1.5fr) minmax(120px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr);
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

  .table-row {
    display: grid;
    grid-template-columns: 60px minmax(200px, 2fr) minmax(120px, 1.5fr) minmax(120px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr);
    gap: var(--space-md, 1rem);
    padding: var(--space-md, 1rem) var(--space-lg, 1.25rem);
    border-bottom: 1px solid var(--color-border-light, #f3f4f6);
    transition: background-color var(--transition-fast, 0.15s);
    cursor: pointer;
  }

    .table-row:hover {
      background: var(--color-surface-hover, #f8fafc);
    }

  .table-row--selected {
    background: var(--color-primary-50, #eff6ff);
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .table-cell {
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

  .host-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 0.5rem);
    min-width: 0;
  }

  .host-name {
    font-weight: var(--font-weight-semibold, 600);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .host-description {
    font-size: 0.8rem;
    color: var(--color-text-muted, #9ca3af);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .host-ip {
    background: var(--color-surface-hover, #f8fafc);
    padding: var(--space-xs, 0.5rem) var(--space-sm, 0.75rem);
    border-radius: var(--radius-sm, 0.375rem);
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    color: var(--color-text-primary, #111827);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .unit-name {
    font-weight: var(--font-weight-medium, 500);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-indicator {
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

  .status--online {
    background: var(--color-success-light, #d1fae5);
    color: var(--color-success, #10b981);
  }

  .status--offline {
    background: var(--color-error-light, #fee2e2);
    color: var(--color-error, #ef4444);
  }

  .status--unknown {
    background: var(--color-warning-light, #fef3c7);
    color: var(--color-warning, #f59e0b);
  }

  /* Selection Summary */
  .selection-summary {
    background: var(--color-surface-hover, #f8fafc);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-xl, 1.5rem);
    border: 1px solid var(--color-border, #e5e7eb);
    min-width: 0;
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-lg, 1.25rem);
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-lg, 1.25rem);
    min-width: 0;
  }

  .summary-icon {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-md, 0.5rem);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

    .summary-icon.units {
      background: var(--color-primary, #3b82f6);
    }

    .summary-icon.hosts {
      background: var(--color-success, #10b981);
    }

    .summary-icon.total {
      background: var(--color-info, #06b6d4);
    }

  .summary-content {
    flex: 1;
  }

  .summary-value {
    font-size: 1.75rem;
    font-weight: var(--font-weight-bold, 700);
    margin-bottom: var(--space-xs, 0.5rem);
    color: var(--color-text-primary, #111827);
  }

  .summary-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
    font-weight: var(--font-weight-medium, 500);
  }

  /* Scripts Section */
  .scripts-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl, 1.5rem);
  }

  .scripts-filters {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: var(--space-md, 1rem);
    align-items: end;
  }

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

  .script-card-header {
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

  .script-card-content {
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

  /* Selected Scripts */
  .selected-scripts {
    background: var(--color-surface-hover, #f8fafc);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-lg, 1.25rem);
    border: 1px solid var(--color-border, #e5e7eb);
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

  /* Options Section */
  .options-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xl, 2rem);
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2xl, 2rem);
  }

  .option-group {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-xl, 1.5rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .option-group-title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-lg, 1.25rem) 0;
    color: var(--color-text-primary, #111827);
    padding-bottom: var(--space-md, 1rem);
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  .option-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg, 1.25rem);
  }

  .option-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md, 1rem);
    padding: var(--space-md, 1rem);
    background: var(--color-surface-hover, #f8fafc);
    border-radius: var(--radius-md, 0.5rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .option-toggle {
    margin-top: 0.125rem;
    flex-shrink: 0;
  }

  .option-content {
    flex: 1;
  }

  .option-label {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
    display: block;
    margin-bottom: var(--space-xs, 0.5rem);
  }

  .option-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
    line-height: 1.4;
    margin: 0;
  }

  /* Final Summary */
  .final-summary {
    background: var(--color-surface, #fff);
    border-radius: var(--radius-lg, 0.75rem);
    padding: var(--space-xl, 1.5rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .summary-title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    margin: 0 0 var(--space-lg, 1.25rem) 0;
    color: var(--color-text-primary, #111827);
  }

  .summary-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-md, 1rem);
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md, 1rem);
    background: var(--color-surface-hover, #f8fafc);
    border-radius: var(--radius-md, 0.5rem);
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .summary-label {
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-primary, #111827);
  }

  .summary-value {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: var(--space-3xl, 3rem) var(--space-2xl, 2rem);
    color: var(--color-text-secondary, #6b7280);
  }

  .empty-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: var(--space-md, 1rem);
    opacity: 0.5;
  }

  .empty-description {
    margin: var(--space-sm, 0.75rem) 0 0 0;
    font-size: 0.9rem;
  }

  /* Navigation */
  .scan-config-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    flex-shrink: 0;
  }

  .nav-btn {
    min-width: 120px;
  }

  .start-btn {
    min-width: 180px;
  }

  .step-indicators {
    display: flex;
    align-items: center;
    gap: var(--space-md, 1rem);
  }

  .step-info {
    font-size: 0.875rem;
    color: var(--color-text-muted, #9ca3af);
    font-weight: var(--font-weight-medium, 500);
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  .input-icon {
    width: 1.125rem;
    height: 1.125rem;
    color: var(--color-text-muted, #9ca3af);
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .hosts-table {
      min-width: 700px;
    }

    .table-header,
    .table-row {
      grid-template-columns: 50px minmax(150px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(80px, 0.8fr) minmax(80px, 0.8fr);
      gap: var(--space-sm, 0.75rem);
      padding: var(--space-sm, 0.75rem) var(--space-md, 1rem);
    }
  }

  @media (max-width: 1024px) {
    .hosts-table {
      min-width: 600px;
    }

    .table-header,
    .table-row {
      grid-template-columns: 50px minmax(150px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(80px, 0.8fr) minmax(80px, 0.8fr);
      gap: var(--space-sm, 0.75rem);
      padding: var(--space-sm, 0.75rem) var(--space-md, 1rem);
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .targets-grid {
      grid-template-columns: 1fr;
    }

    .scripts-filters {
      grid-template-columns: 1fr;
    }

    .options-grid {
      grid-template-columns: 1fr;
    }

    .summary-cards {
      grid-template-columns: 1fr;
    }

    .summary-content {
      grid-template-columns: 1fr;
    }

    .scan-progress {
      padding: var(--space-lg, 1.25rem) var(--space-lg, 1.25rem) var(--space-md, 1rem);
    }

    .scan-config-content {
      padding: var(--space-lg, 1.25rem);
    }
  }

  @media (max-width: 768px) {
    .scan-progress {
      padding: var(--space-lg, 1.25rem) var(--space-lg, 1.25rem) var(--space-md, 1rem);
    }

    .progress-steps::before {
      left: 1.5rem;
      right: 1.5rem;
    }

    .step-label {
      font-size: 0.75rem;
      max-width: 80px;
    }

    .scan-config-actions {
      flex-direction: column;
      gap: var(--space-md, 1rem);
    }

    .scan-config-content {
      padding: var(--space-lg, 1.25rem);
    }

    .table-header,
    .table-row {
      grid-template-columns: 40px minmax(120px, 1fr) minmax(80px, 0.8fr) minmax(80px, 0.8fr);
      font-size: 0.8rem;
    }

    .table-cell:nth-child(4),
    .table-cell:nth-child(5),
    .table-cell:nth-child(6) {
      display: none;
    }

    .scripts-grid {
      grid-template-columns: 1fr;
    }

    .nav-btn {
      width: 100%;
    }

    .step-indicators {
      order: -1;
    }

    .targets-section {
      gap: var(--space-xl, 1.5rem);
    }

    .hosts-table-container {
      padding: var(--space-md, 1rem);
    }

    .table-filters {
      grid-template-columns: 1fr;
      gap: var(--space-sm, 0.75rem);
    }

    .hosts-table {
      min-width: 600px;
      max-height: 350px;
    }
  }

  @media (max-width: 480px) {
    .progress-steps {
      flex-direction: column;
      gap: var(--space-lg, 1.25rem);
    }

      .progress-steps::before {
        display: none;
      }

    .progress-step {
      flex-direction: row;
      text-align: left;
      gap: var(--space-md, 1rem);
    }

    .step-indicator {
      margin-bottom: 0;
    }

    .step-label {
      max-width: none;
      text-align: left;
    }
  }
</style>
