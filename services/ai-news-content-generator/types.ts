export enum GenerationMode {
  Recent = 'recent',
  URL = 'url',
  Text = 'text',
}

export interface NewsSource {
  title: string;
  source: string;
  uri: string;
}

export interface SocialCaptions {
  facebook: string;
  instagram: string;
  x_twitter: string;
  linkedin: string;
  tiktok: string;
  snapchat: string;
}

export interface InfographicSlide {
  title: string;
  content: string;
  icon: string;
}

export interface GeneratedResult {
  article: string;
  translatedArticle?: string;
  socialCaptions: SocialCaptions;
  keyPoints: string[];
  seoKeywords: string[];
  infographicSlides: InfographicSlide[];
  generatedImage?: string;
  imagePrompt?: string;
  headlineSuggestions: string[];
  subheadings: string[];
  imageCaption: string;
  metaDescription: string;
  urlSlug: string;
}

export interface RecentNewsItem {
    title: string;
    snippet: string;
    source: string;
}