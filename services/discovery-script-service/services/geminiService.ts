import { GoogleGenAI, Type } from "@google/genai";
import { Script, FactCheckResult, Source, GroundingChunk, TrainingData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SCRIPT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'The title of the episode.' },
    program: { type: Type.STRING, description: 'The name of the program.' },
    duration: { type: Type.STRING, description: 'The duration of the episode in minutes.' },
    content: { type: Type.STRING, description: 'The full script of the episode in the specified language, including narrator dialogue and scene descriptions.' },
    scenes: {
      type: Type.ARRAY,
      description: 'A breakdown of the episode into major scenes.',
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: 'The time code for the scene (e.g., 00:00-05:30).' },
          description: { type: Type.STRING, description: 'A brief description of the scene and its content.' },
          visuals: { type: Type.STRING, description: 'Suggestions for visual elements (archival footage, animations, etc.).' },
        },
        required: ["time", "description", "visuals"]
      }
    },
    sources: {
        type: Type.ARRAY,
        description: "A list of suggested sources that can be used for fact-checking.",
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The name of the source (e.g., National Geographic)." },
                url: { type: Type.STRING, description: "The URL of the source." }
            },
            required: ["name", "url"]
        }
    }
  },
  required: ["title", "program", "duration", "content", "scenes", "sources"]
};


export const generateScript = async (program: string, title: string, duration: string, language: string, trainingData?: TrainingData): Promise<Script> => {
  
  let trainingInstruction = '';
  if (trainingData) {
    switch(trainingData.method) {
      case 'instructions':
        if(trainingData.instructions) {
          trainingInstruction = `Follow these specific style guidelines for the program: "${trainingData.instructions}"`;
        }
        break;
      case 'example':
        if (trainingData.beforeText && trainingData.afterText) {
          trainingInstruction = `Learn from this example. Transform the text from a style like this: "BEFORE: ${trainingData.beforeText}" to a style like this: "AFTER: ${trainingData.afterText}". Apply this learned style to the new script.`;
        }
        break;
      case 'bulk':
        if (trainingData.instructions) { // Using 'instructions' field for bulk text
          trainingInstruction = `Analyze the following collection of texts to understand the writing style, tone, and structure. Apply this learned style to the new script you generate. Texts: """${trainingData.instructions}"""`;
        }
        break;
    }
  }

  const systemInstruction = `You are a professional scriptwriter for Discovery Channel. Your task is to generate a complete script based on the user's request. ${trainingInstruction}`;
  
  const prompt = `Generate a script for the program "${program}", titled "${title}". The episode duration should be ${duration} minutes. The script must be in ${language}. Provide the output as a valid JSON object that strictly follows the provided schema. Do not include any text or markdown markers outside the JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
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
    const prompt = `Suggest 5 new and creative episode ideas for the Discovery program titled "${program}". Provide the ideas as a simple list.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text.split('\n').filter(idea => idea.trim() !== '');
};

export const deepResearch = async (topic: string): Promise<{ research: string; sources: Source[] }> => {
    const prompt = `Conduct in-depth research on the topic: "${topic}". Provide a detailed report including key facts, historical context, important figures, and the latest developments. Use Google Search to find the most current information.`;
    
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
    const prompt = `Please fact-check the following script content. Assess the overall accuracy as a percentage and provide a detailed summary of any inaccurate or questionable information with suggested corrections. Use Google Search to verify the information. Script: """${scriptContent}"""`;
    
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
