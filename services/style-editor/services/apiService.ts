import axios from "axios";
import { TextPair } from "../types";

// رابط الباك اند
const API_BASE_URL = "https://backend.ghazimortaja.com/api";

// إنشاء axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// جلب التوكن من التخزين المحلي
async function getAuthToken() {
  return localStorage.getItem("access_token");
}

// ✅ تسجيل الدخول وتخزين التوكن
export async function login(username: string, password: string) {
  try {
    const response = await api.post("/token/", { username, password });

    const { access, refresh } = response.data;

    // تخزين التوكنات في localStorage
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    return response.data;
  } catch (error: any) {
    console.error("Login failed:", error);
    throw error;
  }
}

// ✅ جلب الأمثلة المخزنة
export async function fetchExamples(): Promise<TextPair[]> {
  const token = await getAuthToken();
  const response = await api.get("/style-examples/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.map((item: any) => ({
    id: item.id.toString(),
    raw: item.before_text,
    edited: item.after_text,
  }));
}

// ✅ إضافة مثال جديد
export async function saveStyleExample(
  before: string,
  after: string
): Promise<TextPair> {
  const token = await getAuthToken();
  try {
    const response = await api.post(
      "/style-examples/",
      { before_text: before, after_text: after },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      id: response.data.id.toString(),
      raw: response.data.before_text,
      edited: response.data.after_text,
    };
  } catch (error: any) {
    console.error("Error saving style example:", error);
    throw error;
  }
}

// ✅ حذف مثال
export async function deleteExample(id: string): Promise<void> {
  const token = await getAuthToken();
  await api.delete(`/style-examples/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ✅ استدعاء API للتنبؤ/تحرير النص
export async function callPredictAPI(rawText: string): Promise<string> {
  const token = await getAuthToken();
  const response = await api.post(
    "/style-examples/predict/",
    { raw_text: rawText },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.edited_text;
}
