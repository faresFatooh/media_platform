
import { GoogleGenAI, Type } from "@google/genai";
import type { Slide } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const UNSPLASH_ACCESS_KEY = 'CiME0tva8QmqGN26zH5cKmYxI358VnJgl7L0aQ2JR3c';
const PEXELS_API_KEY = 'Vn2ZGOjiUndFRjcwN4pJacdY2q51B72R0IJ2Mjuj9c7WR6JxWPaAgr5R';

const slideSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "عنوان موجز وجذاب للشريحة باللغة العربية، يلخص محتوى النقاط الموجودة فيها.",
    },
    content: {
      type: Type.ARRAY,
      description: "محتوى الشريحة مقسم إلى 2-4 نقاط رئيسية. يجب أن تكون هذه النقاط موجزة ومستخرجة من النص الأصلي.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "نص النقطة الرئيسية باللغة العربية.",
          },
          icon: {
            type: Type.STRING,
            description: "اسم أيقونة مناسب باللغة الإنجليزية من قائمة محددة (مثل 'growth', 'idea', 'data', 'team', 'technology', 'success', 'finance', 'communication', 'strategy', 'security').",
          },
        },
        required: ["text", "icon"],
      },
    },
    visual: {
      type: Type.OBJECT,
      description: "التمثيل البصري للشريحة. يحدد ما إذا كان سيتم البحث عن صورة موجودة أو إنشاء صورة جديدة.",
      properties: {
        method: {
          type: Type.STRING,
          enum: ['search', 'generate'],
          description: "الآلية المستخدمة: 'search' للمفاهيم الملموسة، 'generate' للمفاهيم المجردة."
        },
        query: {
          type: Type.STRING,
          description: "إذا كانت الآلية 'search'، فهذه عبارة بحث محسّنة باللغة الإنجليزية. إذا كانت 'generate'، فهذا هو الموجه التفصيلي لنموذج توليد الصور."
        }
      },
      required: ["method", "query"]
    }
  },
  required: ["title", "content", "visual"],
};


