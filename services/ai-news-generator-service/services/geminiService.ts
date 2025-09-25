// ✅ تعريف متغيرات البيئة
declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
    readonly VITE_CLAUDE_PROXY_URL: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { ArticleInputType, type GeneratedArticle, type ImageFile } from "../types";

// ----------------------------
// 🔑 مفاتيح الـ APIs
// ----------------------------
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const CLAUDE_PROXY_URL = import.meta.env.VITE_CLAUDE_PROXY_URL;

if (!GEMINI_API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set. Gemini calls will fail.");
}
if (!CLAUDE_PROXY_URL) {
  console.error("VITE_CLAUDE_PROXY_URL is not set. Claude calls will fail.");
}

// ✅ إنشاء كائن Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ✅ نفس المخطط (Schema)
const articleSchema = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING", description: "عنوان جذاب للمقال الإخباري (بالعربية الفصحى)." },
    content: { type: "STRING", description: "النص الكامل للمقال مكتوب بالعربية الفصحى فقط." },
    summaryPoints: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "قائمة بأهم النقاط الملخصة من المقال مكتوبة بالعربية.",
    },
    keywords: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "كلمات مفتاحية مناسبة للمقال بالعربية.",
    },
    sources: {
      type: "ARRAY",
      items: { type: "STRING" },
      description:
        'المصادر المحتملة للمعلومات. إذا كانت من رابط، اذكر الرابط. إذا لا، اكتب "محتوى أصلي".',
    },
    socialMediaPosts: {
      type: "OBJECT",
      properties: {
        twitter: { type: "STRING", description: "منشور قصير وجذاب لتويتر/X مكتوب بالعربية." },
        facebook: { type: "STRING", description: "منشور أطول قليلاً لفيسبوك مكتوب بالعربية." },
      },
      required: ["twitter", "facebook"],
    },
  },
  required: ["title", "content", "summaryPoints", "keywords", "sources", "socialMediaPosts"],
};

// ✅ دالة توليد الـ prompt
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
      textPrompt =
        "حلل الصورة المرفقة وأنشئ مقالاً إخبارياً بالعربية الفصحى يصف الحدث أو المشهد.";
      break;
  }

  return `${textPrompt}

مهم جداً:
- أعد الناتج كـ JSON **صالح فقط**.
- هيكل JSON يجب أن يحتوي فقط على:
  {
    "title": string,
    "content": string,
    "summaryPoints": string[],
    "keywords": string[],
    "sources": string[],
    "socialMediaPosts": {
      "twitter": string,
      "facebook": string
    }
  }
- لا تكرر المخطط.
- لا تضع أي نصوص أو شروحات خارج JSON.
`;
};

// ----------------------------
// 🛠️ دالة Safe JSON Parse
// ----------------------------
function safeJsonParse(text: string): any {
  if (!text) throw new Error("Claude/Gemini response is empty.");

  // 1️⃣ شيل ```json و ```
  let cleaned = text.replace(/```json|```/g, "").trim();

  // 2️⃣ جرّب مباشرة
  try {
    return JSON.parse(cleaned);
  } catch {}

  // 3️⃣ قص لآخر }
  const lastBrace = cleaned.lastIndexOf("}");
  if (lastBrace !== -1) {
    cleaned = cleaned.slice(0, lastBrace + 1);
  }

  // 4️⃣ إذا ما في } مسكّرة، ضيف وحدة
  if (!cleaned.endsWith("}")) {
    cleaned += "}";
  }

  try {
    return JSON.parse(cleaned);
  } catch {}

  // 5️⃣ fallback JSON
  return {
    title: "مقال غير مكتمل",
    content: cleaned,
    summaryPoints: [],
    keywords: [],
    sources: ["محتوى أصلي"],
    socialMediaPosts: {
      twitter: "",
      facebook: "",
    },
  };
}

// ----------------------------
// ✅ Gemini
// ----------------------------
export const generateArticleWithGemini = async (
  inputType: ArticleInputType,
  data: string | ImageFile
): Promise<Omit<GeneratedArticle, "imageUrl">> => {
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
    `,
  });

  const prompt = getPrompt(inputType, data);

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" },
  });

  const raw = result.response.text();
  console.log("Gemini raw output:", raw);

  return safeJsonParse(raw) as Omit<GeneratedArticle, "imageUrl">;
};

// ----------------------------
// ✅ Claude
// ----------------------------
export const generateArticleWithClaude = async (
  inputType: ArticleInputType,
  data: string | ImageFile
): Promise<Omit<GeneratedArticle, "imageUrl">> => {
  if (!CLAUDE_PROXY_URL) {
    throw new Error("Claude proxy URL is not configured.");
  }

  const prompt = getPrompt(inputType, data);

  const res = await fetch(`${CLAUDE_PROXY_URL}/api/claude/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const raw = await res.text();
  console.log("Claude raw output:", raw);

  if (!res.ok) {
    throw new Error(`Claude proxy error: ${res.statusText}\nRaw response:\n${raw}`);
  }

  let dataRes: any;
  try {
    dataRes = JSON.parse(raw);
  } catch (err) {
    throw new Error("Claude proxy did not return valid JSON. Raw output:\n" + raw);
  }

  const outputText = dataRes.content?.[0]?.text || "";
  return safeJsonParse(outputText) as Omit<GeneratedArticle, "imageUrl">;
};

// ----------------------------
// ❌ الصور مش مدعومة
// ----------------------------
export const generateImageWithImagen = async (_prompt: string): Promise<string> => {
  throw new Error("توليد الصور غير مدعوم حالياً.");
};
