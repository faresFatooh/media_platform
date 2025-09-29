import type { ElevenLabsVoice } from '../types';

const API_BASE_URL = 'https://api.elevenlabs.io/v1';

export async function validateElevenLabsApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
    if (!apiKey) {
        return { success: false, message: 'مفتاح API مفقود.' };
    }
    try {
        const response = await fetch(`${API_BASE_URL}/user`, {
            headers: { 'xi-api-key': apiKey }
        });

        if (response.ok) {
            return { success: true, message: 'تم التحقق من مفتاح API بنجاح.' };
        }
        if (response.status === 401) {
            return { success: false, message: 'مفتاح API غير صالح. يرجى التحقق من المفتاح في لوحة تحكم ElevenLabs.' };
        }
        return { success: false, message: `فشل التحقق. رمز الحالة: ${response.status}` };
    } catch (error) {
        console.error("Failed to validate ElevenLabs API key:", error);
        return { success: false, message: 'حدث خطأ في الشبكة أثناء التحقق.' };
    }
}


export async function getElevenLabsVoices(apiKey: string): Promise<ElevenLabsVoice[]> {
    const response = await fetch(`${API_BASE_URL}/voices`, {
        headers: {
            'xi-api-key': apiKey
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch voices from ElevenLabs. Status: ${response.status}`);
    }

    const data = await response.json();
    return data.voices;
}

export async function generateElevenLabsAudio(text: string, voiceId: string, apiKey: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
        },
        body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2', // High-quality multilingual model
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to generate audio from ElevenLabs. Status: ${response.status}`);
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
}