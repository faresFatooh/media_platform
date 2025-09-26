// services/apiService.ts
const API_BASE_URL = '/api';

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

// -----------------
// 🔑 Auth Helpers
// -----------------
function getAuthToken(): string | null {
  try {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('access') ||
      sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('access') ||
      null;

    console.debug('[API] 🔑 getAuthToken:', token);
    return token;
  } catch (e) {
    console.warn('[API] ⚠️ getAuthToken failed', e);
    return null;
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) {
    console.debug('[API] 🚫 No token found, sending request without Authorization header');
    return {};
  }
  const headers = { Authorization: `Bearer ${token}` };
  console.debug('[API] 📨 Auth headers:', headers);
  return headers;
}

// -----------------
// 🔄 Response Handler
// -----------------
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';

  if (response.ok) {
    if (response.status === 204) {
      console.debug('[API] ✅ 204 No Content');
      return null as T;
    }
    if (contentType.includes('application/json')) {
      const json = await response.json();
      console.debug('[API] ✅ response json:', json);
      return json as T;
    }
    console.debug('[API] ✅ empty or non-JSON response');
    return null as T;
  }

  let bodyText = '';
  try {
    bodyText = await response.text();
  } catch {}

  let errorData: ApiErrorData = {};
  try {
    if (contentType.includes('application/json')) {
      errorData = JSON.parse(bodyText);
    }
  } catch {
    errorData = { raw: bodyText };
  }

  const message = errorData.detail || bodyText || `HTTP ${response.status}`;
  console.error('[API] ❌ error response', {
    status: response.status,
    message,
    url: response.url,
    body: errorData,
  });
  throw new ApiError(message, response.status, errorData);
}

// -----------------
// 📡 Generic HTTP
// -----------------
export const get = <T>(endpoint: string): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...getAuthHeaders() };
  console.debug('[API] 📥 GET', url, headers);
  return fetch(url, { headers }).then(handleResponse<T>);
};

export const post = <T, U>(endpoint: string, body: U): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
  console.debug('[API] 📤 POST', url, headers, body);
  return fetch(url, { method: 'POST', headers, body: JSON.stringify(body) }).then(handleResponse<T>);
};

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
