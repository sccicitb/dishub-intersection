import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [flowData, setFlowData] = useState([]);
  const [latestFlow, setLatestFlow] = useState(null);

  useEffect(() => {
    const socketInstance = io(BACKEND_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      timeout: 20000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected to backend');
    });

    socketInstance.on('flow_update', (payload) => {
      console.log('Flow update received:', payload);
      setLatestFlow(payload);
      
      // Append to history (keep last 100)
      setFlowData(prev => {
        const newData = [payload, ...prev].slice(0, 100);
        return newData;
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
  }, [socket]);

  return {
    socket,
    flowData,
    latestFlow,
    disconnect
  };
};

