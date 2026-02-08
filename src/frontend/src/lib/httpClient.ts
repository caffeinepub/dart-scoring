/**
 * HTTP client wrapper for cross-origin backend requests.
 * Handles CORS-safe fetch with credentials omitted and non-throwing error handling.
 */

import { BACKEND_URL } from './config';

export interface HttpResponse<T = any> {
  ok: boolean;
  data?: T;
  status?: number;
  message?: string;
}

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Performs a fetch request to the external backend with CORS-safe settings.
 * Always uses credentials: 'omit' and returns a non-throwing result.
 * 
 * @param path - The API path (e.g., '/rooms' or '/rooms/ABC123')
 * @param options - Request options (method, headers, body)
 * @returns Promise<HttpResponse> - Always resolves with ok: true/false
 */
export async function httpRequest<T = any>(
  path: string,
  options: HttpRequestOptions = {}
): Promise<HttpResponse<T>> {
  const { method = 'GET', headers = {}, body } = options;

  const url = `${BACKEND_URL}${path}`;

  const fetchOptions: RequestInit = {
    method,
    credentials: 'omit', // CORS-safe: don't send cookies
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    // Handle non-2xx responses
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let errorData: any = undefined;
      
      try {
        errorData = await response.json();
        
        // Try to extract structured error message
        if (errorData) {
          if (errorData.error) {
            // Handle nested error object: { error: { message, code } }
            errorMessage = errorData.error.message || errorData.error.code || errorMessage;
          } else if (errorData.message) {
            // Handle direct message field
            errorMessage = errorData.message;
          } else if (errorData.code && errorData.message) {
            // Handle flat error structure: { code, message }
            errorMessage = errorData.message;
          }
        }
      } catch {
        // If response body is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      return {
        ok: false,
        status: response.status,
        message: errorMessage,
        data: errorData,
      };
    }

    // Parse successful response
    let data: T | undefined;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    return {
      ok: true,
      data,
      status: response.status,
    };
  } catch (error) {
    // Network error or CORS error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[httpClient] Request failed:', errorMessage);

    return {
      ok: false,
      message: 'Network error. Please try again.',
    };
  }
}
