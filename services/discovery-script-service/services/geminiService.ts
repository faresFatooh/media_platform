// services/discovery-channel-script-production-platform/src/services/geminiService.ts

import { GoogleGenerativeAI, Part, FunctionDeclarationSchemaType } from "@google/generative-ai";
import type { Script, FactCheckResult, Source, GroundingChunk, TrainingData } from '../types';

// --- ✅ التصحيح الأول: قراءة المفتاح بالطريقة الصحيحة لـ Vite ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

// --- ✅ التصحيح الثاني: تعريف المخطط (Schema) ككائن جافاسكريبت عادي ---
const SCRIPT_SCHEMA: FunctionDeclarationSchemaType = {
  type: "object",
  properties: {
    title: { type: "string", description: 'The title of the episode.' },
    program: { type: "string", description: 'The name of the program.' },
    duration: { type: "string", description: 'The duration of the episode in minutes.' },
    content: { type: "string", description: 'The full script of the episode in the specified language, including narrator dialogue and scene descriptions.' },
    scenes: {
      type: "array",
      description: 'A breakdown of the episode into major scenes.',
      items: {
        type: "object",
        properties: {
          time: { type: "string", description: 'The time code for the scene (e.g., 00:00-05:30).' },
          description: { type: "string", description: 'A brief description of the scene and its content.' },
          visuals: { type: "string", description: 'Suggestions for visual elements (archival footage, animations, etc.).' },
        },
        required: ["time", "description", "visuals"]
      }
    },
    sources: {
        type: "array",
        description: "A list of suggested sources that can be used for fact-checking.",
        items: {
            type: "object",
            properties: {
                name: { type: "string", description: "The name of the source (e.g., National Geographic)." },
                url: { type: "string", description: "The URL of the source." }
            },
            required: ["name", "url"]
        }
    }
  },
  required: ["title", "program", "duration", "content", "scenes", "sources"]
};

export const generateScript = async (program: string, title: string, duration: string, language: string, trainingData?: TrainingData): Promise<Script> => {
  let trainingInstruction = '';
  if (trainingData) {
    switch(trainingData.method) {
      case 'instructions':
        if(trainingData.instructions) {
          trainingInstruction = `Follow these specific style guidelines for the program: "${trainingData.instructions}"`;
        }
        break;
      case 'example':
        if (trainingData.beforeText && trainingData.afterText) {
          trainingInstruction = `Learn from this example. Transform the text from a style like this: "BEFORE: ${trainingData.beforeText}" to a style like this: "AFTER: ${trainingData.afterText}". Apply this learned style to the new script.`;
        }
        break;
      case 'bulk':
        if (trainingData.instructions) { // Using 'instructions' field for bulk text
          trainingInstruction = `Analyze the following collection of texts to understand the writing style, tone, and structure. Apply this learned style to the new script you generate. Texts: """${trainingData.instructions}"""`;
        }
        break;
    }
  }

  const systemInstruction = `You are a professional scriptwriter for Discovery Channel. Your task is to generate a complete script based on the user's request. ${trainingInstruction}`;
  const prompt = `Generate a script for the program "${program}", titled "${title}". The episode duration should be ${duration} minutes. The script must be in ${language}. Provide the output as a valid JSON object that strictly follows the provided schema. Do not include any text or markdown markers outside the JSON object.`;

  try {
    // --- ✅ التصحيح الثالث: استخدام الطريقة الحديثة لتهيئة النموذج واستدعائه ---
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: { role: "user", parts: [{ text: systemInstruction }] },
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: SCRIPT_SCHEMA,
      },
    });

    const scriptJson = JSON.parse(result.response.text());
    return scriptJson as Script;
  } catch (error) {
    console.error("Error generating script:", error);
    throw new Error("فشل توليد النص. يرجى المحاولة مرة أخرى.");
  }
};

export const generateIdeas = async (program: string): Promise<string[]> => {
    const prompt = `Suggest 5 new and creative episode ideas for the Discovery program titled "${program}". Provide the ideas as a simple list separated by newlines.`;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().split('\n').filter(idea => idea.trim() !== '' && !idea.startsWith('* ')).map(idea => idea.replace(/^\d+\.\s*/, ''));
};

export const deepResearch = async (topic: string): Promise<{ research: string; sources: Source[] }> => {
    const prompt = `Conduct in-depth research on the topic: "${topic}". Provide a detailed report including key facts, historical context, important figures, and the latest developments. Use Google Search to find the most current information.`;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }],
    });

    const response = result.response;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingAttributions as GroundingChunk[] || [];
    const sources: Source[] = groundingChunks.map(chunk => ({
        name: chunk.web?.title || "Source",
        url: chunk.web?.uri || "#",
    }));
    
    return { research: response.text(), sources };
};

export const factCheckScript = async (scriptContent: string): Promise<FactCheckResult> => {
    const prompt = `Please fact-check the following script content. Assess the overall accuracy as a percentage (e.g., "Accuracy: 95%") and provide a detailed summary of any inaccurate or questionable information with suggested corrections. Use Google Search to verify the information. Script: """${scriptContent}"""`;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }],
    });

    const text = result.response.text();
    const accuracyMatch = text.match(/(\d+)%/);
    const accuracy = accuracyMatch ? parseInt(accuracyMatch[1], 10) : 85;

    return { accuracy, details: text };
};