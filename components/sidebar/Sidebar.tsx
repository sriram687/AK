'use client';

import React from 'react';
import { Plus, Settings, Sparkles, Trash2, PanelLeftClose, RefreshCw } from 'lucide-react';
import { Conversation, ConnectionStatus } from '@/lib/types';
import { groupConversationsByDate } from '@/lib/utils';
import ConversationItem from './ConversationItem';
import ModelSelector from '../model/ModelSelector';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onClearAllConversations: () => void;
  onOpenSettings: () => void;
  connectionStatus: ConnectionStatus;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  defaultModel: string;
}

export default function Sidebar({
  isOpen,
  onToggle,
  conversations,
  activeId,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onClearAllConversations,
  onOpenSettings,
  connectionStatus,
  selectedModel,
  onSelectModel,
  defaultModel,
}: SidebarProps) {
  const grouped = groupConversationsByDate(conversations);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:sticky top-0 bottom-0 left-0 z-40 flex flex-col h-full bg-[#070709] border-r border-white/[0.05] transition-all duration-300 ease-in-out shrink-0 ${
          isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0 overflow-hidden'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.04] shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-white flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-black fill-black" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white select-none">
              Ollama Bot
            </span>
          </div>
          
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] transition-colors cursor-pointer"
            title="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Action Button */}
        <div className="p-3 shrink-0">
          <button
            onClick={() => onSelectConversation('new')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-zinc-200 text-black transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            New Chat
          </button>
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-[11px] text-zinc-600">
              No conversations yet
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={category} className="space-y-1">
                  <h3 className="px-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider select-none">
                    {category}
                  </h3>
                  <div className="space-y-0.5">
                    {items.map((convo) => (
                      <ConversationItem
                        key={convo.id}
                        conversation={convo}
                        isActive={convo.id === activeId}
                        onSelect={onSelectConversation}
                        onDelete={onDeleteConversation}
                        onRename={onRenameConversation}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.04] bg-[#050507] space-y-3 shrink-0">
          
          {/* Model selector inside sidebar */}
          <div className="space-y-1">
            <span className="text-[10px] font-medium text-zinc-500 uppercase px-1">Model</span>
            <ModelSelector
              selectedModel={selectedModel}
              onSelectModel={onSelectModel}
              defaultModel={defaultModel}
            />
          </div>

          {/* Connection Indicator */}
          <div className="flex items-center justify-between px-1 py-0.5 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-500 glow-green' :
                connectionStatus === 'connecting' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
              <span className="text-[11px] capitalize font-medium">
                {connectionStatus === 'connected' ? 'Ollama connected' :
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Ollama offline'}
              </span>
            </div>
            
            {connectionStatus === 'offline' && (
              <button 
                onClick={() => window.location.reload()} 
                className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/[0.02]"
                title="Retry connection"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between border-t border-white/[0.03] pt-2">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.02] transition-colors cursor-pointer w-full text-left"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            
            {conversations.length > 0 && (
              <button
                onClick={onClearAllConversations}
                className="p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-white/[0.02] transition-colors cursor-pointer"
                title="Clear all chats"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

        </div>
      </aside>
    </>
  );
}
