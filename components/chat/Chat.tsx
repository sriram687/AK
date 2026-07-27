'use client';

import React, { useRef, useEffect, useState } from 'react';
import { PanelLeft, ArrowDown, Cpu, AlertCircle, RefreshCw } from 'lucide-react';
import { Conversation, Settings, ConnectionStatus } from '@/lib/types';
import ChatMessage from './ChatMessage';
import ChatComposer from './ChatComposer';
import EmptyState from './EmptyState';

interface ChatProps {
  conversation: Conversation | null;
  isGenerating: boolean;
  error: string | null;
  settings: Settings;
  connectionStatus: ConnectionStatus;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSendMessage: (content: string, editMessageId?: string) => void;
  onStopGeneration: () => void;
  onRegenerateResponse: (messageId: string) => void;
  onSelectSuggestion: (prompt: string) => void;
}

export default function Chat({
  conversation,
  isGenerating,
  error,
  settings,
  connectionStatus,
  sidebarOpen,
  onToggleSidebar,
  onSendMessage,
  onStopGeneration,
  onRegenerateResponse,
  onSelectSuggestion,
}: ChatProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messages = conversation?.messages || [];

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll to bottom when a new user message is sent
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        scrollToBottom('smooth');
      }
    }
  }, [messages.length]);

  // Progressive auto-scroll while generating, but only if user was already at the bottom
  useEffect(() => {
    if (isGenerating && scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      const threshold = 150; // pixels from bottom
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      if (isNearBottom) {
        scrollToBottom('auto');
      }
    }
  }, [messages, isGenerating]);

  // Handle scroll detection for scroll-to-bottom button
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isScrolledUp = el.scrollTop < el.scrollHeight - el.clientHeight - 200;
    setShowScrollButton(isScrolledUp);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0c] overflow-hidden relative">
      
      {/* Top Navbar */}
      <header className="h-14 border-b border-white/[0.05] bg-[#070709]/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-30 select-none">
        <div className="flex items-center gap-3">
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.02] transition-colors cursor-pointer"
              title="Open sidebar"
            >
              <PanelLeft className="h-4.5 w-4.5" />
            </button>
          )}
          
          <div className="flex flex-col">
            <h1 className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-[400px]">
              {conversation ? conversation.title : 'Chat Assistant'}
            </h1>
            {conversation && (
              <span className="text-[10px] text-zinc-500 font-mono">
                {conversation.model}
              </span>
            )}
          </div>
        </div>

        {/* Model Indicator & Connection Status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] px-2.5 py-0.5 text-[10px] font-medium text-zinc-400">
            <Cpu className="h-3 w-3" />
            <span>{conversation?.model || settings.defaultModel}</span>
          </div>

          <div 
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold"
            title={`Ollama is ${connectionStatus}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-500 glow-green' :
              connectionStatus === 'connecting' ? 'bg-amber-500' : 'bg-rose-500'
            }`} />
            <span className="text-zinc-500 capitalize">{connectionStatus}</span>
          </div>
        </div>
      </header>

      {/* Main Conversation viewport */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <EmptyState onSelectSuggestion={onSelectSuggestion} />
        ) : (
          <div className="w-full flex flex-col">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isGenerating={isGenerating}
                codeTheme={settings.codeTheme}
                density={settings.messageDensity}
                onEditSubmit={(content, id) => onSendMessage(content, id)}
                onRegenerate={onRegenerateResponse}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-24 right-6 p-2 rounded-full border border-white/[0.08] bg-[#0c0c0f] hover:bg-zinc-800 text-zinc-400 hover:text-white shadow-xl transition-all duration-200 z-20 cursor-pointer animate-fade-in"
          title="Scroll to bottom"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}

      {/* Connection Failure Error Banner */}
      {connectionStatus === 'offline' && (
        <div className="mx-6 mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            <p className="text-xs text-rose-400 font-medium">
              Unable to connect to Ollama at the configured server URL. Check if Ollama is running.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold text-rose-400 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* Generation Error Banner */}
      {error && (
        <div className="mx-6 mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
          <p className="text-xs text-rose-400 font-medium">{error}</p>
        </div>
      )}

      {/* Composer Input Area */}
      {conversation && (
        <ChatComposer
          onSend={(content) => onSendMessage(content)}
          onStop={onStopGeneration}
          isGenerating={isGenerating}
          enterToSend={settings.enterToSend}
          selectedModel={conversation.model}
        />
      )}
    </div>
  );
}
