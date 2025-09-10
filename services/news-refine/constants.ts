import type { NewsRefineInput } from './types';

export const DEFAULT_OPTIONS: NewsRefineInput = {
  urls: [],
  style_prefs: {
    editing_level: 'detailed',
    tone: 'annajah',
    include_quotes: true,
    include_context_box: true,
    custom_style: '',
    generation_engine: 'gemini',
  },
  output: {
    dual_language: false,
    include_html: true,
    include_image: true,
    search_open_source_images: false,
    include_aiseo: true,
  },
  constraints: {
    max_words: 450,
    plagiarism_threshold: 0.85,
    min_sources: 2,
  },
};