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
import {
  ArticleInputType,
  type GeneratedArticle,
  type ImageFile,
  type NewsSource,
  type BreakingNewsTopic,
} from "../types";

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
// 🛠️ Safe JSON Parse
// ----------------------------
function safeJsonParse(text: string): any {
  if (!text) throw new Error("Claude/Gemini response is empty.");

  // 🟢 1. تنظيف من ```json و ```
  let cleaned = text.replace(/```json|```/g, "").trim();

  // 🟢 2. قص على أول { وآخر } فقط
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  // 🟢 3. محاولة parse طبيعي
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("❌ JSON.parse failed, trying repair:", e);
  }

  // 🟢 4. إصلاح سريع: لو في سترينغ مش مسكّر → سكّره يدوياً
  if (cleaned.match(/"content":\s*".*$/s)) {
    cleaned = cleaned.replace(/"content":\s*"([^"]*)$/, `"content": "$1"`);
    if (!cleaned.trim().endsWith("}")) {
      cleaned += "}";
    }
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      console.error("❌ JSON repair failed:", e2, "raw:", text);
    }
  }

  // 🟢 5. fallback → رجّع object ناقص
  return {
    title: "مقال غير مكتمل",
    content: cleaned,
    summaryPoints: [],
    keywords: [],
    sources: ["Claude/Gemini أرجع JSON غير مكتمل"],
    socialMediaPosts: { twitter: "", facebook: "" },
  };
}

// ----------------------------
// 📝 توليد الـ Prompt
// ----------------------------
const getPrompt = (inputType: ArticleInputType, data: string | ImageFile): string => {
  let textPrompt = "";

  switch (inputType) {
    case ArticleInputType.TITLE:
      textPrompt = `اكتب مقالاً إخبارياً مفصلاً بالعربية الفصحى.
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
- أعد الناتج كـ JSON صالح فقط.
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
}`;
};

// ----------------------------
// ✅ Gemini
// ----------------------------
export const generateArticleWithGemini = async (
  inputType: ArticleInputType,
  data: string | ImageFile
): Promise<Omit<GeneratedArticle, "imageUrl">> => {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key is not configured.");

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
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
  if (!CLAUDE_PROXY_URL) throw new Error("Claude proxy URL is not configured.");

  const prompt = getPrompt(inputType, data);

  const body = {
    system: `
      أنت صحفي محترف. 
      ❌ لا تستخدم أي لغة غير العربية.
      ✅ جميع المخرجات يجب أن تكون بالعربية الفصحى فقط.
      دائماً أعد النتيجة بصيغة JSON فقط.
      هيكل JSON المطلوب:
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
    `,
    prompt,
    response_mime_type: "application/json",
    max_tokens: 2000, // ⬅️ منع القطع
  };

  const res = await fetch(`${CLAUDE_PROXY_URL}/api/claude/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  console.log("Claude raw output:", raw);

  if (!res.ok) {
    throw new Error(`Claude proxy error: ${res.statusText}\nRaw response:\n${raw}`);
  }

  // 🔥 بعض البروكسيات ترجّع { content: [{ text: "..."}] }
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return safeJsonParse(raw) as Omit<GeneratedArticle, "imageUrl">;
  }

  const outputText = parsed.content?.[0]?.text || raw;

  return safeJsonParse(outputText) as Omit<GeneratedArticle, "imageUrl">;
};

// ----------------------------
// ✅ Breaking News
// ----------------------------
export const getBreakingNewsFromSources = async (
  sources: NewsSource[]
): Promise<BreakingNewsTopic[]> => {
  if (!sources || sources.length === 0) return [];

  const validSources = sources.filter((s) => s && s.url);
  if (validSources.length === 0) return [];

  try {
    const sourceUrls = validSources
      .map((s) => {
        try {
          return new URL(s.url).hostname;
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .join(", ");

    const prompt = `أنت مساعد صحفي محترف.
اعرض أهم 5 أخبار عاجلة من المواقع التالية: ${sourceUrls}.
مهم جداً:
- لا تضف أي مقدمة أو شرح عام.
- أعرض الأخبار فقط بهذا الشكل:
العنوان: [عنوان الخبر]
الملخص: [ملخص من جملتين إلى ثلاث جمل]
---`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = response.response.text();

    let cleanedText = text
      .replace(/^.*بصفتي محرر أخبار.*$/gmi, "")
      .replace(/^.*As a news editor.*$/gmi, "")
      .trim();

    const topics: Omit<BreakingNewsTopic, "sources">[] = cleanedText
      .split("---")
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .map((part) => {
        const titleMatch = part.match(/(?:العنوان|Title)\s*[:：]\s*(.+)/);
        const summaryMatch = part.match(/(?:الملخص|Summary)\s*[:：]\s*([\s\S]+)/);

        return {
          title: titleMatch ? titleMatch[1].trim() : part.split("\n")[0].trim(),
          summary: summaryMatch
            ? summaryMatch[1].trim()
            : part.replace(/(?:العنوان|Title)\s*[:：].*/, "").trim(),
        };
      });

    const candidate = response.response.candidates?.[0] as any;
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];

    const fallbackSources = validSources.map((s) => ({
      uri: s.url,
      title: new URL(s.url).hostname,
    }));

    const topicsWithSources: BreakingNewsTopic[] = topics.map((topic, index) => {
      const sourcesPerTopic = Math.ceil(groundingChunks.length / topics.length);
      const startIndex = index * sourcesPerTopic;
      const endIndex = startIndex + sourcesPerTopic;
      const assignedSources = groundingChunks
        .slice(startIndex, endIndex)
        .map((chunk: any) => chunk.web);

      const finalSources =
        assignedSources.length > 0
          ? (assignedSources.filter((s: any) => s) as { uri: string; title: string }[])
          : fallbackSources;

      return {
        ...topic,
        sources: finalSources,
      };
    });

    if (topicsWithSources.length === 0 && cleanedText.length > 0) {
      return [
        {
          title: "مستجدات الأخبار",
          summary: cleanedText,
          sources: fallbackSources,
        },
      ];
    }

    return topicsWithSources;
  } catch (error) {
    console.error("Error fetching breaking news:", error);
    throw new Error("فشل في جلب الأخبار العاجلة.");
  }
};

// ----------------------------
// 🚫 الصور غير مدعومة
// ----------------------------
export const generateImageWithImagen = async (_prompt: string): Promise<string> => {
  throw new Error("توليد الصور غير مدعوم حالياً.");
};
