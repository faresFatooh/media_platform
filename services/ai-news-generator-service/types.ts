export enum InputType {
  TITLE = 'TITLE',
  TEXT = 'TEXT',
  URL = 'URL',
  FILE = 'FILE',
  MULTIPLE_URLS = 'MULTIPLE_URLS'
}

export interface EditorialStyle {
  id: number; 
  user: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface BreakingNewsItem {
  headline: string;
  summary: string;
  publicationTime?: string;
  source?: {
    uri: string;
    title: string;
  };
}

export interface GeneratedPost {
  platform: string;
  content: string;
}

export interface GeneratedArticle {
    headline: string;
    body: string;
    seoKeywords: string[];
    socialPosts: GeneratedPost[];
    keyPoints: string[];
}

export interface CustomNewsSource {
  id: number; // The database ID is a number
  user: string;
  url: string;
  created_at: string;
}

export interface MonitoredSource {
  id: number; // The database ID is a number
  user: string;
  url: string;
  created_at: string;
}

export interface MonitoredContentItem {
  title: string;
  summary: string;
  sourceUrl: string;
  isNew?: boolean;
}