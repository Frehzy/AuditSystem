<template>
  <div class="settings-tab">
    <div class="tab-header">
      <h2 class="tab-title">
        <NetworkIcon class="tab-title-icon" />
        Сетевое подключение
      </h2>
      <p class="tab-description">Настройки прокси-сервера для сетевых соединений</p>
    </div>

    <div class="settings-grid">
      <div class="setting-card">
        <div class="setting-header">
          <GlobeIcon class="setting-icon" />
          <div class="setting-info">
            <h3 class="setting-title">Использовать прокси-сервер</h3>
            <p class="setting-description">Подключение через SSH прокси-сервер для всех исходящих соединений</p>
          </div>
          <BaseToggle v-model="settings.proxySettings.enabled" class="setting-toggle" />
        </div>

        <div v-if="settings.proxySettings.enabled" class="setting-details">
          <div class="setting-row">
            <label class="setting-label">Учетная запись SSH</label>
            <BaseSelect v-model="settings.proxySettings.selectedUser"
                        :options="sshUserOptions"
                        placeholder="Выберите пользователя SSH"
                        size="sm" />
            <BaseButton @click="$emit('manage-users')"
                        variant="text"
                        size="sm"
                        class="manage-users-btn">
              <UsersIcon class="button-icon" />
              Управление пользователями
            </BaseButton>
          </div>

          <div v-if="selectedSshUser" class="user-preview">
            <div class="preview-header">
              <ServerIcon class="preview-icon" />
              <span class="preview-title">Выбранная учетная запись</span>
            </div>
            <div class="preview-details">
              <div class="preview-row">
                <span class="preview-label">Сервер:</span>
                <span class="preview-value">{{ selectedSshUser.server }}:{{ selectedSshUser.port }}</span>
              </div>
              <div class="preview-row">
                <span class="preview-label">Пользователь:</span>
                <span class="preview-value">{{ selectedSshUser.username }}</span>
              </div>
              <div class="preview-row">
                <span class="preview-label">Тип авторизации:</span>
                <span class="preview-value">{{ getAuthTypeText(selectedSshUser.authType) }}</span>
              </div>
            </div>
          </div>

          <div class="setting-action">
            <BaseButton @click="$emit('test-proxy')"
                        variant="secondary"
                        :loading="isTestingProxy"
                        :disabled="!canTestProxy"
                        size="sm"
                        class="test-btn">
              <TestConnectionIcon class="button-icon" />
              Проверить подключение
            </BaseButton>
            <div class="connection-status" :class="`status--${proxyStatus}`">
              {{ getProxyStatusText(proxyStatus) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import { NetworkIcon, GlobeIcon, UsersIcon, ServerIcon, TestConnectionIcon } from '@/assets/icons';
  import type { AuditSettings, SshUser } from '../../../api/audit.types';

  interface Props {
    settings: AuditSettings;
    sshUsers: SshUser[];
    isTestingProxy?: boolean;
    proxyStatus?: string;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    'test-proxy': []
    'manage-users': []
  }>();

  const sshUserOptions = computed(() => {
    return props.sshUsers.map(user => ({
      value: user.id,
      label: user.name
    }));
  });

  const selectedSshUser = computed(() => {
    if (!props.settings.proxySettings.selectedUser) return null;
    return props.sshUsers.find(user => user.id === props.settings.proxySettings.selectedUser) || null;
  });

  const canTestProxy = computed(() => {
    return props.settings.proxySettings.enabled && props.settings.proxySettings.selectedUser;
  });

  const getAuthTypeText = (type: string): string => {
    return type === 'password' ? 'Пароль' : 'RSA ключ';
  };

  const getProxyStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      connected: 'Подключено',
      disconnected: 'Не подключено',
      checking: 'Проверка...'
    };
    return statusMap[status] || status;
  };
</script>

<style scoped>
  /* Стили остаются без изменений */
  .settings-tab {
    animation: fadeIn 0.3s ease-out;
  }

  .tab-header {
    margin-bottom: var(--spacing-2xl);
  }

  .tab-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--color-text-primary);
  }

  .tab-title-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--color-primary);
  }

  .tab-description {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .setting-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--spacing-xl);
    transition: all var(--transition-normal);
  }

    .setting-card:hover {
      box-shadow: var(--shadow-md);
      border-color: var(--color-primary-light);
    }

  .setting-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .setting-icon {
    width: 2rem;
    height: 2rem;
    color: var(--color-primary);
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .setting-info {
    flex: 1;
  }

  .setting-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 var(--spacing-xs) 0;
    color: var(--color-text-primary);
  }

  .setting-description {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .setting-toggle {
    flex-shrink: 0;
  }

  .setting-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-border);
  }

  .setting-row {
    display: grid;
    grid-template-columns: 1fr 2fr auto;
    gap: var(--spacing-lg);
    align-items: center;
  }

  .setting-label {
    font-weight: 500;
    color: var(--color-text-primary);
    padding-top: var(--spacing-xs);
  }

  .user-preview {
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    margin-top: var(--spacing-md);
  }

  .preview-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .preview-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-primary);
  }

  .preview-title {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .preview-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .preview-row {
    display: flex;
    gap: var(--spacing-md);
    font-size: 0.875rem;
  }

  .preview-label {
    font-weight: 500;
    color: var(--color-text-primary);
    min-width: 120px;
  }

  .preview-value {
    color: var(--color-text-secondary);
    flex: 1;
  }

  .setting-action {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--color-border-light);
  }

  .connection-status {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status--connected {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  .status--disconnected {
    background: var(--color-error-light);
    color: var(--color-error);
  }

  .status--checking {
    background: var(--color-warning-light);
    color: var(--color-warning);
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: var(--spacing-sm);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 1024px) {
    .setting-row {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }
  }

  @media (max-width: 768px) {
    .setting-header {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-md);
    }

    .setting-info {
      text-align: center;
    }

    .setting-action {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-md);
    }
  }
</style>
