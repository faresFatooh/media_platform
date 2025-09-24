export enum InputType {
  TITLE = 'TITLE',
  TEXT = 'TEXT',
  URL = 'URL',
  FILE = 'FILE',
  MULTIPLE_URLS = 'MULTIPLE_URLS'
}

export interface EditorialStyle {
  id: string;
  name: string;
  content: string;
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
  id: string;
  url: string;
}

export interface MonitoredSource {
  id: string;
  url: string;
}

export interface MonitoredContentItem {
  title: string;
  summary: string;
  sourceUrl: string;
  isNew?: boolean;
}