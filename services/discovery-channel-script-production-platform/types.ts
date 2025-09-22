
export type Theme = 'light' | 'dark';

export interface Program {
  id: string;
  name: string;
  icon: string;
  scriptCount: number;
}

export interface Scene {
  time: string;
  description: string;
  visuals: string;
}

export interface Source {
  name: string;
  url: string;
  reliability?: number;
}

export interface Script {
  title: string;
  program: string;
  duration: string;
  content: string;
  scenes: Scene[];
  sources: Source[];
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface FactCheckResult {
  accuracy: number;
  details: string; // Could be markdown
}

export type Section = 'dashboard' | 'newScript' | 'factCheck' | 'api';

export interface NotificationMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface ApiConfigs {
  claudeApiKey: string;
  chatGptApiKey: string;
}

export type ApiName = 'claude' | 'chatGpt';

export type ConnectionStatus = 'connected' | 'disconnected' | 'pending';

export interface ApiStatuses {
  claude: ConnectionStatus;
  chatGpt: ConnectionStatus;
}
