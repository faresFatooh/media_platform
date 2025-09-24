import type { GeneratedArticle, ArticleInputType, ImageFile } from '../types';

// Using relative paths for API calls.
// This assumes the frontend is served from the same domain as the backend,
// or a proxy is configured in production to forward /api requests to the backend service.
const API_PREFIX = '/api';

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
  const response = await fetch(`${API_PREFIX}/generate-article/`, {
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
  const response = await fetch(`${API_PREFIX}/generate-image/`, {
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