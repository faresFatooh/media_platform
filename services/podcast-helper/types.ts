
export type Step = 'input' | 'edit' | 'publish';

export interface PodcastMetadata {
  title: string;
  description: string;
  tags: string[];
}
