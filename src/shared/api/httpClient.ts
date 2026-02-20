import { API_CONFIG } from './config';
import { useAuthStore } from '../../entities/auth/authStore';
import { ApiErrorSchema } from './auth.contracts';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions extends RequestInit {
  json?: unknown; // Automatically stringify body
  headers?: Record<string, string>;
  isPublic?: boolean; // If true, do not attach auth token
}

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, method: RequestMethod, options: FetchOptions = {}): Promise<T> {
    const { json, headers = {}, isPublic = false, ...customConfig } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...customConfig,
    };

    // 1. Auth Header Injection
    if (!isPublic) {
      const accessToken = useAuthStore.getState().accessToken;
      if (accessToken) {
        // @ts-ignore
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    // 2. Request Body
    if (json) {
      config.body = JSON.stringify(json);
    }

    // 3. Execute Request
    const url = `${this.baseURL}${endpoint}`;
    
    // Log Request
    console.log(`[API_REQ] ${method} ${endpoint}`, json ? JSON.stringify(json).slice(0, 500) : '');
    
    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (error) {
      // Network Error
      console.error('[API_ERR] Network Error:', error);
      throw new Error('Network request failed. Please check your connection.');
    }

    // 4. Response Handling
    const responseBody = await response.json().catch(() => null);

    // Log Response
    console.log(`[API_RES] ${method} ${endpoint} ${response.status}`, responseBody ? JSON.stringify(responseBody).slice(0, 500) + (JSON.stringify(responseBody).length > 500 ? '...' : '') : '');

    if (!response.ok) {
      // Try to parse structured API error
      const parsedError = ApiErrorSchema.safeParse(responseBody);
      
      if (parsedError.success) {
        // Handle 401 specifically
        if (response.status === 401) {
          useAuthStore.getState().logout();
          // Ideally navigate to login, but store update should trigger UI reaction
        }
        throw parsedError.data; // Throw structured error
      }

      // Fallback error
      throw {
        status: response.status,
        message: responseBody?.message || 'Unknown API Error',
        original: responseBody,
      };
    }

    return responseBody as T;
  }

  // --- Convenience Methods ---
  get<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, 'GET', options);
  }

  post<T>(endpoint: string, body?: unknown, options?: FetchOptions) {
    return this.request<T>(endpoint, 'POST', { ...options, json: body });
  }

  put<T>(endpoint: string, body?: unknown, options?: FetchOptions) {
    return this.request<T>(endpoint, 'PUT', { ...options, json: body });
  }

  patch<T>(endpoint: string, body?: unknown, options?: FetchOptions) {
    return this.request<T>(endpoint, 'PATCH', { ...options, json: body });
  }

  delete<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, 'DELETE', options);
  }
}

export const httpClient = new HttpClient(API_CONFIG.BASE_URL);
