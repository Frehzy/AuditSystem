/**
 * Плагин для интернационализации (i18n)
 */

import type { App } from 'vue';
import { createI18n } from 'vue-i18n';
import { logger } from '@/core/services/logger/logger.service';
import { useAppStore } from '@/framework/stores';
import type { AppSettings } from '@/framework/stores/core/app/app.types';

// Локализованные сообщения
const messages = {
  ru: {
    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      view: 'Просмотр',
      search: 'Поиск',
      filter: 'Фильтр',
      loading: 'Загрузка...',
      noData: 'Нет данных',
      error: 'Ошибка',
      success: 'Успешно',
      warning: 'Предупреждение',
      confirm: 'Подтвердить'
    },
    auth: {
      login: 'Вход',
      logout: 'Выход',
      username: 'Имя пользователя',
      password: 'Пароль',
      rememberMe: 'Запомнить меня',
      forgotPassword: 'Забыли пароль?',
      loginSuccess: 'Вход выполнен успешно',
      loginFailed: 'Ошибка входа',
      sessionExpired: 'Сессия истекла'
    },
    errors: {
      network: 'Ошибка сети',
      server: 'Ошибка сервера',
      unauthorized: 'Требуется авторизация',
      forbidden: 'Доступ запрещен',
      notFound: 'Ресурс не найден',
      validation: 'Ошибка валидации'
    }
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      noData: 'No data',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      confirm: 'Confirm'
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      username: 'Username',
      password: 'Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      loginSuccess: 'Login successful',
      loginFailed: 'Login failed',
      sessionExpired: 'Session expired'
    },
    errors: {
      network: 'Network error',
      server: 'Server error',
      unauthorized: 'Unauthorized',
      forbidden: 'Forbidden',
      notFound: 'Not found',
      validation: 'Validation error'
    }
  }
};

type Locale = 'ru' | 'en';

const i18n = createI18n({
  legacy: false,
  locale: 'ru' as Locale,
  fallbackLocale: 'en' as Locale,
  messages,
  silentTranslationWarn: true,
  silentFallbackWarn: true
});

export const i18nPlugin = {
  install(app: App) {
    const loggerContext = logger.create('I18nPlugin');
    const appStore = useAppStore();

    app.use(i18n);

    // Устанавливаем локаль из настроек приложения
    const initialLocale = (appStore.settings?.language as Locale) || 'ru';
    i18n.global.locale.value = initialLocale;

    // Реактивно обновляем локаль при изменении настроек
    appStore.$subscribe((mutation, state) => {
      const settings = (state as any).settings as AppSettings | undefined;
      if (settings?.language && settings.language !== i18n.global.locale.value) {
        i18n.global.locale.value = settings.language as Locale;
        loggerContext.info('Language changed', { language: settings.language });
      }
    });

    // Глобальные методы для удобства
    app.config.globalProperties.$t = i18n.global.t;
    app.config.globalProperties.$locale = i18n.global.locale;

    loggerContext.info('I18n plugin installed', { defaultLocale: i18n.global.locale.value });
  }
};

export { i18n };
