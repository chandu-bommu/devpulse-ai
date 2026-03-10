'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:4000';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBFFData<T>(path: string, pollInterval?: number): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${BFF_URL}${path}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.data as T);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    fetchData();

    if (pollInterval) {
      intervalRef.current = setInterval(fetchData, pollInterval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, pollInterval]);

  return { data, loading, error, refetch: fetchData };
}

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [pipelineEvents, setPipelineEvents] = useState<any[]>([]);
  const [anomalyEvents, setAnomalyEvents] = useState<any[]>([]);

  useEffect(() => {
    let socket: any = null;

    async function connect() {
      try {
        const { io } = await import('socket.io-client');
        socket = io(BFF_URL, { transports: ['websocket', 'polling'] });

        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        socket.on('pipeline:event', (event: any) => {
          setPipelineEvents((prev) => [event, ...prev].slice(0, 50));
        });

        socket.on('anomaly:detected', (anomalies: any[]) => {
          setAnomalyEvents((prev) => [...anomalies, ...prev].slice(0, 30));
        });
      } catch {
        console.warn('WebSocket connection failed — running in static mode');
      }
    }

    connect();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return { connected, pipelineEvents, anomalyEvents };
}
