<template>
  <div class="settings-tab">
    <div class="tab-header">
      <div class="header-with-action">
        <div>
          <h2 class="tab-title">
            <UsersIcon class="tab-title-icon" />
            Пользователи SSH
          </h2>
          <p class="tab-description">Управление учетными записями для подключения к серверам</p>
        </div>
        <BaseButton @click="$emit('add-user')"
                    variant="primary"
                    size="sm"
                    class="add-user-btn">
          <UserPlusIcon class="button-icon" />
          Добавить пользователя
        </BaseButton>
      </div>
    </div>

    <div class="settings-grid">
      <div class="users-list">
        <div v-for="user in users" :key="user.id" class="user-card">
          <div class="user-header">
            <div class="user-info">
              <KeyIcon class="user-icon" />
              <div class="user-details">
                <h4 class="user-name">{{ user.name }}</h4>
                <div class="user-meta">
                  <span class="user-auth-type">{{ getAuthTypeText(user.authType) }}</span>
                  <span class="user-server">@{{ user.server }}</span>
                </div>
              </div>
            </div>
            <div class="user-actions">
              <BaseButton @click="$emit('edit-user', user)"
                          variant="text"
                          size="sm"
                          class="action-btn">
                <EditIcon class="button-icon" />
                Изменить
              </BaseButton>
              <BaseButton @click="$emit('delete-user', user.id)"
                          variant="text"
                          size="sm"
                          class="action-btn delete-btn">
                <TrashIcon class="button-icon" />
                Удалить
              </BaseButton>
            </div>
          </div>

          <div class="user-details-expanded">
            <div class="detail-row">
              <span class="detail-label">Сервер:</span>
              <span class="detail-value">{{ user.server }}:{{ user.port }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Имя пользователя:</span>
              <span class="detail-value">{{ user.username }}</span>
            </div>
            <div v-if="user.authType === 'rsa'" class="detail-row">
              <span class="detail-label">RSA ключ:</span>
              <span class="detail-value truncated">{{ user.rsaKey ? user.rsaKey.substring(0, 50) + '...' : 'Не указан' }}</span>
            </div>
          </div>
        </div>

        <div v-if="users.length === 0" class="empty-state">
          <KeyIcon class="empty-icon" />
          <p>Пользователи не добавлены</p>
          <p class="empty-description">
            Добавьте учетные записи SSH для удобного подключения к серверам
          </p>
          <BaseButton @click="$emit('add-user')"
                      variant="primary"
                      class="add-first-btn">
            <UserPlusIcon class="button-icon" />
            Добавить первого пользователя
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
import { UsersIcon, UserPlusIcon, KeyIcon, EditIcon, TrashIcon } from '@/assets/icons';
import type { SshUser } from '../../../api/audit.types';

interface Props {
  users: SshUser[];
  proxySettings?: any;
}

interface Emits {
  (e: 'add-user'): void;
  (e: 'edit-user', user: SshUser): void;
  (e: 'delete-user', userId: string): void;
}

defineProps<Props>();
defineEmits<Emits>();

const getAuthTypeText = (type: string): string => {
  return type === 'password' ? 'Пароль' : 'RSA ключ';
};
</script>

<style scoped>
  .settings-tab {
    animation: fadeIn 0.3s ease-out;
  }

  .tab-header {
    margin-bottom: var(--spacing-2xl);
  }

  .header-with-action {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-lg);
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

  .users-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .user-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    transition: all var(--transition-fast);
  }

    .user-card:hover {
      border-color: var(--color-primary);
      box-shadow: var(--shadow-sm);
    }

  .user-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .user-info {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    flex: 1;
  }

  .user-icon {
    width: 2.5rem;
    height: 2.5rem;
    color: var(--color-primary);
    background: var(--color-primary-50);
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);
    flex-shrink: 0;
  }

  .user-details {
    flex: 1;
  }

  .user-name {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 var(--spacing-xs) 0;
    color: var(--color-text-primary);
  }

  .user-meta {
    display: flex;
    gap: var(--spacing-lg);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .user-auth-type {
    background: var(--color-surface-hover);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    font-weight: 500;
  }

  .user-actions {
    display: flex;
    gap: var(--spacing-sm);
    flex-shrink: 0;
  }

  .action-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .delete-btn {
    color: var(--color-error);
  }

    .delete-btn:hover {
      background: var(--color-error-light);
    }

  .user-details-expanded {
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--color-border-light);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .detail-row {
    display: flex;
    gap: var(--spacing-md);
    font-size: 0.875rem;
  }

  .detail-label {
    font-weight: 500;
    color: var(--color-text-primary);
    min-width: 120px;
  }

  .detail-value {
    color: var(--color-text-secondary);
    flex: 1;
  }

  .truncated {
    font-family: var(--font-family-mono);
    font-size: 0.8rem;
    background: var(--color-surface-hover);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--color-text-secondary);
  }

  .empty-icon {
    width: 4rem;
    height: 4rem;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
    color: var(--color-primary);
  }

  .empty-description {
    margin: var(--spacing-sm) 0 var(--spacing-lg) 0;
    font-size: 0.9rem;
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
    .header-with-action {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-md);
    }

    .user-header {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-md);
    }

    .user-actions {
      align-self: flex-end;
    }
  }

  @media (max-width: 768px) {
    .user-info {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-sm);
    }

    .user-meta {
      justify-content: center;
    }

    .user-actions {
      flex-direction: column;
      width: 100%;
    }

    .action-btn {
      width: 100%;
    }
  }
</style>
