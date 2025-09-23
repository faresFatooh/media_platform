// apiConfigService.ts
import { ApiConfigs } from '../types';

export const getApiConfigs = async (): Promise<ApiConfigs> => {
  const response = await fetch('/api/keys', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem("authToken")}` }
  });
  if (!response.ok) throw new Error("Failed to load configs");
  return await response.json();
};

export const saveApiConfigs = async (configs: ApiConfigs): Promise<boolean> => {
  const response = await fetch('/api/keys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("authToken")}`
    },
    body: JSON.stringify(configs)
  });
  return response.ok;
};

export const testApiConnection = async (apiKey: string, provider: "openai"|"claude"|"gemini"): Promise<boolean> => {
  const response = await fetch(`/api/test-connection/${provider}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("authToken")}`
    },
    body: JSON.stringify({ apiKey })
  });
  const data = await response.json();
  return data.connected;
};
