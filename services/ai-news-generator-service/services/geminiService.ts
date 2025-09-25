import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedArticle, ArticleInputType, ImageFile, BreakingNewsTopic, NewsSource } from '../types';
import { ArticleInputType as ArticleInputTypeEnum } from '../types';


const API_KEY = process.env.API_KEY;
const CLAUDE_PROXY_URL = process.env.CLAUDE_PROXY_URL;


if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume the key is present.
  console.warn("API_KEY environment variable not set for Gemini.");
}
if (!CLAUDE_PROXY_URL) {
  console.warn("CLAUDE_PROXY_URL environment variable not set. Claude model will not be available.");
}


const ai = new GoogleGenAI({ apiKey: API_KEY! });

const articleSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "عنوان جذاب ومناسب للخبر." },
    content: { type: Type.STRING, description: "نص المقال الكامل، منسق بفقرات وعناوين فرعية إذا لزم الأمر." },
    sources: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "قائمة بالمصادر أو الاقتباسات المستخدمة في المقال."
    },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "قائمة بالكلمات المفتاحية لتحسين محركات البحث (SEO)."
    },
    summaryPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "ملخص للمقال في شكل نقاط رئيسية."
    },
    socialMediaPosts: {
      type: Type.OBJECT,
      properties: {
        twitter: { type: Type.STRING, description: "منشور جاهز للنشر على تويتر (280 حرفًا كحد أقصى)." },
        facebook: { type: Type.STRING, description: "منشور جاهز للنشر على فيسبوك." },
      },
       required: ["twitter", "facebook"]
    }
  },
  required: ["title", "content", "sources", "keywords", "summaryPoints", "socialMediaPosts"]
};


const getPrompt = (inputType: ArticleInputType, data: string): string => {
  const basePrompt = `أنت صحفي محترف ومحرر أخبار خبير. مهمتك هي كتابة مقال إخباري شامل وعالي الجودة باللغة العربية.
  يجب أن يكون المقال موضوعيًا ودقيقًا وجذابًا للقراء.
  قم بإنشاء المقال بناءً على المدخل التالي:`;

  switch (inputType) {
    case ArticleInputTypeEnum.TITLE:
      return `${basePrompt}\n\n**العنوان:**\n${data}`;
    case ArticleInputTypeEnum.TEXT:
      return `${basePrompt}\n\n**النص الأساسي:**\n${data}`;
    case ArticleInputTypeEnum.URL:
      return `${basePrompt}\n\n**رابط المصدر:**\n${data}\n\n(ملاحظة: قم بتحليل محتوى الرابط واستخدمه كمصدر أساسي للمقال).`;
    case ArticleInputTypeEnum.IMAGE:
      return `أنت صحفي محترف. صف الحدث في الصورة المرفقة واكتب مقالاً إخباريًا شاملاً حوله باللغة العربية.`;
    default:
      return data;
  }
};

const safeJsonParse = (jsonString: string): Omit<GeneratedArticle, 'imageUrl'> => {
  let cleanedString = jsonString.trim();

  // Remove markdown fences
  cleanedString = cleanedString.replace(/^```json\s*/, '').replace(/```$/, '');

  try {
    // First attempt to parse directly
    return JSON.parse(cleanedString);
  } catch (e) {
    console.warn("Initial JSON parse failed, attempting cleanup.", e);
    
    // Attempt to fix incomplete JSON by finding the last closing brace
    if (!cleanedString.endsWith('}')) {
        const lastBrace = cleanedString.lastIndexOf('}');
        if (lastBrace > -1) {
            cleanedString = cleanedString.substring(0, lastBrace + 1);
        }
    }
    
    // Add closing brace if object is open and doesn't have one
    if (cleanedString.startsWith('{') && !cleanedString.endsWith('}')) {
        cleanedString += '}';
    }

    try {
        return JSON.parse(cleanedString);
    } catch (finalError) {
        console.error("Final JSON parse failed after cleanup.", finalError);
        // Fallback to a partial object
        return {
            title: "فشل تحليل المقال",
            content: `تم استلام محتوى غير صالح من النموذج. المحتوى الخام:\n\n${jsonString}`,
            sources: [],
            keywords: [],
            summaryPoints: [],
            socialMediaPosts: {
                twitter: "",
                facebook: "",
            },
        };
    }
  }
};


