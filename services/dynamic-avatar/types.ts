export enum AppState {
  INITIAL,
  AWAITING_IMAGE,
  AWAITING_CONTENT,
  GENERATING,
  COMPLETE,
  ERROR,
}

export interface Message {
  id: number;
  sender: 'user' | 'avatar';
  text: string;
  imagePreview?: string;
  isThinking?: boolean;
}
