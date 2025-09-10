export type EditingLevelOption = "direct" | "detailed" | "analytical";
export type ToneOption = "annajah" | "alsharq" | "neutral";
export type GenerationEngine = "gemini" | "chatgpt" | "claude";

export interface StylePrefs {
  editing_level: EditingLevelOption;
  tone: ToneOption;
  include_quotes: boolean;
  include_context_box: boolean;
  custom_style?: string;
  generation_engine: GenerationEngine;
}

export interface OutputPrefs {
  dual_language: boolean;
  include_html: boolean;
  include_image: boolean;
  search_open_source_images: boolean;
  include_aiseo: boolean;
}

export interface Constraints {
  max_words: number;
  plagiarism_threshold: number;
  min_sources: number;
}

export interface NewsRefineInput {
  urls: string[];
  style_prefs: StylePrefs;
  output: OutputPrefs;
  constraints: Constraints;
}

export interface Quote {
  speaker: string;
  quote: string;
  source: string;
}

export interface Source {
  name: string;
  url: string;
  publish_time: string;
}

export interface Article {
  language: string;
  title: string;
  dek: string;
  body_paragraphs: string[];
  context_box: string[] | null;
  quotes: Quote[] | null;
  sources: Source[];
  time_zone: string;
  word_count: number;
  image_prompt_english: string;
}

export interface SEO {
  meta_title: string;
  meta_description: string;
  keywords: string[];
  ai_summary: string;
}

export interface EnglishVersion {
  enabled: boolean;
  title: string | null;
  body_paragraphs: string[] | null;
}

export interface NewsRefineOutput {
  article: Article;
  html: string;
  seo: SEO;
  english_version: EnglishVersion;
  generated_image_b64?: string;
}

// New type for audio generation preferences
export interface AudioPrefs {
  voice: string;
  stability: number;
  similarity_boost: number;
}

// Types for Settings and RSS Feed
export interface AppSettings {
  rssFeeds: string[];
  reutersApiKey: string;
  audioPrefs: AudioPrefs;
}

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

// Types for Social Media and UI
export type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube';

export interface ToastData {
  message: string;
  type: 'success' | 'error';
}

// New User type for authentication
export interface User {
  email: string;
}

// Type for modular views in the new dashboard
export type View = 'dashboard' | 'news_refine' | 'content_pipeline' | 'transcription' | 'media_tools' | 'community' | 'management';