// src/services/infographic.ts

declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
    readonly VITE_PEXELS_API_KEY: string;
    readonly VITE_UNSPLASH_ACCESS_KEY: string;
    readonly VITE_FACEBOOK_PAGE_ID: string;
    readonly VITE_FACEBOOK_PAGE_ACCESS_TOKEN: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import type { Slide } from "../types";

// ----------------------------
// 🔑 مفاتيح الـ APIs
// ----------------------------
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const FACEBOOK_PAGE_ID = import.meta.env.VITE_FACEBOOK_PAGE_ID;
const FACEBOOK_PAGE_ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_PAGE_ACCESS_TOKEN;

if (!GEMINI_API_KEY) console.error("❌ VITE_GEMINI_API_KEY is not set.");
if (!PEXELS_API_KEY) console.error("❌ VITE_PEXELS_API_KEY is not set.");
if (!UNSPLASH_ACCESS_KEY) console.error("❌ VITE_UNSPLASH_ACCESS_KEY is not set.");
if (!FACEBOOK_PAGE_ID) console.error("❌ VITE_FACEBOOK_PAGE_ID is not set.");
if (!FACEBOOK_PAGE_ACCESS_TOKEN) console.error("❌ VITE_FACEBOOK_PAGE_ACCESS_TOKEN is not set.");

// ✅ إنشاء كائن Gemini
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

// ----------------------------
// 📝 تعريف Schema
// ----------------------------
const slideSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "عنوان موجز للشريحة باللغة العربية" },
    content: {
      type: "array",
      description: "محتوى الشريحة على شكل نقاط ملخصة",
      items: {
        type: "object",
        properties: {
          text: { type: "string", description: "نص النقطة" },
          icon: { type: "string", description: "اسم الأيقونة" }
        },
        required: ["text", "icon"]
      }
    },
    visual: {
      type: "object",
      properties: {
        method: { type: "string", enum: ["search", "generate"], description: "آلية التمثيل البصري" },
        query: { type: "string", description: "عبارة البحث أو التوليد" }
      },
      required: ["method", "query"]
    }
  },
  required: ["title", "content", "visual"]
};

// ----------------------------
// 🧠 توليد الشرائح من نص كامل
// ----------------------------
export async function generateSlidesFromText(
  title: string,
  text: string,
  numberOfSlides: number
): Promise<Slide[]> {
  try {
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: slideSchema
        },
      },
    });

    const result = await model.generateContent(
      `العنوان الرئيسي: ${title}\n\n
      قم بتحليل النص التالي وقسمه إلى ${numberOfSlides} شرائح كحد أقصى. 
      كل شريحة يجب أن تحتوي على:
      - عنوان قصير
      - نقاط محتوى (bullet points)
      - تمثيل بصري (search أو generate) مع query مناسب\n\n
      النص:\n${text}`
    );

    const json = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(json || "[]") as Slide[];
  } catch (error) {
    console.error("❌ Error in generateSlidesFromText:", error);
    return [];
  }
}

// ----------------------------
// 🧠 توليد الشرائح من أجزاء نص
// ----------------------------
export async function generateSlidesFromTextChunks(
  title: string,
  chunks: string[]
): Promise<Slide[]> {
  const slides: Slide[] = [];
  for (const chunk of chunks) {
    const chunkSlides = await generateSlidesFromText(title, chunk, chunks.length);
    slides.push(...chunkSlides);
  }
  return slides;
}

// ----------------------------
// 🎨 توليد صورة باستخدام Gemini
// ----------------------------
export async function generateImage(prompt: string): Promise<string | null> {
  try {
    const model = ai.getGenerativeModel({ model: "imagen-3.0-generate-002" });
    const result = await model.generateContent(prompt);

    const base64 = result.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64) return `data:image/png;base64,${base64}`;
    return null;
  } catch (error) {
    console.error("❌ Error in generateImage:", error);
    return null;
  }
}

// ----------------------------
// 🔎 البحث عن صورة من Pexels
// ----------------------------
export async function searchPexelsImage(query: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    const data = await response.json();
    return data.photos?.[0]?.src?.medium || null;
  } catch (error) {
    console.error("❌ Error in searchPexelsImage:", error);
    return null;
  }
}

// ----------------------------
// 🔎 البحث عن صورة من Unsplash
// ----------------------------
export async function searchUnsplashImage(query: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );
    const data = await response.json();
    return data.results?.[0]?.urls?.regular || null;
  } catch (error) {
    console.error("❌ Error in searchUnsplashImage:", error);
    return null;
  }
}

// ----------------------------
// 🔎 اختيار مصدر صورة (Pexels/Unsplash)
// ----------------------------
export async function searchStockImage(query: string): Promise<string | null> {
  const pexelsImage = await searchPexelsImage(query);
  if (pexelsImage) return pexelsImage;

  const unsplashImage = await searchUnsplashImage(query);
  if (unsplashImage) return unsplashImage;

  return null;
}

// ----------------------------
// 📤 نشر صورة على فيسبوك
// ----------------------------
export async function postToFacebook(caption: string, imageUrl?: string, imageBase64?: string) {
  try {
    const url = `https://graph.facebook.com/v23.0/${FACEBOOK_PAGE_ID}/photos`;

    if (imageUrl) {
      const res = await axios.post(url, null, {
        params: {
          url: imageUrl,
          caption,
          access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
        },
      });
      return res.data;
    }

    if (imageBase64) {
      const blob = await fetch(imageBase64).then(r => r.blob());
      const file = new File([blob], "infographic.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("access_token", FACEBOOK_PAGE_ACCESS_TOKEN);
      formData.append("source", file);

      const res = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    }

    throw new Error("❌ لازم تحدد إما imageUrl أو imageBase64");
  } catch (err: any) {
    console.error("❌ Facebook publish error:", err.response?.data || err);
    return null;
  }
}
