<!-- src/modules/auth/components/AuthForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" class="auth-form" novalidate>
    <!-- Progress Steps (для будущего расширения) -->
    <div class="auth-progress" v-if="showProgress">
      <div class="progress-steps">
        <div class="progress-step progress-step--completed">
          <div class="step-indicator">
            <span class="step-check">
              <CheckIcon size="16" />
            </span>
          </div>
          <span class="step-label">Аутентификация</span>
        </div>
      </div>
    </div>

    <div class="auth-form__content">
      <!-- Form Fields -->
      <div class="auth-form__fields">
        <div class="form-group">
          <BaseInput v-model="formData.username"
                     type="text"
                     label="Имя пользователя"
                     placeholder="Введите имя пользователя"
                     :error="validationErrors.username"
                     :disabled="isLoading || !serverAvailable"
                     :required="true"
                     autocomplete="username"
                     :clearable="false"
                     @blur="validateField('username')"
                     @focus="clearFieldError('username')"
                     class="auth-form__input">
            <template #prefix>
              <span class="auth-form__input-icon">
                <UserIcon />
              </span>
            </template>
          </BaseInput>
        </div>

        <div class="form-group">
          <BaseInput v-model="formData.password"
                     type="password"
                     label="Пароль"
                     placeholder="Введите пароль"
                     :error="validationErrors.password"
                     :disabled="isLoading || !serverAvailable"
                     :required="true"
                     autocomplete="current-password"
                     :show-password-toggle="true"
                     :clearable="false"
                     @blur="validateField('password')"
                     @focus="clearFieldError('password')"
                     class="auth-form__input">
            <template #prefix>
              <span class="auth-form__input-icon">
                <LockIcon />
              </span>
            </template>
          </BaseInput>
        </div>
      </div>

      <!-- Server Status -->
      <div v-if="!serverAvailable" class="server-status-card">
        <div class="server-status__icon status--offline">
          <ServerIcon />
        </div>
        <div class="server-status__content">
          <div class="server-status__title">Сервер недоступен</div>
          <div class="server-status__description">
            Пожалуйста, проверьте подключение к сети и повторите попытку
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <BaseButton type="submit"
                  :is-loading="isLoading"
                  :disabled="!isFormValid || isLoading || !serverAvailable"
                  variant="primary"
                  size="lg"
                  :full-width="true"
                  class="auth-form__submit">
        <span class="auth-form__submit-text">
          {{ serverAvailable ? 'Войти в систему' : 'Сервер недоступен' }}
        </span>
        <template #loader>
          <div class="auth-form__submit-loading">
            <LoadingSpinner class="loading-spinner" />
            <span>Выполняется вход...</span>
          </div>
        </template>
      </BaseButton>

      <!-- General Error -->
      <div v-if="generalError" class="auth-form__error" role="alert">
        <div class="auth-form__error-icon">
          <AlertIcon />
        </div>
        <div class="auth-form__error-content">
          <div class="auth-form__error-title">Ошибка авторизации</div>
          <div class="auth-form__error-text">{{ generalError }}</div>
        </div>
        <BaseButton @click="clearGeneralError"
                    variant="text"
                    size="sm"
                    class="error-close-btn">
          <CloseIcon size="16" />
        </BaseButton>
      </div>

      <!-- Help Links -->
      <div v-if="showHelpLinks && serverAvailable" class="auth-form__help">
        <a href="#" class="auth-form__help-link" @click.prevent="handleForgotPassword">
          <HelpCircleIcon class="help-link-icon" />
          <span>Забыли пароль?</span>
        </a>
        <div class="help-divider">•</div>
        <a href="#" class="auth-form__help-link" @click.prevent="handleSupport">
          <LifebuoyIcon class="help-link-icon" />
          <span>Техническая поддержка</span>
        </a>
      </div>

      <!-- Connection Status -->
      <div v-if="!serverAvailable" class="connection-status">
        <div class="connection-status__content">
          <div class="connection-status__text">
            Ожидание подключения к серверу...
          </div>
          <BaseButton @click="retryConnection"
                      variant="secondary"
                      size="sm"
                      :loading="isLoading"
                      class="retry-btn">
            <RefreshCwIcon class="retry-icon" />
            Повторить
          </BaseButton>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { reactive, computed, ref } from 'vue';
  import { BaseInput, BaseButton } from '@/framework/ui';
  import {
    UserIcon,
    LockIcon,
    AlertIcon,
    CheckIcon,
    ServerIcon,
    HelpCircleIcon,
    LifebuoyIcon,
    RefreshCwIcon,
    CloseIcon,
    LoadingSpinner
  } from '@/assets/icons';
  import type { AuthValidationErrors } from '../api/auth.types';

  interface Props {
    isLoading?: boolean;
    generalError?: string | null;
    serverAvailable?: boolean;
    showHelpLinks?: boolean;
    showProgress?: boolean;
  }

  interface Emits {
    (e: 'submit', credentials: { username: string; password: string }): void;
    (e: 'forgot-password'): void;
    (e: 'support'): void;
    (e: 'retry-connection'): void;
    (e: 'clear-error'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    generalError: null,
    serverAvailable: true,
    showHelpLinks: true,
    showProgress: false,
  });

  const emit = defineEmits<Emits>();

  const formData = reactive({
    username: '',
    password: '',
  });

  const validationErrors = ref<AuthValidationErrors>({});

  /**
   * Проверка валидности формы
   */
  const isFormValid = computed(() => {
    return formData.username.trim().length > 0 &&
      formData.password.length > 0 &&
      Object.keys(validationErrors.value).length === 0;
  });

  /**
   * Валидация поля при потере фокуса
   */
  const validateField = (field: 'username' | 'password'): void => {
    const value = formData[field];
    let error: string | null = null;

    if (field === 'username') {
      if (!value.trim()) {
        error = 'Имя пользователя обязательно';
      } else if (value.length < 2) {
        error = 'Минимум 2 символа';
      } else if (value.length > 50) {
        error = 'Максимум 50 символов';
      } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        error = 'Только буквы, цифры и подчеркивания';
      }
    } else if (field === 'password') {
      if (!value) {
        error = 'Пароль обязателен';
      } else if (value.length < 3) {
        error = 'Минимум 3 символа';
      } else if (value.length > 100) {
        error = 'Максимум 100 символов';
      }
    }

    if (error) {
      validationErrors.value[field] = error;
    } else {
      delete validationErrors.value[field];
    }
  };

  /**
   * Очистка ошибки поля при фокусе
   */
  const clearFieldError = (field: 'username' | 'password'): void => {
    delete validationErrors.value[field];
  };

  /**
   * Очистка общей ошибки
   */
  const clearGeneralError = (): void => {
    emit('clear-error');
  };

  /**
   * Обработка отправки формы
   */
  const handleSubmit = (): void => {
    if (!props.serverAvailable) return;

    // Валидируем все поля
    validateField('username');
    validateField('password');

    if (Object.keys(validationErrors.value).length === 0) {
      emit('submit', {
        username: formData.username.trim(),
        password: formData.password,
      });
    }
  };

  /**
   * Обработка "Забыли пароль"
   */
  const handleForgotPassword = (): void => {
    emit('forgot-password');
  };

  /**
   * Обработка обращения в поддержку
   */
  const handleSupport = (): void => {
    emit('support');
  };

  /**
   * Повторное подключение к серверу
   */
  const retryConnection = (): void => {
    emit('retry-connection');
  };

  /**
   * Сброс формы
   */
  const resetForm = (): void => {
    formData.username = '';
    formData.password = '';
    validationErrors.value = {};
  };

  // Экспорт методов для родительского компонента
  defineExpose({
    resetForm,
  });
