import { GoogleGenerativeAI } from "@google/genai";
import { TextPair } from '../types';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Sends a raw text and a list of style examples to the Gemini API
 * and returns the AI-edited text.
 * @param rawText The text to be edited.
 * @param examples An array of text pairs demonstrating the desired editing style.
 * @returns A promise that resolves to the edited text string.
 */
export async function editWithStyle(rawText: string, examples: TextPair[]): Promise<string> {
  try {
    // Construct the prompt for the AI model
    const examplePrompts = examples.map(p => `Original: ${p.before}\nEdited: ${p.after}`).join('\n\n');
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