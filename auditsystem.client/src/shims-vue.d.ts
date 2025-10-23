declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Для Vue 3
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $logger: {
      debug: (message: string, data?: any) => void;
      info: (message: string, data?: any) => void;
      warn: (message: string, data?: any) => void;
      error: (message: string, data?: any) => void;
    };
  }
}

export { }
