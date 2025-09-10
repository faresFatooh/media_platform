
export type Sender = 'user' | 'bot';

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Message {
  id: number;
  text: string;
  sender: Sender;
  sources?: GroundingChunk[];
}
