import axios from 'axios';

// --- استرجاع التوكن من localStorage ---
function getDjangoToken(): string | null {
  try {
    const raw = localStorage.getItem("django_api_configs");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    // إذا محفوظ بصيغة { "claudeApiKey": "..." }
    return parsed.claudeApiKey || null;
  } catch (e) {
    console.error("Error parsing django_api_configs:", e);
    return null;
  }
}

// --- إنشاء Axios instance ---
const api = axios.create({
  baseURL: import.meta.env.VITE_MAIN_BACKEND_URL, // backend الأساسي
});

// --- إضافة التوكن بالهيدر ---
api.interceptors.request.use(config => {
  const token = getDjangoToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- دوال API Configs ---
export const getApiConfigs = async () => {
  const { data } = await api.get("/api/discovery-script/configs/");
  return data;
};

export const addApiConfig = async (configData: any) => {
  const { data } = await api.post("/api/discovery-script/configs/", configData);
  return data;
};

export const deleteApiConfig = async (id: number) => {
  await api.delete(`/api/discovery-script/configs/${id}/`);
};
