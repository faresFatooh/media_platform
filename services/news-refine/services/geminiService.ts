// Implemented Gemini API service to handle news refinement.
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { NewsRefineInput, NewsRefineOutput } from '../types';

// Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Builds the system instruction prompt for the Gemini model based on user options.
 * @param options - The user's input for refining the news.
 * @returns A detailed system instruction string.
 */
const buildSystemInstruction = (options: NewsRefineInput): string => {
    let instruction = `You are an expert news editor and synthesizer working for the An-Najah University Media Center. Your task is to refine multiple news articles from different sources into a single, high-quality, unbiased, and comprehensive news report in Arabic.

    **Core Instructions:**
    1.  **Synthesize, Don't Just Combine:** Analyze the provided URLs, identify the core event, and synthesize the information. Do not just copy-paste sections. Create a new, coherent narrative.
    2.  **Verify and Cross-Reference:** Compare information across sources to identify corroborating details and discrepancies. Prioritize facts that are confirmed by multiple sources.
    3.  **Maintain Neutrality:** Adopt a neutral, objective tone, avoiding sensationalism or bias present in the source articles.
    4.  **Attribute Information:** Clearly attribute information to its source, especially for direct quotes or exclusive details.
    5.  **Output Structure:** You MUST return a single, valid JSON object that strictly adheres to the provided schema. Do not include any text, backticks, or explanations outside of the JSON object.
    
    **Style Preferences (${options.style_prefs.tone}):**`;

    switch (options.style_prefs.tone) {
        case 'annajah':
            instruction += `\n    - Adopt the official, formal, and academic tone of An-Najah National University. Focus on clarity, accuracy, and impact on the local community and academia.`;
            break;
        case 'alsharq':
            instruction += `\n    - Adopt a style similar to Al Sharq Al Awsat: professional, pan-Arab, and focused on geopolitical context. Use sophisticated language.`;
            break;
        case 'neutral':
            instruction += `\n    - Adopt a standard, neutral agency newswire tone (like Reuters or AP). Focus on factual reporting with no embellishment.`;
            break;
    }
    
    if (options.style_prefs.custom_style) {
        instruction += `\n    - **Custom Style Guideline:** Pay close attention to this user-provided style guide and prioritize it: "${options.style_prefs.custom_style}"`;
    }

    instruction += `\n\n    **Content Requirements:**`;

    switch (options.style_prefs.editing_level) {
        case 'direct':
            instruction += `\n    - **Editing Level:** Direct. Provide a concise summary and reformulation of the key facts.`;
            break;
        case 'detailed':
            instruction += `\n    - **Editing Level:** Detailed. Elaborate on the main points, provide more context from the articles, and ensure a comprehensive narrative.`;
            break;
        case 'analytical':
            instruction += `\n    - **Editing Level:** Analytical. Go beyond reporting the facts. Include analysis of the event's implications, background, and potential future developments based *only* on the provided sources.`;
            break;
    }

    if (options.style_prefs.include_quotes) {
        instruction += `\n    - **Quotes:** Extract and include significant quotes from key figures. Ensure they are attributed correctly with speaker and source.`;
    } else {
        instruction += `\n    - **Quotes:** Do not include any direct quotes. Paraphrase all information.`;
    }
    
    if (options.style_prefs.include_context_box) {
        instruction += `\n    - **Context Box:** If applicable, create a brief "In Context" or "Background" box with 2-3 bullet points summarizing the essential background to the story.`;
    } else {
        instruction += `\n    - **Context Box:** Do not include a context box.`;
    }

    instruction += `\n\n    **Constraints:**`;
    instruction += `\n    - **Word Count:** The final Arabic article body should be approximately ${options.constraints.max_words} words.`;
    instruction += `\n    - **Sources:** The report must be based on at least ${options.constraints.min_sources} of the provided URLs. Acknowledge all used sources.`;

    instruction += `\n\n    **Output Requirements:**`;
    if (options.output.dual_language) {
        instruction += `\n    - **English Version:** After generating the Arabic article, provide a high-quality English translation of the title and body paragraphs.`;
    }
    instruction += `\n    - **Image Prompt:** Generate a concise, descriptive, and photorealistic prompt in English for an AI image generator. The prompt should capture the essence of the news event. It should be suitable for generating a realistic news photograph. For example: "A wide-angle, photorealistic shot of firefighters battling a blaze at a historic building at night, with smoke billowing into the sky."`;
    
    if (options.output.include_aiseo) {
        instruction += `\n    - **SEO & AISEO:** Generate relevant SEO metadata (meta title, description, keywords) in Arabic. Also provide a very brief, one-sentence summary in Arabic for AI-driven systems (ai_summary). This is a critical requirement.`;
    } else {
        instruction += `\n    - **SEO & AISEO Disabled:** Do not generate any SEO data. You MUST still return the 'seo' object in the JSON, but fill its properties with empty values: meta_title: "", meta_description: "", keywords: [], ai_summary: "".`;
    }

    return instruction;
};

