// src/modules/auth/types/constants.ts

/** Роли пользователей */
export const UserRoles = {
  ADMIN: 'admin',
  USER: 'user',
  AUDITOR: 'auditor',
  GUEST: 'guest',
} as const;

export type UserRole = typeof UserRoles[keyof typeof UserRoles];

/** Коды ошибок аутентификации */
export const AuthErrorCodes = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export type AuthErrorCode = typeof AuthErrorCodes[keyof typeof AuthErrorCodes];

/** Сообщения об ошибках */
export const AuthErrorMessages: Record<AuthErrorCode, string> = {
  [AuthErrorCodes.INVALID_CREDENTIALS]: 'Неверное имя пользователя или пароль',
  [AuthErrorCodes.USER_NOT_FOUND]: 'Пользователь не найден',
  [AuthErrorCodes.ACCOUNT_DISABLED]: 'Учетная запись отключена',
  [AuthErrorCodes.TOKEN_EXPIRED]: 'Срок действия токена истек',
  [AuthErrorCodes.TOKEN_INVALID]: 'Недействительный токен',
  [AuthErrorCodes.NETWORK_ERROR]: 'Ошибка сети. Проверьте подключение',
  [AuthErrorCodes.SERVER_ERROR]: 'Ошибка сервера. Попробуйте позже',
  [AuthErrorCodes.SESSION_EXPIRED]: 'Сессия истекла. Войдите снова',
  [AuthErrorCodes.RATE_LIMIT_EXCEEDED]: 'Слишком много попыток. Попробуйте позже',
};

/** Статусы сервера */
export const ServerStatusEnum = {
  CHECKING: 'checking',
  ONLINE: 'online',
  OFFLINE: 'offline',
} as const;

export type ServerStatus = typeof ServerStatusEnum[keyof typeof ServerStatusEnum];

// Алиас для обратной совместимости
export type ServerStatusType = ServerStatus;

/** Конфигурация проверки здоровья */
export interface HealthCheckConfig {
  checkInterval: number;
  retryInterval: number;
  maxRetries: number;
  timeout: number;
  notifyOnChange: boolean;
}
