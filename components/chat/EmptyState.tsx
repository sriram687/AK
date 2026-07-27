'use client';

import React from 'react';
import { Terminal, Code2, ShieldAlert, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onSelectSuggestion: (prompt: string) => void;
}

const suggestions = [
  {
    title: 'Build a React dashboard',
    description: 'Create a state-of-the-art mockup dashboard interface',
    icon: Sparkles,
    prompt: 'Write a comprehensive React component for a state-of-the-art developer dashboard using Tailwind CSS. Include a left navigation bar, stat cards, activity feeds, and a glassmorphic system status indicator.',
  },
  {
    title: 'Write a Python REST API',
    description: 'Build a fast and scalable FastAPI web backend',
    icon: Code2,
    prompt: 'Write a clean, production-ready Python REST API server using FastAPI. Include mock CRUD endpoints for item management, request validation using Pydantic, CORS configuration, and standard error handling responses.',
  },
  {
    title: 'Explain this code',
    description: 'Learn the logic and complexity of an algorithm',
    icon: Terminal,
    prompt: 'Can you explain the logic behind this recursive JavaScript implementation, detailing its time and space complexity in Big O notation?\n\n```javascript\nfunction mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\n```',
  },
  {
    title: 'Debug an error',
    description: 'Troubleshoot React hydration issues in Next.js',
    icon: ShieldAlert,
    prompt: 'I am getting the error: "React hydration error: Text content did not match server-rendered HTML". What does this mean in a Next.js App Router project, what are the common causes, and how can I resolve it?',
  },
];

export default function EmptyState({ onSelectSuggestion }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-12 text-center animate-fade-in">
      <div className="mb-6 rounded-full bg-white/[0.02] border border-white/[0.05] p-4 flex items-center justify-center shadow-lg">
        <Sparkles className="h-8 w-8 text-zinc-400" />
      </div>
      
      <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
        How can I help you build?
      </h1>
      <p className="text-sm text-zinc-400 mb-10">
        Chat with your locally hosted AI. Powered by Ollama.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
        {suggestions.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.title}
              type="button"
              onClick={() => onSelectSuggestion(s.prompt)}
              className="group p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex gap-4 text-left focus:outline-none"
            >
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5 text-zinc-400 group-hover:text-white transition-colors h-11 w-11 shrink-0 flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                  {s.title}
                </h3>
                <p className="text-[11px] text-zinc-500 leading-normal">
                  {s.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
