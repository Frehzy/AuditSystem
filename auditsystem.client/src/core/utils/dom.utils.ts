// src/core/utils/dom.utils.ts

import type { ElementSelector, AnimationOptions, CreateElementOptions } from './types';

/**
 * Улучшенные утилиты для работы с DOM
 */

// Кэш для производительности
const elementCache = new Map<string, HTMLElement>();

/**
 * Безопасное получение элемента с кэшированием
 */
export const getElement = <T extends HTMLElement = HTMLElement>(
  selector: ElementSelector<T>,
  useCache: boolean = true
): T | null => {
  try {
    if (typeof selector === 'string') {
      if (useCache && elementCache.has(selector)) {
        return elementCache.get(selector) as T;
      }

      const element = document.querySelector(selector) as T | null;
      if (element && useCache) {
        elementCache.set(selector, element);
      }
      return element;
    }

    // Для DocumentFragment возвращаем null, так как это не HTMLElement
    if (selector instanceof DocumentFragment) {
      return null;
    }

    return selector as T;
  } catch (error) {
    console.warn('Error getting element:', error);
    return null;
  }
};

/**
 * Безопасное получение всех элементов
 */
export const getAllElements = <T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: Element | Document = document
): T[] => {
  try {
    return Array.from(parent.querySelectorAll(selector)) as T[];
  } catch (error) {
    console.warn('Error getting all elements:', error);
    return [];
  }
};

/**
 * Создание элемента с улучшенными опциями и безопасностью
 */
export const createElement = <T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  options: CreateElementOptions<T> = {}
): HTMLElementTagNameMap[T] => {
  try {
    const element = document.createElement(tagName);

    // Установка атрибутов с валидацией
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== false) {
          const stringValue = value === true ? '' : String(value);
          element.setAttribute(key, stringValue);
        }
      });
    }

    // Установка стилей с валидацией
    if (options.styles) {
      Object.entries(options.styles).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          (element.style as any)[key] = value;
        }
      });
    }

    // Добавление классов с валидацией
    if (options.classes) {
      const validClasses = options.classes.filter(className =>
        className && typeof className === 'string'
      );
      if (validClasses.length > 0) {
        element.classList.add(...validClasses);
      }
    }

    // Установка dataset
    if (options.dataset) {
      Object.entries(options.dataset).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          element.dataset[key] = String(value);
        }
      });
    }

    // Добавление обработчиков событий
    if (options.events) {
      Object.entries(options.events).forEach(([event, handler]) => {
        if (typeof handler === 'function') {
          element.addEventListener(event, handler);
        }
      });
    }

    // Добавление дочерних элементов
    if (options.children) {
      options.children.forEach(child => {
        if (child instanceof Node) {
          element.appendChild(child);
        } else if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        }
      });
    }

    // Установка innerHTML или textContent
    if (options.innerHTML) {
      element.innerHTML = options.innerHTML;
    } else if (options.textContent) {
      element.textContent = options.textContent;
    }

    // Создание Shadow DOM если требуется
    if (options.shadowRoot) {
      const shadow = element.attachShadow({ mode: 'open' });
      if (options.children) {
        options.children.forEach(child => {
          if (child instanceof Node) {
            shadow.appendChild(child.cloneNode(true));
          } else if (typeof child === 'string') {
            shadow.appendChild(document.createTextNode(child));
          }
        });
      }
    }

    return element;
  } catch (error) {
    console.error('Error creating element:', error);
    throw error;
  }
};

/**
 * Управление классами элемента с улучшенной производительностью
 */
export const classList = {
  add: (element: HTMLElement, ...classNames: string[]): void => {
    const validClasses = classNames.filter(name => name && typeof name === 'string');
    if (validClasses.length > 0) {
      element.classList.add(...validClasses);
    }
  },

  remove: (element: HTMLElement, ...classNames: string[]): void => {
    classNames.forEach(className => {
      if (className) {
        element.classList.remove(className);
      }
    });
  },

  toggle: (
    element: HTMLElement,
    className: string,
    force?: boolean
  ): boolean => {
    if (!className) return false;
    return element.classList.toggle(className, force);
  },

  contains: (element: HTMLElement, className: string): boolean => {
    return className ? element.classList.contains(className) : false;
  },

  replace: (element: HTMLElement, oldClass: string, newClass: string): boolean => {
    if (!oldClass || !newClass) return false;

    if (element.classList.contains(oldClass)) {
      element.classList.remove(oldClass);
      element.classList.add(newClass);
      return true;
    }
    return false;
  },

  toggleMultiple: (element: HTMLElement, classes: string[], force?: boolean): void => {
    classes.forEach(className => {
      if (className) {
        element.classList.toggle(className, force);
      }
    });
  }
};

