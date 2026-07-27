import { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  defaultModel: 'qwen2.5-coder:14b',
  enterToSend: true,
  theme: 'dark',
  temperature: 0.7,
  contextLength: 4096,
  messageDensity: 'comfortable',
  codeTheme: 'dracula', // default coding theme
};

const SETTINGS_KEY = 'ollama_bot_settings';

export function getStoredSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function setStoredSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
