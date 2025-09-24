import type { User } from '../types';

// ✅ Get the full backend URL from the environment variable set on Render
// This must be set as VITE_MAIN_BACKEND_URL for this service
const API_URL = import.meta.env.VITE_MAIN_BACKEND_URL;

/**
 * Fetches the current user's data from the backend using an auth token.
 * @param token The user's JWT access token.
 * @returns A promise that resolves to the User object.
 */
export const getCurrentUser = async (token: string): Promise<User> => {
  if (!API_URL) {
    throw new Error("VITE_MAIN_BACKEND_URL environment variable is not set.");
  }
  
  // ✅ Use the full and correct URL for the API call
  const response = await fetch(`${API_URL}/api/users/me/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user data. Your session may have expired.');
  }

  const user: User = await response.json();
  return user;
};