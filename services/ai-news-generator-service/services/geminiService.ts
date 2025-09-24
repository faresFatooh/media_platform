// ✅ تعريف متغيرات البيئة
declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { ArticleInputType, type GeneratedArticle, type ImageFile } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set. Frontend Gemini calls will fail.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ✅ المخطط (Schema) كله صار موصوف بالعربية
const articleSchema = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING", description: 'عنوان جذاب للمقال الإخباري.' },
    content: { type: "STRING", description: 'النص الكامل للمقال مكتوب بالعربية الفصحى.' },
    summaryPoints: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: 'قائمة بأهم النقاط الملخصة من المقال.'
    },
    keywords: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: 'كلمات مفتاحية مناسبة للمقال.'
    },
    sources: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: 'المصادر المحتملة للمعلومات. إذا كانت من رابط، اذكر الرابط. إذا لا، اكتب "محتوى أصلي".'
    },
    socialMediaPosts: {
      type: "OBJECT",
      properties: {
        twitter: { type: "STRING", description: 'منشور قصير وجذاب لتويتر/X.' },
        facebook: { type: "STRING", description: 'منشور أطول قليلاً لفيسبوك.' }
      },
      required: ['twitter', 'facebook']
    }
  },
  required: ['title', 'content', 'summaryPoints', 'keywords', 'sources', 'socialMediaPosts']
};

// ✅ البارامتيرات كلها صارت تطلب إخراج بالعربية
const getPromptParts = (inputType: ArticleInputType, data: string | ImageFile): Part[] => {
  const parts: Part[] = [];
  let textPrompt = "";

  switch (inputType) {
    case ArticleInputType.TITLE:
      textPrompt = `اكتب مقالاً إخبارياً مفصلاً باللغة العربية استناداً إلى العنوان التالي: "${data as string}"`;
      break;
    case ArticleInputType.TEXT:
      textPrompt = `قم بتوسيع النص التالي وتحويله إلى مقال إخباري متكامل باللغة العربية:\n\n---\n${data as string}\n---`;
      break;
    case ArticleInputType.URL:
      textPrompt = `لخص المحتوى من الرابط التالي ثم أنشئ مقالاً إخبارياً باللغة العربية بناءً على هذا الملخص. لا تنسخ النص مباشرة. الرابط: ${data as string}`;
      break;
    case ArticleInputType.IMAGE:
      const imageFile = data as ImageFile;
      parts.push({
        inlineData: {
          mimeType: imageFile.mimeType,
          data: imageFile.base64
        }
      });
      textPrompt = "حلل الصورة المرفقة وأنشئ مقالاً إخبارياً باللغة العربية يصف الحدث أو المشهد الظاهر فيها.";
      break;
  }

  const fullPrompt = `${textPrompt}\n\nمهم جداً: يجب أن يكون الإخراج عبارة عن كائن JSON واحد فقط يتوافق تماماً مع المخطط التالي. لا تضف أي شروح أو نصوص أخرى أو أكواد Markdown مثل \`\`\`json.\n\nالمخطط (JSON Schema):\n${JSON.stringify(articleSchema, null, 2)}`;
  parts.unshift({ text: fullPrompt });

  return parts;
}

/**
 * ✅ توليد مقال بالعربية من Gemini
 */
export const generateArticleWithGemini = async (
  inputType: ArticleInputType,
  data: string | ImageFile,
): Promise<Omit<GeneratedArticle, 'imageUrl'>> => {

  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your environment.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    systemInstruction: `
أنت صحفي محترف. مهمتك توليد مقالات إخبارية دقيقة ومحايدة باللغة العربية الفصحى.
يجب أن يكون الناتج دائماً بصيغة JSON فقط حسب المخطط المطلوب، دون أي نص إضافي أو شرح.
`
  });

  const promptParts = getPromptParts(inputType, data);

  const result = await model.generateContent({
    contents: [{ role: "user", parts: promptParts }],
    generationConfig: {
      responseMimeType: 'application/json',
    }
  });

  try {
    const response = result.response;
    const jsonString = response.text();
    const parsedJson = JSON.parse(jsonString);
    return parsedJson as Omit<GeneratedArticle, 'imageUrl'>;
  } catch (e) {
    console.error("⚠️ Failed to parse Gemini response as JSON:", result.response.text());
    throw new Error("فشل في معالجة استجابة الذكاء الاصطناعي. المخرجات لم تكن JSON صالح.");
  }
};

/**
 * ❌ توليد الصور غير مدعوم حالياً في @google/generative-ai
 */
export const generateImageWithImagen = async (prompt: string): Promise<string> => {
  console.warn('Attempted to call generateImageWithImagen with prompt:', prompt);
  throw new Error("توليد الصور غير مدعوم حالياً. هذه الميزة تحتاج Backend مختلف.");
}
