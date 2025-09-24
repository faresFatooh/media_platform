
export type View = 'generator' | 'breakingNews' | 'monitor';

export enum ArticleInputType {
  TITLE = 'title',
  TEXT = 'text',
  URL = 'url',
  IMAGE = 'image',
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  logout: () => void;
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