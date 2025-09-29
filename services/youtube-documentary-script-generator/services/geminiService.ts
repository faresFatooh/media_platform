/// <reference types="vite/client" />

// =====================
// تعريف الـ ENV Variables
// =====================
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
export {};

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { DocumentaryScript, PromoContent, VideoTemplate, ShortsScript } from "../types";

// =====================
// التحقق من المفتاح
// =====================
if (!import.meta.env.VITE_GEMINI_API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// =====================
// Schemas
// =====================
const documentaryScriptSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING, description: "عنوان جذاب ومناسب لليوتيوب." },
    suggestedDuration: { type: SchemaType.STRING, description: "المدة الزمنية المقترحة للفيديو (مثال: '8-10 دقائق')." },
    hook: { type: SchemaType.STRING, description: "مقدمة قوية لجذب انتباه المشاهد في أول 30 ثانية." },
    scenes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          sceneNumber: { type: SchemaType.INTEGER },
          narration: { type: SchemaType.STRING, description: "النص الصوتي للمشهد (التعليق)." },
          visualSuggestion: { type: SchemaType.STRING, description: "وصف مرئي للمشهد، مع اقتراحات للقطات (فيديو، صور، رسوميات)." }
        },
        required: ["sceneNumber", "narration", "visualSuggestion"]
      }
    },
    conclusion: { type: SchemaType.STRING, description: "خاتمة قوية تلخص الموضوع وتدعو المشاهد للتفاعل." }
  },
  required: ["title", "suggestedDuration", "hook", "scenes", "conclusion"]
};

const promoContentSchema = {
  type: SchemaType.OBJECT,
  properties: {
    youtube: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING },
        tags: { type: SchemaType.STRING, description: "كلمات مفتاحية مفصولة بفاصلة" }
      },
      required: ["title", "description", "tags"]
    },
    instagramPost: {
      type: SchemaType.OBJECT,
      properties: {
        caption: { type: SchemaType.STRING },
        hashtags: { type: SchemaType.STRING }
      },
      required: ["caption", "hashtags"]
    },
    instagramStory: {
      type: SchemaType.OBJECT,
      properties: {
        caption: { type: SchemaType.STRING, description: "نص قصير للستوري." }
      },
      required: ["caption"]
    },
    facebookPost: {
      type: SchemaType.OBJECT,
      properties: {
        caption: { type: SchemaType.STRING, description: "نص أطول قليلاً ومناسب لفيسبوك." }
      },
      required: ["caption"]
    },
    twitterPost: {
      type: SchemaType.OBJECT,
      properties: {
        caption: { type: SchemaType.STRING, description: "تغريدة قصيرة ومباشرة." },
        hashtags: { type: SchemaType.STRING }
      },
      required: ["caption", "hashtags"]
    }
  },
  required: ["youtube", "instagramPost", "instagramStory", "facebookPost", "twitterPost"]
};

const videoTemplatesSchema = {
  type: SchemaType.OBJECT,
  properties: {
    templates: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "اسم قالب الفيديو." },
          description: { type: SchemaType.STRING, description: "شرح موجز لأسلوب الفيديو." },
          promptPlaceholder: { type: SchemaType.STRING, description: "نموذج موضوع مع placeholder." }
        },
        required: ["title", "description", "promptPlaceholder"]
      }
    }
  },
  required: ["templates"]
};

const shortsScriptsSchema = {
  type: SchemaType.OBJECT,
  properties: {
    shorts: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          hook: { type: SchemaType.STRING },
          content: { type: SchemaType.STRING },
          visualSuggestion: { type: SchemaType.STRING }
        },
        required: ["title", "hook", "content", "visualSuggestion"]
      }
    }
  },
  required: ["shorts"]
};

// =====================
// دوال التوليد
// =====================

export async function generateYouTubeIdeas(): Promise<string[]> {
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  const response = await model.generateContent(
    `أنت خبير في تحليل اتجاهات اليوتيوب. قم بتوليد قائمة من 10 أفكار رائجة ومطلوبة بشدة لأفلام وثائقية قصيرة.`
  );
  return response.response.text().split("\n").filter(Boolean);
}

export async function generateVideoTemplates(): Promise<VideoTemplate[]> {
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  const response = await model.generateContent(
    `قم بإنشاء قائمة من 5 قوالب فيديو وثائقية شائعة. لكل قالب، قدم عنوانًا ووصفًا ونموذجًا للموضوع.`
  );
  return JSON.parse(response.response.text()).templates;
}

export async function generateDocumentaryScript(topic: string, duration: number): Promise<DocumentaryScript> {
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `اكتب نص فيلم وثائقي قصير عن "${topic}" بمدة تقريبية ${duration} دقائق.`;
  const response = await model.generateContent(prompt);
  return JSON.parse(response.response.text());
}

export async function generatePromoContent(script: DocumentaryScript): Promise<PromoContent> {
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `بناءً على النص التالي، أنشئ محتوى ترويجي لكل من يوتيوب، انستغرام، فيسبوك وتويتر:\n${JSON.stringify(script)}`;
  const response = await model.generateContent(prompt);
  return JSON.parse(response.response.text());
}

export async function generateShortsScripts(script: DocumentaryScript): Promise<ShortsScript[]> {
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `استخرج 3 مقاطع قصيرة (Shorts/Reels) من النص التالي:\n${JSON.stringify(script)}`;
  const response = await model.generateContent(prompt);
  return JSON.parse(response.response.text()).shorts;
}
