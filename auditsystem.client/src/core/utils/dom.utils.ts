// src/core/utils/dom.utils.ts
/**
 * Улучшенные утилиты для работы с DOM
 */

// Типы для улучшенной типобезопасности
export type ElementSelector<T extends HTMLElement = HTMLElement> = string | T;
export type AnimationOptions = KeyframeAnimationOptions & {
  onFinish?: () => void;
  onCancel?: () => void;
};

/**
 * Безопасное получение элемента
 */
export const getElement = <T extends HTMLElement = HTMLElement>(
  selector: ElementSelector<T>
): T | null => {
  if (typeof selector === 'string') {
    return document.querySelector(selector) as T | null;
  }
  return selector;
};

/**
 * Безопасное получение всех элементов
 */
export const getAllElements = <T extends HTMLElement = HTMLElement>(
  selector: string
): T[] => {
  return Array.from(document.querySelectorAll(selector)) as T[];
};

/**
 * Создание элемента с улучшенными опциями
 */
export const createElement = <T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  options: {
    attributes?: Record<string, string>;
    styles?: Partial<CSSStyleDeclaration>;
    classes?: string[];
    children?: (HTMLElement | string)[];
    events?: Record<string, EventListener>;
    dataset?: Record<string, string>;
  } = {}
): HTMLElementTagNameMap[T] => {
  const element = document.createElement(tagName);

  // Установка атрибутов
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  // Установка стилей
  if (options.styles) {
    Object.assign(element.style, options.styles);
  }

  // Добавление классов
  if (options.classes) {
    element.classList.add(...options.classes);
  }

  // Установка dataset
  if (options.dataset) {
    Object.entries(options.dataset).forEach(([key, value]) => {
      element.dataset[key] = value;
    });
  }

  // Добавление обработчиков событий
  if (options.events) {
    Object.entries(options.events).forEach(([event, handler]) => {
      element.addEventListener(event, handler);
    });
  }

  // Добавление дочерних элементов
  if (options.children) {
    options.children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
};

/**
 * Управление классами элемента
 */
export const classList = {
  add: (element: HTMLElement, ...classNames: string[]): void => {
    element.classList.add(...classNames);
  },

  remove: (element: HTMLElement, ...classNames: string[]): void => {
    element.classList.remove(...classNames);
  },

  toggle: (element: HTMLElement, className: string, force?: boolean): void => {
    element.classList.toggle(className, force);
  },

  contains: (element: HTMLElement, className: string): boolean => {
    return element.classList.contains(className);
  },

  replace: (element: HTMLElement, oldClass: string, newClass: string): void => {
    element.classList.replace(oldClass, newClass);
  }
};

/**
 * Управление видимостью элемента
 */
export const visibility = {
  show: (element: HTMLElement, display: string = 'block'): void => {
    element.style.display = display;
  },

  hide: (element: HTMLElement): void => {
    element.style.display = 'none';
  },

  toggle: (element: HTMLElement, display: string = 'block'): void => {
    if (element.style.display === 'none') {
      visibility.show(element, display);
    } else {
      visibility.hide(element);
    }
  },

  isVisible: (element: HTMLElement): boolean => {
    return element.style.display !== 'none' &&
      element.offsetParent !== null &&
      element.getBoundingClientRect().width > 0 &&
      element.getBoundingClientRect().height > 0;
  }
};

/**
 * Управление атрибутами элемента
 */
export const attributes = {
  set: (element: HTMLElement, attributes: Record<string, string>): void => {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  },

  get: (element: HTMLElement, attribute: string): string | null => {
    return element.getAttribute(attribute);
  },

  remove: (element: HTMLElement, ...attributes: string[]): void => {
    attributes.forEach(attr => element.removeAttribute(attr));
  },

  has: (element: HTMLElement, attribute: string): boolean => {
    return element.hasAttribute(attribute);
  }
};

/**
 * Управление data-атрибутами
 */
export const dataset = {
  set: (element: HTMLElement, key: string, value: string): void => {
    element.dataset[key] = value;
  },

  get: (element: HTMLElement, key: string): string | undefined => {
    return element.dataset[key];
  },

  remove: (element: HTMLElement, key: string): void => {
    delete element.dataset[key];
  },

  getAll: (element: HTMLElement): DOMStringMap => {
    return { ...element.dataset };
  }
};

/**
 * Улучшенное управление событиями
 */
export const events = {
  on: (
    element: HTMLElement,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): (() => void) => {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  },

  off: (
    element: HTMLElement,
    event: string,
    handler: EventListener,
    options?: EventListenerOptions
  ): void => {
    element.removeEventListener(event, handler, options);
  },

  once: (
    element: HTMLElement,
    event: string,
    handler: EventListener
  ): void => {
    element.addEventListener(event, handler, { once: true });
  },

  trigger: (element: HTMLElement, event: string, detail?: unknown): void => {
    const customEvent = new CustomEvent(event, { detail });
    element.dispatchEvent(customEvent);
  }
};

/**
 * Анимация элемента с колбэками
 */
export const animate = (
  element: HTMLElement,
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  options: AnimationOptions
): Animation => {
  const animation = element.animate(keyframes, options);

  if (options.onFinish) {
    animation.onfinish = options.onFinish;
  }

  if (options.onCancel) {
    animation.oncancel = options.onCancel;
  }

  return animation;
};

/**
 * Плавная прокрутка
 */
export const scroll = {
  toElement: (
    element: HTMLElement,
    behavior: ScrollBehavior = 'smooth',
    block: ScrollLogicalPosition = 'start',
    inline: ScrollLogicalPosition = 'nearest'
  ): void => {
    element.scrollIntoView({ behavior, block, inline });
  },

  toTop: (behavior: ScrollBehavior = 'smooth'): void => {
    window.scrollTo({ top: 0, behavior });
  },

  toPosition: (x: number, y: number, behavior: ScrollBehavior = 'smooth'): void => {
    window.scrollTo({ top: y, left: x, behavior });
  }
};

/**
 * Проверка видимости элемента
 */
export const isInViewport = (element: HTMLElement, partial: boolean = false): boolean => {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  if (partial) {
    return (
      rect.top <= windowHeight &&
      rect.bottom >= 0 &&
      rect.left <= windowWidth &&
      rect.right >= 0
    );
  }

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= windowHeight &&
    rect.right <= windowWidth
  );
};

/**
 * Получение позиции элемента
 */
export const getPosition = (element: HTMLElement): DOMRect => {
  return element.getBoundingClientRect();
};

/**
 * Получение относительной позиции элемента
 */
export const getOffset = (element: HTMLElement): { top: number; left: number } => {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset
  };
};

export default {
  getElement,
  getAllElements,
  createElement,
  classList,
  visibility,
  attributes,
  dataset,
  events,
  animate,
  scroll,
  isInViewport,
  getPosition,
  getOffset
};