export const generateSlidesFromText = async (mainTitle: string, rawText: string, numberOfSlides: number): Promise<Slide[]> => {
    const systemInstruction = `مهمتك هي العمل كخبير استراتيجي للمحتوى ومصمم انفوجرافيك. سأزودك بعنوان رئيسي للعرض التقديمي، وكتلة نصية كبيرة باللغة العربية، والعدد المطلوب من الشرائح. وظيفتك هي تحويل هذا النص الخام إلى سلسلة من شرائح الانفوجرافيك الاحترافية.

**قواعد أساسية:**
1.  **التحليل والتقسيم:** اقرأ النص المقدم بالكامل وقم بتقسيمه إلى عدد من الأقسام الموضوعية يساوي عدد الشرائح المطلوب. تأكد من أن توزيع المحتوى عبر الشرائح منطقي ومتوازن.
2.  **إنشاء محتوى الشريحة:** لكل قسم نصي، يجب عليك إنشاء كائن شريحة واحد بالبنية التالية:
    *   \`title\`: عنوان موجز وجذاب باللغة العربية يلخص الرسالة الرئيسية للشريحة.
    *   \`content\`: مصفوفة من 2 إلى 4 نقاط رئيسية. يجب استخلاص هذه النقاط أو تلخيصها من القسم النصي الخاص بتلك الشريحة. يجب أن تكون باللغة العربية، واضحة، ومؤثرة. لا تضف نقطة في نهاية الجمل.
    *   \`visual\`: كائن يحدد صورة الخلفية. اتبع تعليمات الصور هذه بعناية.
3.  **الالتزام الصارم بالعدد:** يجب أن يكون الناتج النهائي مصفوفة تحتوي بالضبط على العدد المطلوب من كائنات الشرائح.

**تعليمات الصور (لخاصية 'visual'):**
- **استخدم 'search' إذا:** كانت المفاهيم ملموسة وممثلة جيدًا في صور الأرشيف (مثل "اجتماع عمل"، "كمبيوتر محمول"، "أفق المدينة"). استهدف الواقعية والمظهر الاحترافي للشركات. يجب أن يكون الاستعلام عبارة بحث إنجليزية وصفية (4-7 كلمات).
- **استخدم 'generate' إذا:** كانت المفاهيم مجردة أو استعارية أو تتطلب أسلوبًا فنيًا معينًا (مثل "مستقبل الابتكار"، "تآزر الفريق"، "خصوصية البيانات"). يجب أن يكون الاستعلام موجهًا إنجليزيًا مفصلاً لنموذج توليد الصور.

تأكد من أن جميع المخرجات النصية باللغة العربية الاحترافية والواضحة.`;

  const prompt = `العنوان الرئيسي: ${mainTitle}\n\nعدد الشرائح المطلوب: ${numberOfSlides}\n\nالنص الكامل:\n${rawText}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: slideSchema,
        },
        temperature: 0.5,
      },
    });
    
    const jsonString = response.text;
    const slides: Slide[] = JSON.parse(jsonString);
    return slides;

  } catch (error) {
    console.error("Error calling Gemini API for slide generation:", error);
    throw new Error("Failed to generate slides from Gemini API.");
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateImage = async (prompt: string, aspectRatio: '16:9' | '9:16' | '1:1' = '16:9'): Promise<string> => {
    let attempts = 0;
    const maxAttempts = 4;
    const initialDelay = 1500;

    while (attempts < maxAttempts) {
        try {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/jpeg',
                  aspectRatio: aspectRatio,
                },
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                return response.generatedImages[0].image.imageBytes;
            } else {
                throw new Error("No image was generated by the API.");
            }
        } catch(error) {
            attempts++;
            if (error instanceof Error && error.message.includes("RESOURCE_EXHAUSTED") && attempts < maxAttempts) {
                const delay = initialDelay * Math.pow(2, attempts - 1);
                console.warn(`Rate limit hit for image generation. Retrying in ${delay}ms... (Attempt ${attempts}/${maxAttempts})`);
                await sleep(delay);
            } else {
                console.error("Error calling Gemini API for image generation:", error);
                throw new Error("Failed to generate image from Gemini API.");
            }
        }
    }
    throw new Error("Failed to generate image from Gemini API after multiple retries.");
};

const searchPexelsImage = async (query: string, page: number = 1, orientation: 'landscape' | 'portrait' | 'square' = 'landscape'): Promise<string> => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&page=${page}&orientation=${orientation}`;
    try {
        const response = await fetch(url, {
            headers: { Authorization: PEXELS_API_KEY }
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Pexels API error:', errorData);
            throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
            return data.photos[0].src.original;
        } else {
            throw new Error(`No image found on Pexels for query: "${query}"`);
        }
    } catch (error) {
        console.error("Error calling Pexels API:", error);
        throw new Error("Failed to fetch image from Pexels.");
    }
};


const searchUnsplashImage = async (query: string, page: number = 1, orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'): Promise<string> => {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=${orientation}&page=${page}&client_id=${UNSPLASH_ACCESS_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Unsplash API error:', errorData);
            throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            return data.results[0].urls.regular;
        } else {
            console.warn(`No image found on Unsplash for query: "${query}". Trying page 1.`);
            // If no result on a specific page, try fetching the first page as a fallback.
            if (page !== 1) {
                return await searchUnsplashImage(query, 1);
            }
            throw new Error(`No image found on Unsplash for query: "${query}"`);
        }
    } catch (error) {
        console.error("Error calling Unsplash API:", error);
        throw new Error("Failed to fetch image from Unsplash.");
    }
};

export const searchStockImage = async (query: string, page: number = 1, orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'): Promise<string> => {
    try {
        console.log(`Attempting to fetch image from Pexels for query: "${query}"`);
        const pexelsOrientation = orientation === 'squarish' ? 'square' : orientation;
        const imageUrl = await searchPexelsImage(query, page, pexelsOrientation);
        return imageUrl;
    } catch (pexelsError) {
        console.warn(`Pexels search failed for "${query}". Falling back to Unsplash. Reason:`, pexelsError);
        try {
            const imageUrl = await searchUnsplashImage(query, page, orientation);
            return imageUrl;
        } catch (unsplashError) {
            console.error(`Unsplash search also failed for "${query}".`, unsplashError);
            throw new Error(`Failed to fetch image from both Pexels and Unsplash for query: "${query}"`);
        }
    }
};
