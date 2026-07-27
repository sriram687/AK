import { useState, useCallback, useRef } from 'react';
import { Message, Conversation, Settings } from '../lib/types';
import { generateId } from '../lib/utils';

interface UseChatProps {
  activeConversation: Conversation | null;
  updateConversationMessages: (id: string, messages: Message[]) => void;
  settings: Settings;
}

export function useChat({ activeConversation, updateConversationMessages, settings }: UseChatProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, editMessageId?: string) => {
    if (!activeConversation) return;

    setError(null);
    setIsGenerating(true);

    let updatedMessages = [...activeConversation.messages];

    if (editMessageId) {
      // Find the index of the message we are editing
      const editIndex = updatedMessages.findIndex((m) => m.id === editMessageId);
      if (editIndex !== -1) {
        // Truncate messages after this point (including the user message we are editing)
        updatedMessages = updatedMessages.slice(0, editIndex);
      }
    }

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    updatedMessages.push(userMessage);

    // Add empty assistant message
    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };
    updatedMessages.push(assistantMessage);

    // Save initial messages list
    updateConversationMessages(activeConversation.id, updatedMessages);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Only send the messages up to the user message we just sent (excluding the empty assistant one)
      const messagesForApi = updatedMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: activeConversation.model,
          messages: messagesForApi,
          temperature: settings.temperature,
          contextLength: settings.contextLength,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        let errText = 'Failed to generate response';
        try {
          const errData = await response.json();
          errText = errData.error || errText;
        } catch {}
        throw new Error(errText);
      }

      if (!response.body) {
        throw new Error('No stream response available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let contentUpdated = false;

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            
            // Check for direct error in stream
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            
            if (parsed.message?.content) {
              assistantContent += parsed.message.content;
              contentUpdated = true;
            }
          } catch (e: any) {
            // If it's a parsing error of some random HTML or string
            if (e.message && e.message.includes('Ollama error')) {
              throw e;
            }
            console.warn('Failed to parse streaming line:', line, e);
          }
        }

        if (contentUpdated) {
          // Update assistant message with accumulated content
          updatedMessages = updatedMessages.map((m) =>
            m.id === assistantMessageId ? { ...m, content: assistantContent } : m
          );
          updateConversationMessages(activeConversation.id, updatedMessages);
        }
      }

      setIsGenerating(false);
      abortControllerRef.current = null;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setIsGenerating(false);
        return;
      }
      
      console.error('Streaming error:', err);
      setError(err.message || 'An error occurred while streaming response.');
      
      const errorText = `\n\n*(Error: ${err.message || 'Connection lost'})*`;
      updatedMessages = updatedMessages.map((m) =>
        m.id === assistantMessageId 
          ? { 
              ...m, 
              content: m.content 
                ? m.content + errorText 
                : `Failed to connect to Ollama. ${err.message || 'Please verify the server is running.'}` 
            } 
          : m
      );
      updateConversationMessages(activeConversation.id, updatedMessages);
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [activeConversation, settings, updateConversationMessages]);

  const regenerateResponse = useCallback(async (messageId: string) => {
    if (!activeConversation) return;
    
    const index = activeConversation.messages.findIndex((m) => m.id === messageId);
    if (index === -1 || activeConversation.messages[index].role !== 'assistant') return;

    const promptMessage = activeConversation.messages[index - 1];
    if (!promptMessage || promptMessage.role !== 'user') return;

    // Send the prompt message again from its ID (truncates everything after it)
    await sendMessage(promptMessage.content, promptMessage.id);
  }, [activeConversation, sendMessage]);

  return {
    isGenerating,
    error,
    sendMessage,
    stopGeneration,
    regenerateResponse,
  };
}
