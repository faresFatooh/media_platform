import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { BreakingNewsItem, GeneratedArticle, CustomNewsSource, MonitoredContentItem, MonitoredSource } from '../types';

// --- ✅ التصحيح الأول: قراءة المفتاح بالطريقة الصحيحة لـ Vite ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    // هذا السطر هو الذي يسبب الخطأ، وهو إجراء أمني جيد
    throw new Error("VITE_GEMINI_API_KEY environment variable not set.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// دالة مساعدة لتحويل الملفات إلى صيغة يفهمها Gemini
const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      mimeType: file.type,
      data: base64EncodedData,
    },
  };
};

// --- باقي دوالك تبقى كما هي، مع استخدام الطريقة الحديثة لاستدعاء النموذج ---

export const generateNewsArticle = async (
    editorialStyle: string,
    inputs: {type: string, value: string | File}[]
) : Promise<GeneratedArticle | null> => {
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    let promptParts: (string | Part)[] = ['بناءً على مصادر المعلومات التالية، قم بإنشاء مقال إخباري احترافي.'];

    // ... (منطق بناء الطلب من المدخلات يبقى كما هو)

    try {
        const result = await model.generateContent(promptParts);
        const response = result.response;
        // ... (منطق معالجة الرد يبقى كما هو)
        return JSON.parse(response.text());
    } catch (error) {
        console.error("Error generating news article:", error);
        return null;
    }
};

// وبالمثل لباقي الدوال مثل fetchBreakingNews...
export const fetchBreakingNews = async (customSources: CustomNewsSource[] = []): Promise<BreakingNewsItem[]> => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", tools: [{googleSearch: {}}] });
    // ...
    return [];
};