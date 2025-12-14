<!-- src/modules/auth/components/auth-form/AuthForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" class="auth-form" novalidate>
    <div class="auth-form__content">
      <slot name="header">
        <div class="auth-form__header">
          <h2 class="auth-form__title">Вход в систему</h2>
          <p class="auth-form__subtitle">Введите свои учетные данные</p>
        </div>
      </slot>

      <div class="auth-form__fields">
        <slot name="fields">
          <AuthFormField v-model="form.username"
                         label="Имя пользователя"
                         placeholder="user123"
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
                         placeholder="••••••••"
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
                      @click="togglePasswordVisibility"
                      class="auth-form__password-toggle"
                      :title="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
                      tabindex="-1">
                <EyeIcon v-if="!showPassword" class="auth-form__toggle-icon" />
                <EyeOffIcon v-else class="auth-form__toggle-icon" />
              </button>
            </template>
          </AuthFormField>
        </slot>
      </div>

      <slot name="actions">
        <div class="auth-form__actions">
          <BaseButton type="submit"
                      :loading="isLoading"
                      :disabled="!isFormValid || !serverAvailable"
                      variant="primary"
                      size="lg"
                      full-width
                      class="auth-form__submit">
            <span v-if="isLoading">Вход...</span>
            <span v-else>Войти</span>
          </BaseButton>

          <button v-if="isLoading"
                  type="button"
                  @click="handleCancel"
                  class="auth-form__cancel">
            Отменить
          </button>
        </div>
      </slot>

      <slot name="error">
        <AuthFormError v-if="errorMessage"
                       :message="errorMessage"
                       @dismiss="clearError"
                       class="auth-form__error" />
      </slot>

      <slot name="footer">
        <div class="auth-form__footer">
          <slot name="links"></slot>
        </div>
      </slot>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { reactive, ref, watch, computed } from 'vue';
  import { BaseButton } from '@/framework/ui';
  import { UserIcon, LockIcon, EyeIcon, EyeOffIcon } from '@/assets/icons';
  import AuthFormField from './AuthFormField.vue';
  import AuthFormError from './AuthFormError.vue';
  import { useAuthValidation } from '../../composables/use-auth-validation';
  import type { AuthValidationErrors } from '../../types';

  interface Props {
    isLoading?: boolean;
    error?: string | null;
    serverAvailable?: boolean;
    initialUsername?: string;
    initialPassword?: string;
  }

  interface Emits {
    (e: 'submit', credentials: { username: string; password: string }): void;
    (e: 'cancel'): void;
    (e: 'clear-error'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    error: null,
    serverAvailable: true,
    initialUsername: '',
    initialPassword: '',
  });

  const emit = defineEmits<Emits>();

  // Состояние формы
  const form = reactive({
    username: props.initialUsername,
    password: props.initialPassword,
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
    showPassword.value = !showPassword.value;
  };

  const handleSubmit = () => {
    if (!props.serverAvailable) return;

    const isValid = validation.validateForm({
      username: form.username,
      password: form.password,
    });

    if (isValid) {
      emit('submit', {
        username: form.username.trim(),
        password: form.password,
      });
    }
  };

  const handleCancel = () => {
    emit('cancel');
  };

  const clearError = () => {
    emit('clear-error');
  };

  // Вычисляемые свойства
  const isFormValid = computed(() => {
    return form.username.trim().length > 0 &&
      form.password.length > 0 &&
      validation.isValid.value;
  });

  const errorMessage = computed(() => {
    return props.error || (validation.errors.value as AuthValidationErrors).general;
  });

  // Реакция на изменение начальных значений
  watch(
    () => props.initialUsername,
    (value) => {
      form.username = value;
    }
  );

  watch(
    () => props.initialPassword,
    (value) => {
      form.password = value;
    }
  );

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
    },
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
    margin-bottom: var(--spacing-sm);
  }

  .auth-form__title {
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-xs);
  }

  .auth-form__subtitle {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin: 0;
  }

  .auth-form__fields {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .auth-form__field-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-text-muted);
  }

  .auth-form__password-toggle {
    background: none;
    border: none;
    padding: var(--spacing-xs);
    cursor: pointer;
    color: var(--color-text-muted);
    transition: color var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
  }

    .auth-form__password-toggle:hover {
      color: var(--color-text-primary);
    }

  .auth-form__toggle-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .auth-form__actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .auth-form__submit {
    min-height: 3rem;
  }

  .auth-form__cancel {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 0.875rem;
    cursor: pointer;
    padding: var(--spacing-sm);
    transition: color var(--transition-fast);
  }

    .auth-form__cancel:hover {
      color: var(--color-text-primary);
    }

  .auth-form__error {
    margin-top: var(--spacing-sm);
  }

  .auth-form__footer {
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--color-border);
  }
</style>
