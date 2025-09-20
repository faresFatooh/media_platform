export type Platform = 'x' | 'facebook' | 'instagram' | 'linkedin' | 'threads' | 'tiktok' | 'youtube_shorts' | 'telegram';
export type Captions = Partial<Record<Platform, string>>;

export interface ParsedNews {
  headline: string;
  summary: string;
  editedSummary?: string; // <-- الحقل الجديد
  entities: string[];
}

export interface Asset {
  source: string;
  url: string;
  license: string;
  credit_line: string;
  query: string;
}

export enum PublishStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
  SCHEDULED = 'scheduled',
  FAILED = 'failed',
  READY = "READY",
}

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
}

export enum InputType {
    URL = 'url',
    TEXT = 'text',
}