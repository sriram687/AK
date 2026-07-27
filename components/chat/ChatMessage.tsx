'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Edit2, RotateCw, User, Cpu, CornerDownLeft, X } from 'lucide-react';
import { Message } from '@/lib/types';
import CodeBlock from './CodeBlock';

interface ChatMessageProps {
  message: Message;
  isGenerating: boolean;
  codeTheme: string;
  density: 'comfortable' | 'compact';
  onEditSubmit: (content: string, messageId: string) => void;
  onRegenerate: (messageId: string) => void;
}

export default function ChatMessage({
  message,
  isGenerating,
  codeTheme,
  density,
  onEditSubmit,
  onRegenerate,
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const paddingClass = density === 'comfortable' ? 'py-6 px-4 md:px-6' : 'py-3.5 px-4 md:px-6';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message content:', err);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    onEditSubmit(editContent.trim(), message.id);
    setIsEditing(false);
  };

  return (
    <div 
      className={`w-full border-b border-white/[0.03] transition-colors duration-150 group ${paddingClass} ${
        isUser ? 'bg-white/[0.01]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-3xl mx-auto flex items-start gap-4">
        
        {/* Avatar */}
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 ${
          isUser 
            ? 'bg-zinc-950 border-white/[0.08] text-zinc-300' 
            : 'bg-zinc-900 border-white/[0.06] text-white'
        }`}>
          {isUser ? <User className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
        </div>

        {/* Message body */}
        <div className="flex-1 min-w-0">
          {/* Header metadata */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-zinc-200">
              {isUser ? 'You' : 'Assistant'}
            </span>
            <span className="text-[10px] text-zinc-500">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Content rendering */}
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="mt-2 w-full">
              <div className="rounded-lg border border-white/[0.08] bg-zinc-950/50 p-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[80px] bg-transparent text-sm text-zinc-200 focus:outline-none resize-y"
                  placeholder="Edit your message..."
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(message.content);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:text-white rounded bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white rounded bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    <CornerDownLeft className="h-3 w-3" />
                    Send
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="prose-custom text-zinc-200 select-text break-words">
              {isUser ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !className && !String(children).includes('\n');
                      
                      return isInline ? (
                        <code 
                          className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[11px] font-mono text-zinc-200 border border-white/[0.04]" 
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <CodeBlock
                          language={match ? match[1] : 'text'}
                          value={String(children)}
                          themeName={codeTheme}
                        />
                      );
                    },
                    a({ href, children }: any) {
                      return (
                        <a 
                          href={href} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-400 hover:underline"
                        >
                          {children}
                        </a>
                      );
                    }
                  }}
                >
                  {message.content || (isGenerating ? '...' : '')}
                </ReactMarkdown>
              )}
            </div>
          )}

          {/* Action buttons (copy, edit, regenerate) visible on hover */}
          {!isEditing && (
            <div className="flex items-center gap-3 mt-3 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 focus:outline-none transition-colors cursor-pointer"
                title="Copy message text"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {isUser ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 focus:outline-none transition-colors cursor-pointer"
                  title="Edit message"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              ) : (
                <button
                  onClick={() => onRegenerate(message.id)}
                  disabled={isGenerating}
                  className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 disabled:opacity-30 focus:outline-none transition-colors cursor-pointer"
                  title="Regenerate response"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
