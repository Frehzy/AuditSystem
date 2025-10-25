// src/core/types/api.ts
/**
 * Типы для API
 */

// Re-export only the types that are not already exported from services
export type {
  ApiRequestOptions,
  ApiClient,
  HttpRequestConfig,
  HttpResponse,
  HttpService,
  ApiResult,
  RequestContext,
  RequestMetadata,
  ApiRequestConfig
} from './services';
