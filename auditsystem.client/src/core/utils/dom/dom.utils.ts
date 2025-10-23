/**
 * Утилиты для работы с DOM
 */

/**
 * Поиск элемента в DOM
 */
export const findElement = <T extends HTMLElement>(selector: string): T | null => {
  return document.querySelector(selector) as T | null;
};

/**
 * Поиск всех элементов в DOM
 */
export const findAllElements = <T extends HTMLElement>(selector: string): T[] => {
  return Array.from(document.querySelectorAll(selector)) as T[];
};

/**
 * Создание элемента
 */
export const createElement = <T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  attributes: Record<string, string> = {},
  children: (HTMLElement | string)[] = []
): HTMLElementTagNameMap[T] => {
  const element = document.createElement(tagName);

  // Установка атрибутов
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  // Добавление дочерних элементов
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });

  return element;
};

/**
 * Добавление класса к элементу
 */
export const addClass = (element: HTMLElement, className: string): void => {
  element.classList.add(className);
};

/**
 * Удаление класса из элемента
 */
export const removeClass = (element: HTMLElement, className: string): void => {
  element.classList.remove(className);
};

/**
 * Переключение класса элемента
 */
export const toggleClass = (element: HTMLElement, className: string, force?: boolean): void => {
  element.classList.toggle(className, force);
};

/**
 * Проверка наличия класса
 */
export const hasClass = (element: HTMLElement, className: string): boolean => {
  return element.classList.contains(className);
};

/**
 * Установка стилей элемента
 */
export const setStyles = (element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void => {
  Object.assign(element.style, styles);
};

/**
 * Показать элемент
 */
export const showElement = (element: HTMLElement, display: string = 'block'): void => {
  element.style.display = display;
};

/**
 * Скрыть элемент
 */
export const hideElement = (element: HTMLElement): void => {
  element.style.display = 'none';
};

/**
 * Переключение видимости элемента
 */
export const toggleVisibility = (element: HTMLElement, display: string = 'block'): void => {
  if (element.style.display === 'none') {
    showElement(element, display);
  } else {
    hideElement(element);
  }
};

/**
 * Получение вычисленных стилей элемента
 */
export const getComputedStyle = (element: HTMLElement, property?: string): any => {
  const computed = window.getComputedStyle(element);
  return property ? computed.getPropertyValue(property) : computed;
};

/**
 * Установка атрибутов элемента
 */
export const setAttributes = (element: HTMLElement, attributes: Record<string, string>): void => {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

/**
 * Получение данных атрибута
 */
export const getDataAttribute = (element: HTMLElement, key: string): string | null => {
  return element.getAttribute(`data-${key}`);
};

/**
 * Установка данных атрибута
 */
export const setDataAttribute = (element: HTMLElement, key: string, value: string): void => {
  element.setAttribute(`data-${key}`, value);
};

/**
 * Удаление данных атрибута
 */
export const removeDataAttribute = (element: HTMLElement, key: string): void => {
  element.removeAttribute(`data-${key}`);
};

/**
 * Добавление обработчика событий
 */
export const addEventListener = (
  element: HTMLElement,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): () => void => {
  element.addEventListener(event, handler, options);

  // Возвращаем функцию для удаления обработчика
  return () => {
    element.removeEventListener(event, handler, options);
  };
};

/**
 * Анимация элемента
 */
export const animateElement = (
  element: HTMLElement,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: KeyframeAnimationOptions
): Animation => {
  return element.animate(keyframes, options);
};

/**
 * Плавная прокрутка к элементу
 */
export const scrollToElement = (
  element: HTMLElement,
  behavior: ScrollBehavior = 'smooth',
  block: ScrollLogicalPosition = 'start',
  inline: ScrollLogicalPosition = 'nearest'
): void => {
  element.scrollIntoView({ behavior, block, inline });
};

/**
 * Проверка видимости элемента в viewport
 */
export const isElementInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Получение позиции элемента относительно документа
 */
export const getElementOffset = (element: HTMLElement): { top: number; left: number } => {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset
  };
};

export default {
  findElement,
  findAllElements,
  createElement,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  setStyles,
  showElement,
  hideElement,
  toggleVisibility,
  getComputedStyle,
  setAttributes,
  getDataAttribute,
  setDataAttribute,
  removeDataAttribute,
  addEventListener,
  animateElement,
  scrollToElement,
  isElementInViewport,
  getElementOffset
};
