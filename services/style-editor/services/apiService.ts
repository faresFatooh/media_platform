import axios from "axios";
import { TextPair } from "../types";

// رابط الباك اند
const API_BASE_URL = "https://backend.ghazimortaja.com/api";

// إنشاء axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 🟢 عند كل طلب نضيف التوكن إذا موجود
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔹 تسجيل الدخول
export async function login(username: string, password: string): Promise<void> {
  const response = await api.post("/token/", { username, password });
  const { access, refresh } = response.data;

  // تخزين التوكنات
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

// 🔹 جلب الأمثلة المخزنة
export async function fetchExamples(): Promise<TextPair[]> {
  const response = await api.get("/style-examples/");
  return response.data.map((item: any) => ({
    id: item.id.toString(),
    raw: item.before_text,
    edited: item.after_text,
  }));
}

// 🔹 إضافة مثال جديد
export async function saveStyleExample(
  before: string,
  after: string
): Promise<TextPair> {
  const response = await api.post("/style-examples/", {
    before_text: before,
    after_text: after,
  });

  return {
    id: response.data.id.toString(),
    raw: response.data.before_text,
    edited: response.data.after_text,
  };
}

// 🔹 حذف مثال
export async function deleteExample(id: string): Promise<void> {
  await api.delete(`/style-examples/${id}/`);
}

// 🔹 استدعاء API للتنبؤ/تحرير النص
export async function callPredictAPI(rawText: string): Promise<string> {
  const response = await api.post("/style-examples/predict/", {
    raw_text: rawText,
  });
  return response.data.edited_text;
}
