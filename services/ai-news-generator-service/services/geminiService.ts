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

// ----------------------------
// 🛠️ Utility: Safe JSON Extractor
// ----------------------------
function extractJsonSafe(text: string): any {
  if (!text) throw new Error("Claude/Gemini response is empty.");

  // 1️⃣ نظف ```json و ```
  let cleaned = text.replace(/```json|```/g, "").trim();

  // 2️⃣ قص لآخر "}" عشان نضمن JSON مكتمل
  const lastBrace = cleaned.lastIndexOf("}");
  if (lastBrace !== -1) {
    cleaned = cleaned.slice(0, lastBrace + 1);
  }

  // 3️⃣ حاول parse
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("❌ JSON parse error حتى بعد التنظيف:\n" + cleaned);
  }
}

// ----------------------------
// ✅ دالة توليد الـ prompt
// ----------------------------
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
// ✅ Gemini (مع Safe Parsing)
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

  return extractJsonSafe(raw) as Omit<GeneratedArticle, "imageUrl">;
};

// ----------------------------
// ✅ Claude (مع Safe Parsing)
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

  // ✅ النص موجود في content[0].text
  const outputText = dataRes.content?.[0]?.text || "";
  return extractJsonSafe(outputText) as Omit<GeneratedArticle, "imageUrl">;
};

// ----------------------------
// ❌ الصور مش مدعومة
// ----------------------------
export const generateImageWithImagen = async (_prompt: string): Promise<string> => {
  throw new Error("توليد الصور غير مدعوم حالياً.");
};
