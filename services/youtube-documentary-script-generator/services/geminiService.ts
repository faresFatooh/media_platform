import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DocumentaryScript, PromoContent, VideoTemplate, ShortsScript } from "../types";

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

// =======================
// التحقق من الـ API KEY
// =======================
if (!import.meta.env.VITE_GEMINI_API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// =======================
// Schemas
// =======================
const documentaryScriptSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    suggestedDuration: { type: "string" },
    hook: { type: "string" },
    scenes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sceneNumber: { type: "integer" },
          narration: { type: "string" },
          visualSuggestion: { type: "string" }
        },
        required: ["sceneNumber", "narration", "visualSuggestion"]
      }
    },
    conclusion: { type: "string" }
  },
  required: ["title", "suggestedDuration", "hook", "scenes", "conclusion"]
};

const promoContentSchema = {
  type: "object",
  properties: {
    youtube: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        tags: { type: "string" }
      },
      required: ["title", "description", "tags"]
    },
    instagramPost: {
      type: "object",
      properties: {
        caption: { type: "string" },
        hashtags: { type: "string" }
      },
      required: ["caption", "hashtags"]
    },
    instagramStory: {
      type: "object",
      properties: { caption: { type: "string" } },
      required: ["caption"]
    },
    facebookPost: {
      type: "object",
      properties: { caption: { type: "string" } },
      required: ["caption"]
    },
    twitterPost: {
      type: "object",
      properties: {
        caption: { type: "string" },
        hashtags: { type: "string" }
      },
      required: ["caption", "hashtags"]
    }
  },
  required: ["youtube", "instagramPost", "instagramStory", "facebookPost", "twitterPost"]
};

const videoTemplatesSchema = {
  type: "object",
  properties: {
    templates: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          promptPlaceholder: { type: "string" }
        },
        required: ["title", "description", "promptPlaceholder"]
      }
    }
  },
  required: ["templates"]
};

const shortsScriptsSchema = {
  type: "object",
  properties: {
    shorts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          hook: { type: "string" },
          content: { type: "string" },
          visualSuggestion: { type: "string" }
        },
        required: ["title", "hook", "content", "visualSuggestion"]
      }
    }
  },
  required: ["shorts"]
};

// =======================
// دوال التوليد
// =======================

export async function generateYouTubeIdeas(): Promise<string[]> {
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: "أعطني 10 أفكار رائجة لوثائقيات قصيرة على يوتيوب، كقائمة نصوص فقط." }]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: { ideas: { type: "array", items: { type: "string" } } },
        required: ["ideas"]
      }
    }
  });

  return JSON.parse(response.response.text()).ideas;
}

export async function generateVideoTemplates(): Promise<VideoTemplate[]> {
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: "أنشئ 5 قوالب شائعة للفيديو الوثائقي على يوتيوب مع العنوان والوصف والنص المقترح." }]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: videoTemplatesSchema
    }
  });

  return JSON.parse(response.response.text()).templates;
}

export async function generateDocumentaryScript(
  topic: string,
  duration: number
): Promise<DocumentaryScript> {
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `اكتب سيناريو وثائقي قصير عن "${topic}" بمدة تقريبية ${duration} دقائق.` }]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: documentaryScriptSchema
    }
  });

  return JSON.parse(response.response.text());
}

export async function generatePromoContent(
  script: DocumentaryScript
): Promise<PromoContent> {
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `قم بإنشاء محتوى تسويقي لمختلف المنصات بناءً على هذا النص: ${JSON.stringify(script)}` }]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: promoContentSchema
    }
  });

  return JSON.parse(response.response.text());
}

export async function generateShortsScripts(
  script: DocumentaryScript
): Promise<ShortsScript[]> {
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `استخرج 3 مقاطع قصيرة (Shorts) من النص التالي: ${JSON.stringify(script)}` }]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: shortsScriptsSchema
    }
  });

  return JSON.parse(response.response.text()).shorts;
}

// =======================
// صور وفيديو
// =======================

export async function generateImageForScene(prompt: string): Promise<string> {
  const model = ai.getGenerativeModel({ model: "imagen-3.0" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `Generate a cinematic, 4K, hyper-realistic image: ${prompt}` }]
      }
    ]
  });

  const image = result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!image) throw new Error("Image generation failed");
  return `data:image/png;base64,${image}`;
}

export async function generateVideoForScene(
  prompt: string,
  onProgress: (message: string) => void
): Promise<string> {
  onProgress("🚀 بدأ توليد الفيديو...");

  const model = ai.getGenerativeModel({ model: "veo-1.5" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `Generate a cinematic, hyper-realistic short clip: ${prompt}` }]
      }
    ]
  });

  const url = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!url) throw new Error("Video generation failed");

  onProgress("✅ الفيديو جاهز!");
  return url;
}
