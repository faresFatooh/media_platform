
import { GoogleGenAI } from "@google/genai";
import type { GroundingChunk } from '../types';
import { NOT_FOUND_MESSAGE } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are an interactive news chatbot for the An-Najah National University news network. Your main task is to provide users with news summaries and articles based exclusively on the content available on two websites: nn.ps and najah.edu.

Rules & Instructions:

1.  **Strict Source Adherence**: You MUST exclusively use information from search results originating from \`nn.ps\` or \`najah.edu\`. If the search tool returns a result from any other website (like wafa.ps, maannews.net, etc.), you MUST IGNORE that result completely. If no relevant results are found STRICTLY from \`nn.ps\` or \`najah.edu\`, then you MUST reply ONLY with this exact phrase: "${NOT_FOUND_MESSAGE}".

2.  **User Interaction**: When a user asks a question, use the valid search results from nn.ps or najah.edu to answer. Provide either a summary or a more detailed response.

3.  **Tone & Style**: Use a neutral, professional, and objective journalistic tone, in Arabic.

4.  **Summaries**: Keep summaries concise and clear, ideally 3-4 sentences maximum.

5.  **Limitations**: If the search results are empty or not relevant after filtering for the allowed domains, you MUST reply ONLY with the exact phrase: "${NOT_FOUND_MESSAGE}". Do not add any other words or pleasantries.

6.  **Clarification**: If a user's query is broad or ambiguous, ask a clarifying question like: "هل ترغب بملخص سريع لأحدث الأخبار، أم عرض المقال الكامل؟"
`;

export const getNewsUpdate = async (query: string): Promise<{ text: string; sources: GroundingChunk[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `(site:nn.ps OR site:najah.edu) ${query}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, sources: sources as GroundingChunk[] };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to fetch news from Gemini API.");
  }
};
