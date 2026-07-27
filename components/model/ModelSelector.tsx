'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown, AlertTriangle, Cpu, Loader2 } from 'lucide-react';
import { OllamaModel } from '@/lib/types';

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (model: string) => void;
  defaultModel: string;
}

export default function ModelSelector({
  selectedModel,
  onSelectModel,
  defaultModel,
}: ModelSelectorProps) {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true);
        const res = await fetch('/api/models');
        const data = await res.json();
        
        if (data.models && Array.isArray(data.models) && data.models.length > 0) {
          // Normalize names
          const fetchedModels = data.models.map((m: any) => ({
            name: m.name,
            details: m.details,
            size: m.size,
          }));
          setModels(fetchedModels);
          
          // Check if selectedModel or defaultModel is installed
          const hasSelected = fetchedModels.some((m: OllamaModel) => m.name === selectedModel);
          
          if (!hasSelected) {
            const hasDefault = fetchedModels.some((m: OllamaModel) => m.name === defaultModel);
            if (hasDefault) {
              onSelectModel(defaultModel);
              setWarning(null);
            } else {
              const fallbackModel = fetchedModels[0].name;
              onSelectModel(fallbackModel);
              setWarning(`"${defaultModel}" is not installed. Defaulted to "${fallbackModel}".`);
            }
          } else {
            setWarning(null);
          }
        } else {
          setWarning(`No models found on Ollama. Please run 'ollama pull ${defaultModel}'`);
        }
      } catch (err) {
        console.error('Error fetching models:', err);
        setWarning('Unable to reach Ollama server to query models.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchModels();
  }, [defaultModel]); // Run once or when default changes

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const cleanName = (name: string) => {
    return name.split(':')[0];
  };

  const getTag = (name: string) => {
    return name.split(':')[1] || 'latest';
  };

  return (
    <div className="relative inline-block text-left w-full max-w-[240px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg glass-panel text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-700"
      >
        <div className="flex items-center gap-2 truncate">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
          ) : (
            <Cpu className="h-4 w-4 text-zinc-400 shrink-0" />
          )}
          <span className="truncate font-medium text-left">
            {loading ? 'Loading models...' : selectedModel}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-zinc-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 z-50 w-full min-w-[220px] rounded-lg border border-white/[0.06] bg-[#0c0c0f] p-1 shadow-xl animate-fade-in">
          <div className="max-h-[220px] overflow-y-auto">
            {models.length === 0 ? (
              <div className="px-3 py-2 text-xs text-zinc-500">No models available</div>
            ) : (
              models.map((model) => (
                <button
                  key={model.name}
                  type="button"
                  onClick={() => {
                    onSelectModel(model.name);
                    setIsOpen(false);
                    setWarning(null);
                  }}
                  className={`w-full flex flex-col items-start px-3 py-2 rounded-md text-left text-xs transition-colors duration-150 cursor-pointer hover:bg-white/[0.04] ${
                    selectedModel === model.name ? 'bg-white/[0.04] text-white' : 'text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full font-medium">
                    <span className="truncate text-zinc-200">{cleanName(model.name)}</span>
                    <span className="text-[10px] text-zinc-500 bg-white/[0.04] px-1 rounded uppercase tracking-wider shrink-0">
                      {getTag(model.name)}
                    </span>
                  </div>
                  {model.size && (
                    <span className="text-[10px] text-zinc-500 mt-0.5">
                      {formatSize(model.size)} {model.details?.parameter_size ? `• ${model.details.parameter_size}` : ''}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {warning && (
        <div className="absolute left-0 top-full mt-2 z-40 w-full p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2 shadow-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-yellow-400 leading-normal">{warning}</p>
        </div>
      )}
    </div>
  );
}
