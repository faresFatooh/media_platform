// src/services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import type { GenerationResult, GroundingChunk } from "../types";

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
// 🧠 توليد محتوى
// ----------------------------
export async function generateContent(
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
    console.error("❌ Error generating content:", error);
    let errorMessage = "حدث خطأ غير متوقع أثناء توليد المحتوى.";
    if (error instanceof Error) {
      errorMessage = `حدث خطأ أثناء الاتصال بـ Gemini API: ${error.message}`;
    }
    return { text: errorMessage, sources: null };
  }
}

// ----------------------------
// 📝 نشر نص على فيسبوك
// ----------------------------
export async function createFacebookPost({ message }: { message: string }) {
  try {
    const url = `https://graph.facebook.com/v23.0/${FACEBOOK_PAGE_ID}/feed`;

    const res = await axios.post(
      url,
      { message, access_token: FACEBOOK_PAGE_ACCESS_TOKEN },
      { headers: { "Content-Type": "application/json" } }
    );

    return res.data; // يحتوي ID للبوست
  } catch (err: any) {
    console.error("❌ Facebook post error:", err.response?.data || err);
    throw err;
  }
}
