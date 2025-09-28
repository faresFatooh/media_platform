import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GenerationResult, GroundingChunk } from "../types";

// مفتاح Gemini من متغيرات البيئة (Render)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("❌ VITE_GEMINI_API_KEY environment variable is not set.");
}

// إنشاء العميل
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateContent = async (
  prompt: string,
  useGoogleSearch: boolean = false
): Promise<GenerationResult> => {
  try {
    // نحدد الموديل
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // إعدادات التوليد
    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
    };

    // استدعاء API
    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      // في حالة تفعيل البحث من جوجل
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
};
