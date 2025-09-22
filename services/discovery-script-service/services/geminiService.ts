
import { GoogleGenAI, Type } from "@google/genai";
import { Script, FactCheckResult, Source, GroundingChunk } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SCRIPT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'عنوان الحلقة' },
    program: { type: Type.STRING, description: 'اسم البرنامج' },
    duration: { type: Type.STRING, description: 'مدة الحلقة بالدقائق' },
    content: { type: Type.STRING, description: 'النص الكامل للحلقة باللغة العربية، متضمناً حوار الراوي ووصف المشاهد.' },
    scenes: {
      type: Type.ARRAY,
      description: 'تقسيم الحلقة إلى مشاهد رئيسية.',
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: 'التوقيت الزمني للمشهد (مثال: 00:00-05:30)' },
          description: { type: Type.STRING, description: 'وصف موجز للمشهد ومحتواه.' },
          visuals: { type: Type.STRING, description: 'اقتراحات للعناصر البصرية (لقطات أرشيفية، رسوم متحركة، ...)' },
        },
        required: ["time", "description", "visuals"]
      }
    },
    sources: {
        type: Type.ARRAY,
        description: "قائمة بالمصادر المقترحة التي يمكن استخدامها للتحقق من المعلومات.",
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "اسم المصدر (مثال: National Geographic)" },
                url: { type: Type.STRING, description: "رابط المصدر" }
            },
            required: ["name", "url"]
        }
    }
  },
  required: ["title", "program", "duration", "content", "scenes", "sources"]
};


export const generateScript = async (program: string, title: string, duration: string, language: string): Promise<Script> => {
  const prompt = `أنت كاتب سيناريو محترف في قناة Discovery. قم بإنشاء نص حلقة مدتها ${duration} دقيقة لبرنامج "${program}" بعنوان "${title}". يجب أن يكون النص باللغة ${language}. قم بتوفير المخرجات ككائن JSON صالح يتبع المخطط المحدد بدقة. لا تقم بتضمين أي نص أو علامات markdown خارج كائن JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: SCRIPT_SCHEMA,
      },
    });

    const scriptJson = JSON.parse(response.text);
    return scriptJson as Script;
  } catch (error) {
    console.error("Error generating script:", error);
    throw new Error("فشل توليد النص. يرجى المحاولة مرة أخرى.");
  }
};

export const generateIdeas = async (program: string): Promise<string[]> => {
    const prompt = `اقترح 5 أفكار جديدة ومبتكرة لحلقات لبرنامج Discovery بعنوان "${program}". قدم الأفكار كقائمة بسيطة.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text.split('\n').filter(idea => idea.trim() !== '');
};

export const deepResearch = async (topic: string): Promise<{ research: string; sources: Source[] }> => {
    const prompt = `قم بإجراء بحث معمق حول موضوع: "${topic}". قدم تقريرًا مفصلاً يتضمن الحقائق الرئيسية، السياق التاريخي، الشخصيات الهامة، وآخر التطورات. استخدم بحث Google للعثور على أحدث المعلومات.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
        const sources: Source[] = groundingChunks.map(chunk => ({
            name: chunk.web.title,
            url: chunk.web.uri,
        }));
        
        return { research: response.text, sources };
    } catch (error) {
        console.error("Error during deep research:", error);
        throw new Error("فشل البحث المعمق. يرجى المحاولة مرة أخرى.");
    }
};

export const factCheckScript = async (scriptContent: string): Promise<FactCheckResult> => {
    const prompt = `يرجى تدقيق الحقائق في النص التالي. قيم الدقة الإجمالية كنسبة مئوية وقدم ملخصًا تفصيليًا لأي معلومات غير دقيقة أو مشكوك فيها مع التصحيحات المقترحة. استخدم بحث Google للتحقق من المعلومات. النص: """${scriptContent}"""`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        const text = response.text;
        // Simple parsing to extract accuracy percentage
        const accuracyMatch = text.match(/(\d+)%/);
        const accuracy = accuracyMatch ? parseInt(accuracyMatch[1], 10) : 85; // Default if not found

        return { accuracy, details: text };
    } catch (error) {
        console.error("Error during fact check:", error);
        throw new Error("فشل تدقيق الحقائق. يرجى المحاولة مرة أخرى.");
    }
};
