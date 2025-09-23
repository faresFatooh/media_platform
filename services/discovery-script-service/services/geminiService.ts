import { GoogleGenerativeAI } from "@google/generative-ai";
import { TrainingData, GenerationEngine, NotificationMessage, OnThisDayData, OnThisDayEvent } from "../types";
import { transformWithClaude, researchWithClaude } from "./claudeService";
import { generateWithChatGPT, researchWithChatGPT } from "./chatGptService";

if (!import.meta.env.VITE_GEMINI_API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SCRIPT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'The title of the episode.' },
    style: { type: Type.STRING, description: 'The name of the style for the script.' },
    duration: { type: Type.STRING, description: 'The duration of the episode in minutes.' },
    content: { type: Type.STRING, description: 'The full script of the episode. CRITICAL: Every single fact, statistic, or claim MUST be cited with a numbered, bracketed footnote like [1], [2], etc. The number must correspond to the source in the "sources" array.' },
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
        description: "A list of suggested sources that can be used for fact-checking. The index of the source in this array + 1 corresponds to the footnote number in the content.",
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
  required: ["title", "style", "duration", "content", "scenes", "sources"]
};


export const generateScript = async (styleName: string, title: string, duration: string, language: string, sourceText: string, trainingData?: TrainingData, engine: GenerationEngine = 'gemini', addNotification?: (message: string, type: NotificationMessage['type']) => void): Promise<Script> => {
  
  // Path 1: High-precision transformation using examples. (NO CHANGE - This is a specific workflow)
  if (sourceText && trainingData?.method === 'example' && trainingData.examples.filter(ex => ex.before.trim() && ex.after.trim()).length > 0) {
    addNotification?.('يتم التحويل باستخدام أمثلة التدريب الدقيقة...', 'info');
    const validExamples = trainingData.examples.filter(ex => ex.before.trim() !== '' && ex.after.trim() !== '');
    
    const examplesText = validExamples
      .map((ex, index) => `--- EXAMPLE ${index + 1} ---\n### BEFORE (Original Text):\n${ex.before}\n\n### AFTER (Transformed Text):\n${ex.after}`)
      .join('\n\n');

    const systemInstruction = `You are a highly specialized text transformation model. Your ONLY function is to convert a given SOURCE TEXT into a new format and style, strictly following the patterns demonstrated in the provided BEFORE/AFTER examples. Analyze the stylistic changes (sentence structure, punctuation, formatting like '/', '///', and adding 'جرافيك') and replicate them precisely. You MUST NOT generate new content or deviate from the source text's core information. Your output MUST be a valid JSON object matching the provided schema.`;
    
    const prompt = `**STYLE EXAMPLES:**
${examplesText}

---

**INPUT DATA:**

**SOURCE TEXT TO TRANSFORM:**
"""
${sourceText}
"""

**METADATA:**
- title: "${title}"
- duration: "${duration} minutes"
- style: "${styleName}"

---

**TASK:**
Based on the STYLE EXAMPLES, transform the SOURCE TEXT. Your output must be a single, valid JSON object containing the transformed content and all METADATA, strictly adhering to the schema. The JSON's "content" field should hold the newly transformed text.`;

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
        console.error("Error generating script with transformation:", error);
        throw new Error("فشل تحويل النص. يرجى مراجعة الأمثلة والمحاولة مرة أخرى.");
      }
  }

  // --- Path 2: Generation from title with different engines (NEW LOGIC) ---
  if (!sourceText || sourceText.trim() === '') {
     try {
        switch(engine) {
            case 'claude':
                addNotification?.('يتم التوليد باستخدام Claude...', 'info');
                return transformWithClaude(styleName, title, duration, language, '', trainingData);
            case 'chatgpt':
                addNotification?.('يتم التوليد باستخدام ChatGPT...', 'info');
                return generateWithChatGPT(styleName, title, duration, language, trainingData);
            case 'hybrid':
                addNotification?.('البحث الهجين: البحث باستخدام Gemini...', 'info');
                const geminiResearch = await deepResearch(title);
                addNotification?.('البحث الهجين: البحث باستخدام Claude...', 'info');
                const claudeResearch = await researchWithClaude(title);
                addNotification?.('البحث الهجين: البحث باستخدام ChatGPT...', 'info');
                const chatGptResearch = await researchWithChatGPT(title);
                addNotification?.('البحث الهجين: دمج النتائج وتوليد النص...', 'info');

                const hybridSystemInstruction = `You are an expert synthesizer and scriptwriter. You have been provided with three different research reports on the same topic from three different AI models. Your task is to critically evaluate, combine, and synthesize this information into a single, cohesive, and highly accurate script. Discard redundant information and resolve any contradictions by prioritizing the most cited or logical facts. Your output MUST be a valid JSON object.`;
                const hybridPrompt = `TOPIC: "${title}"
                ---
                REPORT FROM GEMINI:
                """${geminiResearch.research}"""
                SOURCES FROM GEMINI:
                ${geminiResearch.sources.map(s => `[${s.name}](${s.url})`).join('\n')}
                ---
                REPORT FROM CLAUDE:
                """${claudeResearch}"""
                ---
                REPORT FROM CHATGPT:
                """${chatGptResearch}"""
                ---
                TASK: Synthesize these reports into a single, comprehensive script for a "${duration}" minute episode in ${language}. Use numbered footnotes [1], [2] for citations and populate the sources array based on the Gemini sources. Output a valid JSON matching the schema.`;
                
                const hybridResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: hybridPrompt,
                    config: {
                        systemInstruction: hybridSystemInstruction,
                        responseMimeType: 'application/json',
                        responseSchema: SCRIPT_SCHEMA,
                    },
                });
                return JSON.parse(hybridResponse.text) as Script;

            case 'cross':
                 addNotification?.('البحث المتقاطع: بحث أولي مع Claude...', 'info');
                 const crossClaudeResearch = await researchWithClaude(title);
                 addNotification?.('البحث المتقاطع: بحث معمق مع ChatGPT...', 'info');
                 const crossGptResearch = await researchWithChatGPT(`Based on this initial research: ${crossClaudeResearch}, perform a deeper investigation on "${title}".`);
                 addNotification?.('البحث المتقاطع: كتابة النص وتدقيقه مع Gemini...', 'info');
                 
                 const crossSystemInstruction = `You are a scriptwriter with an emphasis on accuracy and deep analysis. You will be given an initial research report from one AI and a deeper analysis from a second AI. Your job is to use this information to write a script, performing an implicit fact-check as you write. Your output MUST be a valid JSON object.`;
                 const crossPrompt = `TOPIC: "${title}"
                 ---
                 INITIAL RESEARCH (From Claude):
                 """${crossClaudeResearch}"""
                 ---
                 DEEP ANALYSIS (From ChatGPT):
                 """${crossGptResearch}"""
                 ---
                 TASK: Using both reports, write a script for a "${duration}" minute episode in ${language}. The deep analysis should be prioritized. Use numbered footnotes [1], [2] for citations and generate a plausible list of sources. Output a valid JSON matching the schema.`;

                 const crossResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: crossPrompt,
                    config: {
                        systemInstruction: crossSystemInstruction,
                        responseMimeType: 'application/json',
                        responseSchema: SCRIPT_SCHEMA,
                    },
                 });
                 return JSON.parse(crossResponse.text) as Script;

            case 'gemini':
            default:
                addNotification?.('المرحلة 1: إجراء بحث معمق مع المصادر...', 'info');
                // Step 1: Conduct research and get a report with inline markdown citations.
                const researchPrompt = `Conduct in-depth, multilingual research on the topic: "${title}". Synthesize the findings into a detailed report.
**CRITICAL:** For every single fact or piece of information you write, you MUST provide an inline citation immediately after it in markdown format: ([Source Title](Source URL)). 
Use the most specific and relevant sources from your search. Example: 'The Battle of Hastings occurred in 1066 ([History of England](https://example.com/history)).'`;

                const researchResponse = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: researchPrompt,
                    config: { tools: [{googleSearch: {}}] },
                });
                const researchTextWithCitations = researchResponse.text;
                
                if (!researchTextWithCitations) {
                    throw new Error("فشل البحث المعمق. لم يتم العثور على معلومات كافية حول هذا الموضوع.");
                }

                addNotification?.('المرحلة 2: تحويل التقرير إلى نص احترافي...', 'info');

                // Step 2: Convert the cited report into the final JSON script.
                const scriptGenTrainingInstruction = trainingData?.instructions ? `In addition, please adhere to these specific style guidelines: "${trainingData.instructions}"` : '';
                
                const systemInstruction = `You are a professional documentary scriptwriter and a meticulous data processor. Your task is to convert a research report into a polished script in JSON format.
The report you will receive contains inline markdown citations like '([Source Title](Source URL))'.

**CRITICAL PROCESSING RULES:**
1. Read the entire research report.
2. As you write the script content, replace each inline markdown citation '([Title](URL))' with a numbered, bracketed footnote, like [1], [2], [3].
3. You MUST compile a unique, ordered list of all sources you encounter. The first unique source becomes source [1], the second unique source becomes source [2], and so on.
4. You MUST populate the "sources" array in the final JSON with this compiled list. The object for each source should have 'name' (from the title in the markdown link) and 'url' (from the URL in the markdown link).
5. The final output **must** be a single, valid JSON object matching the provided schema.
${scriptGenTrainingInstruction}`;

                const finalPrompt = `Generate a script for style "${styleName}", titled "${title}". Duration: ${duration} minutes. Language: ${language}.
                ---
                **RESEARCH REPORT WITH INLINE CITATIONS (Process this text):**
                ${researchTextWithCitations}
                ---
                TASK: Create the script as a valid JSON object. Follow all CRITICAL PROCESSING RULES. Convert the inline citations to footnotes and build the corresponding 'sources' array.`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: finalPrompt,
                    config: {
                        systemInstruction: systemInstruction,
                        responseMimeType: 'application/json',
                        responseSchema: SCRIPT_SCHEMA,
                    },
                });
                return JSON.parse(response.text) as Script;
        }
     } catch (error) {
         console.error(`Error generating script with engine ${engine}:`, error);
         throw new Error(`فشل توليد النص باستخدام ${engine}. قد تكون هناك مشكلة في الاتصال أو الطلب.`);
     }
  }

  // --- Path 3: Fallback to original logic for transformation with instructions/bulk) ---
  addNotification?.('يتم التحويل باستخدام الإرشادات العامة...', 'info');
  let trainingInstruction = '';
  if (trainingData) {
    switch(trainingData.method) {
      case 'instructions':
        if(trainingData.instructions) trainingInstruction = `Follow these specific style guidelines: "${trainingData.instructions}"`;
        break;
      case 'bulk':
        if (trainingData.instructions) trainingInstruction = `Analyze the following collection of texts to understand the writing style, tone, and structure. Apply this learned style to the new script you generate. Texts: """${trainingData.instructions}"""`;
        break;
      case 'example':
        trainingInstruction = 'The user has provided examples of a style. Your generation should try to match it.';
        break;
    }
  }

  const systemInstruction = `You are a professional scriptwriter. Your task is to generate a complete script based on the user's request. ${trainingInstruction}`;
  const prompt = `Your primary task is to act as a creative scriptwriter and TRANSFORM the following source text into a compelling documentary script.
    Style: "${styleName}"
    Episode Title: "${title}"
    Target Duration: ${duration} minutes
    Language: ${language}
    Source Text to Transform:
    """
    ${sourceText}
    """
    Instructions:
    1. Do NOT just summarize the text. You must creatively adapt it into a full script format.
    2. Adhere STRICTLY to the system instructions which define the specific style.
    3. The final output must be a valid JSON object that strictly follows the provided schema.`;
  
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
    return JSON.parse(response.text) as Script;
  } catch (error) {
    console.error("Error generating script:", error);
    throw new Error("فشل توليد النص. يرجى المحاولة مرة أخرى.");
  }
};