/**
 * Управление видимостью элемента с улучшенными опциями
 */
export const visibility = {
  show: (
    element: HTMLElement,
    display: string = 'block',
    important: boolean = false
  ): void => {
    if (important) {
      element.style.setProperty('display', display, 'important');
    } else {
      element.style.display = display;
    }
  },

  hide: (element: HTMLElement, important: boolean = false): void => {
    if (important) {
      element.style.setProperty('display', 'none', 'important');
    } else {
      element.style.display = 'none';
    }
  },

  toggle: (
    element: HTMLElement,
    display: string = 'block',
    important: boolean = false
  ): void => {
    if (visibility.isVisible(element)) {
      visibility.hide(element, important);
    } else {
      visibility.show(element, display, important);
    }
  },

  isVisible: (element: HTMLElement): boolean => {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    return style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      element.offsetParent !== null &&
      element.getBoundingClientRect().width > 0 &&
      element.getBoundingClientRect().height > 0;
  },

  isHidden: (element: HTMLElement): boolean => {
    return !visibility.isVisible(element);
  }
};

/**
 * Управление атрибутами элемента с улучшенной безопасностью
 */
export const attributes = {
  set: (element: HTMLElement, attributes: Record<string, string | number | boolean>): void => {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== false) {
        const stringValue = value === true ? '' : String(value);
        element.setAttribute(key, stringValue);
      }
    });
  },

  get: (element: HTMLElement, attribute: string): string | null => {
    return element.getAttribute(attribute);
  },

  remove: (element: HTMLElement, ...attributes: string[]): void => {
    attributes.forEach(attr => {
      if (attr) {
        element.removeAttribute(attr);
      }
    });
  },

  has: (element: HTMLElement, attribute: string): boolean => {
    return attribute ? element.hasAttribute(attribute) : false;
  },

  toggle: (element: HTMLElement, attribute: string, value?: string): boolean => {
    if (!attribute) return false;

    if (attributes.has(element, attribute)) {
      attributes.remove(element, attribute);
      return false;
    } else {
      element.setAttribute(attribute, value || '');
      return true;
    }
  }
};

/**
 * Управление data-атрибутами с улучшенной типобезопасностью
 */
export const dataset = {
  set: (element: HTMLElement, key: string, value: string | number | boolean): void => {
    if (value !== null && value !== undefined) {
      element.dataset[key] = String(value);
    }
  },

  get: (element: HTMLElement, key: string): string | undefined => {
    return element.dataset[key];
  },

  remove: (element: HTMLElement, key: string): void => {
    delete element.dataset[key];
  },

  getAll: (element: HTMLElement): DOMStringMap => {
    return { ...element.dataset };
  },

  has: (element: HTMLElement, key: string): boolean => {
    return key in element.dataset;
  }
};

/**
 * Улучшенное управление событиями с автоматической очисткой
 */
export const events = {
  on: (
    element: HTMLElement | Window | Document,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions
  ): (() => void) => {
    element.addEventListener(event, handler, options);

    // Возвращаем функцию для удаления
    return () => {
      element.removeEventListener(event, handler, options);
    };
  },

  off: (
    element: HTMLElement | Window | Document,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: EventListenerOptions
  ): void => {
    element.removeEventListener(event, handler, options);
  },

  once: (
    element: HTMLElement | Window | Document,
    event: string,
    handler: EventListener
  ): void => {
    element.addEventListener(event, handler, { once: true });
  },

  trigger: (
    element: HTMLElement,
    event: string,
    detail?: unknown,
    options: CustomEventInit = {}
  ): boolean => {
    try {
      const customEvent = new CustomEvent(event, {
        bubbles: true,
        cancelable: true,
        ...options,
        detail
      });
      return element.dispatchEvent(customEvent);
    } catch (error) {
      console.warn('Error triggering event:', error);
      return false;
    }
  },

  delegate: (
    parent: HTMLElement,
    selector: string,
    event: string,
    handler: (target: HTMLElement, event: Event) => void,
    options?: AddEventListenerOptions
  ): (() => void) => {
    const eventHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      const matchingElement = target.closest(selector);

      if (matchingElement && parent.contains(matchingElement)) {
        handler(matchingElement as HTMLElement, e);
      }
    };

    return events.on(parent, event, eventHandler, options);
  }
};

