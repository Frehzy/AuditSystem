// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { logger } from '@/core/utils/logger';
import { mockService } from '@/core/services/mock/mock.service';
import { APP_CONFIG } from '@/core/config/app.config';
import './assets/styles/theme.css'

/**
 * Инициализация приложения
 */
const initializeApp = async () => {
  try {
    // Инициализация mock service в development режиме
    if (APP_CONFIG.APP.ENV === 'development' && APP_CONFIG.FEATURES.USE_MOCK) {
      mockService.enable();
      console.log('🔧 Mock service enabled - using mock data');
    }

    // Создание экземпляра приложения
    const app = createApp(App);
    const pinia = createPinia();

    // Регистрация плагинов
    app.use(pinia);
    app.use(router);

    // Глобальные свойства для отладки
    if (import.meta.env.DEV) {
      app.config.globalProperties.$logger = logger;
    }

    // Глобальная обработка ошибок Vue
    app.config.errorHandler = (err: unknown, _instance: unknown, info: string) => {
      console.error('Vue error:', err, info);
      logger.error('Vue error occurred', { error: err, info });
    };

    // Монтирование приложения
    await router.isReady();
    app.mount('#app');

    logger.info('Application initialized successfully', {
      environment: import.meta.env.MODE,
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      mockEnabled: mockService.isMockEnabled()
    });

  } catch (error: unknown) {
    logger.error('Failed to initialize application', { error });

    // Fallback UI для критических ошибок инициализации
    const fallbackElement = document.getElementById('app');
    if (fallbackElement) {
      fallbackElement.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
          text-align: center;
          font-family: system-ui, sans-serif;
        ">
          <div>
            <h1 style="color: #dc2626; margin-bottom: 1rem;">Ошибка загрузки приложения</h1>
            <p style="color: #6b7280; margin-bottom: 2rem;">
              Не удалось загрузить приложение. Пожалуйста, обновите страницу.
            </p>
            <button onclick="window.location.reload()" style="
              background: #3b82f6;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
            ">
              Обновить страницу
            </button>
          </div>
        </div>
      `;
    }
  }
};

// Запуск инициализации
initializeApp();

// Глобальная обработка неперехваченных ошибок
window.addEventListener('error', (event) => {
  logger.error('Unhandled error', {
    message: event.error?.message,
    stack: event.error?.stack,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', {
    reason: event.reason?.message || event.reason,
    stack: event.reason?.stack
  });
});
