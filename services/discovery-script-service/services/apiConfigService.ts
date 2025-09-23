import axios from 'axios';
import { ApiConfigs } from '../types';

// إنشاء instance للـ API مع الـ baseURL
const api = axios.create({
  baseURL: import.meta.env.VITE_MAIN_BACKEND_URL,
});

// إضافة التوكن تلقائيًا مع كل طلب
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- دوال إدارة إعدادات API ---

// جلب الإعدادات
export const getApiConfigs = async (): Promise<ApiConfigs> => {
  const { data } = await api.get('/api/discovery-script/configs/');
  return data;
};

// حفظ الإعدادات
export const saveApiConfigs = async (configs: ApiConfigs): Promise<ApiConfigs> => {
  const { data } = await api.post('/api/discovery-script/configs/', configs);
  return data;
};
