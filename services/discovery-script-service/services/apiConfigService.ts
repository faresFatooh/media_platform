import axios from "axios";

// الأساس للباكند
const api = axios.create({
  baseURL: import.meta.env.VITE_MAIN_BACKEND_URL + "/api/discovery-script",
  withCredentials: true,
});

// إضافة التوكن تلقائيًا مع كل طلب
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// قراءة الإعدادات
export async function getApiConfigs() {
  const res = await api.get("/configs/");
  return res.data;
}

// حفظ أو تحديث الإعدادات
export async function saveApiConfigs(configs: any) {
  const res = await api.post("/configs/", configs);
  return res.data;
}
