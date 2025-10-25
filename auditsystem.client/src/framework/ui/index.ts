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

// ========== КОМПОНЕНТЫ ФОРМ ==========
export { default as BaseInput } from './components/forms/BaseInput.vue';
export { default as BaseSelect } from './components/forms/BaseSelect.vue';
export { default as BaseTextarea } from './components/forms/BaseTextarea.vue';
export { default as BaseCheckbox } from './components/forms/BaseCheckbox.vue';
export { default as BaseRadio } from './components/forms/BaseRadio.vue';
export { default as BaseToggle } from './components/forms/BaseToggle.vue';
export { default as BaseSlider } from './components/forms/BaseSlider.vue';
export { default as BaseFileInput } from './components/forms/BaseFileInput.vue';

// ========== КНОПКИ ==========
export { default as BaseButton } from './components/buttons/BaseButton.vue';
export { default as BaseButtonGroup } from './components/buttons/BaseButtonGroup.vue';

// ========== ОБРАТНАЯ СВЯЗЬ ==========
export { default as BaseSpinner } from './components/feedback/BaseSpinner.vue';
export { default as BaseProgress } from './components/feedback/BaseProgress.vue';
export { default as BaseAlert } from './components/feedback/BaseAlert.vue';
export { default as BaseToast } from './components/feedback/BaseToast.vue';
export { default as BaseSkeleton } from './components/feedback/BaseSkeleton.vue';

// ========== ОВЕРЛЕИ ==========
export { default as BaseModal } from './components/overlay/BaseModal.vue';
export { default as BaseDrawer } from './components/overlay/BaseDrawer.vue';
export { default as BaseTooltip } from './components/overlay/BaseTooltip.vue';

// ========== ОТОБРАЖЕНИЕ ДАННЫХ ==========
export { default as BaseBadge } from './components/data-display/BaseBadge.vue';
export { default as BaseCard } from './components/data-display/BaseCard.vue';
export { default as BaseAvatar } from './components/data-display/BaseAvatar.vue';
export { default as BaseTable } from './components/data-display/BaseTable.vue';
export { default as BaseList } from './components/data-display/BaseList.vue';

// ========== НАВИГАЦИЯ ==========
export { default as BasePagination } from './components/navigation/BasePagination.vue';
export { default as BaseTabs } from './components/navigation/BaseTabs.vue';
export { default as BaseBreadcrumb } from './components/navigation/BaseBreadcrumb.vue';
export { default as BaseStepper } from './components/navigation/BaseStepper.vue';

// ========== ЛАЙАУТ ==========
export { default as BaseContainer } from './components/layout/BaseContainer.vue';
export { default as BaseGrid } from './components/layout/BaseGrid.vue';
export { default as BaseDivider } from './components/layout/BaseDivider.vue';
export { default as BaseAccordion } from './components/layout/BaseAccordion.vue';

// ========== ДОПОЛНИТЕЛЬНЫЕ КОМПОНЕНТЫ ==========
export { default as BaseChip } from './components/data-display/BaseChip.vue';
export { default as BaseRating } from './components/feedback/BaseRating.vue';
export { default as BaseTimeline } from './components/data-display/BaseTimeline.vue';

// ========== КОМПОЗАБЛЫ ==========
export { useToast } from './composables/useToast';
export { useModal } from './composables/useModal';
export { useForm } from './composables/useForm';
export { useTheme } from './composables/useTheme';

// ========== ТИПЫ ==========
export type { FormField, ValidationRule, FormOptions } from './types/form';
export type { Notification, NotificationType, NotificationOptions } from './types/notification';
export type { BaseComponentProps, Size, Variant, Placement, ThemeConfig } from './types/common';

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
  install(app: any) {
    // Регистрация всех компонентов глобально
    const components = [
      'BaseInput', 'BaseSelect', 'BaseTextarea', 'BaseCheckbox', 'BaseRadio',
      'BaseToggle', 'BaseSlider', 'BaseFileInput', 'BaseButton', 'BaseButtonGroup',
      'BaseSpinner', 'BaseProgress', 'BaseAlert', 'BaseToast', 'BaseSkeleton',
      'BaseModal', 'BaseDrawer', 'BaseTooltip', 'BaseBadge', 'BaseCard',
      'BaseAvatar', 'BaseTable', 'BaseList', 'BasePagination', 'BaseTabs',
      'BaseBreadcrumb', 'BaseStepper', 'BaseContainer', 'BaseGrid', 'BaseDivider',
      'BaseAccordion', 'BaseChip', 'BaseRating', 'BaseTimeline'
    ];

    components.forEach(component => {
      app.component(component, () => import(`./components/${getComponentPath(component)}`));
    });
  }
};

function getComponentPath(componentName: string): string {
  const componentMap: Record<string, string> = {
    // Forms
    'BaseInput': 'forms/BaseInput.vue',
    'BaseSelect': 'forms/BaseSelect.vue',
    'BaseTextarea': 'forms/BaseTextarea.vue',
    'BaseCheckbox': 'forms/BaseCheckbox.vue',
    'BaseRadio': 'forms/BaseRadio.vue',
    'BaseToggle': 'forms/BaseToggle.vue',
    'BaseSlider': 'forms/BaseSlider.vue',
    'BaseFileInput': 'forms/BaseFileInput.vue',

    // Buttons
    'BaseButton': 'buttons/BaseButton.vue',
    'BaseButtonGroup': 'buttons/BaseButtonGroup.vue',

    // Feedback
    'BaseSpinner': 'feedback/BaseSpinner.vue',
    'BaseProgress': 'feedback/BaseProgress.vue',
    'BaseAlert': 'feedback/BaseAlert.vue',
    'BaseToast': 'feedback/BaseToast.vue',
    'BaseSkeleton': 'feedback/BaseSkeleton.vue',

    // Overlay
    'BaseModal': 'overlay/BaseModal.vue',
    'BaseDrawer': 'overlay/BaseDrawer.vue',
    'BaseTooltip': 'overlay/BaseTooltip.vue',

    // Data Display
    'BaseBadge': 'data-display/BaseBadge.vue',
    'BaseCard': 'data-display/BaseCard.vue',
    'BaseAvatar': 'data-display/BaseAvatar.vue',
    'BaseTable': 'data-display/BaseTable.vue',
    'BaseList': 'data-display/BaseList.vue',

    // Navigation
    'BasePagination': 'navigation/BasePagination.vue',
    'BaseTabs': 'navigation/BaseTabs.vue',
    'BaseBreadcrumb': 'navigation/BaseBreadcrumb.vue',
    'BaseStepper': 'navigation/BaseStepper.vue',

    // Layout
    'BaseContainer': 'layout/BaseContainer.vue',
    'BaseGrid': 'layout/BaseGrid.vue',
    'BaseDivider': 'layout/BaseDivider.vue',
    'BaseAccordion': 'layout/BaseAccordion.vue',

    // Additional components
    'BaseChip': 'data-display/BaseChip.vue',
    'BaseRating': 'feedback/BaseRating.vue',
    'BaseTimeline': 'data-display/BaseTimeline.vue'
  };

  return componentMap[componentName] || '';
}
