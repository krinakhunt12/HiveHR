import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(WebSocket.CONNECTING);
  const ws = useRef(null);

  useEffect(() => {
    if (!url) return;

    const connect = () => {
      try {
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
          setReadyState(WebSocket.OPEN);
          console.log('WebSocket connected');
        };

        ws.current.onclose = () => {
          setReadyState(WebSocket.CLOSED);
          console.log('WebSocket disconnected');
          
          // Attempt reconnect after 5 seconds
          setTimeout(connect, 5000);
        };

        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setReadyState(WebSocket.CLOSED);
        };

        ws.current.onmessage = (event) => {
          setLastMessage(event);
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
      }
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message) => {
    if (ws.current && readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return {
    lastMessage,
    readyState,
    sendMessage
  };
};