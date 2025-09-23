import { GoogleGenerativeAI } from "@google/generative-ai";
import { TrainingData, GenerationEngine, NotificationMessage, OnThisDayData, OnThisDayEvent, Script, Source, FactCheckResult, GroundingChunk } from "../types";
import { transformWithClaude, researchWithClaude } from "./claudeService";
import { generateWithChatGPT, researchWithChatGPT } from "./chatGptService";

if (!import.meta.env.VITE_GEMINI_API_KEY) {
  throw new Error("❌ VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// ✅ JSON Schema عادي بدون Type
const SCRIPT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "The title of the episode." },
    style: { type: "string", description: "The name of the style for the script." },
    duration: { type: "string", description: "The duration of the episode in minutes." },
    content: { type: "string", description: "Full script of the episode with citations [1], [2], etc." },
    scenes: {
      type: "array",
      description: "Breakdown of the episode into scenes.",
      items: {
        type: "object",
        properties: {
          time: { type: "string" },
          description: { type: "string" },
          visuals: { type: "string" }
        },
        required: ["time", "description", "visuals"]
      }
    },
    sources: {
      type: "array",
      description: "List of sources used with citation index.",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          url: { type: "string" }
        },
        required: ["name", "url"]
      }
    }
  },
  required: ["title", "style", "duration", "content", "scenes", "sources"]
};

// ✅ الدوال الأساسية
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
- Source Text: """${sourceText}"""`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Return only JSON strictly matching the schema.",
        responseMimeType: "application/json",
        responseSchema: SCRIPT_SCHEMA
      }
    });

    return JSON.parse(response.text) as Script;
  } catch (error) {
    console.error("❌ Error generating script:", error);
    throw new Error("فشل توليد النص باستخدام Gemini");
  }
};

export const generateIdeas = async (styleName: string): Promise<string[]> => {
  const prompt = `Suggest 5 new creative episode ideas for style "${styleName}".`;
  const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
  return response.text.split("\n").filter(i => i.trim() !== "");
};

export const deepResearch = async (topic: string): Promise<{ research: string; sources: Source[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Do deep research on "${topic}" with citations.`,
      config: { tools: [{ googleSearch: {} }] }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    const sources: Source[] = groundingChunks.map(chunk => ({
      name: chunk.web.title,
      url: chunk.web.uri
    }));

    return { research: response.text, sources };
  } catch (error) {
    console.error("❌ Error during deep research:", error);
    throw new Error("فشل البحث المعمق");
  }
};

export const factCheckScript = async (scriptContent: string): Promise<FactCheckResult> => {
  const prompt = `Fact-check this script and return accuracy % with notes: """${scriptContent}"""`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });

  const text = response.text;
  const match = text.match(/(\d+)%/);
  const accuracy = match ? parseInt(match[1], 10) : 85;

  return { accuracy, details: text };
};

export const getOnThisDayEvents = async (date: Date): Promise<OnThisDayData> => {
  const formattedDate = date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const prompt = `Give historical Events, Births, and Deaths for ${formattedDate} in Arabic. Format with ## Events, ## Births, ## Deaths.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });

  const text = response.text;
  const parseSection = (section: string): OnThisDayEvent[] =>
    section
      .split("\n")
      .filter(line => line.includes(":"))
      .map(line => {
        const [year, ...rest] = line.split(":");
        return { year: year.trim(), description: rest.join(":").trim() };
      });

  return {
    date: date.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }),
    events: parseSection(text.match(/## Events([\s\S]*?)(?=##|$)/)?.[1] || ""),
    births: parseSection(text.match(/## Births([\s\S]*?)(?=##|$)/)?.[1] || ""),
    deaths: parseSection(text.match(/## Deaths([\s\S]*)/)?.[1] || "")
  };
};
