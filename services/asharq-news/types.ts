// Define the specific platforms you support
export type Platform = 'x' | 'facebook' | 'instagram' | 'linkedin' | 'threads' | 'tiktok' | 'youtube_shorts' | 'telegram';

// An object to hold the generated captions for each platform
export type Captions = Partial<Record<Platform, string>>;

// The structure for the AI-parsed news data
export interface ParsedNews {
  headline: string;
  summary: string;
  entities: string[];
}

// The structure for an image asset associated with a news item
export interface Asset {
  source: string;
  url: string;
  license: string;
  credit_line: string;
  query: string;
}

// The different statuses a news item can have
export enum PublishStatus {
  DRAFT = 'draft',
  READY = 'ready',
  POSTED = 'posted',
  SCHEDULED = 'scheduled',
  FAILED = 'failed',
}

// The main data structure for a single news item
export interface NewsItem {
  id: string;
  brandId: string;
  status: PublishStatus;
  sourceUrl?: string;
  parsed: ParsedNews;
  image: Asset;
  captions: Captions;
  selectedPlatforms: Platform[];
  createdAt: string;
  publishTime?: string;
  permalinks?: Partial<Record<Platform, string>>;
}

// Enum for the input form type
export enum InputType {
    URL = 'url',
    TEXT = 'text',
}