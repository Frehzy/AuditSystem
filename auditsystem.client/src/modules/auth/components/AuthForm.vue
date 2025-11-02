<!-- src/modules/auth/components/AuthForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" class="auth-form" novalidate>
    <div class="auth-form__fields">
      <div class="form-group">
        <BaseInput v-model="formData.username"
                   type="text"
                   label="Имя пользователя"
                   placeholder="Введите имя пользователя"
                   :error="validationErrors.username"
                   :disabled="isLoading || !serverAvailable || isCancelling"
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
                   :type="showPassword ? 'text' : 'password'"
                   label="Пароль"
                   placeholder="Введите пароль"
                   :error="validationErrors.password"
                   :disabled="isLoading || !serverAvailable || isCancelling"
                   :required="true"
                   autocomplete="current-password"
                   :show-password-toggle="false"
                   :clearable="false"
                   @blur="validateField('password')"
                   @focus="clearFieldError('password')"
                   class="auth-form__input">
          <template #prefix>
            <span class="auth-form__input-icon">
              <LockIcon />
            </span>
          </template>
          <template #suffix>
            <BaseButton @click="togglePasswordVisibility"
                        type="button"
                        variant="text"
                        size="sm"
                        class="password-toggle-btn"
                        :title="showPassword ? 'Скрыть пароль' : 'Показать пароль'">
              <span class="password-toggle-icon">
                <EyeIcon v-if="!showPassword" />
                <EyeOffIcon v-else />
              </span>
            </BaseButton>
          </template>
        </BaseInput>
      </div>
    </div>

    <div v-if="!serverAvailable" class="server-status-card">
      <div class="server-status__icon status--offline">
        <ServerIcon />
      </div>
      <div class="server-status__content">
        <div class="server-status__title">Сервер недоступен</div>
        <div class="server-status__description">
          Пожалуйста, проверьте подключение к сети
        </div>
      </div>
    </div>

    <BaseButton v-if="isLoading && !isCancelling"
                @click="cancelRequest"
                type="button"
                variant="secondary"
                size="lg"
                :full-width="true"
                class="auth-form__cancel">
      <span class="auth-form__cancel-text">Отменить</span>
    </BaseButton>

    <BaseButton v-else
                type="submit"
                :is-loading="isLoading && !isCancelling"
                :disabled="!isFormValid || isLoading || !serverAvailable || isCancelling"
                variant="primary"
                size="lg"
                :full-width="true"
                class="auth-form__submit">
      <span class="auth-form__submit-text">{{ submitButtonText }}</span>
      <template #loader>
        <div class="auth-form__submit-loading">
          <LoadingSpinner class="loading-spinner" />
          <span>Выполняется вход...</span>
        </div>
      </template>
    </BaseButton>

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
        <CloseIcon />
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, onUnmounted } from 'vue';
  import { BaseInput, BaseButton } from '@/framework/ui';
  import {
    UserIcon,
    LockIcon,
    AlertIcon,
    ServerIcon,
    CloseIcon,
    LoadingSpinner,
    EyeIcon,
    EyeOffIcon
  } from '@/assets/icons';
  import type { AuthValidationErrors } from '../api/auth.types';

  interface Props {
    isLoading?: boolean;
    generalError?: string | null;
    serverAvailable?: boolean;
  }

  interface Emits {
    (e: 'submit', credentials: { username: string; password: string }): void;
    (e: 'retry-connection'): void;
    (e: 'clear-error'): void;
    (e: 'cancel-request'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    generalError: null,
    serverAvailable: true,
  });

  const emit = defineEmits<Emits>();

  const formData = reactive({
    username: '',
    password: '',
  });

  const validationErrors = ref<AuthValidationErrors>({});
  const showPassword = ref(false);
  const isCancelling = ref(false);

  const isFormValid = computed(() => {
    return formData.username.trim().length > 0 &&
      formData.password.length > 0 &&
      Object.keys(validationErrors.value).length === 0;
  });

  const submitButtonText = computed(() => {
    if (isCancelling.value) return 'Отмена...';
    if (!props.serverAvailable) return 'Сервер недоступен';
    if (props.isLoading) return 'Выполняется вход...';
    return 'Войти в систему';
  });

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

  const clearFieldError = (field: 'username' | 'password'): void => {
    delete validationErrors.value[field];
  };

  const clearGeneralError = (): void => {
    emit('clear-error');
    validationErrors.value = {};
  };

  const togglePasswordVisibility = (): void => {
    showPassword.value = !showPassword.value;
  };

  const handleSubmit = (): void => {
    if (!props.serverAvailable) return;

    validateField('username');
    validateField('password');

    if (Object.keys(validationErrors.value).length === 0) {
      isCancelling.value = false;
      emit('submit', {
        username: formData.username.trim(),
        password: formData.password,
      });
    }
  };

  const cancelRequest = (): void => {
    isCancelling.value = true;
    emit('cancel-request');
    // Сбрасываем состояние через короткое время
    setTimeout(() => {
      isCancelling.value = false;
    }, 1000);
  };

  const resetForm = (): void => {
    formData.username = '';
    formData.password = '';
    validationErrors.value = {};
    showPassword.value = false;
    isCancelling.value = false;
  };

  onUnmounted(() => {
    isCancelling.value = false;
  });

  defineExpose({
    resetForm,
    cancelRequest,
  });
