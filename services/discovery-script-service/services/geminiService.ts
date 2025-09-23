import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  TrainingData,
  GenerationEngine,
  NotificationMessage,
  OnThisDayData,
  OnThisDayEvent,
  Script,
  Source,
  FactCheckResult,
  GroundingChunk,
} from "../types";
import { transformWithClaude, researchWithClaude } from "./claudeService";
import { generateWithChatGPT, researchWithChatGPT } from "./chatGptService";

// --- API Key ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("❌ VITE_GEMINI_API_KEY environment variable not set");
}
const genAI = new GoogleGenerativeAI(apiKey);

// --- Helper to get model instance ---
const getModel = (modelName = "gemini-1.5-flash") =>
  genAI.getGenerativeModel({ model: modelName });

// --- Schema ---
const SCRIPT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    style: { type: "string" },
    duration: { type: "string" },
    content: { type: "string" },
    scenes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          time: { type: "string" },
          description: { type: "string" },
          visuals: { type: "string" },
        },
        required: ["time", "description", "visuals"],
      },
    },
    sources: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          url: { type: "string" },
        },
        required: ["name", "url"],
      },
    },
  },
  required: ["title", "style", "duration", "content", "scenes", "sources"],
};

// --- Generate Script ---
export const generateScript = async (
  styleName: string,
  title: string,
  duration: string,
  language: string,
  sourceText: string,
  trainingData?: TrainingData,
  engine: GenerationEngine = "gemini",
  addNotification?: (message: string, type: NotificationMessage["type"]) => void
): Promise<Script> => {
  try {
    addNotification?.("📡 Starting script generation with Gemini...", "info");

    const prompt = `Generate a documentary script.
- Style: ${styleName}
- Title: ${title}
- Duration: ${duration} minutes
- Language: ${language}
- Source Text: """${sourceText}"""

Return JSON strictly matching this schema: ${JSON.stringify(
      SCRIPT_SCHEMA
    )}`;

    const model = getModel("gemini-1.5-pro");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text) as Script;
  } catch (error) {
    console.error("❌ Error generating script:", error);
    throw new Error("فشل توليد النص باستخدام Gemini");
  }
};

// --- Generate Ideas ---
export const generateIdeas = async (styleName: string): Promise<string[]> => {
  const prompt = `Suggest 5 new creative episode ideas for style "${styleName}".`;

  const model = getModel();
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response
    .text()
    .split("\n")
    .filter((i) => i.trim() !== "");
};

// --- Deep Research ---
export const deepResearch = async (
  topic: string
): Promise<{ research: string; sources: Source[] }> => {
  try {
    const model = getModel();
    const result = await model.generateContent(
      `Do deep research on "${topic}" with citations.`
    );
    const response = await result.response;

    const text = response.text();

    // Grounding chunks (مش دايمًا موجودة)
    const groundingChunks =
      (result.response.candidates?.[0]?.groundingMetadata
        ?.groundingChunks as GroundingChunk[]) || [];

    const sources: Source[] = groundingChunks.map((chunk) => ({
      name: chunk.web?.title,
      url: chunk.web?.uri,
    }));

    return { research: text, sources };
  } catch (error) {
    console.error("❌ Error during deep research:", error);
    throw new Error("فشل البحث المعمق");
  }
};

// --- Fact Check ---
export const factCheckScript = async (
  scriptContent: string
): Promise<FactCheckResult> => {
  const prompt = `Fact-check this script and return accuracy % with notes: """${scriptContent}"""`;

  const model = getModel();
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const match = text.match(/(\d+)%/);
  const accuracy = match ? parseInt(match[1], 10) : 85;

  return { accuracy, details: text };
};

// --- On This Day Events ---
export const getOnThisDayEvents = async (
  date: Date
): Promise<OnThisDayData> => {
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const prompt = `Give historical Events, Births, and Deaths for ${formattedDate} in Arabic. Format with ## Events, ## Births, ## Deaths.`;

  const model = getModel();
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const parseSection = (section: string): OnThisDayEvent[] =>
    section
      .split("\n")
      .filter((line) => line.includes(":"))
      .map((line) => {
        const [year, ...rest] = line.split(":");
        return { year: year.trim(), description: rest.join(":").trim() };
      });

  return {
    date: date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    events: parseSection(text.match(/## Events([\s\S]*?)(?=##|$)/)?.[1] || ""),
    births: parseSection(text.match(/## Births([\s\S]*?)(?=##|$)/)?.[1] || ""),
    deaths: parseSection(text.match(/## Deaths([\s\S]*)/)?.[1] || ""),
  };
};
