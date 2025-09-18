import { GoogleGenerativeAI } from "@google/genai";
import { TextPair } from '../types';

// تهيئة عميل Gemini AI باستخدام مفتاح API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * يرسل نصًا خامًا وقائمة من أمثلة الأسلوب إلى Gemini API
 * ويعيد النص المحرر بواسطة الذكاء الاصطناعي.
 * @param rawText النص المراد تحريره.
 * @param examples مصفوفة من أزواج النصوص التي توضح أسلوب التحرير المطلوب.
 * @returns وعد يتم حله إلى سلسلة نصية تحتوي على النص المحرر.
 */
export async function editWithStyle(rawText: string, examples: TextPair[]): Promise<string> {
  try {
    // بناء الطلب (prompt) لنموذج الذكاء الاصطناعي
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
        // نعيد رسالة الخطأ للواجهة الأمامية لتعرضها للمستخدم
        return `حدث خطأ أثناء الاتصال بخدمة Gemini: ${error.message}`;
    }
    return "حدث خطأ غير معروف.";
  }
}