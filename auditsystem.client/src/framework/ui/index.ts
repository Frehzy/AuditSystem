// src/framework/ui/index.ts
/**
 * UI Framework - главный файл экспорта компонентов
 * 
 * @description
 * Единая точка входа для всех UI компонентов системы.
 * Компоненты сгруппированы по функциональности для удобства импорта.
 * 
 * @example
 * // Импорт отдельных компонентов
 * import { BaseButton, BaseInput } from '@/framework/ui'
 * 
 * // Импорт композаблов
 * import { useToast, useForm } from '@/framework/ui'
*/

// ========== КНОПКИ ==========
export { default as BaseButton } from './components/buttons/BaseButton.vue';
export { default as BaseButtonGroup } from './components/buttons/BaseButtonGroup.vue';

// ========== ОТОБРАЖЕНИЕ ДАННЫХ ==========
export { default as BaseAvatar } from './components/data-display/BaseAvatar.vue';
export { default as BaseCard } from './components/data-display/BaseCard.vue';
export { default as BaseChip } from './components/data-display/BaseChip.vue';
export { default as BaseList } from './components/data-display/BaseList.vue';
export { default as BaseTable } from './components/data-display/BaseTable.vue';
export { default as BaseTimeline } from './components/data-display/BaseTimeline.vue';

// ========== ОБРАТНАЯ СВЯЗЬ ==========
export { default as BaseAlert } from './components/feedback/BaseAlert.vue';
export { default as BaseProgress } from './components/feedback/BaseProgress.vue';
export { default as BaseRating } from './components/feedback/BaseRating.vue';
export { default as BaseSkeleton } from './components/feedback/BaseSkeleton.vue';
export { default as BaseSpinner } from './components/feedback/BaseSpinner.vue';
export { default as BaseToast } from './components/feedback/BaseToast.vue';

// ========== КОМПОНЕНТЫ ФОРМ ==========
export { default as BaseCheckbox } from './components/forms/BaseCheckbox.vue';
export { default as BaseFileInput } from './components/forms/BaseFileInput.vue';
export { default as BaseInput } from './components/forms/BaseInput.vue';
export { default as BaseRadio } from './components/forms/BaseRadio.vue';
export { default as BaseSelect } from './components/forms/BaseSelect.vue';
export { default as BaseSlider } from './components/forms/BaseSlider.vue';
export { default as BaseTextarea } from './components/forms/BaseTextarea.vue';
export { default as BaseToggle } from './components/forms/BaseToggle.vue';

// ========== ЛАЙАУТ ==========
export { default as BaseAccordion } from './components/layout/BaseAccordion.vue';
export { default as BaseContainer } from './components/layout/BaseContainer.vue';
export { default as BaseDivider } from './components/layout/BaseDivider.vue';
export { default as BaseGrid } from './components/layout/BaseGrid.vue';

// ========== НАВИГАЦИЯ ==========
export { default as BaseBreadcrumb } from './components/navigation/BaseBreadcrumb.vue';
export { default as BasePagination } from './components/navigation/BasePagination.vue';
export { default as BaseStepper } from './components/navigation/BaseStepper.vue';
export { default as BaseTabs } from './components/navigation/BaseTabs.vue';

// ========== ОВЕРЛЕИ ==========
export { default as BaseDrawer } from './components/overlay/BaseDrawer.vue';
export { default as BaseModal } from './components/overlay/BaseModal.vue';
export { default as BaseTooltip } from './components/overlay/BaseTooltip.vue';

// ========== КОМПОЗАБЛЫ ==========
export { useToast } from './composables/useToast';
export { useModal } from './composables/useModal';
export { useForm } from './composables/useForm';
export { useTheme } from './composables/useTheme';

// ========== ТИПЫ ==========
export type { FormField, ValidationRule, FormOptions } from './composables/useForm';
export type { Toast, ToastOptions } from './composables/useToast';
export type { Size, Variant, Placement } from './types/common';

// ========== УТИЛИТЫ ==========
/**
 * Плагин для глобальной регистрации всех компонентов
 * 
 * @example
 * // main.ts
 * import { createApp } from 'vue'
 * import { UIPlugin } from '@/framework/ui'
 * 
 * const app = createApp(App)
 * app.use(UIPlugin)
 */
