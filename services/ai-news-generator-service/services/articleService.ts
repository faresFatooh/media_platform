// FIX: Corrected the Vite environment variable type declarations. By declaring `ImportMetaEnv` inside
// a `declare global` block, it becomes a global, augmentable interface. This prevents type
// conflicts with other files and ensures `import.meta.env` is consistently typed.
declare global {
  interface ImportMetaEnv {
    readonly VITE_MAIN_BACKEND_URL: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

import type { GeneratedArticle, ArticleInputType, ImageFile } from '../types';

const API_URL = import.meta.env.VITE_MAIN_BACKEND_URL;

/**
 * Calls the Django backend to generate an article using the Gemini API.
 * @param inputType The type of input provided by the user.
 * @param data The user's input data (text, URL, or image file).
 * @param token The user's authentication token.
 * @returns A promise that resolves to the text-based parts of a generated article.
 */
export const generateArticle = async (
  inputType: ArticleInputType,
  data: string | ImageFile,
  token: string
): Promise<Omit<GeneratedArticle, 'imageUrl'>> => {
  if (!API_URL) {
    throw new Error("VITE_MAIN_BACKEND_URL environment variable is not set.");
  }
  const response = await fetch(`${API_URL}/api/generate-article/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ input_type: inputType, data }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred.' }));
    throw new Error(errorData.detail || 'Failed to generate article.');
  }

  return await response.json();
};

/**
 * Calls the Django backend to generate an image related to an article.
 * @param prompt The title or topic of the article.
 * @param token The user's authentication token.
 * @returns A promise that resolves to the URL of the generated image.
 */
export const generateImage = async (prompt: string, token: string): Promise<string> => {
    if (!API_URL) {
    throw new Error("VITE_MAIN_BACKEND_URL environment variable is not set.");
  }
  const response = await fetch(`${API_URL}/api/generate-image/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred.' }));
    throw new Error(errorData.detail || 'Failed to generate image.');
  }

  const result = await response.json();
  // Assuming the backend returns a JSON object like { "imageUrl": "..." }
  return result.imageUrl;
};