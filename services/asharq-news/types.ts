
export enum InputType {
  URL = 'url',
  TEXT = 'text',
}

export enum PublishStatus {
  DRAFT = 'draft',
  READY = 'ready',
  POSTED = 'posted',
  FAILED = 'failed',
  SCHEDULED = 'scheduled',
}

export type Platform = 'x' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube_shorts' | 'telegram' | 'threads';

export interface ParsedNews {
  headline: string;
  summary: string;
  entities: string[];
  source_name: string;
}

export interface Asset {
  source: string;
  url: string;
  license: string;
  credit_line: string;
  query: string;
}

export type Captions = Record<Platform, string>;

export interface NewsItem {
  id: string;
  inputType: InputType;
  inputContent: string;
  parsed: ParsedNews;
  image: Asset;
  captions: Captions;
  selectedPlatforms: Platform[];
  status: PublishStatus;
  publishTime?: string;
  permalinks: Partial<Record<Platform, string>>;
  createdAt: string;
}
