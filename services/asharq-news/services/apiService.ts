import axios from 'axios';
import type { NewsItem } from '../types';

// يقرأ عنوان الخادم الخلفي الرئيسي من متغيرات البيئة
const api = axios.create({
  baseURL: import.meta.env.VITE_MAIN_BACKEND_URL,
});

// إضافة "بطاقة الهوية" (التوكن) تلقائيًا مع كل طلب
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- دوال لإدارة الأخبار في قاعدة البيانات ---

export const getNewsArticles = async (): Promise<NewsItem[]> => {
  const { data } = await api.get('/api/asharq-automation/articles/');
  return data;
};

export const createNewsArticle = async (newsData: Omit<NewsItem, 'id' | 'posts'>): Promise<NewsItem> => {
  const payload = {
    original_text: newsData.parsed.summary,
    source_url: newsData.sourceUrl,
    topic: newsData.brandId // Using brandId as topic for now
  };
  const { data } = await api.post('/api/asharq-automation/articles/', payload);
  // We need to merge the backend response with the frontend data
  return { ...newsData, id: data.id, posts: [] };
};

export const deleteNewsArticle = async (id: string): Promise<void> => {
  await api.delete(`/api/asharq-automation/articles/${id}/`);
};

// This function can be expanded later to update the full item
export const updateNewsArticlePosts = async (id: string, posts: any): Promise<NewsItem> => {
    // For now, this is a placeholder. We need to build the "GeneratedPost" update logic.
    console.log("Updating posts for article:", id, posts);
    const { data } = await api.patch(`/api/asharq-automation/articles/${id}/`, { posts_data: posts });
    return data;
}