import { GoogleGenAI, Type } from "@google/genai";
import { InputType, type ParsedNews, type Captions } from '../types';
import { PLATFORMS, DEFAULT_HASHTAGS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textModel = 'gemini-2.5-flash';
const imageModel = 'imagen-4.0-generate-001';

export const parseAndSummarizeNews = async (
  content: string,
  type: InputType
): Promise<ParsedNews> => {
  const prompt = `Analyze the provided news content. Your output must be a clean JSON object.
- Headline: Extract the main headline verbatim if possible, or create a concise, factual one.
- Summary: Write a tight, journalistic summary (1-2 sentences) covering the essential 5 Ws (Who, What, When, Where, Why).
- Entities: List the key people, organizations, and locations.
- Source Name: Identify the source from the URL or content. For raw text, use "User Provided Text".

Content:
${type === InputType.URL ? `URL: ${content}` : `Text: "${content}"`}`;
  
  try {
    const response = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        systemInstruction: "You are a highly efficient news-parsing AI. Your task is to extract factual information from articles or text with extreme accuracy. Do not infer or add information not present in the source.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: "The main headline of the article." },
            summary: { type: Type.STRING, description: "A concise summary answering who, what, when, and where." },
            entities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of key people, places, and organizations mentioned." },
            source_name: { type: Type.STRING, description: "The name of the news source or 'User Text'." }
          },
          required: ["headline", "summary", "entities", "source_name"]
        }
      }
    });

    const jsonText = response.text;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error parsing news with Gemini:", error);
    throw new Error("Failed to parse and summarize the news content.");
  }
};

export const generateAllCaptions = async (
  parsedNews: ParsedNews
): Promise<Captions> => {
  const prompt = `
Based on the following news data, generate tailored captions for the specified social media platforms.

News Data:
- Headline: ${parsedNews.headline}
- Summary: ${parsedNews.summary}

General Rules:
1. Maintain a neutral, journalistic tone suitable for Asharq News.
2. ALWAYS append the hashtags "${DEFAULT_HASHTAGS}" at the very end of EACH caption.
3. Strictly adhere to the character limits for each platform.

Platform-Specific Instructions:
- x: Breaking news style. Short, impactful, and designed for quick consumption.
- instagram: More descriptive and visual. Tell the story behind the image.
- facebook: A comprehensive but concise summary.
- linkedin: Professional and formal. Focus on the business, political, or economic impact.
- threads: Conversational but informative. Similar to x but can be slightly more detailed.
- tiktok & youtube_shorts: A very short, punchy caption for a video format.
- telegram: Informative and direct, like a news alert.

Provide the output as a single, valid JSON object with platform identifiers as keys.
`;

  try {
     const response = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        systemInstruction: `You are an expert social media editor for "Asharq News" (الشرق), a major international news organization. Your tone is always professional, objective, and authoritative. You are an expert in crafting engaging, platform-specific content that adheres to the highest journalistic standards. Ensure all text is in Arabic and formatted for RTL. Do not add commentary or opinion. Stick to the facts provided.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: Object.keys(PLATFORMS).reduce((acc, key) => {
            acc[key] = { type: Type.STRING };
            return acc;
          }, {} as Record<string, { type: Type }>)
        }
      }
    });

    const jsonText = response.text;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating captions with Gemini:", error);
    throw new Error("Failed to generate social media captions.");
  }
};


export const generateImageSearchQuery = async (
  parsedNews: ParsedNews
): Promise<string> => {
  const prompt = `From the news headline and entities below, generate a concise, professional search query for a photo agency like Reuters or Getty Images. Focus on objective, descriptive keywords. Avoid generic terms. Think about action, location, and key subjects.

Headline: ${parsedNews.headline}
Entities: ${parsedNews.entities.join(', ')}

Return only the search query string.`;

  try {
    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            systemInstruction: "You are a professional photo editor for a major news wire service. Your job is to create search queries that yield the most relevant and high-impact news photographs."
        }
    });
    return response.text.trim().replace(/"/g, ''); // Clean up the response
  } catch (error)    {
    console.error("Error generating image query with Gemini:", error);
    return parsedNews.headline; // Fallback to headline
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: imageModel,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1', // A good default for social media
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    } else {
      throw new Error("Image generation returned no images.");
    }
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    throw new Error("Failed to generate image.");
  }
};