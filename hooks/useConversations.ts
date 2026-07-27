import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message } from '../lib/types';
import { generateId } from '../lib/utils';

const STORAGE_KEY = 'ollama_bot_conversations';

export function useConversations(defaultModel: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Conversation[];
          setConversations(parsed);
          if (parsed.length > 0) {
            setActiveId(parsed[0].id);
          }
        } catch (e) {
          console.error('Error parsing conversations from localStorage', e);
        }
      }
      setLoaded(true);
    }
  }, []);

  // Save to localStorage when conversations change
  useEffect(() => {
    if (loaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations, loaded]);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  const createConversation = useCallback((model: string = defaultModel) => {
    const newConvo: Conversation = {
      id: generateId(),
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model,
      messages: [],
    };
    setConversations((prev) => [newConvo, ...prev]);
    setActiveId(newConvo.id);
    return newConvo;
  }, [defaultModel]);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeId === id) {
        if (filtered.length > 0) {
          setActiveId(filtered[0].id);
        } else {
          setActiveId(null);
        }
      }
      return filtered;
    });
  }, [activeId]);

  const renameConversation = useCallback((id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle.trim(), updatedAt: new Date().toISOString() } : c))
    );
  }, []);

  const clearAllConversations = useCallback(() => {
    setConversations([]);
    setActiveId(null);
  }, []);

  const updateConversationMessages = useCallback((id: string, messages: Message[]) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        // Auto-generate title if it's "New Chat" and we have messages
        let title = c.title;
        if (title === 'New Chat' && messages.length > 0) {
          const firstUserMsg = messages.find((m) => m.role === 'user');
          if (firstUserMsg) {
            title = firstUserMsg.content.trim();
            if (title.length > 40) {
              title = title.substring(0, 37) + '...';
            }
          }
        }

        return {
          ...c,
          title,
          messages,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const updateConversationModel = useCallback((id: string, model: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, model, updatedAt: new Date().toISOString() } : c))
    );
  }, []);

  return {
    conversations,
    activeId,
    activeConversation,
    loaded,
    setActiveId,
    createConversation,
    deleteConversation,
    renameConversation,
    clearAllConversations,
    updateConversationMessages,
    updateConversationModel,
  };
}
