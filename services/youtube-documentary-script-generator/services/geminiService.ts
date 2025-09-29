// src/services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import type { DocumentaryScript, PromoContent, VideoTemplate, ShortsScript } from "../types";

// ----------------------------
// 🔑 مفاتيح من Render (Vite)
// ----------------------------
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

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const FACEBOOK_PAGE_ID = import.meta.env.VITE_FACEBOOK_PAGE_ID;
const FACEBOOK_PAGE_ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_PAGE_ACCESS_TOKEN;

if (!GEMINI_API_KEY) console.error("❌ VITE_GEMINI_API_KEY is not set.");
if (!FACEBOOK_PAGE_ID) console.error("❌ VITE_FACEBOOK_PAGE_ID is not set.");
if (!FACEBOOK_PAGE_ACCESS_TOKEN) console.error("❌ VITE_FACEBOOK_PAGE_ACCESS_TOKEN is not set.");

// ✅ إنشاء كائن Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ----------------------------
// 🧠 مثال: توليد أفكار يوتيوب
// ----------------------------
export async function generateYouTubeIdeas(): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "أعطني 10 أفكار لأفلام وثائقية قصيرة رائجة" }] }],
    });

    const text = response.response.text();
    return text.split("\n").filter(Boolean); // ترجع كمصفوفة
  } catch (err) {
    console.error("❌ Error generating YouTube ideas:", err);
    return [];
  }
}

// ----------------------------
// 📝 نشر بوست على فيسبوك
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
