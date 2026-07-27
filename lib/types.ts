export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  messages: Message[];
}

export interface Settings {
  defaultModel: string;
  enterToSend: boolean;
  theme: 'dark' | 'light' | 'system';
  temperature: number;
  contextLength: number;
  messageDensity: 'comfortable' | 'compact';
  codeTheme: string;
}

export interface OllamaModel {
  name: string;
  model?: string;
  modified_at?: string;
  size?: number;
  digest?: string;
  details?: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

export type ConnectionStatus = 'connected' | 'connecting' | 'offline';
