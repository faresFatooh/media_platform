export type View = 'generator' | 'breakingNews' | 'monitor' | 'trainingExamples';

export enum ArticleInputType {
  TITLE = 'title',
  TEXT = 'text',
  URL = 'url',
  IMAGE = 'image',
}

export interface GeneratedArticle {
  title: string;
  content: string;
  sources: string[];
  keywords: string[];
  summaryPoints: string[];
  socialMediaPosts: {
    twitter: string;
    facebook: string;
  };
  imageUrl: string;
}

export interface ImageFile {
  base64: string;
  mimeType: string;
}

// Updated to match Django's MonitoredSource model
export interface NewsSource {
  id: number;
  url: string;
  user: string;
  created_at: string;
}

export interface SourceArticle {
  id: string;
  title: string;
  link: string;
  snippet: string;
  publishedDate: string;
}

// New types for Breaking News
export interface BreakingNewsTopic {
  title: string;
  summary: string;
  sources: { uri: string; title: string; }[];
}

// Type for Django EditorialStyle model
export interface EditorialStyle {
  id: number;
  user: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
}
