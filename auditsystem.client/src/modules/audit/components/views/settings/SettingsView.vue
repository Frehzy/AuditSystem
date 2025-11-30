<template>
  <div class="settings-view">
    <SettingsHeader @export="exportSettings" />

    <SettingsNavigation :active-tab="activeTab"
                        :tabs="tabs"
                        @tab-change="activeTab = $event" />

    <div class="settings-view__content">
      <ScanSettingsTab v-if="activeTab === 'scan'"
                       v-model:settings="localSettings" />

      <NotificationSettingsTab v-if="activeTab === 'notifications'"
                               v-model:settings="localSettings"
                               :is-testing-email="isTestingEmail"
                               :email-status="emailStatus"
                               @test-email="testEmailConnection" />

      <SshUsersTab v-if="activeTab === 'users'"
                   v-model:users="sshUsers"
                   :proxy-settings="localSettings.proxySettings"
                   @edit-user="editUser"
                   @delete-user="deleteUser"
                   @add-user="showAddUserDialog = true" />

      <NetworkSettingsTab v-if="activeTab === 'network'"
                          v-model:settings="localSettings"
                          :ssh-users="sshUsers"
                          :is-testing-proxy="isTestingProxy"
                          :proxy-status="proxyStatus"
                          @test-proxy="testProxyConnection"
                          @manage-users="activeTab = 'users'" />
    </div>

    <SshUserDialog v-if="showAddUserDialog"
                   v-model:show="showAddUserDialog"
                   :user="editingUser"
                   @save="saveUser"
                   @close="closeUserDialog" />

    <SettingsActions @save="saveSettings"
                     @reset="resetToDefaults"
                     :is-saving="isSaving" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import { useAudit } from '../../../composables/useAudit';
  import type { AuditSettings, SshUser } from '../../api/audit.types';

  // Components
  import SettingsHeader from './components/SettingsHeader.vue';
  import SettingsNavigation from './components/SettingsNavigation.vue';
  import SettingsActions from './components/SettingsActions.vue';
  import ScanSettingsTab from './tabs/ScanSettingsTab.vue';
  import NotificationSettingsTab from './tabs/NotificationSettingsTab.vue';
  import SshUsersTab from './tabs/SshUsersTab.vue';
  import NetworkSettingsTab from './tabs/NetworkSettingsTab.vue';
  import SshUserDialog from './dialogs/SshUserDialog.vue';

  // Icons
  import { ScanIcon, BellIcon, UsersIcon, NetworkIcon } from '@/assets/icons';

  interface Props {
    settings?: AuditSettings;
    isLoading?: boolean;
  }

  interface Emits {
    (e: 'update-settings', settings: Partial<AuditSettings>): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { showToast } = useToast();
  const audit = useAudit();

  // State
  const isSaving = ref(false);
  const isTestingProxy = ref(false);
  const isTestingEmail = ref(false);
  const proxyStatus = ref<'connected' | 'disconnected' | 'checking'>('disconnected');
  const emailStatus = ref<'connected' | 'disconnected' | 'checking'>('disconnected');
  const activeTab = ref('scan');
  const showAddUserDialog = ref(false);
  const editingUser = ref<SshUser | null>(null);
  const sshUsers = ref<SshUser[]>([]);

  const localSettings = ref<AuditSettings>({
    scanInterval: 3600000,
    autoReporting: true,
    notificationEnabled: true,
    reportFormat: 'pdf',
    maxScanDuration: 1800000,
    deepScan: false,
    proxySettings: {
      enabled: false,
      host: '',
      port: 22,
      authType: 'password',
      selectedUser: ''
    },
    emailSettings: {
      enabled: false,
      host: '',
      port: 25,
      useSSL: false,
      username: '',
      password: '',
      fromAddress: '',
      toAddresses: [],
      notifyOnScanComplete: true,
      notifyOnCritical: true
    },
    realtimeNotifications: true,
    reportDetailLevel: 'detailed',
    autoArchive: true
  });

  // Tabs
  const tabs = [
    { id: 'scan', title: 'Сканирование', icon: ScanIcon },
    { id: 'notifications', title: 'Уведомления', icon: BellIcon },
    { id: 'users', title: 'Пользователи SSH', icon: UsersIcon },
    { id: 'network', title: 'Сетевое подключение', icon: NetworkIcon }
  ];

  // API методы
  const loadSettings = async (): Promise<void> => {
    try {
      const settings = await audit.loadSettings();
      if (settings) {
        localSettings.value = { ...localSettings.value, ...settings };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      showToast({
        type: 'error',
        title: 'Ошибка загрузки',
        message: 'Не удалось загрузить настройки'
      });
    }
  };

  const loadSshUsers = async (): Promise<void> => {
    try {
      const users = await audit.loadSshUsers();
      sshUsers.value = users || [];
    } catch (error) {
      console.error('Failed to load SSH users:', error);
      showToast({
        type: 'error',
        title: 'Ошибка загрузки',
        message: 'Не удалось загрузить пользователей SSH'
      });
    }
  };

  const saveSettings = async (): Promise<void> => {
    isSaving.value = true;
    try {
      await audit.saveSettings(localSettings.value);
      emit('update-settings', localSettings.value);
      showToast({
        type: 'success',
        title: 'Настройки сохранены',
        message: 'Все изменения успешно применены'
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast({
        type: 'error',
        title: 'Ошибка сохранения',
        message: 'Не удалось сохранить настройки'
      });
    } finally {
      isSaving.value = false;
    }
  };

  const saveUser = async (userData: any): Promise<void> => {
    try {
      if (editingUser.value) {
        const updatedUser = await audit.updateSshUser(editingUser.value.id, userData);
        const index = sshUsers.value.findIndex(user => user.id === editingUser.value!.id);
        if (index !== -1) {
          sshUsers.value[index] = updatedUser;
        }
      } else {
        const newUser = await audit.createSshUser(userData);
        sshUsers.value.push(newUser);
      }

      closeUserDialog();
      showToast({
        type: 'success',
        title: editingUser.value ? 'Пользователь обновлен' : 'Пользователь добавлен',
        message: 'Учетная запись SSH успешно сохранена'
      });
    } catch (error) {
      console.error('Failed to save user:', error);
      showToast({
        type: 'error',
        title: 'Ошибка сохранения',
        message: 'Не удалось сохранить пользователя'
      });
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await audit.deleteSshUser(userId);
        sshUsers.value = sshUsers.value.filter(user => user.id !== userId);

        if (localSettings.value.proxySettings.selectedUser === userId) {
          localSettings.value.proxySettings.selectedUser = '';
        }

        showToast({
          type: 'success',
          title: 'Пользователь удален',
          message: 'Учетная запись SSH успешно удалена'
        });
      } catch (error) {
        console.error('Failed to delete user:', error);
        showToast({
          type: 'error',
          title: 'Ошибка удаления',
          message: 'Не удалось удалить пользователя'
        });
      }
    }
  };

  const testProxyConnection = async (): Promise<void> => {
    isTestingProxy.value = true;
    proxyStatus.value = 'checking';
    try {
      await audit.testProxyConnection(localSettings.value.proxySettings);
      proxyStatus.value = 'connected';
      showToast({
        type: 'success',
        title: 'Подключение успешно',
        message: 'Соединение с прокси-сервером установлено'
      });
    } catch (error) {
      proxyStatus.value = 'disconnected';
      showToast({
        type: 'error',
        title: 'Ошибка подключения',
        message: 'Не удалось подключиться к прокси-серверу'
      });
    } finally {
      isTestingProxy.value = false;
    }
  };

  const testEmailConnection = async (): Promise<void> => {
    isTestingEmail.value = true;
    emailStatus.value = 'checking';
    try {
      await audit.testEmailConnection(localSettings.value.emailSettings);
      emailStatus.value = 'connected';
      showToast({
        type: 'success',
        title: 'Подключение успешно',
        message: 'Соединение с SMTP сервером установлено'
      });
    } catch (error) {
      emailStatus.value = 'disconnected';
      showToast({
        type: 'error',
        title: 'Ошибка подключения',
        message: 'Не удалось подключиться к SMTP серверу'
      });
    } finally {
      isTestingEmail.value = false;
    }
  };

  // Вспомогательные методы
  const editUser = (user: SshUser) => {
    editingUser.value = user;
    showAddUserDialog.value = true;
  };

  const closeUserDialog = () => {
    showAddUserDialog.value = false;
    editingUser.value = null;
  };

  const resetToDefaults = (): void => {
    if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
      localSettings.value = {
        scanInterval: 3600000,
        autoReporting: true,
        notificationEnabled: true,
        reportFormat: 'pdf',
        maxScanDuration: 1800000,
        deepScan: false,
        proxySettings: {
          enabled: false,
          host: '',
          port: 22,
          authType: 'password',
          selectedUser: ''
        },
        emailSettings: {
          enabled: false,
          host: '',
          port: 25,
          useSSL: false,
          username: '',
          password: '',
          fromAddress: '',
          toAddresses: [],
          notifyOnScanComplete: true,
          notifyOnCritical: true
        },
        realtimeNotifications: true,
        reportDetailLevel: 'detailed',
        autoArchive: true
      };
      showToast({
        type: 'success',
        title: 'Настройки сброшены',
        message: 'Все настройки восстановлены к значениям по умолчанию'
      });
    }
  };

  const exportSettings = (): void => {
    const dataStr = JSON.stringify(localSettings.value, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'audit-settings.json';
    link.click();
    showToast({
      type: 'success',
      title: 'Настройки экспортированы',
      message: 'Файл с настройками успешно скачан'
    });
  };

  // Watchers
  watch(() => props.settings, (newSettings) => {
    if (newSettings) {
      localSettings.value = { ...newSettings };
    }
  });

  onMounted(async () => {
    await Promise.all([
      loadSettings(),
      loadSshUsers()
    ]);
  });
</script>

<style scoped>
  .settings-view {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
    min-height: 100%;
    max-width: 1000px;
    margin: 0 auto;
  }

  .settings-view__content {
    flex: 1;
  }
</style>