/**
 * Анимация элемента с улучшенными опциями и fallback
 */
export const animate = (
  element: HTMLElement,
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  options: AnimationOptions
): Animation | null => {
  try {
    if (!element.animate) {
      // Fallback для старых браузеров
      if (options.onFinish) {
        const duration = typeof options.duration === 'number' ? options.duration : 0;
        setTimeout(options.onFinish, duration);
      }
      return null;
    }

    const animation = element.animate(keyframes, options);

    if (options.onFinish) {
      animation.onfinish = options.onFinish;
    }

    if (options.onCancel) {
      animation.oncancel = options.onCancel;
    }

    if (options.onReady) {
      animation.ready.then(options.onReady);
    }

    return animation;
  } catch (error) {
    console.warn('Error creating animation:', error);
    return null;
  }
};

/**
 * Плавная прокрутка с улучшенными опциями
 */
export const scroll = {
  toElement: (
    element: HTMLElement,
    behavior: ScrollBehavior = 'smooth',
    block: ScrollLogicalPosition = 'start',
    inline: ScrollLogicalPosition = 'nearest',
    offset: number = 0
  ): void => {
    const elementRect = element.getBoundingClientRect();
    const absolutePosition = elementRect.top + window.pageYOffset - offset;

    window.scrollTo({
      top: absolutePosition,
      behavior
    });
  },

  toTop: (behavior: ScrollBehavior = 'smooth'): void => {
    window.scrollTo({ top: 0, behavior });
  },

  toBottom: (behavior: ScrollBehavior = 'smooth'): void => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
  },

  toPosition: (x: number, y: number, behavior: ScrollBehavior = 'smooth'): void => {
    window.scrollTo({ top: y, left: x, behavior });
  },

  toSelector: (selector: string, behavior: ScrollBehavior = 'smooth'): boolean => {
    const element = getElement(selector);
    if (element) {
      scroll.toElement(element, behavior);
      return true;
    }
    return false;
  }
};

/**
 * Проверка видимости элемента с улучшенной точностью
 */
export const isInViewport = (
  element: HTMLElement,
  options: {
    partial?: boolean;
    threshold?: number;
    direction?: 'vertical' | 'horizontal' | 'both';
  } = {}
): boolean => {
  const { partial = false, threshold = 0, direction = 'both' } = options;

  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
  const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);

  const elementHeight = rect.height;
  const elementWidth = rect.width;

  let verticalVisible = false;
  let horizontalVisible = false;

  if (partial) {
    verticalVisible = visibleHeight > threshold;
    horizontalVisible = visibleWidth > threshold;
  } else {
    verticalVisible = visibleHeight >= elementHeight * (1 - threshold);
    horizontalVisible = visibleWidth >= elementWidth * (1 - threshold);
  }

  switch (direction) {
    case 'vertical':
      return verticalVisible;
    case 'horizontal':
      return horizontalVisible;
    case 'both':
    default:
      return verticalVisible && horizontalVisible;
  }
};

/**
 * Получение позиции элемента с улучшенной точностью
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

/**
 * Измерение производительности DOM операций
 */
export const measure = {
  layout: (callback: () => void): number => {
    const start = performance.now();
    callback();
    return performance.now() - start;
  },

  repaint: async (callback: () => void): Promise<number> => {
    const start = performance.now();

    // Принудительный reflow для точного измерения
    document.body.offsetHeight;

    callback();

    // Ждем следующего frame для измерения repaint
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        resolve(performance.now() - start);
      });
    });
  }
};

/**
 * Очистка кэша элементов
 */
export const clearElementCache = (selector?: string): void => {
  if (selector) {
    elementCache.delete(selector);
  } else {
    elementCache.clear();
  }
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
  getOffset,
  measure,
  clearElementCache
};
