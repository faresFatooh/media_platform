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
 * Handles the response from a fetch request, throwing an ApiError for non-ok responses.
 * @param response The fetch Response object.
 * @returns A promise that resolves with the JSON data if the response is ok.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  if (response.ok) {
     if (contentType && contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }
    // Handle 204 No Content and other non-json success responses
    return Promise.resolve(undefined as T);
  }

  let errorData: ApiErrorData = {};
  let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
  
  if (contentType && contentType.includes('application/json')) {
    try {
      errorData = await response.json();
      errorMessage = errorData.detail || JSON.stringify(errorData);
    } catch (e) {
      // The body was not valid JSON
      errorMessage = `HTTP Error: ${response.status} ${response.statusText}. Failed to parse error response body.`;
    }
  }

  throw new ApiError(errorMessage, response.status, errorData);
}

/**
 * Performs a GET request.
 * @param endpoint The API endpoint to call (e.g., '/styles/').
 * @returns A promise that resolves with the fetched data.
 */
export const get = <T>(endpoint: string): Promise<T> => {
  return fetch(`${API_BASE_URL}${endpoint}`).then(handleResponse<T>);
};

/**
 * Performs a POST request.
 * @param endpoint The API endpoint.
 * @param body The data to send in the request body.
 * @returns A promise that resolves with the server's response data.
 */
export const post = <T, U>(endpoint: string, body: U): Promise<T> => {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleResponse<T>);
};

/**
 * Performs a PUT request.
 * @param endpoint The API endpoint (e.g., '/styles/1/').
 * @param body The data to update.
 * @returns A promise that resolves with the server's response data.
 */
export const put = <T, U>(endpoint: string, body: U): Promise<T> => {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleResponse<T>);
};

/**
 * Performs a DELETE request.
 * @param endpoint The API endpoint to call (e.g., '/styles/1/').
 * @returns A promise that resolves when the deletion is successful.
 */
export const del = (endpoint: string): Promise<void> => {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
  }).then(handleResponse<void>);
};