</script>

<style scoped>
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl, 1.5rem);
    width: 100%;
    background: var(--color-background-card, #ffffff);
    border-radius: var(--radius-xl, 0.75rem);
    padding: var(--spacing-2xl, 2rem);
    border: 1px solid var(--color-border-card, #f1f5f9);
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  }

  /* Progress Steps */
  .auth-progress {
    padding-bottom: var(--spacing-lg, 1.25rem);
    border-bottom: 1px solid var(--color-border, #e2e8f0);
  }

  .progress-steps {
    display: flex;
    justify-content: center;
  }

  .progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  .step-indicator {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-success, #10b981);
    color: white;
    margin-bottom: var(--spacing-sm, 0.75rem);
  }

  .step-check ::v-deep(svg) {
    width: 1rem;
    height: 1rem;
  }

  .step-label {
    font-size: 0.875rem;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-success, #10b981);
  }

  /* Form Content */
  .auth-form__content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg, 1.25rem);
  }

  .auth-form__fields {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg, 1.25rem);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 0.75rem);
  }

  .auth-form__input {
    min-height: 52px;
  }

  .auth-form__input-icon {
    font-size: 16px;
    opacity: 0.7;
    background: transparent !important;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--color-text-muted, #64748b);
    transition: color var(--transition-fast, 0.15s);
  }

  .auth-form__input:focus-within .auth-form__input-icon {
    color: var(--color-primary, #0ea5e9);
    opacity: 1;
  }

  /* Server Status Card */
  .server-status-card {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md, 1rem);
    padding: var(--spacing-lg, 1.25rem);
    background: var(--status-offline-bg, color-mix(in srgb, var(--color-error) 8%, transparent));
    border: 1px solid var(--status-offline-border, color-mix(in srgb, var(--color-error) 30%, transparent));
    border-radius: var(--radius-lg, 0.75rem);
    color: var(--status-offline-text, var(--color-error));
  }

  .server-status__icon {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-md, 0.5rem);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--status-offline-indicator, color-mix(in srgb, var(--color-error) 15%, transparent));
  }

    .server-status__icon ::v-deep(svg) {
      width: 1.25rem;
      height: 1.25rem;
    }

  .server-status__content {
    flex: 1;
  }

  .server-status__title {
    font-weight: var(--font-weight-semibold, 600);
    margin-bottom: var(--spacing-xs, 0.5rem);
    font-size: 0.9rem;
  }

  .server-status__description {
    font-size: 0.8rem;
    opacity: 0.9;
    line-height: 1.4;
  }

  /* Submit Button */
  .auth-form__submit {
    width: 100%;
    min-height: 48px;
    height: auto;
    font-weight: var(--font-weight-semibold, 600);
    font-size: 15px;
    border-radius: var(--radius-lg, 0.75rem);
    transition: all var(--transition-normal, 0.3s);
    padding: 12px 16px;
    margin-top: var(--spacing-sm, 0.75rem);
    background: var(--gradient-primary, linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%));
    box-shadow: var(--shadow-primary, 0 4px 12px color-mix(in srgb, var(--color-primary) 25%, transparent));
  }

    .auth-form__submit:not(.base-button--disabled):not(.base-button--loading):hover {
      background: var(--gradient-primary-hover, linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%));
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
    }

  .auth-form__submit-text,
  .auth-form__submit-loading {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm, 0.75rem);
    min-width: 140px;
    justify-content: center;
  }

  .loading-spinner {
    width: 1rem;
    height: 1rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  /* Error State */
  .auth-form__error {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md, 1rem);
    padding: var(--spacing-lg, 1.25rem);
    background: var(--status-offline-bg, color-mix(in srgb, var(--color-error) 8%, transparent));
    border: 1px solid var(--status-offline-border, color-mix(in srgb, var(--color-error) 30%, transparent));
    border-radius: var(--radius-lg, 0.75rem);
    color: var(--status-offline-text, var(--color-error));
    font-size: 13px;
    line-height: 1.4;
    box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
    position: relative;
  }

  .auth-form__error-icon {
    flex-shrink: 0;
    margin-top: 1px;
    font-size: 14px;
    background: transparent !important;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: var(--color-error, #ef4444);
  }

  .auth-form__error-content {
    flex: 1;
  }

  .auth-form__error-title {
    font-weight: var(--font-weight-semibold, 600);
    margin-bottom: 2px;
    font-size: 13px;
    color: var(--color-error-dark, #dc2626);
  }

  .auth-form__error-text {
    word-break: break-word;
    font-size: 12px;
    color: var(--color-error-dark, #dc2626);
    opacity: 0.9;
  }

  .error-close-btn {
    flex-shrink: 0;
    color: var(--color-error, #ef4444);
  }

  /* Help Links */
  .auth-form__help {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md, 1rem);
    margin-top: var(--spacing-sm, 0.75rem);
    padding-top: var(--spacing-lg, 1.25rem);
    border-top: 1px solid var(--color-border, #e2e8f0);
  }

  .auth-form__help-link {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 0.5rem);
    color: var(--color-text-muted, #64748b);
    text-decoration: none;
    font-size: 13px;
    transition: all var(--transition-fast, 0.15s);
    padding: 6px 8px;
    border-radius: var(--radius-md, 0.5rem);
  }

    .auth-form__help-link:hover {
      color: var(--color-primary, #0ea5e9);
      background: color-mix(in srgb, var(--color-primary) 8%, transparent);
      text-decoration: none;
    }

  .help-link-icon {
    width: 14px;
    height: 14px;
  }

  .help-divider {
    color: var(--color-text-muted, #64748b);
    opacity: 0.5;
  }

  /* Connection Status */
  .connection-status {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg, 1.25rem);
    background: var(--color-surface-hover, #f1f5f9);
    border-radius: var(--radius-lg, 0.75rem);
    border: 1px solid var(--color-border, #e2e8f0);
  }

  .connection-status__content {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg, 1.25rem);
  }

  .connection-status__text {
    font-size: 0.9rem;
    color: var(--color-text-secondary, #475569);
    font-weight: var(--font-weight-medium, 500);
  }

  .retry-btn {
    white-space: nowrap;
  }

  .retry-icon {
    width: 14px;
    height: 14px;
  }

  /* Адаптивность для мобильных устройств */
  @media (max-width: 480px) {
    .auth-form {
      gap: var(--spacing-lg, 1.25rem);
      padding: var(--spacing-xl, 1.5rem);
    }

    .auth-form__fields {
      gap: var(--spacing-md, 1rem);
    }

    .auth-form__submit {
      min-height: 44px;
      border-radius: var(--radius-md, 0.5rem);
      font-size: 14px;
      padding: 10px 14px;
    }

    .auth-form__error {
      padding: var(--spacing-md, 1rem);
      border-radius: var(--radius-md, 0.5rem);
    }

    .auth-form__help {
      flex-direction: column;
      gap: var(--spacing-sm, 0.75rem);
    }

    .help-divider {
      display: none;
    }

    .connection-status__content {
      flex-direction: column;
      gap: var(--spacing-md, 1rem);
      text-align: center;
    }
  }

  @media (max-width: 360px) {
    .auth-form {
      padding: var(--spacing-lg, 1.25rem);
    }

    .auth-form__submit-text {
      min-width: 120px;
      font-size: 13px;
    }

    .auth-form__help-link {
      font-size: 12px;
    }
  }

  /* Ландшафтная ориентация */
  @media (max-height: 500px) and (orientation: landscape) {
    .auth-form {
      gap: var(--spacing-md, 1rem);
      padding: var(--spacing-lg, 1.25rem);
    }

    .auth-form__fields {
      gap: var(--spacing-sm, 0.75rem);
    }

    .auth-form__input {
      min-height: 44px;
    }

    .auth-form__submit {
      min-height: 40px;
      margin-top: var(--spacing-xs, 0.5rem);
    }

    .auth-form__error {
      padding: var(--spacing-md, 1rem);
    }

    .auth-form__help {
      margin-top: var(--spacing-xs, 0.5rem);
      padding-top: var(--spacing-md, 1rem);
    }
  }

  /* Очень маленькие экраны */
  @media (max-width: 320px) {
    .auth-form {
      gap: var(--spacing-md, 1rem);
      padding: var(--spacing-md, 1rem);
    }

    .auth-form__submit {
      min-height: 42px;
      padding: 8px 12px;
    }
  }

  /* Темная тема */
  @media (prefers-color-scheme: dark) {
    .auth-form {
      background: var(--color-surface-dark, #1e293b);
      border-color: var(--color-border-dark, #334155);
    }

    .auth-progress {
      border-bottom-color: var(--color-border-dark, #334155);
    }

    .auth-form__help {
      border-top-color: var(--color-border-dark, #334155);
    }

    .connection-status {
      background: var(--color-surface-hover-dark, #1e293b);
      border-color: var(--color-border-dark, #334155);
    }
  }
</style>
