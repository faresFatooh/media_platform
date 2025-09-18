import { TextPair } from '../types';

// This service now connects to the custom style editor backend.
const API_URL = '/api';

/**
 * Sends a raw text and a list of style examples to the custom editing service
 * and returns the AI-edited text.
 * @param rawText The text to be edited.
 * @param examples An array of text pairs demonstrating the desired editing style.
 * @returns A promise that resolves to the edited text string.
 */
export async function editWithStyle(rawText: string, examples: TextPair[]): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw_text: rawText,
        examples: examples.map(({ id, ...rest }) => rest),
      }),
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        // Attempt to parse a more specific error message from the backend.
        const errorData = await response.json();
        errorMessage = errorData.detail || JSON.stringify(errorData);
      } catch (e) {
        // If the response is not JSON, use the raw text as the error.
        errorMessage = await response.text();
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (typeof data.edited_text !== 'string') {
        throw new Error("الاستجابة من الخادم غير صالحة. 'edited_text' مفقود أو ليس نصًا.");
    }
    
    return data.edited_text;

  } catch (error) {
    console.error("Error calling style editor API:", error);
    if (error instanceof Error) {
        return `حدث خطأ أثناء الاتصال بخدمة التحرير: ${error.message}`;
    }
    return "حدث خطأ غير معروف.";
  }
}
