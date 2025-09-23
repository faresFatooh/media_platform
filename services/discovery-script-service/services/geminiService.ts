import { GoogleGenerativeAI } from "@google/generative-ai";
import { transformWithClaude, researchWithClaude } from "./claudeService";
import { generateWithChatGPT, researchWithChatGPT } from "./chatGptService";

// ======================
// JSON Schema للـ Script
// ======================
const SCRIPT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "The title of the episode." },
    style: { type: "string", description: "The name of the style for the script." },
    duration: { type: "string", description: "The duration of the episode in minutes." },
    content: {
      type: "string",
      description: "The full script of the episode, written in natural language.",
    },
    scenes: {
      type: "array",
      description: "A breakdown of the episode into major scenes.",
      items: {
        type: "object",
        properties: {
          time: { type: "string", description: "The time code for the scene." },
          description: { type: "string", description: "A brief description of the scene." },
          visuals: { type: "string", description: "Suggestions for visuals accompanying the narration." },
        },
        required: ["time", "description", "visuals"],
      },
    },
    sources: {
      type: "array",
      description: "A list of suggested sources used to create the script.",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name of the source." },
          url: { type: "string", description: "The URL of the source." },
        },
        required: ["name", "url"],
      },
    },
  },
  required: ["title", "style", "duration", "content", "scenes", "sources"],
};

// ======================
// تهيئة Google Generative AI
// ======================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ======================
// Function: توليد سكربت كامل
// ======================
export async function generateWithGemini(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: SCRIPT_SCHEMA,
      },
    });

    if (!result?.response?.text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("❌ Error in generateWithGemini:", error);
    throw error;
  }
}

// ======================
// Function: بحث بالمصادر
// ======================
export async function researchWithGemini(topic: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const researchPrompt = `
      ابحث عن موضوع: "${topic}" 
      وارجع قائمة من 5 مصادر موثوقة بصيغة JSON.
      كل مصدر يحتوي: name, url, description.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: researchPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    if (!result?.response?.text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("❌ Error in researchWithGemini:", error);
    throw error;
  }
}

// ======================
// Function: تحويل النص
// (زي transformWithClaude)
// ======================
export async function transformWithGemini(text: string, style: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const transformPrompt = `
      حول النص التالي ليتماشى مع أسلوب: "${style}"
      النص:
      ${text}
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: transformPrompt }] }],
    });

    if (!result?.response?.text) {
      throw new Error("No response from Gemini");
    }

    return result.response.text();
  } catch (error) {
    console.error("❌ Error in transformWithGemini:", error);
    throw error;
  }
}
