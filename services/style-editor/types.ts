export interface StylePair {
  _id: string;
  before: string;
  after: string;
}

export enum View {
  Training,
  Editing,
}

export interface ApiKeys {
  claude: string;
  chatgpt: string;
}