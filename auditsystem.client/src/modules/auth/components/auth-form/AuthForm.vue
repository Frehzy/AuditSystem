<!-- Форма авторизации -->
<template>
  <form @submit.prevent="handleSubmit" class="auth-form" novalidate>
    <div class="auth-form__content">
      <div class="auth-form__header">
        <h2 class="auth-form__title">Вход в систему</h2>
        <p class="auth-form__subtitle">Введите свои учетные данные</p>
      </div>

      <div class="auth-form__fields">
        <AuthFormField v-model="form.username"
                       label="Имя пользователя"
                       placeholder="Введите имя пользователя"
                       :error="validation.errors.username"
                       :touched="validation.touched.username"
                       :disabled="isLoading || !serverAvailable"
                       @blur="handleFieldBlur('username')"
                       @focus="handleFieldFocus('username')">
          <template #prefix>
            <UserIcon class="auth-form__field-icon" />
          </template>
        </AuthFormField>

        <AuthFormField v-model="form.password"
                       :type="showPassword ? 'text' : 'password'"
                       label="Пароль"
                       placeholder="Введите пароль"
                       :error="validation.errors.password"
                       :touched="validation.touched.password"
                       :disabled="isLoading || !serverAvailable"
                       @blur="handleFieldBlur('password')"
                       @focus="handleFieldFocus('password')">
          <template #prefix>
            <LockIcon class="auth-form__field-icon" />
          </template>
          <template #suffix>
            <button type="button"
                    class="auth-form__password-toggle"
                    :title="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
                    tabindex="-1"
                    :disabled="isLoading || !serverAvailable"
                    @click="togglePasswordVisibility">
              <EyeIcon v-if="!showPassword" class="auth-form__toggle-icon" />
              <EyeOffIcon v-else class="auth-form__toggle-icon" />
            </button>
          </template>
        </AuthFormField>
      </div>

      <div class="auth-form__actions">
        <button type="submit"
                :class="['auth-form__submit', {
                  'auth-form__submit--loading': isLoading,
                  'auth-form__submit--disabled': !serverAvailable
                }]"
                :disabled="!isFormValid || isLoading || !serverAvailable"
                :title="!serverAvailable ? 'Сервер недоступен' : ''">
          <span v-if="isLoading" class="auth-form__submit-spinner"></span>
          <span v-if="isLoading">Вход...</span>
          <span v-else>Войти</span>
        </button>

        <button v-if="isLoading" type="button" class="auth-form__cancel" @click="handleCancel">
          Отменить
        </button>
      </div>

      <div v-if="!serverAvailable" class="auth-form__server-warning">
        <InfoIcon />
        <span>Сервер недоступен. Авторизация временно невозможна.</span>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { reactive, ref, computed } from 'vue';
  import { UserIcon, LockIcon, EyeIcon, EyeOffIcon, InfoIcon } from '@/assets/icons';
  import AuthFormField from './AuthFormField.vue';
  import { useAuthValidation } from '../../composables/use-auth-validation';
  import type { AuthValidationErrors } from '../../composables/use-auth-validation';

  interface Props {
    isLoading?: boolean;
    serverAvailable?: boolean;
    initialUsername?: string;
    initialPassword?: string;
  }

  interface Emits {
    (e: 'submit', credentials: { username: string; password: string }): void;
    (e: 'cancel'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    serverAvailable: true,
    initialUsername: '',
    initialPassword: ''
  });

  const emit = defineEmits<Emits>();

  // Состояние формы
  const form = reactive({
    username: props.initialUsername,
    password: props.initialPassword
  });

  const showPassword = ref(false);
  const validation = useAuthValidation();

  // Обработчики
  const handleFieldBlur = (field: string) => {
    validation.markAsTouched(field);
    validateField(field);
  };

  const handleFieldFocus = (field: string) => {
    const errors = validation.errors.value as AuthValidationErrors;
    if (errors[field as keyof AuthValidationErrors]) {
      delete errors[field as keyof AuthValidationErrors];
    }
  };

  const validateField = (field: string) => {
    if (field === 'username') {
      validation.validateField('username', form.username);
    } else if (field === 'password') {
      validation.validateField('password', form.password);
    }
  };

  const togglePasswordVisibility = () => {
    if (!props.isLoading && props.serverAvailable) {
      showPassword.value = !showPassword.value;
    }
  };

  const handleSubmit = () => {
    if (props.isLoading || !isFormValid.value || !props.serverAvailable) return;

    const isValid = validation.validateForm({
      username: form.username,
      password: form.password
    });

    if (isValid) {
      emit('submit', {
        username: form.username.trim(),
        password: form.password
      });
    }
  };

  const handleCancel = () => {
    emit('cancel');
  };

  // Вычисляемые свойства
  const isFormValid = computed(() => {
    const isValid = (
      form.username.trim().length >= 2 &&
      form.password.length >= 3 &&
      validation.isValid.value
    );

    return isValid;
  });

  // Экспоз методы формы
  defineExpose({
    reset: () => {
      form.username = '';
      form.password = '';
      validation.reset();
      showPassword.value = false;
    },
    setValues: (username: string, password: string) => {
      form.username = username;
      form.password = password;
    }
  });
