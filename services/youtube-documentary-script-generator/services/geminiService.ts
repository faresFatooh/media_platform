/// <reference types="vite/client" />

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

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DocumentaryScript, PromoContent, VideoTemplate, ShortsScript } from "../types";

if (!import.meta.env.VITE_GEMINI_API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

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
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `استخرج 3 مقاطع قصيرة (Shorts/Reels) من النص التالي:\n${JSON.stringify(script)}`;
  const response = await model.generateContent(prompt);
  return JSON.parse(response.response.text()).shorts;
}

// دوال الميديا (ممكن تربطها مع API خارجي للصور والفيديو)
export async function generateImageForScene(prompt: string): Promise<string> {
  return `https://dummyimage.com/600x400/000/fff&text=${encodeURIComponent(prompt)}`;
}

export async function generateVideoForScene(
  prompt: string,
  onProgress?: (msg: string) => void
): Promise<string> {
  if (onProgress) onProgress("جارٍ توليد الفيديو...");
  return `https://example.com/generated-video.mp4`;
}
