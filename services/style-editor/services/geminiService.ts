// الملف: services/style-editor/services/geminiService.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { TextPair } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * يرسل نصًا خامًا وقائمة من أمثلة الأسلوب إلى Gemini API
 * ويعيد النص المحرر بواسطة الذكاء الاصطناعي.
 */
export async function editWithStyle(rawText: string, examples: TextPair[]): Promise<string> {
  try {
    // --- تم تصحيح هذا السطر ليستخدم "raw" و "edited" ---
    const examplePrompts = examples.map(p => `Original: ${p.raw}\nEdited: ${p.edited}`).join('\n\n');
    
    const prompt = `
      You are an expert text editor. Your task is to edit the following text based on the provided style examples.
      
      Here are the examples of the desired style:
      ${examplePrompts}
      
      Now, please edit this text in the same style:
      Original: ${rawText}
      Edited:
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const editedText = response.text();
    
    if (!editedText) {
        throw new Error("AI response was empty.");
    }
        
    return editedText;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `حدث خطأ أثناء الاتصال بخدمة Gemini: ${error.message}`;
    }
    return "حدث خطأ غير معروف.";
  }
}