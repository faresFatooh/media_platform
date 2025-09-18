import { TextPair } from '../types';

const API_URL = '/api'; // Using the proxy

export async function editWithStyle(rawText: string, examples: TextPair[]): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw_text: rawText,
        examples: examples.map(({ id, ...rest }) => rest), // Send correct format
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    const data = await response.json();
    return data.edited_text;
  } catch (error) {
    console.error("Error calling style editor API:", error);
    if (error instanceof Error) {
        return `حدث خطأ: ${error.message}`;
    }
    return "حدث خطأ غير معروف.";
  }
}