const buildUserPrompt = (urls: string[]): string => {
    // A more advanced implementation would fetch the content of the URLs server-side 
    // and provide it directly in the context. For this implementation, we rely on the
    // model's ability to access and process information from the provided URLs.
    return `Please synthesize the news from the following URLs:\n${urls.map(url => `- ${url}`).join('\n')}`;
};

const getResponseSchema = () => {
    const quoteSchema = {
        type: Type.OBJECT,
        properties: {
            speaker: { type: Type.STRING, description: 'The person who made the statement.' },
            quote: { type: Type.STRING, description: 'The exact quote in Arabic.' },
            source: { type: Type.STRING, description: 'The source URL where the quote was found.' },
        },
        required: ['speaker', 'quote', 'source'],
    };

    const sourceSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: 'The name of the news source (e.g., "BBC News", "Al Jazeera").' },
            url: { type: Type.STRING, description: 'The original URL of the article.' },
            publish_time: { type: Type.STRING, description: 'The publication time of the source article, if available.' },
        },
        required: ['name', 'url'],
    };

    const articleSchema = {
        type: Type.OBJECT,
        properties: {
            language: { type: Type.STRING, description: 'The language code of the article, which is "ar".' },
            title: { type: Type.STRING, description: 'A compelling and accurate headline for the article in Arabic.' },
            dek: { type: Type.STRING, description: 'A short sub-headline or summary (dek) in Arabic.' },
            body_paragraphs: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'The main body of the article, split into an array of paragraphs in Arabic.' },
            context_box: { type: Type.ARRAY, nullable: true, items: { type: Type.STRING }, description: 'An optional array of bullet points providing background context.' },
            quotes: { type: Type.ARRAY, nullable: true, items: quoteSchema, description: 'An optional array of significant quotes.' },
            sources: { type: Type.ARRAY, items: sourceSchema, description: 'A list of the source articles used.' },
            time_zone: { type: Type.STRING, description: 'The relevant time zone for the event, e.g., "Asia/Jerusalem".' },
            word_count: { type: Type.INTEGER, description: 'The total word count of the article body.' },
            image_prompt_english: { type: Type.STRING, description: 'A concise, descriptive prompt in English for an AI image generator to create a relevant, photorealistic news image.' },
        },
        required: ['language', 'title', 'dek', 'body_paragraphs', 'sources', 'time_zone', 'word_count', 'image_prompt_english'],
    };

    const seoSchema = {
        type: Type.OBJECT,
        properties: {
            meta_title: { type: Type.STRING, description: 'A concise and SEO-friendly title in Arabic (max 60 characters).' },
            meta_description: { type: Type.STRING, description: 'A compelling meta description in Arabic (max 160 characters).' },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of relevant SEO keywords in Arabic.' },
            ai_summary: { type: Type.STRING, description: 'A one-sentence summary for AI systems in Arabic.' },
        },
        required: ['meta_title', 'meta_description', 'keywords', 'ai_summary'],
    };

    const englishVersionSchema = {
        type: Type.OBJECT,
        properties: {
            enabled: { type: Type.BOOLEAN },
            title: { type: Type.STRING, nullable: true },
            body_paragraphs: { type: Type.ARRAY, nullable: true, items: { type: Type.STRING } },
        },
        required: ['enabled'],
    };

    return {
        type: Type.OBJECT,
        properties: {
            article: articleSchema,
            html: { type: Type.STRING, description: 'The full article content formatted in clean, semantic HTML. It should be a single string.' },
            seo: seoSchema,
            english_version: englishVersionSchema,
        },
        required: ['article', 'html', 'seo', 'english_version'],
    };
};