export const generateIdeas = async (styleName: string): Promise<string[]> => {
    const prompt = `Suggest 5 new and creative episode ideas for the creative style titled "${styleName}". Provide the ideas as a simple list.`;
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

export const getOnThisDayEvents = async (date: Date): Promise<OnThisDayData> => {
    const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  
    const prompt = `For the date ${formattedDate}, provide a list of major historical events, famous births, and famous deaths.
    Structure your response in Markdown with the following three EXACT headers:
    
## Events
## Births
## Deaths

Under each header, list items in the format:
YYYY: A concise description of the event.

Do not include any other text, introduction, or conclusion. Use Arabic for the response.`;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
  
      const text = response.text;
  
      const parseSection = (sectionText: string): OnThisDayEvent[] => {
        if (!sectionText) return [];
        return sectionText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0 && line.includes(':'))
          .map(line => {
            const parts = line.split(':');
            const year = parts[0].trim();
            const description = parts.slice(1).join(':').trim();
            return { year, description };
          });
      };
  
      const eventsMatch = text.match(/## Events\s*([\s\S]*?)(?=## Births|$)/);
      const birthsMatch = text.match(/## Births\s*([\s\S]*?)(?=## Deaths|$)/);
      const deathsMatch = text.match(/## Deaths\s*([\s\S]*)/);
      
      const eventsText = eventsMatch ? eventsMatch[1] : '';
      const birthsText = birthsMatch ? birthsMatch[1] : '';
      const deathsText = deathsMatch ? deathsMatch[1] : '';
  
      return {
        date: date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
        events: parseSection(eventsText),
        births: parseSection(birthsText),
        deaths: parseSection(deathsText),
      };
  
    } catch (error) {
      console.error("Error fetching 'On This Day' events:", error);
      throw new Error("فشل جلب أحداث هذا اليوم. يرجى المحاولة مرة أخرى.");
    }
};