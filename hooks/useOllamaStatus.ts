import { useState, useEffect, useCallback, useRef } from 'react';
import { ConnectionStatus } from '../lib/types';

export function useOllamaStatus(pollIntervalMs = 15000) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [serverUrl, setServerUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      if (response.ok && data.status === 'connected') {
        setStatus('connected');
        setError(null);
      } else {
        setStatus('offline');
        setError(data.message || 'Ollama offline');
      }
      if (data.url) {
        setServerUrl(data.url);
      }
    } catch (err: any) {
      setStatus('offline');
      setError(err.message || 'Failed to fetch status');
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkStatus();

    // Setup polling
    pollTimerRef.current = setInterval(checkStatus, pollIntervalMs);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [checkStatus, pollIntervalMs]);

  return {
    status,
    serverUrl,
    error,
    isChecking,
    checkStatus,
  };
}
