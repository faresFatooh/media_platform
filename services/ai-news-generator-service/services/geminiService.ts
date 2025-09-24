import { GoogleGenAI, Type, GenerateContentResponse, Part, Modality } from "@google/genai";
import { BreakingNewsItem, GeneratedArticle, CustomNewsSource, MonitoredContentItem, MonitoredSource } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  const data = await base64EncodedDataPromise;
  return {
    inlineData: {
      mimeType: file.type,
      data,
    },
  };
};

export const generateNewsArticle = async (
    editorialStyle: string,
    inputs: {type: string, value: string | File}[]
) : Promise<GeneratedArticle | null> => {
    
    let promptParts: Part[] = [];

    for(const input of inputs){
        if(input.type === 'URL' || input.type === 'TITLE' || input.type === 'TEXT'){
             if (typeof input.value === 'string' && input.value.trim()) {
                promptParts.push({ text: `\n\n--- مصدر معلومات: ${input.type} ---\n${input.value}` });
            }
        } else if (input.type === 'FILE' && input.value instanceof File){
            const filePart = await fileToGenerativePart(input.value);
            
            let fileInstructionText = `\n\n--- مصدر معلومات: ملف (${input.value.name}) ---\n`;
            
            const mimeType = input.value.type;
            if (mimeType.startsWith('image/')) {
                fileInstructionText += "قم بتحليل محتوى هذه الصورة واستخدمه كمصدر أساسي للمعلومات.";
            } else if (mimeType.startsWith('audio/')) {
                fileInstructionText += "قم بتحليل المحتوى الصوتي في هذا الملف واستخدمه كمصدر أساسي للمعلومات.";
            } else if (mimeType.startsWith('video/')) {
                fileInstructionText += "قم بتحليل المحتوى المرئي والصوتي في هذا الفيديو واستخدمه كمصدر أساسي للمعلومات.";
            } else if (mimeType === 'application/pdf') {
                fileInstructionText += "قم باستخلاص النص من ملف PDF هذا واستخدمه كمصدر أساسي للمعلومات.";
            } else if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                fileInstructionText += "قم باستخلاص النص من مستند Word هذا واستخدمه كمصدر أساسي للمعلومات.";
            } else {
                fileInstructionText += "قم بتحليل محتوى هذا الملف واستخدمه كمصدر أساسي للمعلومات.";
            }
            
            promptParts.push(filePart);
            promptParts.push({ text: fileInstructionText });
        }
    }

    if (promptParts.length === 0) {
        console.error("No valid inputs provided to generate article.");
        return null;
    }

    const systemInstruction = `أنت محرر أخبار محترف وخبير في تحسين محركات البحث (AISEO). مهمتك هي إنشاء مقالات إخبارية تتبع بدقة الأسلوب التحريري المرفق. قم بتحليل النبرة، والمصطلحات، وهيكل الجمل، والتوجه الصحفي في الأسلوب المرجعي وقم بمحاككاته بشكل مثالي. يجب أن يكون المقال جاهزًا للنشر مباشرة على منصات مثل "النجاح الإخباري" أو "الشرق فلسطين".
مهم جدًا: التزم فقط بالمصادر والمعلومات المقدمة لك لتوليد الخبر. لا تستخدم أي معلومات خارجية أو معرفة سابقة لديك على الإطلاق. يجب أن يكون المحتوى الناتج مستندًا بشكل حصري وكامل على المدخلات التي تم تزويدك بها.
--- الأسلوب التحريري المرجعي ---
${editorialStyle}
--- نهاية الأسلوب المرجعي ---
`;

    const request = {
        model: 'gemini-2.5-flash',
        contents: [
            {
                parts: [
                    {text: 'بناءً على مصادر المعلومات التالية، قم بإنشاء مقال إخباري احترافي.'},
                    ...promptParts,
                ]
            }
        ],
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    headline: { type: Type.STRING, description: 'عنوان جذاب ومناسب لمحركات البحث للمقال.' },
                    body: { type: Type.STRING, description: 'نص المقال الكامل، منسق باستخدام המاركداون (عناوين فرعية، نقاط، إلخ) لسهولة القراءة.' },
                    seoKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'قائمة بالكلمات المفتاحية الأساسية لتحسين محركات البحث.'},
                    keyPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'قائمة من 10 إلى 20 نقطة تلخص أهم ما ورد في الخبر، تصلح للنشر كنقاط سريعة على وسائل التواصل الاجتماعي.'},
                    socialPosts: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                platform: { type: Type.STRING, description: 'اسم منصة التواصل الاجتماعي (Facebook, Twitter, Instagram, LinkedIn, TikTok, WhatsApp).' },
                                content: { type: Type.STRING, description: 'النص المقترح للنشر على هذه المنصة، مع مراعاة خصائصها (e.g., طول النص لـ Twitter, أسلوب جذاب لـ Facebook).' }
                            }
                        }
                    }
                }
            }
        }
    };
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent(request);
        const jsonText = response.text.trim();
        // FIX: Remove markdown fences before parsing JSON
        const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const cleanedJson = match ? match[1] : jsonText;
        return JSON.parse(cleanedJson) as GeneratedArticle;
    } catch (error) {
        console.error("Error generating news article:", error);
        return null;
    }
};

