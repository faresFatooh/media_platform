export interface Scene {
    sceneNumber: number;
    narration: string;
    visualSuggestion: string;
}

export interface DocumentaryScript {
    title: string;
    suggestedDuration: string;
    hook: string;
    scenes: Scene[];
    conclusion: string;
}

export interface SocialMediaContent {
    title?: string;
    caption: string;
    hashtags?: string;
    description?: string;
    tags?: string;
}

export interface PromoContent {
    youtube: SocialMediaContent;
    instagramPost: SocialMediaContent;
    instagramStory: SocialMediaContent;
    facebookPost: SocialMediaContent;
    twitterPost: SocialMediaContent;
}

export interface MediaItem {
    prompt: string;
    url: string;
}

export interface GeneratedMedia {
    images: MediaItem[];
    videos: MediaItem[];
}

export interface VideoTemplate {
    title: string;
    description: string;
    promptPlaceholder: string;
}

export interface ShortsScript {
    title: string;
    hook: string;
    content: string;
    visualSuggestion: string;
}

export interface ElevenLabsVoice {
    voice_id: string;
    name: string;
}
