import axios from 'axios';
import { TextPair } from '../types';

// يقرأ عنوان الخادم الخلفي الرئيسي من متغيرات البيئة
const api = axios.create({
  baseURL: import.meta.env.VITE_MAIN_BACKEND_URL,
});

// هذا الجزء مهم جدًا: هو يضيف "بطاقة الهوية" (التوكن) تلقائيًا مع كل طلب
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- دوال لإدارة بيانات التدريب ---
export const getStyleExamples = async (): Promise<TextPair[]> => {
  const { data } = await api.get('/api/style-examples/');
  return data.map((item: any) => ({
    id: item.id.toString(),
    raw: item.before_text,
    edited: item.after_text,
  }));
};

export const addStyleExample = async (pair: { raw: string; edited: string }): Promise<TextPair> => {
  const { data } = await api.post('/api/style-examples/', { before_text: pair.raw, after_text: pair.edited });
   return {
    id: data.id.toString(),
    raw: data.before_text,
    edited: data.after_text,
  };
};

export const deleteStyleExample = async (id: string): Promise<void> => {
  await api.delete(`/api/style-examples/${id}/`);
};

// --- دالة التحرير باستخدام الذكاء الاصطناعي ---
// *** هذا هو الكود الصحيح والنهائي لهذه الدالة ***
export const performEdit = async (rawText: string): Promise<string> => {
  // نستخدم "post" لإرسال "طرد" يحتوي على البيانات
  const { data } = await api.post('/api/style-examples/predict/', { raw_text: rawText });
  return data.edited_text;
};