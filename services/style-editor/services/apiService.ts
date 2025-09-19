// src/services/apiService.ts
import axios from "axios";
import { TextPair } from "../types";

// 🔹 رابط الباك اند
const API_BASE_URL = "https://backend.ghazimortaja.com/api";

// 🔹 إنشاء axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // إذا كان السيرفر يحتاج الكوكيز
});

// 🟢 عند كل طلب نضيف التوكن إذا موجود
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔹 تسجيل الدخول وتخزين التوكنات
export async function login(username: string, password: string): Promise<void> {
  try {
    const response = await api.post("/token/", { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  } catch (err: any) {
    console.error("خطأ في تسجيل الدخول:", err);
    throw new Error(err.response?.data?.detail || "فشل تسجيل الدخول");
  }
}

// 🔹 جلب الأمثلة المخزنة
export async function fetchExamples(): Promise<TextPair[]> {
  try {
    const response = await api.get("/style-examples/");
    return response.data.map((item: any) => ({
      id: item.id.toString(),
      raw: item.before_text,
      edited: item.after_text,
    }));
  } catch (err: any) {
    console.error("خطأ في جلب الأمثلة:", err);
    throw new Error("فشل جلب الأمثلة");
  }
}

// 🔹 إضافة مثال جديد
export async function saveStyleExample(before: string, after: string): Promise<TextPair> {
  try {
    const response = await api.post("/style-examples/", {
      before_text: before,
      after_text: after,
    });
    return {
      id: response.data.id.toString(),
      raw: response.data.before_text,
      edited: response.data.after_text,
    };
  } catch (err: any) {
    console.error("خطأ في حفظ المثال:", err);
    throw new Error(err.response?.data?.detail || "فشل حفظ المثال");
  }
}

// 🔹 حذف مثال
export async function deleteExample(id: string): Promise<void> {
  try {
    await api.delete(`/style-examples/${id}/`);
  } catch (err: any) {
    console.error("خطأ في حذف المثال:", err);
    throw new Error("فشل حذف المثال");
  }
}

// 🔹 استدعاء API للتنبؤ/تحرير النص
export async function callPredictAPI(rawText: string): Promise<string> {
  try {
    const response = await api.post("/style-examples/predict/", {
      raw_text: rawText,
    });
    return response.data.edited_text;
  } catch (err: any) {
    console.error("خطأ في التنبؤ:", err);
    throw new Error("فشل تحرير النص");
  }
}
