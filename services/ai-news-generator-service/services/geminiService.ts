// FIX: Correctly augment the global ImportMetaEnv interface for Vite environment variables.
declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// FIX: Switched to the official @google/generative-ai package to match project dependencies.
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { ArticleInputType, type GeneratedArticle, type ImageFile } from '../types';

// WARNING: This approach exposes your API key on the client-side.
// It is highly recommended to make API calls from a secure backend server to protect your key.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("VITE_GEMINI_API_KEY is not set. Frontend Gemini calls will fail.");
}

// FIX: Instantiated the official GoogleGenerativeAI class.
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const articleSchema = {
    type: "OBJECT",
    properties: {
        title: { type: "STRING", description: 'A compelling headline for the news article.' },
        content: { type: "STRING", description: 'The full content of the news article, formatted with paragraphs.' },
        summaryPoints: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: 'A list of key summary points from the article.'
        },
        keywords: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: 'A list of relevant SEO keywords.'
        },
        sources: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: 'A list of potential sources for the information. If the source is a URL, list the URL. Otherwise, state "Original content".'
        },
        socialMediaPosts: {
            type: "OBJECT",
            properties: {
                twitter: { type: "STRING", description: 'A short, engaging post for Twitter/X.' },
                facebook: { type: "STRING", description: 'A slightly longer, descriptive post for Facebook.' }
            },
            required: ['twitter', 'facebook']
        }
    },
    required: ['title', 'content', 'summaryPoints', 'keywords', 'sources', 'socialMediaPosts']
};

const getPromptParts = (inputType: ArticleInputType, data: string | ImageFile): Part[] => {
    const parts: Part[] = [];
    let textPrompt = "";

    switch (inputType) {
        case ArticleInputType.TITLE:
            textPrompt = `Generate a detailed news article based on the following headline: "${data as string}"`;
            break;
        case ArticleInputType.TEXT:
            textPrompt = `Expand the following text into a full news article:\n\n---\n${data as string}\n---`;
            break;
        case ArticleInputType.URL:
            textPrompt = `Summarize the content from the URL below and then generate a unique news article based on that summary. Do not plagiarize. URL: ${data as string}`;
            break;
        case ArticleInputType.IMAGE:
            const imageFile = data as ImageFile;
            parts.push({
                inlineData: {
                    mimeType: imageFile.mimeType,
                    data: imageFile.base64
                }
            });
            textPrompt = "Analyze the provided image and generate a relevant news article about the event, object, or scene depicted.";
            break;
    }
    
    const fullPrompt = `${textPrompt}\n\nIMPORTANT: You must return your response as a single, valid JSON object that adheres strictly to the following schema. Do not include any other text, explanations, or markdown formatting like \`\`\`json.\n\nJSON Schema:\n${JSON.stringify(articleSchema, null, 2)}`;
    parts.unshift({ text: fullPrompt });

    return parts;
}

/**
 * Generates a structured news article directly from the Gemini API.
 */
export const generateArticleWithGemini = async (
  inputType: ArticleInputType,
  data: string | ImageFile,
): Promise<Omit<GeneratedArticle, 'imageUrl'>> => {

    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your environment.");
    }
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
      systemInstruction: "You are an expert journalist. Your task is to generate well-written, factual, and unbiased news articles based on the user's input. Always provide the output in the requested JSON format."
    });

    const promptParts = getPromptParts(inputType, data);
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: promptParts }],
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    try {
        const response = result.response;
        const jsonString = response.text();
        const parsedJson = JSON.parse(jsonString);
        return parsedJson as Omit<GeneratedArticle, 'imageUrl'>;
    } catch (e) {
        console.error("Failed to parse Gemini response as JSON:", result.response.text());
        throw new Error("Failed to process the AI's response. It was not valid JSON.");
    }
};

/**
 * NOTE: Image generation is not supported by the @google/generative-ai SDK.
 * This function will throw an error. A secure backend with a different library is needed for Imagen.
 */
export const generateImageWithImagen = async (prompt: string): Promise<string> => {
    console.warn('Attempted to call generateImageWithImagen with prompt:', prompt);
    throw new Error("Image generation is not available. The current library (@google/generative-ai) does not support Imagen. This feature requires a backend implementation.");
}