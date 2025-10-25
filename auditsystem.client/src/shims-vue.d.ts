// Отключение проверки неиспользуемых переменных для Vue SFC
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

// Глобальные объявления для подавления предупреждений
declare global {
  const __VUE_OPTIONS_API__: boolean
  const __VUE_PROD_DEVTOOLS__: boolean
}
