import { StylePair } from '../types';

const API_BASE_URL = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || JSON.stringify(errorBody);
    } catch {
      errorMessage = await response.text();
    }
    throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const getPairs = async (): Promise<StylePair[]> => {
  const response = await fetch(`${API_BASE_URL}/pairs`);
  return handleResponse<StylePair[]>(response);
};

export const addPair = async (pairData: { before: string; after: string }): Promise<StylePair> => {
  const response = await fetch(`${API_BASE_URL}/pairs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pairData),
  });
  return handleResponse<StylePair>(response);
};

export const deletePair = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/pairs/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<{ message: string }>(response);
};

export const addPairsBatch = async (pairs: { before: string; after: string }[]): Promise<StylePair[]> => {
    const response = await fetch(`${API_BASE_URL}/pairs/batch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pairs),
    });
    return handleResponse<StylePair[]>(response);
};