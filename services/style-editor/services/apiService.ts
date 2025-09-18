// services/apiService.ts
import axios from "axios";
import { TextPair } from "../types";

// Base URL للـ backend
const API_BASE_URL = import.meta.env.VITE_MAIN_BACKEND_URL || "https://style-editor-service.onrender.com/api";

// إنشاء instance من Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // إذا كنت تستخدم جلسات أو cookies
});

// الحصول على التوكن من localStorage
async function getAuthToken() {
  return localStorage.getItem("access_token");
}

// حفظ زوج تدريبي جديد (before/after)
export const saveStyleExample = async (before: string, after: string): Promise<TextPair> => {
  try {
    const token = await getAuthToken();
    const response = await api.post(
      "/styleexample/", // هذا endpoint يطابق basename='styleexample'
      {
        before_text: before,
        after_text: after,
      },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    // إرجاع البيانات مع تحويلها للشكل المتوقع في React
    return {
      id: response.data.id.toString(),
      raw: response.data.before_text,
      edited: response.data.after_text,
    };
  } catch (error: any) {
    console.error("Error saving style example:", error);
    throw error;
  }
};

// جلب الأمثلة المخزنة
export const fetchExamples = async (): Promise<TextPair[]> => {
  try {
    const token = await getAuthToken();
    const response = await api.get("/styleexample/", {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return response.data.map((item: any) => ({
      id: item.id.toString(),
      raw: item.before_text,
      edited: item.after_text,
    }));
  } catch (error: any) {
    console.error("Error fetching examples:", error);
    throw error;
  }
};

// حذف مثال تدريبي
export const deleteExample = async (id: string): Promise<void> => {
  try {
    const token = await getAuthToken();
    await api.delete(`/styleexample/${id}/`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  } catch (error: any) {
    console.error("Error deleting example:", error);
    throw error;
  }
};