export const fetchBreakingNews = async (customSources: CustomNewsSource[] = []): Promise<BreakingNewsItem[]> => {
  const newsCount = 30 + (customSources.length * 3);
  const customSourcesText = customSources.length > 0
    ? `In addition to the reputable sources listed, please also prioritize recent news from the following user-provided URLs: ${customSources.map(s => s.url).join(', ')}.`
    : '';

  const prompt = `Your task is to provide a comprehensive list of at least ${newsCount} top breaking news stories from the past hour.
Focus on events related to Palestine, the Arab world, and major global news.
Prioritize information from the following reputable sources: الجزيرة (Al Jazeera), العربية (Al Arabiya), وكالة وفا (Wafa News Agency), وكالة معاً (Ma'an News Agency), رويترز (Reuters), وكالة الأنباء الفرنسية (AFP), الشرق للأخبار (Asharq News), and العربي الجديد (Al-Araby Al-Jadeed).
${customSourcesText}
Your response MUST be a valid JSON object.
The JSON object must have a single root key called "newsItems".
The value of "newsItems" must be an array of JSON objects.
Each object in the array must have three keys: "headline" (a string), "summary" (a string), and "publicationTime" (a string describing when the article was published, e.g., "قبل 25 دقيقة" or "15:30 - 25/07/2024").
All text, including headlines and summaries, must be in Arabic.
Crucially, ensure any double quotes (") inside the headline or summary strings are properly escaped with a backslash (e.g., \\"text\\").
Do not add any introductory text, concluding remarks, or markdown formatting around the JSON object.
Base your information on recent search results from the specified sources.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
    });
    
    if(!response.text) {
        console.error("Breaking news response was empty.");
        return [];
    }
    const resultText = response.text.trim();
    const match = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const cleanedJson = match ? match[1] : resultText;
    
    const result = JSON.parse(cleanedJson);
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk.web) || [];

    let newsItems: BreakingNewsItem[] = result.newsItems || [];
    
    if(newsItems.length > 0 && sources.length > 0) {
       newsItems = newsItems.map((item, index) => ({
           ...item,
           source: sources[index] || sources[0]
       }));
    }
    
    return newsItems;

  } catch (error) {
    console.error("Error fetching breaking news:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
       console.error("The response from the AI was not valid JSON.");
    }
    return [];
  }
};

export const fetchAllMonitoredContent = async (sources: MonitoredSource[]): Promise<MonitoredContentItem[]> => {
    if (sources.length === 0) {
        return [];
    }

    const sourceUrls = sources.map(s => s.url).join('\n');

    const prompt = `Based on the latest Google Search results for EACH of the following URLs, extract the title and a brief summary of the single most recent article or post from each URL.
URLs to monitor:
${sourceUrls}

Respond ONLY with a valid JSON array of objects. Each object in the array must represent a monitored source and contain three keys: "sourceUrl" (the original URL you monitored), "title", and "summary".
If you cannot find a recent article for a specific URL, omit it from the result array.
Do not include any other text or markdown formatting.
Ensure any double quotes inside the strings are properly escaped.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        const jsonText = response.text.trim();
        const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const cleanedJson = match ? match[1] : jsonText;
        return JSON.parse(cleanedJson) as MonitoredContentItem[];
    } catch (error) {
        console.error(`Error fetching all monitored content:`, error);
        return [];
    }
};

export const generateImageForArticle = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `صورة فوتوغرافية احترافية وعالية الجودة لمقال إخباري بعنوان: "${prompt}". يجب أن تكون الصورة ذات صلة بالموضوع وتتجنب النصوص أو الإثارة الزائدة.`,
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
        return null;

    } catch(error){
        console.error("Error generating image:", error);
        return null;
    }
};