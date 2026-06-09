import { getItem } from '../utils/storage';
import { isTokenExpired } from '../utils/token';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

class ApiError extends Error {
  statusCode: number;
  error: string;

  constructor(statusCode: number, error: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getItem('user_token');

  if (token && isTokenExpired(token)) {
    await useAuthStore.getState().handleSessionExpired();
    throw new ApiError(401, 'Unauthorized', 'Session expired. Please log in again.');
  }

  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      if (response.status === 401) {
        await useAuthStore.getState().handleSessionExpired();
      }
      throw new ApiError(
        data?.statusCode || response.status,
        data?.error || 'Unknown Error',
        data?.message || 'An error occurred during the API request.'
      );
    }

    return data;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new Error('Network error. Please try again.');
  }
}

export const api = {
  get: (endpoint: string, options?: RequestInit) => fetchWithAuth(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, data: any, options?: RequestInit) => fetchWithAuth(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
  patch: (endpoint: string, data: any, options?: RequestInit) => fetchWithAuth(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) }),
  delete: (endpoint: string, options?: RequestInit) => fetchWithAuth(endpoint, { ...options, method: 'DELETE' }),
};
