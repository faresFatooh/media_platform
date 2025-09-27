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

// باقي الكود (generateSlidesFromText, generateSlidesFromTextChunks, generateImage, searchPexelsImage, searchUnsplashImage, searchStockImage) 
// نفس الموجود عندك، الفرق الوحيد إنه الـ API Keys جاية من environment بدل hardcoded.
