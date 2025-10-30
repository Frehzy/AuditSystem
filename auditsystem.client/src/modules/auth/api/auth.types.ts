// ==================== CORE TYPES ====================

export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  isActive?: boolean;
  avatar?: string;
  permissions?: string[];
}

// ==================== REQUEST TYPES ====================

export interface LoginCommand {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LogoutCommand {
  userId: string;
  token: string;
}

export interface ValidateTokenRequest {
  token: string;
}

// ==================== RESPONSE TYPES ====================

// Базовый интерфейс для ответов API (соответствует бэкенду Result<T>)
export interface ApiResponse<T = unknown> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: string[];
  timestamp: string;
  statusCode?: number;
}

// Тип для успешного ответа от бэкенда
export interface Result<T> {
  succeeded: boolean;
  data?: T;
  errors?: string[];
  message?: string;
}

// Прямой ответ от бекенда (без обертки)
export interface LoginResponseData {
  token: string;
  refreshToken?: string;
  expiresAt: string;
  user: UserDto;
}

// Типы для обернутых ответов (если бекенд использует стандартную обертку)
export type LoginResponse = Result<LoginResponseData>;
export type ValidateTokenResponse = Result<unknown>;

// ==================== STATE TYPES ====================

export interface AuthState {
  token: string | null;
  user: UserDto | null;
  isLoading: boolean;
  error: string | null;
  lastActivity: string | null;
  sessionTimeout: number | null;
}

export interface AuthValidationErrors {
  username?: string;
  password?: string;
  email?: string;
  confirmPassword?: string;
  general?: string;
}

// ==================== TYPE GUARDS ====================

export const isSuccessResponse = <T>(
  response: Result<T>
): response is Result<T> & { succeeded: true; data: T } => {
  return response.succeeded === true && response.data !== undefined;
};

export const isErrorResponse = (
  response: Result<unknown>
): response is Result<unknown> & { succeeded: false; errors: string[] } => {
  return response.succeeded === false && Array.isArray(response.errors);
};

export const isUserDto = (user: unknown): user is UserDto => {
  return !!user &&
    typeof user === 'object' &&
    'id' in user && typeof (user as UserDto).id === 'string' &&
    'username' in user && typeof (user as UserDto).username === 'string' &&
    'email' in user && typeof (user as UserDto).email === 'string' &&
    'role' in user && typeof (user as UserDto).role === 'string';
};

// Проверка прямого ответа логина (без обертки)
export const isDirectLoginResponse = (response: unknown): response is LoginResponseData => {
  return !!response &&
    typeof response === 'object' &&
    'token' in response && typeof (response as LoginResponseData).token === 'string' &&
    'user' in response && typeof (response as LoginResponseData).user === 'object' &&
    'id' in (response as LoginResponseData).user && typeof (response as LoginResponseData).user.id === 'string';
};

// Проверка ответа от бэкенда в формате Result<T>
export const isBackendResult = <T>(response: unknown): response is Result<T> => {
  return !!response &&
    typeof response === 'object' &&
    'succeeded' in response && typeof (response as Result<T>).succeeded === 'boolean';
};

// Извлечение данных из ответа бэкенда
export const extractBackendData = <T>(response: unknown): T | null => {
  if (isBackendResult<T>(response) && response.succeeded && response.data) {
    return response.data;
  }
  return null;
};

// Извлечение ошибок из ответа бэкенда
export const extractBackendError = (response: unknown): string | null => {
  if (isBackendResult<unknown>(response) && !response.succeeded) {
    if (response.errors && response.errors.length > 0) {
      return response.errors.join(', ');
    }
    return response.message || 'Unknown error from backend';
  }
  return null;
};

// ==================== CONSTANTS ====================

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Неверное имя пользователя или пароль',
  USER_NOT_FOUND: 'Пользователь не найден',
  ACCOUNT_LOCKED: 'Аккаунт заблокирован',
  TOKEN_EXPIRED: 'Токен истек',
  NETWORK_ERROR: 'Ошибка сети',
  SERVER_ERROR: 'Ошибка сервера',
  UNKNOWN_ERROR: 'Неизвестная ошибка',
  VALIDATION_ERROR: 'Ошибка валидации',
  SESSION_EXPIRED: 'Сессия истекла',
} as const;

export const AUTH_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  AUDITOR: 'auditor',
  GUEST: 'guest',
} as const;

export type AuthRole = typeof AUTH_ROLES[keyof typeof AUTH_ROLES];
