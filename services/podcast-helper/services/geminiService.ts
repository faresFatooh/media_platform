import { GoogleGenAI, Type } from "@google/genai";
import { PodcastMetadata } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateScript = async (content: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `أنت مساعد أتمتة نصوص البودكاست. مهمتك هي تحويل المحتوى التالي إلى نص بودكاست جذاب ومنظم بشكل جيد. يجب أن يكون النص جاهزًا للسرد الصوتي وأن يبدو طبيعيًا وحواريًا.

      قم بتنظيم النص بالأقسام التالية:
      - **مقدمة:** افتتاحية موجزة وجذابة لجذب المستمع. قدم الموضوع.
      - **المحتوى الرئيسي:** تحليل مفصل للنقاط الرئيسية من المحتوى المصدر. استخدم لغة واضحة، ورواية قصص مقنعة، وتدفقًا منطقيًا. قسم الموضوعات المعقدة إلى أجزاء سهلة الفهم.
      - **خاتمة:** ملخص ختامي للنقاط الرئيسية وعبارة ختامية لا تُنسى.

      ها هو المحتوى المراد تحويله:
      ---
      ${content}
      ---

      قم بإنشاء نص البودكاست الآن.`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating script:", error);
    throw new Error("فشل في إنشاء النص. يرجى التحقق من مفتاح API الخاص بك واتصال الشبكة.");
  }
};

export const generateMetadataAndTranscript = async (
  finalScript: string,
  isTranscriptEnabled: boolean
): Promise<{ metadata: PodcastMetadata; transcript: string | null }> => {
  const metadataPromise = generateMetadata(finalScript);
  const transcriptPromise = isTranscriptEnabled ? generateTranscript(finalScript) : Promise.resolve(null);

  try {
    const [metadata, transcript] = await Promise.all([metadataPromise, transcriptPromise]);
    return { metadata, transcript };
  } catch (error) {
    console.error("Error in parallel generation:", error);
    throw new Error("فشل في إنشاء أصول البودكاست. يرجى المحاولة مرة أخرى.");
  }
};

const generateMetadata = async (script: string): Promise<PodcastMetadata> => {
   try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `أنت مساعد نشر بودكاست. بناءً على نص البودكاست التالي، قم بإنشاء البيانات الوصفية اللازمة للنشر على منصات مثل سبوتيفاي وآبل بودكاست.

      نص البودكاست:
      ---
      ${script}
      ---
      
      قم بإنشاء البيانات الوصفية بصيغة JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "عنوان جذاب وذو صلة لحلقة البودكاست (بحد أقصى 80 حرفًا)."
            },
            description: {
              type: Type.STRING,
              description: "ملخص موجز للحلقة لحقل الوصف (بحد أقصى 4000 حرف)."
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "مجموعة من 5-10 كلمات رئيسية أو وسوم ذات صلة لسهولة الاكتشاف."
            }
          },
          required: ["title", "description", "tags"]
        },
      },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as PodcastMetadata;

  } catch (error) {
    console.error("Error generating metadata:", error);
    throw new Error("فشل في إنشاء بيانات البودكاست الوصفية.");
  }
};

const generateTranscript = async (script: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `أنت مساعد تفريغ صوتي. بناءً على نص البودكاست التالي، قم بإنشاء نسخة نصية نظيفة ومنسقة للحلقة. سيتم توفير هذه النسخة بجانب الصوت للمستمعين. تأكد من أن التنسيق واضح وسهل القراءة، مع إزالة عناوين الأقسام مثل "مقدمة" أو "المحتوى الرئيسي" وتقديمه ككتلة واحدة من النص المنطوق.

      نص البودكاست:
      ---
      ${script}
      ---
      
      قم بإنشاء النسخة النصية النظيفة الآن.`,
      config: {
        temperature: 0.2,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error generating transcript:", error);
    throw new Error("فشل في إنشاء النسخة النصية.");
  }
};