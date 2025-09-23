import { ApiConfigs } from '../types';

const API_URL = '/api/discovery-script/api/configs/';

export const getApiConfigs = async (): Promise<ApiConfigs> => {
  const response = await fetch(API_URL, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("access_token")}`
    }
  });
  if (!response.ok) throw new Error("Failed to fetch API configs");
  return await response.json();
};

export const saveApiConfigs = async (configs: ApiConfigs): Promise<boolean> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("access_token")}`
    },
    body: JSON.stringify(configs),
  });
  return response.ok;
};

export const testApiConnection = async (apiKey: string): Promise<boolean> => {
  return apiKey.trim() !== '' && apiKey.length > 10;
};
