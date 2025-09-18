import { GoogleGenAI, Type } from "@google/genai";
import { StylePair } from "../types";

export const editWithStyle = async (
  textToEdit: string,
  stylePairs: StylePair[]
): Promise<string[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured.");
  }
  
  if (stylePairs.length === 0) {
      throw new Error("لا توجد أزواج تدريب. يرجى إضافة بعض الأمثلة في خانة التدريب أولاً.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const examples = stylePairs
    .map(
      (pair, index) =>
        `مثال ${index + 1}:\nالنص الأصلي (قبل): "${pair.before}"\nالنص المعدل (بعد): "${pair.after}"`
    )
    .join("\n\n");

  const prompt = `أنت محرر خبير ومساعد كتابة ذكي. مهمتك هي إعادة كتابة النص المقدم لك بأسلوب محدد تعلمته من الأمثلة التالية.
  
قواعد صارمة:
- يجب أن تلتزم بأسلوب "بعد" في الأمثلة المقدمة.
- يجب أن تحافظ على المعنى الأساسي للنص الأصلي دون تغيير.
- يجب أن تتجنب تمامًا أي عناصر من أسلوب "قبل".
- يجب أن تقدم نسخة واحدة مُحسَّنة من النص المُحرر.
- يجب أن يكون الرد بصيغة JSON فقط، ويجب أن يكون كائنًا يحتوي على مفتاح "edited_texts" وقيمته عبارة عن مصفوفة تحتوي على نص محرر واحد فقط.

الأمثلة على الأسلوب المطلوب:
${examples}

---
الآن، أعد كتابة النص التالي بناءً على القواعد والأمثلة أعلاه.

النص المراد تحريره:
"${textToEdit}"
`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              edited_texts: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: "An array containing one edited version of the text."
              }
            },
            required: ["edited_texts"]
          }
        }
    });
    
    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    if (parsed && Array.isArray(parsed.edited_texts) && parsed.edited_texts.length > 0) {
      return parsed.edited_texts;
    } else {
      throw new Error("لم يتمكن الذكاء الاصطناعي من إنشاء اقتراحات صالحة.");
    }

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    if (error instanceof SyntaxError) {
        throw new Error("حدث خطأ أثناء معالجة الاستجابة من الذكاء الاصطناعي. قد تكون الاستجابة غير صالحة.");
    }
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.";
    throw new Error(errorMessage);
  }
};
