'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Sidebar from '@/components/sidebar/Sidebar';
import Chat from '@/components/chat/Chat';
import SettingsDialog from '@/components/settings/SettingsDialog';
import { useConversations } from '@/hooks/useConversations';
import { useChat } from '@/hooks/useChat';
import { useOllamaStatus } from '@/hooks/useOllamaStatus';
import { getStoredSettings, setStoredSettings, DEFAULT_SETTINGS } from '@/lib/storage';
import { Settings } from '@/lib/types';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [settings, setLocalSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Load settings on client side mount
  useEffect(() => {
    setLocalSettings(getStoredSettings());
    setMounted(true);
  }, []);

  // Sync settings with localStorage
  const handleSaveSettings = (newSettings: Settings) => {
    setLocalSettings(newSettings);
    setStoredSettings(newSettings);
  };

  const {
    conversations,
    activeId,
    activeConversation,
    loaded: conversationsLoaded,
    setActiveId,
    createConversation,
    deleteConversation,
    renameConversation,
    clearAllConversations,
    updateConversationMessages,
    updateConversationModel,
  } = useConversations(settings.defaultModel);

  // Ensure there is always at least one conversation if fully loaded
  useEffect(() => {
    if (conversationsLoaded && conversations.length === 0) {
      createConversation(settings.defaultModel);
    }
  }, [conversationsLoaded, conversations.length, createConversation, settings.defaultModel]);

  const {
    status: connectionStatus,
    serverUrl,
  } = useOllamaStatus();

  const {
    isGenerating,
    error,
    sendMessage,
    stopGeneration,
    regenerateResponse,
  } = useChat({
    activeConversation,
    updateConversationMessages,
    settings,
  });

  const handleSelectModel = (modelName: string) => {
    if (activeConversation) {
      updateConversationModel(activeConversation.id, modelName);
    }
  };

  const handleSelectConversation = (id: string) => {
    if (id === 'new') {
      createConversation(settings.defaultModel);
    } else {
      setActiveId(id);
    }
  };

  const handleSelectSuggestion = (prompt: string) => {
    if (activeConversation) {
      sendMessage(prompt);
    }
  };

  if (!mounted || !conversationsLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0c] text-zinc-400 select-none">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          <span className="text-xs tracking-wider uppercase font-semibold text-zinc-600">Initializing Ollama client</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0c] text-zinc-200">
      
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={deleteConversation}
        onRenameConversation={renameConversation}
        onClearAllConversations={clearAllConversations}
        onOpenSettings={() => setSettingsOpen(true)}
        connectionStatus={connectionStatus}
        selectedModel={activeConversation?.model || settings.defaultModel}
        onSelectModel={handleSelectModel}
        defaultModel={settings.defaultModel}
      />

      {/* Main chat layout */}
      <Chat
        conversation={activeConversation}
        isGenerating={isGenerating}
        error={error}
        settings={settings}
        connectionStatus={connectionStatus}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onSendMessage={sendMessage}
        onStopGeneration={stopGeneration}
        onRegenerateResponse={regenerateResponse}
        onSelectSuggestion={handleSelectSuggestion}
      />

      {/* Settings Dialog Modal */}
      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        connectionStatus={connectionStatus}
        serverUrl={serverUrl}
      />
    </div>
  );
}