export const refineNews = async (options: NewsRefineInput): Promise<NewsRefineOutput> => {
    const systemInstruction = buildSystemInstruction(options);
    const userPrompt = buildUserPrompt(options.urls);
    const schema = getResponseSchema();
    const model = 'gemini-2.5-flash';
    
    try {
        const result = await ai.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.5,
            }
        });

        const jsonText = result.text.trim();
        let parsedOutput: NewsRefineOutput;
        try {
            parsedOutput = JSON.parse(jsonText);
        } catch (e) {
            console.error("Failed to parse JSON response:", jsonText);
            throw new Error("The model returned an invalid JSON format.");
        }
        
        if (options.output.include_image && parsedOutput.article.image_prompt_english) {
            try {
                // FIX: Use generateImages with the appropriate model for image generation.
                const imageResponse = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: parsedOutput.article.image_prompt_english,
                    config: {
                      numberOfImages: 1,
                      outputMimeType: 'image/jpeg',
                    },
                });

                if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
                   parsedOutput.generated_image_b64 = imageResponse.generatedImages[0].image.imageBytes;
                }
            } catch (imageError) {
                console.error("Error generating image:", imageError);
                // Do not fail the whole request if image generation fails; proceed without an image.
            }
        }

        return parsedOutput;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("An error occurred while communicating with the AI service.");
    }
};

/**
 * Generates a short podcast script from a news article.
 * @param articleTitle - The title of the article.
 * @param articleBody - The body content of the article.
 * @returns A string containing the podcast script.
 */
export const generatePodcastScript = async (articleTitle: string, articleBody: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a professional podcast scriptwriter. Your task is to transform a news article into a concise and engaging podcast script for a single host. The final audio duration should be under 3 minutes.

    **Instructions:**
    1.  **Structure:** The script must have three clear parts: an intro, the main content, and an outro.
    2.  **Tone:** Make it conversational and easy to understand for a general audience.
    3.  **Content:** Summarize the key points of the article. Do not just read the article. Rephrase it for audio. Start with a hook to grab the listener's attention.
    4.  **Formatting:** Use clear labels like [مقدمة], [مذيع], and [خاتمة].
    5.  **Language:** The script must be in Arabic.

    Example Output:
    [مقدمة]
    (موسيقى إخبارية حماسية تبدأ ثم تخفت في الخلفية)

    [مذيع]
    أهلاً بكم في موجز الأنباء. اليوم، نسلّط الضوء على... (ملخص الخبر)...

    [خاتمة]
    (ترتفع الموسيقى قليلاً)
    [مذيع]
    كان هذا هو الخبر الأبرز لهذا اليوم. للمزيد من التفاصيل، يمكنكم زيارة موقعنا. شكراً لمتابعتكم.
    (تتلاشى الموسيقى)
    `;

    const userPrompt = `Please create a podcast script from the following news article:
    
    **Title:** ${articleTitle}

    **Body:**
    ${articleBody}
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating podcast script:", error);
        throw new Error("Failed to generate podcast script.");
    }
};

/**
 * Generates a bulleted summary from a news article (either from URL or text).
 * @param input The source content, either a URL or raw text.
 * @returns A promise that resolves to the generated summary text.
 */
export const generateBulletedSummary = async (input: { source: 'url' | 'text'; value: string }): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an expert news editor. Your task is to create a concise summary of the provided news article in the form of clear, easy-to-read bullet points in Arabic. The summary should capture the most important information and be suitable for social media or a quick brief. Each bullet point should be on a new line and start with a dash (-) or an asterisk (*).`;
    
    let userPrompt = '';
    if (input.source === 'url') {
        userPrompt = `Create a bulleted summary for the news report at this URL: ${input.value}`;
    } else {
        userPrompt = `Create a bulleted summary for the following news article:\n\n${input.value}`;
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating bulleted summary:", error);
        throw new Error("Failed to generate bulleted summary.");
    }
};

/**
 * Generates an infographic image from text data.
 * @param data The text data to be visualized (e.g., "Category 1, 100\nCategory 2, 200").
 * @returns A promise that resolves to a base64 encoded image string.
 */
export const generateInfographic = async (data: string): Promise<string> => {
    const prompt = `Create a visually appealing and modern infographic bar chart based on the following data. The infographic should be clean, professional, and easy to read, suitable for a news report. Use a color palette of blues and greys. The data is:
    
    ${data}
    
    The infographic should have a clear title and labeled axes. The chart should be the main focus of the image.`;

    try {
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
            return imageResponse.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating infographic:", error);
        throw new Error("Failed to generate infographic image.");
    }
};