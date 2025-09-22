
export enum NewsItemStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  REVIEW = 'review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
}

export enum JobType {
  FETCH = 'fetch',
  NLP = 'nlp',
  IMAGE = 'image',
  VIDEO = 'video',
  TTS = 'tts',
  STT = 'stt',
  TRANSLATE = 'translate',
  PUBLISH = 'publish',
}

export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Source {
  id: string;
  name: string;
  url: string;
  type: 'RSS' | 'API' | 'Scraper';
  credibility: number;
  categories: string[];
  enabled: boolean;
  lastFetched: string;
}

export interface NewsItem {
  id: string;
  sourceRef: string;
  rawContent: string;
  normalizedContent: {
    title: string;
    body: string;
    alternativeTitles: string[];
  };
  keywords: string[];
  status: NewsItemStatus;
  timestamps: {
    createdAt: string;
    publishedAt?: string;
  };
  source: Source; // Enriched data
}

export interface IntegrationKey {
  id: string;
  provider: string;
  isConfigured: boolean;
  description: string;
  category: 'LLM' | 'Media' | 'Publishing' | 'Storage';
}