</script>

<style scoped>
  .auth-form {
    width: 100%;
  }

  .auth-form__content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .auth-form__header {
    text-align: center;
    margin-bottom: 8px;
  }

  .auth-form__title {
    font-size: 1.25rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0 0 4px;
  }

  .auth-form__subtitle {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin: 0;
  }

  .auth-form__fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .auth-form__field-icon {
    width: 20px;
    height: 20px;
    color: var(--color-text-muted);
  }

  .auth-form__password-toggle {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: var(--color-text-muted);
    transition: color var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
  }

    .auth-form__password-toggle:hover:not(:disabled) {
      color: var(--color-text-primary);
    }

    .auth-form__password-toggle:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

  .auth-form__toggle-icon {
    width: 20px;
    height: 20px;
  }

  .auth-form__actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .auth-form__submit {
    background: var(--color-primary);
    color: var(--color-text-on-primary);
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-md);
    font-family: var(--font-family-sans);
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
    padding: 12px 16px;
    cursor: pointer;
    transition: all var(--transition-fast);
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
  }

    .auth-form__submit:hover:not(:disabled):not(.auth-form__submit--disabled) {
      background: var(--color-primary-dark);
      border-color: var(--color-primary-dark);
    }

    .auth-form__submit:disabled,
    .auth-form__submit--disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: var(--color-primary);
      border-color: var(--color-primary);
    }

    .auth-form__submit:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
    }

  .auth-form__submit--loading {
    color: transparent;
  }

  .auth-form__submit-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-radius: var(--radius-full);
    border-top-color: transparent;
    animation: spin 1s linear infinite;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .auth-form__cancel {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 0.875rem;
    cursor: pointer;
    padding: 8px;
    transition: color var(--transition-fast);
  }

    .auth-form__cancel:hover {
      color: var(--color-text-primary);
    }

  .auth-form__server-warning {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: color-mix(in srgb, var(--color-warning) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-warning) 30%, transparent);
    border-radius: var(--radius-md);
    color: var(--color-warning-dark);
    font-size: 0.875rem;
  }

    .auth-form__server-warning svg {
      width: 16px;
      height: 16px;
      color: var(--color-warning);
      flex-shrink: 0;
    }

  @keyframes spin {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }

    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .auth-form__submit-spinner {
      animation: none;
    }
  }

  @media (max-width: 640px) {
    .auth-form__title {
      font-size: 1.125rem;
    }

    .auth-form__fields {
      gap: 12px;
    }

    .auth-form__submit {
      padding: 10px 14px;
      min-height: 36px;
    }
  }
</style>
