<template>
  <BaseModal :model-value="show"
             :title="user ? 'Редактирование пользователя' : 'Добавление пользователя'"
             size="md"
             @close="$emit('close')">
    <div class="user-form">
      <div class="form-row">
        <label class="form-label">Название подключения *</label>
        <BaseInput v-model="form.name"
                   placeholder="Мой сервер"
                   size="sm" />
      </div>

      <div class="form-row">
        <label class="form-label">Сервер *</label>
        <BaseInput v-model="form.server"
                   placeholder="server.example.com"
                   size="sm" />
      </div>

      <div class="form-row">
        <label class="form-label">SSH порт *</label>
        <BaseInput v-model.number="form.port"
                   type="number"
                   min="1"
                   max="65535"
                   size="sm"
                   :value="22" />
      </div>

      <div class="form-row">
        <label class="form-label">Имя пользователя *</label>
        <BaseInput v-model="form.username"
                   placeholder="username"
                   size="sm" />
      </div>

      <div class="form-row">
        <label class="form-label">Тип авторизации *</label>
        <BaseSelect v-model="form.authType"
                    :options="authTypeOptions"
                    size="sm" />
      </div>

      <div v-if="form.authType === 'password'" class="form-row">
        <label class="form-label">Пароль *</label>
        <BaseInput v-model="form.password"
                   type="password"
                   placeholder="Введите пароль"
                   size="sm" />
      </div>

      <div v-if="form.authType === 'rsa'" class="form-row">
        <label class="form-label">Приватный RSA ключ *</label>
        <BaseTextarea v-model="form.rsaKey"
                      placeholder="-----BEGIN RSA PRIVATE KEY-----"
                      rows="6"
                      size="sm" />
        <p class="form-hint">
          Вставьте содержимое приватного RSA ключа. Убедитесь, что соответствующий публичный ключ добавлен на сервер.
        </p>
      </div>
    </div>

    <template #footer>
      <div class="dialog-actions">
        <BaseButton @click="$emit('close')"
                    variant="secondary"
                    class="cancel-btn">
          Отмена
        </BaseButton>
        <BaseButton @click="handleSave"
                    variant="primary"
                    :disabled="!canSaveUser"
                    class="save-btn">
          {{ user ? 'Сохранить' : 'Добавить' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import BaseModal from '@/framework/ui/components/overlay/BaseModal.vue';
import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
import BaseTextarea from '@/framework/ui/components/forms/BaseTextarea.vue';
import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
import type { SshUser } from '../../../api/audit.types';

interface Props {
  show: boolean;
  user?: SshUser | null;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'save', userData: any): void;
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const form = ref({
  name: '',
  server: '',
  port: 22,
  username: '',
  authType: 'password' as 'password' | 'rsa',
  password: '',
  rsaKey: ''
});

const authTypeOptions = [
  { value: 'password', label: 'Логин/пароль' },
  { value: 'rsa', label: 'RSA ключ' }
];

const canSaveUser = computed(() => {
  const f = form.value;
  return f.name && f.server && f.username && f.port > 0 &&
    (f.authType === 'password' ? f.password : f.rsaKey);
});

const handleSave = () => {
  emit('save', { ...form.value });
};

// Watch for user prop changes to populate form when editing
watch(() => props.user, (newUser) => {
  if (newUser) {
    form.value = { ...newUser };
  } else {
    // Reset form when adding new user
    form.value = {
      name: '',
      server: '',
      port: 22,
      username: '',
      authType: 'password',
      password: '',
      rsaKey: ''
    };
  }
}, { immediate: true });
</script>

<style scoped>
  .user-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .form-label {
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .form-hint {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin: var(--spacing-xs) 0 0 0;
    line-height: 1.4;
  }

  .dialog-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
  }

  @media (max-width: 768px) {
    .dialog-actions {
      flex-direction: column;
    }

    .cancel-btn,
    .save-btn {
      width: 100%;
    }
  }
</style>
