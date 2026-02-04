const API_BASE_URL = '/api';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * Sanitize input to prevent XSS attacks
 */
function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Safe JSON parse with XSS protection
 */
function safeJsonParse<T>(str: string | null): T | null {
  if (!str) return null;
  try {
    const parsed = JSON.parse(str);
    // Sanitize string values in the parsed object
    return sanitizeParsedObject(parsed) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}

/**
 * Recursively sanitize parsed JSON object
 */
function sanitizeParsedObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeParsedObject(item));
  }
  if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const key in obj) {
      sanitized[key] = sanitizeParsedObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

/**
 * Calculate delay with exponential backoff
 */
function getRetryDelay(attempt: number): number {
  return BASE_DELAY_MS * Math.pow(2, attempt);
}

/**
 * Check if error is retriable
 */
function isRetriableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('econnreset') ||
    message.includes('etimedout') ||
    message.includes('socket') ||
    message.includes('fetch') ||
    !message.includes('401') && !message.includes('403') // Not auth errors
  );
}

/**
 * Request with exponential backoff retry
 */
async function request<T>(
  endpoint: string, 
  options: RequestInit = {},
  retryCount: number = 0
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');

    // Retry on network errors or if we haven't exceeded max retries
    if (isRetriableError(err) && retryCount < MAX_RETRIES) {
      const delay = getRetryDelay(retryCount);
      console.warn(`API request failed, retrying in ${delay}ms...`, err.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return request<T>(endpoint, options, retryCount + 1);
    }

    throw err;
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

// Export sanitization utilities for use in other files
export { sanitizeInput, safeJsonParse };
