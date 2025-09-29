// src/services/newsGenerator.ts

declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
    readonly VITE_FACEBOOK_PAGE_ID: string;
    readonly VITE_FACEBOOK_PAGE_ACCESS_TOKEN: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import type { GenerationResult, GroundingChunk } from "../types";

// ----------------------------
// 🔑 مفاتيح الـ APIs
// ----------------------------
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const FACEBOOK_PAGE_ID = import.meta.env.VITE_FACEBOOK_PAGE_ID;
const FACEBOOK_PAGE_ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_PAGE_ACCESS_TOKEN;

if (!GEMINI_API_KEY) console.error("❌ VITE_GEMINI_API_KEY is not set.");
if (!FACEBOOK_PAGE_ID) console.error("❌ VITE_FACEBOOK_PAGE_ID is not set.");
if (!FACEBOOK_PAGE_ACCESS_TOKEN) console.error("❌ VITE_FACEBOOK_PAGE_ACCESS_TOKEN is not set.");

// ✅ إنشاء كائن Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ----------------------------
// 🧠 توليد محتوى أخبار
// ----------------------------
export async function generateNewsContent(
  prompt: string,
  useGoogleSearch: boolean = false
): Promise<GenerationResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
    };

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      tools: useGoogleSearch ? [{ googleSearchRetrieval: {} }] : undefined,
    });

    const text = response.response.text();
    const sources =
      (response.response.candidates?.[0]?.groundingMetadata
        ?.groundingChunks as GroundingChunk[]) || null;

    return { text, sources };
  } catch (error) {
    console.error("❌ Error generating news content:", error);
    let errorMessage = "حدث خطأ غير متوقع أثناء توليد المحتوى.";
    if (error instanceof Error) {
      errorMessage = `حدث خطأ أثناء الاتصال بـ Gemini API: ${error.message}`;
    }
    return { text: errorMessage, sources: null };
  }
}

// ----------------------------
// 📝 نشر منشور نصي على فيسبوك
// ----------------------------
export async function createFacebookTextPost(message: string) {
  try {
    const url = `https://graph.facebook.com/v23.0/${FACEBOOK_PAGE_ID}/feed`;

    const res = await axios.post(
      url,
      {
        message,
        access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    return res.data; // فيه id للبوست الجديد
  } catch (err: any) {
    console.error("❌ Facebook text post error:", err.response?.data || err);
    return null;
  }
}

// ----------------------------
// 🖼️ نشر صورة مع نص (بوست)
// ----------------------------
export async function createFacebookImagePost(options: { imageBase64: string; message?: string }) {
  try {
    const url = `https://graph.facebook.com/v23.0/${FACEBOOK_PAGE_ID}/photos`;

    // فك Base64 وتحويله لـ Blob
    const byteString = atob(options.imageBase64.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ia], { type: "image/png" });

    // تجهيز البيانات
    const formData = new FormData();
    formData.append("access_token", FACEBOOK_PAGE_ACCESS_TOKEN);
    formData.append("published", "true"); // 👈 مباشرة كمنشور
    formData.append("source", blob, "news.png");
    if (options.message) {
      formData.append("message", options.message);
    }

    // رفع الصورة + نشرها في بوست
    const res = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (err: any) {
    console.error("❌ Facebook image post error:", err.response?.data || err);
    return null;
  }
}

// ----------------------------
// ✏️ تعديل منشور (تحديث النص)
// ----------------------------
export async function updateFacebookPost(postId: string, newMessage: string) {
  try {
    const res = await axios.post(
      `https://graph.facebook.com/v23.0/${postId}`,
      null,
      {
        params: {
          message: newMessage,
          access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
        },
      }
    );
    return res.data;
  } catch (err: any) {
    console.error("❌ Facebook update post error:", err.response?.data || err);
    return null;
  }
}
