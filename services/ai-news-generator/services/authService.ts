import type { User } from '../types';

// Using relative paths for API calls.
// This assumes the frontend is served from the same domain as the backend,
// or a proxy is configured in production to forward /api requests to the backend service.
const API_PREFIX = '/api';

/**
 * Fetches the current user's data from the backend using an auth token.
 * @param token The user's JWT access token.
 * @returns A promise that resolves to the User object.
 */
export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await fetch(`${API_PREFIX}/user/me/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // This could be because the token is expired or invalid.
    throw new Error('Failed to fetch user data. Your session may have expired.');
  }

  const user: User = await response.json();
  return user;
};