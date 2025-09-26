// ✅ This is the corrected and improved apiService.ts

// --- Get the main server URL from the environment variables ---
// This makes the code work perfectly on both local and production environments
const API_BASE_URL = import.meta.env.VITE_MAIN_BACKEND_URL || '';

interface ApiErrorData {
  detail?: string;
  [key: string]: any;
}

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

// --- Auth Helpers ---
function getAuthToken(): string | null {
  try {
    return localStorage.getItem('access_token') || null;
  } catch (e) {
    console.warn('[API] Failed to get auth token', e);
    return null;
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// --- Response Handler ---
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.detail || `HTTP error! status: ${response.status}`;
    console.error('[API] ❌ Error Response', { status: response.status, data });
    throw new ApiError(message, response.status, data);
  }
  
  console.debug('[API] ✅ Success Response', { status: response.status, data });
  return data as T;
}

// --- Generic HTTP Methods ---
// These functions will now correctly combine the server URL with the endpoint path
export const get = <T>(endpoint: string): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, { headers: getAuthHeaders() }).then(handleResponse<T>);
};

export const post = <T, U>(endpoint: string, body: U): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
  return fetch(url, { method: 'POST', headers, body: JSON.stringify(body) }).then(handleResponse<T>);
};

// ... (put and del functions would follow the same pattern)

export const put = <T, U>(endpoint: string, body: U): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
  console.debug('[API] ✏️ PUT', url, headers, body);
  return fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) }).then(handleResponse<T>);
};

export const del = (endpoint: string): Promise<void> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...getAuthHeaders() };
  console.debug('[API] 🗑️ DELETE', url, headers);
  return fetch(url, { method: 'DELETE', headers }).then(handleResponse<void>);
};

// -----------------
// 🎯 Specialized API Calls
// -----------------

// 📰 Monitored Sources
export const getMonitoredSources = () =>
  get<{ id: number; url: string; created_at: string }[]>('/news_generator/monitored-sources/');

export const addMonitoredSource = (url: string) =>
  post<{ id: number; url: string; created_at: string }, { url: string }>(
    '/news_generator/monitored-sources/',
    { url }
  );

export const deleteMonitoredSource = (id: number) =>
  del(`/news_generator/monitored-sources/${id}/`);

// 🌐 Custom Sources
export const getCustomSources = () =>
  get<{ id: number; url: string; created_at: string }[]>('/news_generator/custom-sources/');

export const addCustomSource = (url: string) =>
  post<{ id: number; url: string; created_at: string }, { url: string }>(
    '/news_generator/custom-sources/',
    { url }
  );

export const deleteCustomSource = (id: number) =>
  del(`/news_generator/custom-sources/${id}/`);

// ✍️ Editorial Styles
export const getEditorialStyles = () =>
  get<{ id: number; name: string; description: string; created_at: string }[]>(
    '/news_generator/editorial-styles/'
  );

export const addEditorialStyle = (name: string, description: string) =>
  post<{ id: number; name: string; description: string; created_at: string }, { name: string; description: string }>(
    '/news_generator/editorial-styles/',
    { name, description }
  );

export const deleteEditorialStyle = (id: number) =>
  del(`/news_generator/editorial-styles/${id}/`);
