// ✅ تعريف متغيرات البيئة لـ Gemini
declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk"; // ✅ Claude SDK
import { ArticleInputType, type GeneratedArticle, type ImageFile } from '../types';

// ----------------------------
// 🔑 مفاتيح الـ APIs
// ----------------------------
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const CLAUDE_API_KEY = "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"; // ⚠️ مؤقت: بدّله لاحقاً بـ env

if (!GEMINI_API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set. Frontend Gemini calls will fail.");
}

if (!CLAUDE_API_KEY) {
  console.error("Claude API key is not set. Calls will fail.");
}

// ✅ إنشاء الكلاسات
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const anthropic = new Anthropic({ apiKey: CLAUDE_API_KEY });

// ✅ نفس المخطط (Schema) مستخدم لكل النماذج
const articleSchema = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING", description: 'عنوان جذاب للمقال الإخباري (بالعربية الفصحى).' },
    content: { type: "STRING", description: 'النص الكامل للمقال مكتوب بالعربية الفصحى فقط.' },
    summaryPoints: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: 'قائمة بأهم النقاط الملخصة من المقال مكتوبة بالعربية.'
    },
    keywords: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: 'كلمات مفتاحية مناسبة للمقال بالعربية.'
    },
    sources: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: 'المصادر المحتملة للمعلومات. إذا كانت من رابط، اذكر الرابط. إذا لا، اكتب "محتوى أصلي".'
    },
    socialMediaPosts: {
      type: "OBJECT",
      properties: {
        twitter: { type: "STRING", description: 'منشور قصير وجذاب لتويتر/X مكتوب بالعربية.' },
        facebook: { type: "STRING", description: 'منشور أطول قليلاً لفيسبوك مكتوب بالعربية.' }
      },
      required: ['twitter', 'facebook']
    }
  },
  required: ['title', 'content', 'summaryPoints', 'keywords', 'sources', 'socialMediaPosts']
};

// ✅ نفس دالة توليد الـ prompt (لكلاهما)
const getPrompt = (inputType: ArticleInputType, data: string | ImageFile): string => {
  let textPrompt = "";

  switch (inputType) {
    case ArticleInputType.TITLE:
      textPrompt = `اكتب مقالاً إخبارياً مفصلاً. ⚠️ النص يجب أن يكون بالعربية الفصحى فقط.
العنوان: "${data as string}"`;
      break;
    case ArticleInputType.TEXT:
      textPrompt = `قم بتوسيع النص التالي وتحويله إلى مقال إخباري متكامل بالعربية الفصحى:
---
${data as string}
---`;
      break;
    case ArticleInputType.URL:
      textPrompt = `لخص المحتوى من الرابط التالي ثم أنشئ مقالاً إخبارياً بالعربية الفصحى فقط. ممنوع النسخ الحرفي.
الرابط: ${data as string}`;
      break;
    case ArticleInputType.IMAGE:
      textPrompt = "حلل الصورة المرفقة وأنشئ مقالاً إخبارياً بالعربية الفصحى يصف الحدث أو المشهد.";
      break;
  }

  return `${textPrompt}

مهم جداً:
- يجب أن يكون الإخراج كائن JSON واحد فقط يتوافق مع هذا المخطط:
${JSON.stringify(articleSchema, null, 2)}

- لا تضف أي نصوص أو شروحات إضافية.`;
};

// ----------------------------
// ✅ Gemini
// ----------------------------
export const generateArticleWithGemini = async (
  inputType: ArticleInputType,
  data: string | ImageFile,
): Promise<Omit<GeneratedArticle, 'imageUrl'>> => {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-latest",
    systemInstruction: `
      أنت صحفي محترف. 
      ❌ لا تستخدم أي لغة غير العربية.
      ✅ جميع المخرجات يجب أن تكون بالعربية الفصحى فقط.
      دائماً أعد النتيجة بصيغة JSON فقط.
    `
  });

  const prompt = getPrompt(inputType, data);

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
    }
  });

  const jsonString = result.response.text();
  return JSON.parse(jsonString) as Omit<GeneratedArticle, 'imageUrl'>;
};

// ----------------------------
// ✅ Claude
// ----------------------------
export const generateArticleWithClaude = async (
  inputType: ArticleInputType,
  data: string | ImageFile,
): Promise<Omit<GeneratedArticle, 'imageUrl'>> => {
  if (!CLAUDE_API_KEY) {
    throw new Error("Claude API key is not configured.");
  }

  const prompt = getPrompt(inputType, data);

  const msg = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1000,
    temperature: 0.7,
    system: `
      أنت صحفي محترف. 
      ❌ لا تستخدم أي لغة غير العربية.
      ✅ جميع المخرجات يجب أن تكون بالعربية الفصحى فقط.
      دائماً أعد النتيجة بصيغة JSON فقط.
    `,
    messages: [
      { role: "user", content: prompt }
    ]
  });

  const text = msg.content[0].text;
  return JSON.parse(text) as Omit<GeneratedArticle, 'imageUrl'>;
};

// ----------------------------
// ❌ الصور مش مدعومة
// ----------------------------
export const generateImageWithImagen = async (prompt: string): Promise<string> => {
  throw new Error("توليد الصور غير مدعوم حالياً.");
};
