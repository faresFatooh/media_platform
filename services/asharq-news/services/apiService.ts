import axios from 'axios';
import type { NewsItem } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_MAIN_BACKEND_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getNewsArticles = async (): Promise<NewsItem[]> => {
  const { data } = await api.get('/api/asharq-automation/articles/');
  // This mapping needs to be improved to correctly match the frontend NewsItem type
  return data.map(item => ({
      id: item.id.toString(),
      brandId: item.topic,
      status: 'draft',
      // ... other fields need to be mapped from the backend response
      captions: item.posts.reduce((acc, post) => {
          acc[post.platform.toLowerCase()] = post.content;
          return acc;
      }, {}),
      selectedPlatforms: item.posts.map(p => p.platform.toLowerCase()),
      createdAt: item.created_at,
  }));
};

export const processAndGenerate = async (source: { url?: string; text?: string }, platforms: string[], brandId: string): Promise<NewsItem> => {
  const payload = { ...source, platforms, brandId };
  const { data } = await api.post('/api/asharq-automation/articles/process-and-generate/', payload);
  // This mapping also needs to be improved
  return {
      id: data.id.toString(),
      brandId: data.topic,
      status: 'draft',
       // ... other fields
      captions: data.posts.reduce((acc, post) => {
          acc[post.platform.toLowerCase()] = post.content;
          return acc;
      }, {}),
      selectedPlatforms: data.posts.map(p => p.platform.toLowerCase()),
      createdAt: data.created_at,
  };
};

export const deleteNewsArticle = async (id: string): Promise<void> => {
  await api.delete(`/api/asharq-automation/articles/${id}/`);
};

export const updateNewsArticle = async (id: string, updatedData: Partial<NewsItem>): Promise<NewsItem> => {
    const { data } = await api.patch(`/api/asharq-automation/articles/${id}/`, updatedData);
    return data;
};

// --- هذه هي الدالة الجديدة التي قمنا بإضافتها ---
export const generatePostsForArticle = async (articleId: string, platforms: string[]) => {
  const { data } = await api.post(`/api/asharq-automation/articles/${articleId}/generate-posts/`, {
    platforms: platforms,
  });
  // يفترض أن الخادم يعيد قائمة بالمنشورات المولدة حديثًا
  return data;
};