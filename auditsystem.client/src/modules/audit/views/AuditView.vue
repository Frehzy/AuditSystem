<template>
  <div class="audit-view" :class="`theme-${theme}`">
    <AuditLayout>
      <template #header>
        <AuditHeader :title="currentViewTitle"
                     :scan-progress="currentScan?.progress"
                     :is-scanning="!!currentScan"
                     @start-scan="handleStartScan"
                     @cancel-scan="handleCancelScan" />
      </template>

      <template #sidebar>
        <AuditSidebar :active-view="activeView"
                      :collapsed="isSidebarCollapsed"
                      @nav-change="handleNavChange"
                      @toggle-theme="handleToggleTheme"
                      @toggle-sidebar="handleToggleSidebar" />
      </template>

      <template #default>
        <div class="audit-content">
          <!-- Loading State -->
          <div v-if="isLoading" class="loading-container">
            <div class="loading-content">
              <BaseSpinner size="large" class="loading-spinner" />
              <div class="loading-text">
                <h3 class="loading-title">Загрузка данных</h3>
                <p class="loading-description">Пожалуйста, подождите...</p>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-container">
            <BaseAlert type="error"
                       :message="error"
                       dismissible
                       @dismiss="clearError"
                       class="error-alert" />
          </div>

          <!-- Main Content -->
          <div v-else class="content-wrapper">
            <router-view :units="units"
                         :scripts="scripts"
                         :tasks="tasks"
                         :current-scan="currentScan"
                         :reports="reports"
                         :settings="settings"
                         :is-loading="isLoading"
                         @start-scan="handleStartScan"
                         @cancel-scan="handleCancelScan"
                         @generate-report="handleGenerateReport"
                         @download-report="handleDownloadReport"
                         @update-settings="handleUpdateSettings" />
          </div>
        </div>
      </template>
    </AuditLayout>

    <!-- Scan Progress Dialog -->
    <BaseModal v-if="showScanProgress"
               :model-value="true"
               title="Прогресс сканирования"
               size="lg"
               @close="showScanProgress = false">
      <ScanProgressDialog :scan-task="currentScan"
                          @cancel="handleCancelScan"
                          @close="showScanProgress = false" />
    </BaseModal>

    <!-- Quick Scan Config Modal -->
    <QuickScanConfig v-if="showQuickScanConfig"
                     :units="units"
                     :scripts="scripts"
                     @start-scan="handleQuickScanStart"
                     @cancel="showQuickScanConfig = false" />

    <!-- Host Selection Dialog -->
    <BaseModal v-if="showHostSelection"
               :model-value="true"
               title="Выбор целей"
               size="xl"
               @close="showHostSelection = false">
      <HostSelectionDialog :units="units"
                           @confirm="handleHostSelection"
                           @close="showHostSelection = false" />
    </BaseModal>

    <!-- Script Selection Dialog -->
    <BaseModal v-if="showScriptSelection"
               :model-value="true"
               title="Выбор скриптов"
               size="xl"
               @close="showScriptSelection = false">
      <ScriptSelectionDialog :scripts="scripts"
                             @confirm="handleScriptSelection"
                             @close="showScriptSelection = false" />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToast } from '@/framework/ui/composables/useToast';
  import { useAppStore } from '@/framework/stores/app.store';
  import { BaseSpinner, BaseAlert, BaseModal } from '@/framework/ui';
  import AuditLayout from '../components/layout/AuditLayout.vue';
  import AuditHeader from '../components/layout/AuditHeader.vue';
  import AuditSidebar from '../components/layout/AuditSidebar.vue';
  import ScanProgressDialog from '../components/common/ScanProgressDialog.vue';
  import HostSelectionDialog from '../components/common/HostSelectionDialog.vue';
  import ScriptSelectionDialog from '../components/common/ScriptSelectionDialog.vue';
  import QuickScanConfig from '../components/common/QuickScanConfig.vue';
  import { useAudit } from '../composables/useAudit';
  import type { StartScanCommand } from '../api/audit.types';

  // Composables
  const route = useRoute();
  const router = useRouter();
  const { showToast } = useToast();
  const appStore = useAppStore();
  const {
    units,
    scripts,
    tasks,
    currentScan,
    reports,
    settings,
    isLoading,
    error,
    initialize,
    startScan,
    cancelScan,
    generateReport,
    downloadReport,
    updateSettings,
    clearError
  } = useAudit();

  // State
  const showScanProgress = ref(false);
  const showQuickScanConfig = ref(false);
  const showHostSelection = ref(false);
  const showScriptSelection = ref(false);
  const pendingScanCommand = ref<StartScanCommand | null>(null);
  const isSidebarCollapsed = ref(false);

  // Computed
  const theme = computed(() => appStore.theme);

  const activeView = computed(() => {
    const routeName = route.name as string;
    switch (routeName) {
      case 'Monitoring': return 'monitoring';
      case 'Reports': return 'reports';
      case 'Settings': return 'settings';
      case 'Scripts': return 'scripts';
      case 'MilitaryUnits': return 'units';
      default: return 'monitoring';
    }
  });

  const currentViewTitle = computed(() => {
    const titles = {
      monitoring: 'Мониторинг',
      reports: 'Отчёты',
      settings: 'Настройки',
      scripts: 'Скрипты',
      units: 'Войсковые части'
    };
    return titles[activeView.value];
  });

  // Methods
  const handleNavChange = (item: any) => {
    console.log('Navigation changed:', item);
  };

  const handleToggleTheme = () => {
    appStore.toggleTheme();
  };

  const handleToggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
  };

  const handleStartScan = (command?: StartScanCommand) => {
    if (command) {
      executeStartScan(command);
    } else {
      // Вместо старого диалога используем улучшенный QuickScanConfig
      showQuickScanConfig.value = true;
    }
  };

  const handleQuickScanStart = (command: StartScanCommand) => {
    showQuickScanConfig.value = false;
    executeStartScan(command);
  };

  const handleCancelScan = async () => {
    if (!currentScan.value) return;

    try {
      await cancelScan(currentScan.value.id);
      showScanProgress.value = false;
      showToast({
        type: 'success',
        title: 'Сканирование отменено',
        message: 'Процесс сканирования был успешно остановлен.'
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось отменить сканирование.'
      });
    }
  };

  const handleHostSelection = (selectedHosts: any) => {
    showHostSelection.value = false;
    showScriptSelection.value = true;
    pendingScanCommand.value = {
      name: `Сканирование ${new Date().toLocaleString('ru-RU')}`,
      unitIds: selectedHosts.unitIds,
      hostIds: selectedHosts.hostIds,
      scriptIds: [],
      autoFix: false,
      description: '',
      stopOnError: false,
      parallelExecution: true,
      generateReport: true,
      notifyOnComplete: true,
      emailReport: false
    };
  };

  const handleScriptSelection = (selectedScripts: any) => {
    showScriptSelection.value = false;

    if (pendingScanCommand.value) {
      pendingScanCommand.value.scriptIds = selectedScripts.scriptIds;
      pendingScanCommand.value.autoFix = selectedScripts.autoFix;

      executeStartScan(pendingScanCommand.value);
      pendingScanCommand.value = null;
    }
  };

  const executeStartScan = async (command: StartScanCommand) => {
    try {
      await startScan(command);
      showScanProgress.value = true;

      showToast({
        type: 'success',
        title: 'Сканирование запущено',
        message: 'Процесс сканирования успешно начат.'
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось запустить сканирование.'
      });
    }
  };

  const handleGenerateReport = async (taskId: string, format: string) => {
    try {
      await generateReport(taskId, format);
      showToast({
        type: 'success',
        title: 'Отчёт сгенерирован',
        message: 'Отчёт успешно создан и доступен для скачивания.'
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось сгенерировать отчёт.'
      });
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      await downloadReport(reportId);
      showToast({
        type: 'success',
        title: 'Отчёт скачан',
        message: 'Отчёт успешно загружен на ваше устройство.'
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось скачать отчёт.'
      });
    }
  };

  const handleUpdateSettings = async (newSettings: any) => {
    try {
      await updateSettings(newSettings);
      showToast({
        type: 'success',
        title: 'Настройки обновлены',
        message: 'Настройки системы успешно сохранены.'
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось обновить настройки.'
      });
    }
  };

  // Lifecycle
  onMounted(async () => {
    await initialize();
  });
