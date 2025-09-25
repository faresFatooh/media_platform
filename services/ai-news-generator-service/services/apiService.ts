// A centralized service for making API calls to the Django backend.
const API_BASE_URL = '/api'; // Adjust if your Django API is hosted elsewhere

interface ApiErrorData {
  detail?: string;
  [key: string]: any;
}

/**
 * A custom error class for API-related errors.
 */
export class ApiError extends Error {
  public status: number;
  public data: ApiErrorData;

  constructor(message: string, status: number, data: ApiErrorData) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Get auth headers with token (from localStorage or sessionStorage).
 */
function getAuthHeaders() {
  const token =
    localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Handles the response from a fetch request, throwing an ApiError for non-ok responses.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');

  if (response.ok) {
    if (contentType && contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }
    return Promise.resolve(undefined as T); // e.g., 204 No Content
  }

  let errorData: ApiErrorData = {};
  let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;

  if (contentType && contentType.includes('application/json')) {
    try {
      errorData = await response.json();
      errorMessage = errorData.detail || JSON.stringify(errorData);
    } catch {
      errorMessage = `HTTP Error: ${response.status} ${response.statusText}. Failed to parse error body.`;
    }
  }

  throw new ApiError(errorMessage, response.status, errorData);
}

/**
 * Performs a GET request.
 */
export const get = <T>(endpoint: string): Promise<T> => {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { ...getAuthHeaders() },
  }).then(handleResponse<T>);
};

/**
 * Performs a POST request.
 */
export const post = <T, U>(endpoint: string, body: U): Promise<T> => {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body),
  }).then(handleResponse<T>);
};

/**
 * Performs a PUT request.
 */
export const put = <T, U>(endpoint: string, body: U): Promise<T> => {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body),
  }).then(handleResponse<T>);
};

/**
 * Performs a DELETE request.
 */
export const del = (endpoint: string): Promise<void> => {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  }).then(handleResponse<void>);
};
