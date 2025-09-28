
export enum Platform {
  X = 'X',
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  YouTube = 'YouTube',
  LinkedIn = 'LinkedIn',
  Telegram = 'Telegram',
  News = 'News',
  Analysis = 'Analysis',
  Creative = 'Creative',
  TikTok = 'TikTok',
  FactCheck = 'FactCheck',
  General = 'General',
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface GenerationResult {
  text: string;
  sources: GroundingChunk[] | null;
}

export interface ContentTemplate {
  id: number;
  title: string;
  description: string;
  platform: Platform;
  prompt: (inputs: Record<string, string>) => string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'textarea';
    placeholder: string;
  }[];
}