export const UIPlugin = {
  install(app: { component: (name: string, component: unknown) => void }) {
    // Регистрация всех компонентов глобально
    const components = [
      'BaseInput', 'BaseSelect', 'BaseTextarea', 'BaseCheckbox', 'BaseRadio',
      'BaseToggle', 'BaseSlider', 'BaseFileInput', 'BaseButton', 'BaseButtonGroup',
      'BaseSpinner', 'BaseProgress', 'BaseAlert', 'BaseToast', 'BaseSkeleton',
      'BaseModal', 'BaseDrawer', 'BaseTooltip', 'BaseCard', 'BaseAvatar',
      'BaseTable', 'BaseList', 'BasePagination', 'BaseBreadcrumb',
      'BaseContainer', 'BaseGrid', 'BaseDivider', 'BaseAccordion',
      'BaseChip', 'BaseRating', 'BaseTimeline', 'BaseStepper', 'BaseTabs'
    ];

    // Исправленная функция для получения путей компонентов
    const getComponent = async (componentName: string) => {
      const componentMap: Record<string, () => Promise<unknown>> = {
        // Buttons
        'BaseButton': () => import('./components/buttons/BaseButton.vue'),
        'BaseButtonGroup': () => import('./components/buttons/BaseButtonGroup.vue'),

        // Data Display
        'BaseCard': () => import('./components/data-display/BaseCard.vue'),
        'BaseAvatar': () => import('./components/data-display/BaseAvatar.vue'),
        'BaseTable': () => import('./components/data-display/BaseTable.vue'),
        'BaseList': () => import('./components/data-display/BaseList.vue'),
        'BaseChip': () => import('./components/data-display/BaseChip.vue'),
        'BaseTimeline': () => import('./components/data-display/BaseTimeline.vue'),

        // Feedback
        'BaseSpinner': () => import('./components/feedback/BaseSpinner.vue'),
        'BaseProgress': () => import('./components/feedback/BaseProgress.vue'),
        'BaseAlert': () => import('./components/feedback/BaseAlert.vue'),
        'BaseToast': () => import('./components/feedback/BaseToast.vue'),
        'BaseSkeleton': () => import('./components/feedback/BaseSkeleton.vue'),
        'BaseRating': () => import('./components/feedback/BaseRating.vue'),

        // Forms
        'BaseInput': () => import('./components/forms/BaseInput.vue'),
        'BaseSelect': () => import('./components/forms/BaseSelect.vue'),
        'BaseTextarea': () => import('./components/forms/BaseTextarea.vue'),
        'BaseCheckbox': () => import('./components/forms/BaseCheckbox.vue'),
        'BaseRadio': () => import('./components/forms/BaseRadio.vue'),
        'BaseToggle': () => import('./components/forms/BaseToggle.vue'),
        'BaseSlider': () => import('./components/forms/BaseSlider.vue'),
        'BaseFileInput': () => import('./components/forms/BaseFileInput.vue'),

        // Layout
        'BaseContainer': () => import('./components/layout/BaseContainer.vue'),
        'BaseGrid': () => import('./components/layout/BaseGrid.vue'),
        'BaseDivider': () => import('./components/layout/BaseDivider.vue'),
        'BaseAccordion': () => import('./components/layout/BaseAccordion.vue'),

        // Navigation
        'BaseBreadcrumb': () => import('./components/navigation/BaseBreadcrumb.vue'),
        'BasePagination': () => import('./components/navigation/BasePagination.vue'),
        'BaseStepper': () => import('./components/navigation/BaseStepper.vue'),
        'BaseTabs': () => import('./components/navigation/BaseTabs.vue'),

        // Overlay
        'BaseDrawer': () => import('./components/overlay/BaseDrawer.vue'),
        'BaseModal': () => import('./components/overlay/BaseModal.vue'),
        'BaseTooltip': () => import('./components/overlay/BaseTooltip.vue'),
      };

      const importFn = componentMap[componentName];
      if (importFn) {
        const component = await importFn();
        return component;
      }
      return null;
    };

    components.forEach(componentName => {
      app.component(componentName, {
        async setup() {
          const component = await getComponent(componentName);
          return component ? (component as { setup?: () => unknown }).setup : () => { };
        },
        template: '<div>Loading...</div>'
      });
    });
  }
};
