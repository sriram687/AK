'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip, Loader2 } from 'lucide-react';

interface ChatComposerProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  enterToSend: boolean;
  selectedModel: string;
}

export default function ChatComposer({
  onSend,
  onStop,
  isGenerating,
  enterToSend,
  selectedModel,
}: ChatComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [value]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!value.trim() || isGenerating) return;
    onSend(value.trim());
    setValue('');
    
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (enterToSend) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-6 pb-6">
      <form 
        onSubmit={handleSubmit}
        className="rounded-xl border border-white/[0.08] bg-[#0c0c0f] p-3 shadow-xl relative focus-within:border-white/[0.12] transition-colors"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message your local AI..."
          rows={1}
          className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none resize-none min-h-[24px] max-h-[200px] leading-relaxed pr-12"
        />

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.04]">
          {/* Left accessories */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] transition-colors cursor-pointer"
              title="Add attachment (visual mockup only)"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <div className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-zinc-500 tracking-wider">
              {selectedModel}
            </div>
            
            {isGenerating && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
                <span className="animate-pulse-glow text-[10px] tracking-wider uppercase font-medium">Generating</span>
              </div>
            )}
          </div>

          {/* Right submit/stop */}
          <div>
            {isGenerating ? (
              <button
                type="button"
                onClick={onStop}
                className="flex items-center justify-center p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
                title="Stop generation"
              >
                <Square className="h-4 w-4 fill-white" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!value.trim()}
                className="flex items-center justify-center p-2 rounded-lg bg-white hover:bg-zinc-200 text-black transition-colors disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
