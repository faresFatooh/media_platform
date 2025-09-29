// src/services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import type {
  GenerationResult,
  GroundingChunk,
  DocumentaryScript,
  PromoContent,
  VideoTemplate,
  ShortsScript,
} from "../types";

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
// 🧠 توليد محتوى عام
// ----------------------------
export async function generateContent(
  prompt: string,
  useGoogleSearch: boolean = false
): Promise<GenerationResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
// 🎥 أفكار لليوتيوب
// ----------------------------
export async function generateYouTubeIdeas(): Promise<string[]> {
  const res = await generateContent(
    "أنت خبير في تحليل اتجاهات اليوتيوب. أعطني قائمة من 10 أفكار وثائقية قصيرة عالية الانتشار."
  );
  return res.text.split("\n").filter(Boolean);
}

// ----------------------------
// 🎥 قوالب فيديو
// ----------------------------
export async function generateVideoTemplates(): Promise<VideoTemplate[]> {
  const res = await generateContent(
    "أنت منتج محتوى خبير على يوتيوب. أنشئ 5 قوالب فيديو وثائقية مع عنوان + وصف + مثال."
  );

  return res.text
    .split("\n")
    .filter(Boolean)
    .map((line, i) => ({
      title: `Template ${i + 1}`,
      description: line,
      promptPlaceholder: line,
    }));
}

// ----------------------------
// 🎬 سكربت وثائقي
// ----------------------------
export async function generateDocumentaryScript(
  topic: string,
  duration: number
): Promise<DocumentaryScript> {
  const res = await generateContent(
    `اكتب نص لفيلم وثائقي قصير عن "${topic}". المدة المستهدفة: ${duration} دقائق. 
     النص يجب أن يحتوي على مقدمة قوية، مشاهد مع تعليق صوتي واقتراحات بصرية، وخاتمة قوية.`
  );
  return JSON.parse(res.text);
}

// ----------------------------
// 📣 محتوى ترويجي
// ----------------------------
export async function generatePromoContent(
  script: DocumentaryScript
): Promise<PromoContent> {
  const res = await generateContent(
    `بناءً على النص الوثائقي التالي: ${JSON.stringify(
      script
    )}, أنشئ محتوى ترويجي ليوتيوب + فيسبوك + انستغرام + تويتر.`
  );
  return JSON.parse(res.text);
}

// ----------------------------
// 🎬 نصوص Shorts
// ----------------------------
export async function generateShortsScripts(
  script: DocumentaryScript
): Promise<ShortsScript[]> {
  const res = await generateContent(
    `بناءً على النص الوثائقي التالي: ${JSON.stringify(
      script
    )}, استخلص 3 نصوص قصيرة (Shorts) أقل من 60 ثانية بخطاف قوي ومحتوى مكثف.`
  );
  return JSON.parse(res.text);
}

// ----------------------------
// 🖼️ صورة لمشهد
// ----------------------------
export async function generateImageForScene(prompt: string): Promise<string> {
  const descriptivePrompt = `Generate a cinematic, hyper-realistic, 4K image for a YouTube documentary. Scene: ${prompt}`;
  // NOTE: Gemini images API غير متاح دائماً، لو متاح تستعمله هنا
  const res = await generateContent(descriptivePrompt);
  return res.text; // أو return base64 من API خاص بالصور
}

// ----------------------------
// 🎥 فيديو لمشهد
// ----------------------------
export async function generateVideoForScene(
  prompt: string,
  onProgress: (msg: string) => void
): Promise<string> {
  onProgress("🚀 بدء توليد الفيديو (محاكاة)...");
  await new Promise((r) => setTimeout(r, 5000));
  onProgress("✅ الفيديو جاهز.");
  return `https://dummyvideo.com/${encodeURIComponent(prompt)}`;
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

    return res.data;
  } catch (err: any) {
    console.error("❌ Facebook post error:", err.response?.data || err);
    throw err;
  }
}
