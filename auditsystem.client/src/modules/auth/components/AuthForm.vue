<template>
  <form @submit.prevent="handleSubmit" class="auth-form" novalidate>
    <div class="auth-form__fields">
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

    <BaseButton type="submit"
                :is-loading="isLoading"
                :disabled="!isFormValid || isLoading || !serverAvailable"
                variant="primary"
                size="lg"
                :full-width="true"
                class="auth-form__submit">
      <span class="auth-form__submit-text">
        {{ serverAvailable ? 'Войти' : 'Сервер недоступен' }}
      </span>
      <template #loader>
        <span class="auth-form__submit-loading">Вход...</span>
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
    </div>

    <div v-if="showHelpLinks" class="auth-form__help">
      <a href="#" class="auth-form__help-link" @click.prevent="handleForgotPassword">
        Забыли пароль?
      </a>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { reactive, computed, ref } from 'vue';
  import { BaseInput, BaseButton } from '@/framework/ui';
  import { formService } from '@/core/services/form/form.service';
  import { UserIcon, LockIcon, AlertIcon } from '@/assets/icons';
  import type { AuthValidationErrors } from '../api/auth.types';

  interface Props {
    isLoading?: boolean;
    generalError?: string | null;
    serverAvailable?: boolean;
    showHelpLinks?: boolean;
  }

  interface Emits {
    (e: 'submit', credentials: { username: string; password: string }): void;
    (e: 'forgot-password'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    generalError: null,
    serverAvailable: true,
    showHelpLinks: true,
  });

  const emit = defineEmits<Emits>();

  const formData = reactive({
    username: '',
    password: '',
  });

  const validationErrors = ref<AuthValidationErrors>({});

  // Правила валидации с использованием formService
  const formValidationRules = {
    username: [
      formService.rules.required('Имя пользователя обязательно'),
      formService.rules.minLength(2, 'Минимум 2 символа'),
      formService.rules.maxLength(50, 'Максимум 50 символов'),
      formService.rules.pattern(/^[a-zA-Z0-9_]+$/, 'Только буквы, цифры и подчеркивания'),
    ],
    password: [
      formService.rules.required('Пароль обязателен'),
      formService.rules.minLength(3, 'Минимум 3 символа'),
      formService.rules.maxLength(100, 'Максимум 100 символов'),
    ],
  };

  /**
   * Проверка валидности формы
   */
  const isFormValid = computed(() => {
    const formDataForValidation = {
      username: formData.username,
      password: formData.password,
    };

    const validation = formService.validateForm(formDataForValidation, formValidationRules);
    return validation.isValid && formData.username.trim().length > 0 && formData.password.length > 0;
  });

  /**
   * Валидация поля при потере фокуса
   */
  const validateField = (field: 'username' | 'password'): void => {
    const value = formData[field];
    const rules = formValidationRules[field];

    const validation = formService.validateField(value, rules, formData);

    if (!validation.isValid) {
      validationErrors.value[field] = validation.errors[0];
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
   * Обработка отправки формы
   */
  const handleSubmit = (): void => {
    if (!props.serverAvailable) return;

    // Валидируем все поля
    const validation = formService.validateForm(formData, formValidationRules);

    if (validation.isValid) {
      emit('submit', {
        username: formData.username.trim(),
        password: formData.password,
      });
    } else {
      // Преобразуем ошибки в формат AuthValidationErrors
      validationErrors.value = Object.entries(validation.errors).reduce((acc, [key, errors]) => {
        acc[key as keyof AuthValidationErrors] = errors[0];
        return acc;
      }, {} as AuthValidationErrors);
    }
  };

  /**
   * Обработка "Забыли пароль"
   */
  const handleForgotPassword = (): void => {
    emit('forgot-password');
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
    gap: 16px;
    width: 100%;
  }

  .auth-form__fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
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
    color: var(--color-text-muted);
    transition: color var(--transition-fast);
  }

  .auth-form__input:focus-within .auth-form__input-icon {
    color: var(--color-primary);
    opacity: 1;
  }

  .auth-form__submit {
    width: 100%;
    min-height: 48px;
    height: auto;
    font-weight: 600;
    font-size: 15px;
    border-radius: 10px;
    transition: all var(--transition-normal);
    padding: 12px 16px;
    margin-top: 8px;
    background: var(--gradient-primary);
    box-shadow: var(--shadow-primary);
  }

  .auth-form__submit-text,
  .auth-form__submit-loading {
    display: inline-block;
    min-width: 100px;
    text-align: center;
  }

  .auth-form__submit:not(.base-button--disabled):not(.base-button--loading) {
    background: var(--gradient-primary);
    box-shadow: var(--shadow-primary);
  }

    .auth-form__submit:not(.base-button--disabled):not(.base-button--loading):hover {
      background: var(--gradient-primary-hover);
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
    }

  .auth-form__error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    background: color-mix(in srgb, var(--color-error-light) 20%, transparent);
    border: 1px solid var(--color-error);
    border-radius: 8px;
    color: var(--color-error-dark);
    font-size: 13px;
    line-height: 1.4;
    box-shadow: var(--shadow-sm);
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
    color: var(--color-error);
  }

  .auth-form__error-content {
    flex: 1;
  }

  .auth-form__error-title {
    font-weight: 600;
    margin-bottom: 2px;
    font-size: 13px;
    color: var(--color-error-dark);
  }

  .auth-form__error-text {
    word-break: break-word;
    font-size: 12px;
    color: var(--color-error-dark);
    opacity: 0.9;
  }

  .auth-form__help {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 8px;
  }

  .auth-form__help-link {
    color: var(--color-text-muted);
    text-decoration: none;
    font-size: 13px;
    transition: all var(--transition-fast);
    padding: 4px 8px;
    border-radius: 4px;
  }

    .auth-form__help-link:hover {
      color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 8%, transparent);
      text-decoration: none;
    }

  /* Адаптивность для мобильных устройств */
  @media (max-width: 480px) {
    .auth-form {
      gap: 14px;
    }

    .auth-form__fields {
      gap: 14px;
    }

    .auth-form__submit {
      min-height: 44px;
      border-radius: 8px;
      font-size: 14px;
      padding: 10px 14px;
    }

    .auth-form__error {
      padding: 10px;
      border-radius: 6px;
    }

    .auth-form__submit-text {
      min-width: 80px;
    }
  }

  @media (max-width: 360px) {
    .auth-form__submit-text {
      min-width: 70px;
      font-size: 13px;
    }

    .auth-form__help-link {
      font-size: 12px;
    }
  }

  /* Ландшафтная ориентация */
  @media (max-height: 500px) and (orientation: landscape) {
    .auth-form__fields {
      gap: 12px;
    }

    .auth-form__input {
      min-height: 44px;
    }

    .auth-form__submit {
      min-height: 40px;
      margin-top: 4px;
    }

    .auth-form__error {
      padding: 8px 10px;
    }
  }

  /* Очень маленькие экраны */
  @media (max-width: 320px) {
    .auth-form {
      gap: 12px;
    }

    .auth-form__submit {
      min-height: 42px;
      padding: 8px 12px;
    }
  }
</style>
