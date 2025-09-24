// In src/services/apiService.ts
import axios from 'axios';
import { EditorialStyle, CustomNewsSource, MonitoredSource } from '../types';

const api = axios.create({
  // This uses the environment variable to find our backend
  baseURL: import.meta.env.VITE_MAIN_BACKEND_URL,
});

// This automatically adds the user's login token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Functions for Editorial Styles ---
export const getStyles = async (): Promise<EditorialStyle[]> => {
  const { data } = await api.get('/api/news-generator/styles/');
  return data;
};

export const createStyle = async (styleData: { name: string; content: string }): Promise<EditorialStyle> => {
  const { data } = await api.post('/api/news-generator/styles/', styleData);
  return data;
};

export const deleteStyle = async (id: number): Promise<void> => {
    await api.delete(`/api/news-generator/styles/${id}/`);
};

// --- Functions for Custom News Sources ---
export const getCustomSources = async (): Promise<CustomNewsSource[]> => {
  const { data } = await api.get('/api/news-generator/custom-sources/');
  return data;
};

// --- Functions for Monitored Sources ---
export const getMonitoredSources = async (): Promise<MonitoredSource[]> => {
    const { data } = await api.get('/api/news-generator/monitored-sources/');
    return data;
};