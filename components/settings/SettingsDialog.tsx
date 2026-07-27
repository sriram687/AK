'use client';

import React, { useState, useEffect } from 'react';
import { X, Sliders, Monitor, Palette, Info, Settings as SettingsIcon, RefreshCw } from 'lucide-react';
import { Settings, ConnectionStatus } from '@/lib/types';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
  connectionStatus: ConnectionStatus;
  serverUrl: string;
}

type TabType = 'general' | 'generation' | 'appearance' | 'about';

export default function SettingsDialog({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  connectionStatus,
  serverUrl,
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [healthResult, setHealthResult] = useState<string | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleTestConnection = async () => {
    setCheckingHealth(true);
    setHealthResult(null);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (res.ok && data.status === 'connected') {
        setHealthResult('Success! Connected to Ollama server.');
      } else {
        setHealthResult(`Error: ${data.message || 'Offline'}`);
      }
    } catch (e: any) {
      setHealthResult(`Error: ${e.message || 'Failed to reach backend'}`);
    } finally {
      setCheckingHealth(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog container */}
      <div className="relative w-full max-w-2xl h-[500px] flex rounded-xl border border-white/[0.08] bg-[#0c0c0f] shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Sidebar Nav */}
        <div className="w-48 border-r border-white/[0.06] bg-[#070709] p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-2 py-1.5 mb-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <SettingsIcon className="h-3.5 w-3.5" />
              <span>Settings</span>
            </div>
            
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                activeTab === 'general' 
                  ? 'bg-white/[0.04] text-white' 
                  : 'text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-200'
              }`}
            >
              <Monitor className="h-4 w-4" />
              General
            </button>
            
            <button
              onClick={() => setActiveTab('generation')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                activeTab === 'generation' 
                  ? 'bg-white/[0.04] text-white' 
                  : 'text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-200'
              }`}
            >
              <Sliders className="h-4 w-4" />
              Generation
            </button>
            
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                activeTab === 'appearance' 
                  ? 'bg-white/[0.04] text-white' 
                  : 'text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-200'
              }`}
            >
              <Palette className="h-4 w-4" />
              Appearance
            </button>
            
            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                activeTab === 'about' 
                  ? 'bg-white/[0.04] text-white' 
                  : 'text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-200'
              }`}
            >
              <Info className="h-4 w-4" />
              About
            </button>
          </div>
          
          <div className="text-[10px] text-zinc-600 px-2">
            v1.0.0-production
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0c]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold capitalize text-white">
              {activeTab} Settings
            </h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-md text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form Options */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
            
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 py-1.5">
                  <div className="space-y-0.5">
                    <label className="text-xs font-medium text-zinc-200">Enter to Send</label>
                    <p className="text-[11px] text-zinc-500">
                      Press Enter to submit your message. Shift+Enter for new lines.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange('enterToSend', !localSettings.enterToSend)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      localSettings.enterToSend ? 'bg-zinc-200' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[#0a0a0c] shadow ring-0 transition duration-200 ease-in-out ${
                        localSettings.enterToSend ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 py-1.5 border-t border-white/[0.04] pt-4">
                  <div className="space-y-0.5">
                    <label className="text-xs font-medium text-zinc-200">Default Model</label>
                    <p className="text-[11px] text-zinc-500 font-mono text-zinc-400">
                      qwen2.5-coder:14b
                    </p>
                  </div>
                  <input
                    type="text"
                    value={localSettings.defaultModel}
                    onChange={(e) => handleChange('defaultModel', e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white/[0.03] border border-white/[0.08] rounded-md text-zinc-300 focus:outline-none focus:border-zinc-700 w-44 text-right"
                  />
                </div>
              </div>
            )}

            {activeTab === 'generation' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-medium text-zinc-200">Temperature</label>
                    <span className="font-mono text-zinc-400">{localSettings.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.1"
                    value={localSettings.temperature}
                    onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Controls creativity: 0.0 is deterministic, 1.0 is creative, 1.5 is highly creative.
                  </p>
                </div>

                <div className="space-y-2 border-t border-white/[0.04] pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-medium text-zinc-200">Context Length (num_ctx)</label>
                    <span className="font-mono text-zinc-400">{localSettings.contextLength} tokens</span>
                  </div>
                  <select
                    value={localSettings.contextLength}
                    onChange={(e) => handleChange('contextLength', parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white/[0.03] border border-white/[0.08] rounded-md text-zinc-300 focus:outline-none focus:border-zinc-700 cursor-pointer"
                  >
                    <option value="2048">2048 tokens (Compact)</option>
                    <option value="4096">4096 tokens (Default)</option>
                    <option value="8192">8192 tokens (Large)</option>
                    <option value="16384">16384 tokens (Deep context)</option>
                    <option value="32768">32768 tokens (Max context)</option>
                  </select>
                  <p className="text-[10px] text-zinc-500">
                    Maximum size of memory Ollama retains. Larger context sizes use more RAM.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 py-1.5">
                  <div className="space-y-0.5">
                    <label className="text-xs font-medium text-zinc-200">Message Layout Spacing</label>
                    <p className="text-[11px] text-zinc-500">
                      Comfortable has generous margins; Compact packs text tighter.
                    </p>
                  </div>
                  <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-white/[0.04] shrink-0">
                    <button
                      onClick={() => handleChange('messageDensity', 'comfortable')}
                      className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                        localSettings.messageDensity === 'comfortable' 
                          ? 'bg-white/[0.08] text-white' 
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Comfortable
                    </button>
                    <button
                      onClick={() => handleChange('messageDensity', 'compact')}
                      className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                        localSettings.messageDensity === 'compact' 
                          ? 'bg-white/[0.08] text-white' 
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Compact
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 py-1.5 border-t border-white/[0.04] pt-4">
                  <div className="space-y-0.5">
                    <label className="text-xs font-medium text-zinc-200">Code Syntax Theme</label>
                    <p className="text-[11px] text-zinc-500">
                      Color scheme for syntax highlighted code outputs.
                    </p>
                  </div>
                  <select
                    value={localSettings.codeTheme}
                    onChange={(e) => handleChange('codeTheme', e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white/[0.03] border border-white/[0.08] rounded-md text-zinc-300 focus:outline-none focus:border-zinc-700 w-36 text-right cursor-pointer"
                  >
                    <option value="dracula">Dracula</option>
                    <option value="monokai">Monokai</option>
                    <option value="vs2015">VS Dark</option>
                    <option value="tomorrow">Tomorrow</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-4 space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Ollama API Base URL</span>
                    <span className="font-mono text-zinc-200">{serverUrl || 'http://172.16.7.240:11434'}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-white/[0.04] pt-3">
                    <span className="text-zinc-400">Connection Status</span>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        connectionStatus === 'connected' ? 'bg-emerald-500 glow-green' :
                        connectionStatus === 'connecting' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      <span className="capitalize">{connectionStatus}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-white/[0.04] pt-3">
                    <span className="text-zinc-400">Default Selected Model</span>
                    <span className="font-mono text-zinc-300">qwen2.5-coder:14b</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={checkingHealth}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {checkingHealth ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      'Test Server Health'
                    )}
                  </button>
                  {healthResult && (
                    <div className={`p-2.5 rounded-md text-xs border ${
                      healthResult.startsWith('Success') 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {healthResult}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
