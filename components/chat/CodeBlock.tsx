'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import dracula from 'react-syntax-highlighter/dist/esm/styles/prism/dracula';
import tomorrow from 'react-syntax-highlighter/dist/esm/styles/prism/tomorrow';
import twilight from 'react-syntax-highlighter/dist/esm/styles/prism/twilight';
import prism from 'react-syntax-highlighter/dist/esm/styles/prism/prism';

interface CodeBlockProps {
  language: string;
  value: string;
  themeName?: string;
}

const themeMap: { [key: string]: any } = {
  dracula,
  tomorrow,
  twilight,
  prism
};

export default function CodeBlock({ language, value, themeName = 'dracula' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const selectedTheme = themeMap[themeName] || dracula;

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-white/[0.08] bg-[#0d0d11] font-mono text-xs shadow-md">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/[0.06] text-zinc-400 select-none">
        <span className="font-semibold lowercase text-zinc-400">{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer focus:outline-none"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-medium text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Content */}
      <div className="overflow-x-auto w-full">
        <SyntaxHighlighter
          language={language || 'text'}
          style={selectedTheme}
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            background: 'transparent',
            fontSize: '0.85rem',
            lineHeight: '1.6',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'var(--font-geist-mono), monospace',
            },
          }}
          PreTag="div"
        >
          {value.replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
