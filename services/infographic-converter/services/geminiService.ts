declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
    readonly VITE_PEXELS_API_KEY: string;
    readonly VITE_UNSPLASH_ACCESS_KEY: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Slide } from "../types";

// ----------------------------
// 🔑 مفاتيح الـ APIs
// ----------------------------
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

if (!GEMINI_API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set. Gemini calls will fail.");
}
if (!PEXELS_API_KEY) {
  console.error("VITE_PEXELS_API_KEY is not set. Pexels calls will fail.");
}
if (!UNSPLASH_ACCESS_KEY) {
  console.error("VITE_UNSPLASH_ACCESS_KEY is not set. Unsplash calls will fail.");
}

// ✅ إنشاء كائن Gemini
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

// ----------------------------
// 📝 تعريف Schema
// ----------------------------
const slideSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description:
        "عنوان موجز وجذاب للشريحة باللغة العربية، يلخص محتوى النقاط الموجودة فيها.",
    },
    content: {
      type: SchemaType.ARRAY,
      description:
        "محتوى الشريحة مقسم إلى نقاط رئيسية. يجب أن تكون هذه النقاط ملخصة وموجزة.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: {
            type: SchemaType.STRING,
            description: "نص النقطة الرئيسية الملخص باللغة العربية.",
          },
          icon: {
            type: SchemaType.STRING,
            description:
              "اسم أيقونة مناسب باللغة الإنجليزية من قائمة محددة (مثل 'growth', 'idea', 'data', 'team', 'technology', 'success', 'finance', 'communication', 'strategy', 'security').",
          },
        },
        required: ["text", "icon"],
      },
    },
    visual: {
      type: SchemaType.OBJECT,
      description:
        "التمثيل البصري للشريحة. يحدد ما إذا كان سيتم البحث عن صورة موجودة أو إنشاء صورة جديدة.",
      properties: {
        method: {
          type: SchemaType.STRING,
          enum: ["search", "generate"],
          description:
            "الآلية المستخدمة: 'search' للمفاهيم الملموسة، 'generate' للمفاهيم المجردة.",
        },
        query: {
          type: SchemaType.STRING,
          description:
            "إذا كانت الآلية 'search'، فهذه عبارة بحث محسّنة باللغة الإنجليزية. إذا كانت 'generate'، فهذا هو الموجه التفصيلي لنموذج توليد الصور.",
        },
      },
      required: ["method", "query"],
    },
  },
  required: ["title", "content", "visual"],
};

// ----------------------------
// 🧠 توليد الشرائح من نص كامل
// ----------------------------
export async function generateSlidesFromText(text: string): Promise<Slide[]> {
  try {
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: slideSchema,
        },
      },
    });

    const result = await model.generateContent([
      {
        role: "user",
        parts: [
          {
            text: `حلل النص التالي وقسمه إلى مجموعة شرائح (slides) بحيث كل شريحة لها عنوان، محتوى على شكل نقاط، وتمثيل بصري:\n\n${text}`,
          },
        ],
      },
    ]);

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
  chunks: string[]
): Promise<Slide[]> {
  const slides: Slide[] = [];
  for (const chunk of chunks) {
    const chunkSlides = await generateSlidesFromText(chunk);
    slides.push(...chunkSlides);
  }
  return slides;
}

// ----------------------------
// 🎨 توليد صورة باستخدام Gemini
// ----------------------------
export async function generateImage(prompt: string): Promise<string | null> {
  try {
    const model = ai.getGenerativeModel({ model: "imagen-3.0" });
    const result = await model.generateContent(prompt);

    const base64 = result.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64) {
      return `data:image/png;base64,${base64}`;
    }
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
      {
        headers: { Authorization: PEXELS_API_KEY },
      }
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
      {
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
      }
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
