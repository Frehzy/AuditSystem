<template>
  <div class="audit-view">
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
                      @nav-change="handleNavChange"
                      @toggle-theme="handleToggleTheme"
                      @toggle-sidebar="handleToggleSidebar" />
      </template>

      <template #default>
        <div class="audit-content">
          <div v-if="isLoading" class="loading-container">
            <BaseSpinner size="large" />
            <p>Загрузка данных...</p>
          </div>

          <div v-else-if="error" class="error-container">
            <BaseAlert type="error" :message="error" dismissible @dismiss="clearError" />
          </div>

          <router-view v-else
                       :units="units"
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
      </template>
    </AuditLayout>

    <!-- Scan Progress Dialog -->
    <ScanProgressDialog v-if="showScanProgress"
                        :scan-task="currentScan"
                        @cancel="handleCancelScan"
                        @close="showScanProgress = false" />

    <!-- Host Selection Dialog -->
    <HostSelectionDialog v-if="showHostSelection"
                         :units="units"
                         @confirm="handleHostSelection"
                         @close="showHostSelection = false" />

    <!-- Script Selection Dialog -->
    <ScriptSelectionDialog v-if="showScriptSelection"
                           :scripts="scripts"
                           @confirm="handleScriptSelection"
                           @close="showScriptSelection = false" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToast } from '@/framework/ui/composables/useToast';
  import { useAppStore } from '@/framework/stores/app.store';
  import { BaseSpinner, BaseAlert } from '@/framework/ui';
  import AuditLayout from '../components/layout/AuditLayout.vue';
  import AuditHeader from '../components/layout/AuditHeader.vue';
  import AuditSidebar from '../components/layout/AuditSidebar.vue';
  import ScanProgressDialog from '../components/common/ScanProgressDialog.vue';
  import HostSelectionDialog from '../components/common/HostSelectionDialog.vue';
  import ScriptSelectionDialog from '../components/common/ScriptSelectionDialog.vue';
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
  const showHostSelection = ref(false);
  const showScriptSelection = ref(false);
  const pendingScanCommand = ref<StartScanCommand | null>(null);
  const isSidebarCollapsed = ref(false);

  // Computed
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
    // Навигация уже обрабатывается через router-link в AuditSidebar
    // Это событие можно использовать для дополнительной логики
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
      showHostSelection.value = true;
    }
  };

  const handleCancelScan = async () => {
    if (!currentScan.value) return;

    try {
      await cancelScan(currentScan.value.id);
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
      name: `Scan ${new Date().toLocaleString()}`,
      unitIds: selectedHosts.unitIds,
      hostIds: selectedHosts.hostIds,
      scriptIds: [],
      autoFix: false
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
    color: var(--color-text);
  }

  .audit-content {
    flex: 1;
    padding: var(--spacing-md);
    overflow-y: auto;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    gap: var(--spacing-md);
  }

  .error-container {
    margin-bottom: var(--spacing-md);
  }

  @media (max-width: 768px) {
    .audit-content {
      padding: var(--spacing-sm);
    }
  }
</style>
