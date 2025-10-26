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

export interface RegisterCommand {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface ValidateTokenRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ResetPasswordCommand {
  email: string;
  token?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// ==================== RESPONSE TYPES ====================

// Базовый интерфейс для ответов API
export interface ApiResponse<T = unknown> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: string[];
  timestamp: string;
  statusCode?: number;
}

export interface SuccessResponse<T> extends ApiResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse extends ApiResponse {
  success: false;
  errors: string[];
  statusCode: number;
}

// Прямой ответ от бекенда (без обертки)
export interface LoginResponseData {
  token: string;
  refreshToken?: string;
  expiresAt: string;
  user: UserDto;
}

export interface ValidateTokenResponseData {
  isValid: boolean;
  expiresAt?: string;
  user?: UserDto;
}

export interface RefreshTokenResponseData {
  token: string;
  expiresAt: string;
  refreshToken?: string;
}

// Типы для обернутых ответов (если бекенд использует стандартную обертку)
export type LoginResponse = SuccessResponse<LoginResponseData>;
export type ValidateTokenResponse = SuccessResponse<ValidateTokenResponseData>;
export type RefreshTokenResponse = SuccessResponse<RefreshTokenResponseData>;

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

// ==================== UTILITY TYPES ====================

export type ApiResult<T> =
  | { success: true; data: T; status?: number }
  | { success: false; error: string; status?: number };

// ==================== TYPE GUARDS ====================

export const isSuccessResponse = <T>(
  response: ApiResponse<T>
): response is SuccessResponse<T> => {
  return response.success === true && response.data !== undefined;
};

export const isErrorResponse = (
  response: ApiResponse
): response is ErrorResponse => {
  return response.success === false && Array.isArray(response.errors);
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
