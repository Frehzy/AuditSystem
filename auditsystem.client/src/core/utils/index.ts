// Date utilities
export { default as dateUtils } from './date/date.utils';
export { formatRelativeTime, formatTime, formatDateTime } from './date/date.utils';

// URL utilities
export { default as urlUtils } from './url/url.utils';
export { truncateUrl, isValidUrl, parseUrl } from './url/url.utils';

// DOM utilities
export { default as domUtils } from './dom/dom.utils';
export {
  findElement,
  createElement,
  addClass,
  removeClass,
  toggleClass,
  showElement,
  hideElement
} from './dom/dom.utils';

// Text utilities
export { default as textUtils } from './text/text.utils';
export {
  truncateText,
  capitalize,
  toCamelCase,
  escapeHtml,
  countWords,
  formatFileSize
} from './text/text.utils';

// Validation
export { validationRules, Validator } from './validation/validation.rules';
export type { ValidationRule, ValidationResult } from './validation/validation.rules';

// Logger
export { logger } from './logger/logger';
export type { LogLevel, LogEntry } from './logger/logger';
