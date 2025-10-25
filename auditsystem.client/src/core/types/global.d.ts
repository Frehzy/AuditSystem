// src/core/types/global.d.ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENV: string;
}

// Используем type вместо interface для глобальных объявлений
declare global {
  type AppWindow = Window & {
    __APP_CONFIG__?: Record<string, unknown>;
    __VUE_DEVTOOLS_GLOBAL_HOOK__?: {
      emit?: (event: string, payload: unknown) => void;
    };
  };
}

// Экспортируем типы для использования в других модулях
export { ImportMetaEnv };
