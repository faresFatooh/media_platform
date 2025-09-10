import { GoogleGenAI, Part, Type } from "@google/genai";
import { SrtEntry, SyncResult } from '../types';
import { srtTimeToMilliseconds, millisecondsToSrtTime, parseSrt, convertEntriesToSrt } from '../utils/srtUtils';

// Initialize the Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * A constant string defining the core rules for synchronization.
 */
const hardBoundaryProtocol = `
**Core Synchronization Protocol: Hard Boundaries**
Your most critical task is to create timestamps that are extremely precise. Follow these rules without exception:
1.  **Start Time:** The timestamp must begin at the exact moment the first audible sound of the first word in the line is spoken. There should be zero silence before it.
2.  **End time:** The timestamp must end at the exact moment the last audible sound of the last word in the line fades. Do not include any trailing silence, pauses, or breaths that follow the spoken words.
3.  **Test:** Imagine you are using the timestamps to cut the audio. The resulting clip should contain *only* the spoken words for that line and nothing else.
Failure to adhere to this "Hard Boundary" protocol will result in an incorrect output.
`;

/**
 * A constant string defining the formatting rules for subtitles.
 */
const formattingRules = `
**Formatting Rules:**
In addition to the timing protocol, you must adhere to these formatting rules for every single subtitle entry:
1.  **Word Count Limit:** Each subtitle entry must contain a maximum of 8 words. Split longer sentences into multiple, appropriately timed entries.
2.  **No Preposition Endings:** Do not end any subtitle line with a preposition (e.g., 'in', 'on', 'with', 'to'). Restructure the sentence if necessary to ensure it flows naturally while respecting the word count limit and synchronization.
`;


/**
 * Converts a File object to a GoogleGenAI.Part object.
 * @param file The file to convert.
 * @returns A promise that resolves to a Part object.
 */
async function fileToGenerativePart(file: File): Promise<Part> {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
}

/**
 * Synchronizes subtitles for a video, either by transcribing or aligning existing text.
 * @param videoFile The video file.
 * @param textContent Optional text content to align.
 * @returns A promise that resolves to a SyncResult object.
 */
export const synchronizeSubtitles = async (videoFile: File, textContent: string | null): Promise<SyncResult> => {
    const videoPart = await fileToGenerativePart(videoFile);
    
    const parts: Part[] = [videoPart];
    let prompt: string;
    let schemaDescription: any;

    if (textContent) {
        prompt = `You are an expert in video subtitle synchronization. Your task is to process the given video and the provided text content to generate a single, perfectly synchronized SRT file.

**Crucial Instructions:**
1.  **Use the Provided Text Verbatim:** You **must** use the text content below exactly as it is written. Do not add, omit, change, or translate any words or characters. Your output must be a direct synchronization of this specific text.
2.  **Strict Synchronization:** Adhere to the timing protocols for perfect synchronization.

Provided Text:
---
${textContent}
---

${hardBoundaryProtocol}

${formattingRules}

After applying all protocols and rules, provide the output in a JSON object with a single key: "synchronized".
- "synchronized": The perfectly synchronized subtitles in SRT format, created *strictly* from the provided text.`;
        
        schemaDescription = {
            synchronized: { type: Type.STRING, description: "The synchronized subtitles in SRT format, created strictly from the provided text." },
        };
    } else {
        prompt = `You are an expert in video transcription and translation. Your task is to process the given video to generate accurate subtitles.

${hardBoundaryProtocol}

${formattingRules}

After applying all protocols and rules, provide the following in a JSON object with keys: "original" and "arabic".
- "original": Transcribe the audio from the video into the original language and create frame-accurate subtitles in SRT format.
- "arabic": Provide an Arabic translation of the transcription, also in SRT format.`;
        
        schemaDescription = {
            original: { type: Type.STRING, description: "The original language transcription from the video in SRT format." },
            arabic: { type: Type.STRING, description: "An Arabic translation of the subtitles in SRT format." },
        };
    }

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: schemaDescription,
            }
        }
    });

    const jsonResponse = response.text.trim();
    const result = JSON.parse(jsonResponse) as SyncResult;

    const TIME_OFFSET_MS = -200; // Making it 200ms earlier

    const applyOffsetToSrtString = (srt: string | undefined): string | undefined => {
        if (!srt) return undefined;
        const entries = parseSrt(srt);
        const adjustedEntries = entries.map(entry => ({
            ...entry,
            startTime: millisecondsToSrtTime(srtTimeToMilliseconds(entry.startTime) + TIME_OFFSET_MS),
            endTime: millisecondsToSrtTime(srtTimeToMilliseconds(entry.endTime) + TIME_OFFSET_MS),
        }));
        return convertEntriesToSrt(adjustedEntries);
    };

    const finalResult: SyncResult = {
        synchronized: applyOffsetToSrtString(result.synchronized),
        original: applyOffsetToSrtString(result.original),
        arabic: applyOffsetToSrtString(result.arabic),
    };

    return finalResult;
};

/**
 * Refines subtitles based on user corrections.
 * @param videoFile The video file.
 * @param correctedText The corrected full transcript.
 * @returns A promise that resolves to an array of SrtEntry objects.
 */
export const refineSubtitles = async (videoFile: File, correctedText: string): Promise<SrtEntry[]> => {
    const videoPart = await fileToGenerativePart(videoFile);
    
    const prompt = `You are a professional subtitle synchronizer. Your task is to take the provided video and a corrected transcript, and generate perfectly synchronized subtitle entries.
    
The corrected transcript is:
---
${correctedText}
---

${hardBoundaryProtocol}

${formattingRules}
    
Apply all rules and output a JSON array of subtitle objects. Each object must have "id", "startTime", "endTime", and "text" properties. The startTime and endTime must be in "HH:MM:SS,mmm" format. Ensure the IDs are sequential starting from 1.`;

    const parts: Part[] = [videoPart, { text: prompt }];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER, description: "Sequential ID of the subtitle entry, starting from 1." },
                        startTime: { type: Type.STRING, description: "Start time in HH:MM:SS,mmm format" },
                        endTime: { type: Type.STRING, description: "End time in HH:MM:SS,mmm format" },
                        text: { type: Type.STRING, description: "The subtitle text content." },
                    },
                    required: ["id", "startTime", "endTime", "text"]
                }
            }
        }
    });

    const jsonResponse = response.text.trim();
    const entries = JSON.parse(jsonResponse);

    const TIME_OFFSET_MS = -200; // Making it 200ms earlier
    
    if (Array.isArray(entries)) {
        return entries.map(e => ({
            id: e.id,
            startTime: millisecondsToSrtTime(srtTimeToMilliseconds(e.startTime) + TIME_OFFSET_MS),
            endTime: millisecondsToSrtTime(srtTimeToMilliseconds(e.endTime) + TIME_OFFSET_MS),
            text: e.text,
        }));
    }
    
    throw new Error("AI response was not in the expected format.");
};
