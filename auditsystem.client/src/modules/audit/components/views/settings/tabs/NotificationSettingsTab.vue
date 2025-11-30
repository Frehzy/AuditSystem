<template>
  <div class="settings-tab">
    <div class="tab-header">
      <h2 class="tab-title">
        <BellIcon class="tab-title-icon" />
        Email уведомления
      </h2>
      <p class="tab-description">Настройки отправки уведомлений по электронной почте</p>
    </div>

    <div class="settings-grid">
      <div class="setting-card">
        <div class="setting-header">
          <MailIcon class="setting-icon" />
          <div class="setting-info">
            <h3 class="setting-title">Включить email уведомления</h3>
            <p class="setting-description">Отправка результатов сканирования по электронной почте</p>
          </div>
          <BaseToggle v-model="settings.emailSettings.enabled" class="setting-toggle" />
        </div>

        <div v-if="settings.emailSettings.enabled" class="setting-details">
          <div class="setting-row">
            <label class="setting-label">SMTP сервер</label>
            <BaseInput v-model="settings.emailSettings.host"
                       placeholder="smtp.example.com"
                       size="sm" />
          </div>
          <div class="setting-row">
            <label class="setting-label">Порт SMTP</label>
            <BaseInput v-model.number="settings.emailSettings.port"
                       type="number"
                       min="1"
                       max="65535"
                       size="sm" />
          </div>
          <div class="setting-row">
            <label class="setting-label">Использовать SSL/TLS</label>
            <BaseToggle v-model="settings.emailSettings.useSSL" />
          </div>
          <div class="setting-row">
            <label class="setting-label">Имя пользователя</label>
            <BaseInput v-model="settings.emailSettings.username"
                       size="sm" />
          </div>
          <div class="setting-row">
            <label class="setting-label">Пароль</label>
            <BaseInput v-model="settings.emailSettings.password"
                       type="password"
                       size="sm" />
          </div>
          <div class="setting-row">
            <label class="setting-label">Email отправителя</label>
            <BaseInput v-model="settings.emailSettings.fromAddress"
                       type="email"
                       placeholder="audit@example.com"
                       size="sm" />
          </div>
          <div class="setting-row">
            <label class="setting-label">Получатели уведомлений</label>
            <BaseTextarea v-model="emailRecipients"
                          placeholder="user1@example.com, user2@example.com"
                          rows="2"
                          size="sm" />
          </div>

          <div class="setting-action">
            <BaseButton @click="$emit('test-email')"
                        variant="secondary"
                        :loading="isTestingEmail"
                        :disabled="!canTestEmail"
                        size="sm"
                        class="test-btn">
              <TestConnectionIcon class="button-icon" />
              Проверить подключение
            </BaseButton>
            <div class="connection-status" :class="`status--${emailStatus}`">
              {{ getEmailStatusText(emailStatus) }}
            </div>
          </div>
        </div>
      </div>

      <div class="setting-card" v-if="settings.emailSettings.enabled">
        <div class="setting-header">
          <NotificationSettingsIcon class="setting-icon" />
          <div class="setting-info">
            <h3 class="setting-title">Типы email уведомлений</h3>
            <p class="setting-description">Выберите события для отправки уведомлений</p>
          </div>
        </div>
        <div class="setting-details">
          <div class="setting-row">
            <BaseToggle v-model="settings.emailSettings.notifyOnScanComplete" />
            <div class="toggle-label">
              <span class="label-text">Завершение сканирования</span>
              <span class="label-description">Отправлять email при завершении любого сканирования</span>
            </div>
          </div>
          <div class="setting-row">
            <BaseToggle v-model="settings.emailSettings.notifyOnCritical" />
            <div class="toggle-label">
              <span class="label-text">Критические проблемы</span>
              <span class="label-description">Отправлять email только при обнаружении критических уязвимостей</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue';
  import BaseTextarea from '@/framework/ui/components/forms/BaseTextarea.vue';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import { BellIcon, MailIcon, TestConnectionIcon, ShieldIcon } from '@/assets/icons';
  import type { AuditSettings } from '../../../api/audit.types';

  interface Props {
    settings: AuditSettings;
    isTestingEmail?: boolean;
    emailStatus?: string;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    'test-email': []
  }>();

  const NotificationSettingsIcon = ShieldIcon;

  const emailRecipients = computed({
    get: () => props.settings.emailSettings.toAddresses.join(', '),
    set: (value) => {
      props.settings.emailSettings.toAddresses = value
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
    }
  });

  const canTestEmail = computed(() => {
    const email = props.settings.emailSettings;
    return email.enabled && email.host && email.port > 0 && email.fromAddress;
  });

  const getEmailStatusText = (status: string): string => {
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
    grid-template-columns: 1fr 2fr;
    gap: var(--spacing-lg);
    align-items: start;
  }

    .setting-row:has(.toggle-label) {
      grid-template-columns: auto 1fr;
      gap: var(--spacing-md);
      align-items: center;
    }

  .setting-label {
    font-weight: 500;
    color: var(--color-text-primary);
    padding-top: var(--spacing-xs);
  }

  .toggle-label {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .label-text {
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .label-description {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
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
