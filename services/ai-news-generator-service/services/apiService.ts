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

// حاول قراءة التوكن من مفاتيح محتملة (access_token أو access)
function getAuthToken(): string | null {
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('access') ||
    sessionStorage.getItem('access_token') ||
    sessionStorage.getItem('access') ||
    null
  );
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';

  if (response.ok) {
    if (contentType.includes('application/json')) {
      const json = await response.json();
      console.debug('[API] response json:', json);
      return json as T;
    }
    // no-json success (e.g. 204)
    return Promise.resolve(undefined as unknown as T);
  }

  // قراءة جسم الخطأ لو كان ممكن
  let bodyText = '';
  try { bodyText = await response.text(); } catch (e) { /* ignore */ }

  let errorData: ApiErrorData = {};
  try {
    if (contentType.includes('application/json')) errorData = JSON.parse(bodyText);
  } catch (e) {
    errorData = { raw: bodyText };
  }

  const message = errorData.detail || bodyText || `HTTP ${response.status}`;
  console.error('[API] error response', { status: response.status, message, url: response.url, body: errorData });
  throw new ApiError(message, response.status, errorData);
}

// دوال HTTP مع طباعة تفصيلية لسهولة الديباغ
export const get = <T>(endpoint: string): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...getAuthHeaders() };
  console.debug('[API] GET', url, headers);
  return fetch(url, { headers }).then(handleResponse<T>);
};

export const post = <T, U>(endpoint: string, body: U): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
  console.debug('[API] POST', url, headers, body);
  return fetch(url, { method: 'POST', headers, body: JSON.stringify(body) }).then(handleResponse<T>);
};

export const put = <T, U>(endpoint: string, body: U): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
  console.debug('[API] PUT', url, headers, body);
  return fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) }).then(handleResponse<T>);
};

export const del = (endpoint: string): Promise<void> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...getAuthHeaders() };
  console.debug('[API] DELETE', url, headers);
  return fetch(url, { method: 'DELETE', headers }).then(handleResponse<void>);
};
