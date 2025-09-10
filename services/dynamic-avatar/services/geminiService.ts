import { GoogleGenAI } from "@google/genai";

const getApiKey = (): string => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable not set.");
    }
    return apiKey;
  };

export const generateAvatarVideo = async (
  image: { base64: string; mimeType: string },
  promptText: string,
  background: string,
  audio: { base64: string; mimeType: string; duration: number } | null,
  voicePitch: string,
  backgroundMusic: { base64: string; mimeType: string } | null,
  onProgress: (message: string) => void
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const backgroundDescriptions: { [key: string]: string } = {
    'Original': 'Preserve the original background from the provided image. The person should be animated in place within their original environment.',
    'Neutral Dark Grey': 'The background should be a neutral solid dark grey.',
    'Virtual Studio': 'The background should be a modern virtual news studio with soft, professional lighting.',
    'Gradient Blue': 'The background should be a subtle, clean blue to purple gradient.',
    'Blurred Office': 'The background should be a blurred, out-of-focus modern office setting.',
  };

  const pitchDescriptions: { [key: string]: string } = {
    'Low': 'The generated voice should have a low pitch.',
    'Medium': 'The generated voice should have a medium pitch.',
    'High': 'The generated voice should have a high pitch.',
  };

  const backgroundPrompt = backgroundDescriptions[background] || backgroundDescriptions['Original'];
  const pitchPrompt = pitchDescriptions[voicePitch] || pitchDescriptions['Medium'];
  
  let prompt = `Create a full-length, high-quality animated video of the person in this image.
- The person should be the primary focus, centered, showing their face and upper body.
- Animate them with natural, lively movements including head turns, hand gestures, and subtle upper body shifts to make them appear engaged and realistic.
- The animation must perfectly lip-sync with the dialogue. Every word must match the lip movements precisely.
- The dialogue to be spoken is: "${promptText}". Generate a natural-sounding voice for the dialogue. ${pitchPrompt}
- **Crucially, the final video's duration must exactly match the specified duration.** Do not cut the video short. To achieve this, seamlessly extend background animations and subtle, non-speaking movements (like blinking, slight smiles, or shifting posture) to fill any gaps and cover the entire duration. The goal is a continuous, natural-looking performance without any noticeable loops or cuts.
- ${backgroundPrompt}`;

  const videoRequest: {
    model: string;
    prompt: string;
    image: { imageBytes: string; mimeType: string; };
    config: { numberOfVideos: number; durationSecs?: number; };
    backgroundMusic?: { audioBytes: string; mimeType: string; };
  } = {
    model: 'veo-2.0-generate-001',
    prompt: prompt,
    image: {
      imageBytes: image.base64,
      mimeType: image.mimeType,
    },
    config: {
        numberOfVideos: 1,
    }
  };

  // If user provides audio, use its duration to set the video length
  if (audio && audio.duration) {
    videoRequest.config.durationSecs = Math.ceil(audio.duration);
  }

  if (backgroundMusic) {
    videoRequest.backgroundMusic = {
        audioBytes: backgroundMusic.base64,
        mimeType: backgroundMusic.mimeType
    };
  }

  onProgress("Sending generation request...");
  let operation = await ai.models.generateVideos(videoRequest);

  onProgress("Video generation has started...");
  let checks = 0;

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
    } catch(e) {
        console.warn("Polling failed, retrying...", e);
        // Continue loop on polling error
    }

    checks++;
    if (checks > 5) onProgress("Polishing the final render...");
    else if (checks > 2) onProgress("Syncing facial movements...");
    else onProgress("Processing initial frames...");
  }

  if (operation.error) {
    throw new Error(`Video generation failed: ${operation.error.message}`);
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Video generation failed to produce a download link. The content may have been blocked by safety filters.");
  }
  
  onProgress("Downloading generated video...");
  const response = await fetch(`${downloadLink}&key=${getApiKey()}`);
  if (!response.ok) {
      throw new Error(`Failed to download video file. Status: ${response.status} ${response.statusText}`);
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateSubtitles = async (text: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `Generate an SRT subtitle file for the following text. Estimate the timings for natural speech, starting from 00:00:00,000. Do not add any explanation, commentary, or markdown code fences (like \`\`\`srt). Only provide the raw SRT content, starting directly with the number 1.

Text: "${text}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    const rawText = response.text;
    return rawText.replace(/```srt\n/g, '').replace(/```/g, '').trim();
}
