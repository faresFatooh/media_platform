import { TextPair } from '../types';

const API_URL = import.meta.env.VITE_MAIN_BACKEND_URL;

export async function editWithStyle(rawText: string): Promise<string> {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/style-examples/predict/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ raw_text: rawText }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Request failed');
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
