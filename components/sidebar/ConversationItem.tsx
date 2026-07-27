'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import { Conversation } from '@/lib/types';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

export default function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(conversation.title);
  }, [conversation.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (title.trim() && title.trim() !== conversation.title) {
      onRename(conversation.id, title.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTitle(conversation.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTitle(conversation.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      onClick={() => !isEditing && onSelect(conversation.id)}
      className={`group w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all duration-150 cursor-pointer ${
        isActive 
          ? 'bg-white/[0.04] text-white border border-white/[0.06]' 
          : 'text-zinc-400 hover:bg-white/[0.015] hover:text-zinc-200 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-zinc-300' : 'text-zinc-500'}`} />
        
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-zinc-900 border border-white/[0.1] rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-zinc-500"
          />
        ) : (
          <span className="truncate pr-2">{conversation.title}</span>
        )}
      </div>

      {/* Action buttons (Rename & Delete) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="p-0.5 rounded hover:bg-white/[0.05] text-zinc-400 hover:text-white cursor-pointer"
              title="Save title"
            >
              <Check className="h-3 w-3" />
            </button>
            <button
              onClick={handleCancel}
              className="p-0.5 rounded hover:bg-white/[0.05] text-zinc-400 hover:text-white cursor-pointer"
              title="Cancel editing"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 rounded hover:bg-white/[0.05] text-zinc-500 hover:text-zinc-300 cursor-pointer"
              title="Rename conversation"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conversation.id);
              }}
              className="p-1 rounded hover:bg-white/[0.05] text-zinc-500 hover:text-rose-400 cursor-pointer"
              title="Delete conversation"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