export const generateArticle = async (inputType: ArticleInputType, data: string | ImageFile): Promise<Omit<GeneratedArticle, 'imageUrl'>> => {
  try {
    const contents = (inputType === ArticleInputTypeEnum.IMAGE && typeof data === 'object') 
      ? { parts: [
          { inlineData: { data: data.base64, mimeType: data.mimeType } },
          { text: getPrompt(inputType, '') }
        ]}
      : getPrompt(inputType, data as string);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: articleSchema,
        temperature: 0.7,
      }
    });

    const jsonText = response.text.trim();
    // A simple check to ensure we got some JSON
    if (!jsonText.startsWith('{') || !jsonText.endsWith('}')) {
        throw new Error("Invalid JSON response from API.");
    }
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating article:", error);
    throw new Error("فشل توليد المقال. يرجى المحاولة مرة أخرى.");
  }
};


export const generateArticleWithClaude = async (inputType: ArticleInputType, data: string | ImageFile): Promise<Omit<GeneratedArticle, 'imageUrl'>> => {
  if (!CLAUDE_PROXY_URL) {
    throw new Error("لم يتم تكوين عنوان URL الوكيل لـ Claude.");
  }

  if (inputType === ArticleInputTypeEnum.IMAGE) {
    throw new Error("توليد المقالات من الصور غير مدعوم حاليًا مع Claude في هذا التطبيق.");
  }
  
  try {
    const userPrompt = getPrompt(inputType, data as string);
    const schemaString = JSON.stringify(articleSchema, null, 2);

    const systemPrompt = `مهمتك هي العمل كمحرر أخبار AI. قم بإنشاء مقال إخباري بناءً على طلب المستخدم.
يجب أن يكون الإخراج دائمًا كائن JSON صالحًا تمامًا، بدون أي نص إضافي أو توضيحات قبله أو بعده.
التزم تمامًا بهذا المخطط JSON:
${schemaString}
`;
    
    const response = await fetch(CLAUDE_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`فشل استدعاء Claude API: ${response.status} ${errorBody}`);
    }

    const responseData = await response.json();
    const claudeContent = responseData.content?.[0]?.text || '';

    if (!claudeContent) {
        throw new Error("تم استلام استجابة فارغة من Claude.");
    }

    return safeJsonParse(claudeContent);

  } catch (error) {
    console.error("Error generating article with Claude:", error);
    throw new Error("فشل توليد المقال باستخدام Claude. يرجى المحاولة مرة أخرى.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const imagePrompt = `صورة فوتوغرافية واقعية لمقال إخباري عن: "${prompt}". يجب أن تكون الصورة ذات جودة عالية ومناسبة للنشر الصحفي.`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("No image was generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("فشل توليد الصورة. يرجى المحاولة مرة أخرى.");
  }
};

export const getNewsFromSources = async (sources: NewsSource[]): Promise<BreakingNewsTopic[]> => {
  if (sources.length === 0) {
    return [];
  }
  try {
    const sourceUrls = sources.map(s => new URL(s.url).hostname).join(', ');
    const prompt = `بصفتك محرر أخبار، قم بمراجعة المواقع الإخبارية التالية: ${sourceUrls}.
أوجد أهم 5 قصص إخبارية عاجلة ومهمة منها حالياً.
لكل خبر، اتبع التنسيق التالي بدقة شديدة:
العنوان: [عنوان الخبر هنا]
الملخص: [ملخص من جملتين إلى ثلاث جمل هنا]
---`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Parse the text response
    const topics: Omit<BreakingNewsTopic, 'sources'>[] = text.split('---')
      .map(part => part.trim())
      .filter(part => part.length > 0)
      .map(part => {
        const titleMatch = part.match(/العنوان: (.*)/);
        const summaryMatch = part.match(/الملخص: ([\s\S]*)/); // Match multi-line summary
        const title = titleMatch ? titleMatch[1].trim() : 'لم يتم العثور على عنوان';
        const summary = summaryMatch ? summaryMatch[1].trim() : 'لم يتم العثور على ملخص.';
        return { title, summary };
      });

    // Distribute sources among topics (simple distribution)
    const topicsWithSources: BreakingNewsTopic[] = topics.map((topic, index) => {
        const sourcesPerTopic = Math.ceil(groundingChunks.length / topics.length);
        const startIndex = index * sourcesPerTopic;
        const endIndex = startIndex + sourcesPerTopic;
        const assignedSources = groundingChunks.slice(startIndex, endIndex).map(chunk => chunk.web);
        
        return {
            ...topic,
            sources: assignedSources.filter(s => s) as { uri: string; title: string; }[],
        };
    });

    if (topicsWithSources.length === 0 && text.length > 0) {
        // Fallback if parsing fails but we have some text
        return [{ title: "مستجدات الأخبار", summary: text, sources: groundingChunks.map(c => c.web).filter(s => s) as { uri: string; title: string; }[] }]
    }

    return topicsWithSources;

  } catch (error) {
    console.error("Error fetching breaking news:", error);
    throw new Error("فشل في جلب الأخبار العاجلة.");
  }
};
