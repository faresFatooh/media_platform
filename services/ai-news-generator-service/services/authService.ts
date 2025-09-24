import type { User } from '../types';

// ✅ جلب الرابط الكامل للخادم الخلفي من متغير البيئة الذي تم تعيينه في Render
// يجب تعيينه كـ VITE_MAIN_BACKEND_URL لهذه الخدمة
const API_URL = import.meta.env.VITE_MAIN_BACKEND_URL;

/**
 * يجلب بيانات المستخدم الحالي من الخادم الخلفي باستخدام توكن المصادقة.
 * @param token توكن الوصول JWT الخاص بالمستخدم.
 * @returns وعد يتم حله إلى كائن المستخدم.
 */
export const getCurrentUser = async (token: string): Promise<User> => {
  if (!API_URL) {
    throw new Error("VITE_MAIN_BACKEND_URL environment variable is not set.");
  }
  
  // ✅ استخدام الرابط الكامل والصحيح لاستدعاء API
  // ملاحظة: قمت بتصحيح المسار إلى /api/users/me/ ليتطابق مع إعداد Django الخاص بنا
  const response = await fetch(`${API_URL}/api/users/me/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل جلب بيانات المستخدم. قد تكون جلستك قد انتهت.');
  }

  const user: User = await response.json();
  return user;
};