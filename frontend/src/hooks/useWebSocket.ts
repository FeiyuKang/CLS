import { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  lat: number;
  lon: number;
}

interface ContainerEntity {
  id: number;
  position: Position;
  current_temp: number;
  target_temp: number;
  quality: number;
}

interface WorldState {
  containers: ContainerEntity[];
  sim_time: number;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface ServerMessage {
  type: 'FullState' | 'DeltaUpdate' | 'Alert';
  state?: WorldState;
  changes?: ContainerEntity[];
  message?: string;
}

export function useWebSocket(url: string) {
  const [worldState, setWorldState] = useState<WorldState>({
    containers: [],
    sim_time: 0,
  });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | undefined>(undefined);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);

        if (message.type === 'FullState' && message.state) {
          setWorldState(message.state);
        } else if (message.type === 'DeltaUpdate' && message.changes) {
          // Apply delta updates
          setWorldState((prev) => {
            const updatedContainers = [...prev.containers];
            message.changes?.forEach((change) => {
              const index = updatedContainers.findIndex((c) => c.id === change.id);
              if (index !== -1) {
                updatedContainers[index] = change;
              }
            });
            return { ...prev, containers: updatedContainers };
          });
        } else if (message.type === 'Alert' && message.message) {
          console.log('Alert:', message.message);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
      wsRef.current = null;

      // Reconnect after 2 seconds
      reconnectTimeoutRef.current = window.setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 2000);
    };

    wsRef.current = ws;
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { worldState, connectionStatus };
}
