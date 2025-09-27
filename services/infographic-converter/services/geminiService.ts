
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
      description: "محتوى الشريحة مقسم إلى نقاط رئيسية. يجب أن تكون هذه النقاط ملخصة وموجزة.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "نص النقطة الرئيسية الملخص باللغة العربية.",
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
  const systemInstruction = `مهمتك هي تحويل نص عربي طويل إلى سلسلة من شرائح الإنفوجرافيك الاحترافية باستخدام قدراتك التحليلية. سأزودك بعنوان رئيسي للموضوع، والنص الكامل، والعدد المطلوب من الشرائح.

**قواعد صارمة للمحتوى:**
1.  **التحليل والتقسيم:** اقرأ النص بالكامل، افهم الأفكار الرئيسية، ثم قسمه إلى عدد من الأقسام المنطقية يساوي عدد الشرائح المطلوب. يجب أن يمثل كل قسم محتوى شريحة واحدة.
2.  **التلخيص الذكي:** لمحتوى كل شريحة، قم بتحليل القسم المخصص لها واستخرج جوهر الأفكار. بعد ذلك، **أعد صياغة هذه الأفكار على شكل نقاط قصيرة ومختزلة وواضحة**. لا تقتبس بشكل حرفي من النص الأصلي؛ بل استخدم قدراتك اللغوية لتلخيص المعلومة مع الحفاظ على المعنى الأساسي.
3.  **الالتزام بالعدد:** يجب أن يتطابق عدد الشرائح في الإخراج تمامًا مع "عدد الشرائح المطلوب".

**بنية المخرجات (لكل شريحة):**
-   \`title\`: عنوان موجز وجذاب باللغة العربية يلخص محتوى قسم تلك الشريحة.
-   \`content\`: قائمة بالنقاط الملخصة والموجزة التي تمثل الأفكار الرئيسية للقسم. لا تضف نقطة في نهاية الجملة.
-   \`visual\`: كائن بصري. قرر بين 'search' للمفاهيم الملموسة أو 'generate' للأفكار المجردة، مع توفير استعلام مناسب باللغة الإنجليزية.

تأكد من أن جميع النصوص باللغة العربية الواضحة والمهنية، وأن النقاط مختصرة وسهلة الفهم.`;

  const prompt = `العنوان الرئيسي للموضوع: ${mainTitle}\n\nالنص الكامل: ${rawText}\n\nالعدد المطلوب من الشرائح: ${numberOfSlides}`;

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
        temperature: 0.7,
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

export const generateSlidesFromTextChunks = async (mainTitle: string, textChunks: string[]): Promise<Slide[]> => {
    const systemInstruction = `مهمتك هي تحويل مجموعة من نصوص الشرائح المنفصلة باللغة العربية إلى سلسلة من شرائح الإنفوجرافيك الاحترافية. سأزودك بعنوان رئيسي للموضوع، ومصفوفة تحتوي على نص كل شريحة على حدة.

**قواعد صارمة للمحتوى:**
1.  **معالجة فردية:** لكل نص شريحة في المصفوفة المدخلة، يجب عليك إنشاء كائن شريحة واحد مقابل له.
2.  **استخراج المحتوى:** بالنسبة لكل شريحة، قم بتحليل النص الخاص بها واستخرج منه النقاط الرئيسية. **لا تقتبس حرفياً بالضرورة**، بل قم بتلخيص وصياغة النقاط بأسلوب واضح وموجز مناسب لشريحة إنفوجرافيك.
3.  **الالتزام بالعدد:** يجب أن يكون عدد الشرائح في المخرجات مساوياً تماماً لعدد نصوص الشرائح في المدخلات.

**بنية المخرجات (لكل شريحة):**
-   \`title\`: عنوان موجز وجذاب باللغة العربية يلخص محتوى نص الشريحة.
-   \`content\`: قائمة بالنقاط الرئيسية المستخرجة من نص الشريحة.
-   \`visual\`: كائن بصري. قرر بين 'search' للمفاهيم الملموسة أو 'generate' للأفكار المجردة، مع توفير استعلام مناسب باللغة الإنجليزية.

تأكد من أن جميع النصوص باللغة العربية الواضحة والمهنية.`;

    const prompt = `العنوان الرئيسي للموضوع: ${mainTitle}\n\nنصوص الشرائح (مصفوفة): ${JSON.stringify(textChunks)}`;

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
                temperature: 0.6, // Slightly higher temp for more creative summarization
            },
        });
        
        const jsonString = response.text;
        const slides: Slide[] = JSON.parse(jsonString);
        return slides;

    } catch (error) {
        console.error("Error calling Gemini API for slide generation from chunks:", error);
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