</script>

<style scoped>
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    width: 100%;
  }

  .auth-form__fields {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .auth-form__input {
    min-height: 44px;
  }

  .auth-form__input-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--color-text-muted);
    transition: color var(--transition-fast);
  }

  .auth-form__input:focus-within .auth-form__input-icon {
    color: var(--color-primary);
  }

  .password-toggle-btn {
    padding: 6px;
    min-width: auto;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    color: var(--color-text-muted);
  }

    .password-toggle-btn:hover {
      background: var(--color-surface-hover);
      color: var(--color-primary);
    }

  .password-toggle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
  }

    .password-toggle-icon :deep(svg) {
      width: 18px;
      height: 18px;
    }

  .server-status-card {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: var(--status-offline-bg);
    border: 1px solid var(--status-offline-border);
    border-radius: var(--radius-md);
    color: var(--status-offline-text);
    font-size: 0.8125rem;
  }

  .server-status__icon {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--status-offline-indicator);
  }

    .server-status__icon :deep(svg) {
      width: 16px;
      height: 16px;
    }

  .server-status__content {
    flex: 1;
  }

  .server-status__title {
    font-weight: 600;
    margin-bottom: 2px;
    font-size: 0.8125rem;
  }

  .server-status__description {
    font-size: 0.75rem;
    opacity: 0.9;
    line-height: 1.3;
  }

  .auth-form__cancel {
    margin-top: var(--spacing-sm);
    min-height: 44px;
    font-weight: 600;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    transition: all var(--transition-normal);
  }

  .auth-form__cancel-text {
    color: var(--color-text-secondary);
  }

  .auth-form__cancel:hover {
    background: var(--color-surface-hover);
    border-color: var(--color-border-hover);
    transform: translateY(-1px);
  }

  .auth-form__submit {
    width: 100%;
    min-height: 44px;
    font-weight: 600;
    font-size: 0.875rem;
    border-radius: var(--radius-md);
    transition: all var(--transition-normal);
    padding: 0.75rem 1rem;
    background: var(--gradient-primary);
    box-shadow: var(--shadow-primary);
    position: relative;
    z-index: 1;
  }

    .auth-form__submit:not(.base-button--disabled):not(.base-button--loading):hover {
      background: var(--gradient-primary-hover);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

  .auth-form__submit-text,
  .auth-form__submit-loading {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    justify-content: center;
  }

  .loading-spinner {
    width: 18px;
    height: 18px;
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

  .auth-form__error {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: var(--status-offline-bg);
    border: 1px solid var(--status-offline-border);
    border-radius: var(--radius-md);
    color: var(--status-offline-text);
    font-size: 0.75rem;
    line-height: 1.3;
    position: relative;
    z-index: 10;
  }

  .auth-form__error-icon {
    flex-shrink: 0;
    margin-top: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    color: var(--color-error);
  }

    .auth-form__error-icon :deep(svg) {
      width: 16px;
      height: 16px;
    }

  .auth-form__error-content {
    flex: 1;
  }

  .auth-form__error-title {
    font-weight: 600;
    margin-bottom: 2px;
    font-size: 0.75rem;
    color: var(--color-error-dark);
  }

  .auth-form__error-text {
    word-break: break-word;
    font-size: 0.7rem;
    color: var(--color-error-dark);
    opacity: 0.9;
  }

  .error-close-btn {
    flex-shrink: 0;
    color: var(--color-error);
    padding: 4px;
    min-width: auto;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

    .error-close-btn:hover {
      background: var(--color-surface-hover);
      transform: scale(1.05);
    }

    .error-close-btn:active {
      transform: scale(0.95);
    }

    .error-close-btn :deep(svg) {
      width: 16px;
      height: 16px;
    }

  /* Улучшение видимости состояния disabled */
  .base-button--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

    .base-button--disabled:hover {
      transform: none !important;
      box-shadow: var(--shadow-primary) !important;
    }
</style>
