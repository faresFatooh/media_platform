import { TextPair } from "../types";
import { callPredictAPI } from "./apiService";

// تحرير النص باستخدام Gemini عبر الباك اند
export async function editWithStyle(rawText: string, examples: TextPair[]): Promise<string> {
  try {
    // إرسال النص + الأمثلة (إذا أردت أن الباك اند يستخدمها)
    const editedText = await callPredictAPI(rawText);
    return editedText;
  } catch (error: any) {
    console.error("Error calling style editor API:", error);
    return `حدث خطأ: ${error.message || "غير معروف"}`;
  }
}