</script>

<style scoped>
  .audit-view {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--color-background);
    color: var(--color-text-primary);
    transition: background-color var(--transition-normal), color var(--transition-normal);
  }

  .audit-content {
    flex: 1;
    padding: var(--spacing-xl);
    overflow-y: auto;
    background: var(--color-background);
    position: relative;
  }

  /* Loading State */
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: var(--spacing-2xl);
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
    text-align: center;
  }

  .loading-spinner {
    color: var(--color-primary);
  }

  .loading-text {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .loading-title {
    font-size: 1.5rem;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
    margin: 0;
  }

  .loading-description {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  /* Error State */
  .error-container {
    margin-bottom: var(--spacing-lg);
  }

  .error-alert {
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-error-light);
    background: var(--color-error-light);
  }

  /* Content Wrapper */
  .content-wrapper {
    animation: fade-in 0.3s ease-out;
    height: 100%;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .audit-content {
      padding: var(--spacing-lg);
    }

    .loading-container {
      min-height: 300px;
      padding: var(--spacing-xl);
    }

    .loading-title {
      font-size: 1.25rem;
    }

    .loading-description {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 768px) {
    .audit-content {
      padding: var(--spacing-md);
    }

    .loading-container {
      min-height: 250px;
      padding: var(--spacing-lg);
    }

    .loading-content {
      gap: var(--spacing-md);
    }

    .loading-title {
      font-size: 1.125rem;
    }

    .loading-description {
      font-size: 0.875rem;
    }
  }

  @media (max-width: 480px) {
    .audit-content {
      padding: var(--spacing-sm);
    }

    .loading-container {
      min-height: 200px;
      padding: var(--spacing-md);
    }

    .loading-title {
      font-size: 1rem;
    }

    .loading-description {
      font-size: 0.8rem;
    }
  }

  /* Scrollbar Styling */
  .audit-content::-webkit-scrollbar {
    width: 6px;
  }

  .audit-content::-webkit-scrollbar-track {
    background: var(--color-surface-hover);
    border-radius: var(--radius-sm);
  }

  .audit-content::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: var(--radius-sm);
  }

    .audit-content::-webkit-scrollbar-thumb:hover {
      background: var(--color-text-muted);
    }

  /* Theme Transition */
  .audit-view.theme-transition * {
    transition: color var(--transition-normal), background-color var(--transition-normal), border-color var(--transition-normal);
  }

  /* Focus Management */
  .audit-content :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  /* Print Styles */
  @media print {
    .audit-view {
      background: white;
      color: black;
    }

    .audit-content {
      padding: 0;
      overflow: visible;
    }
  }
</style>
