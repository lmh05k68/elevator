import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000', {
  autoConnect: false, 
});

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => {
      console.log('WebSocket: Connected!');
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log('WebSocket: Disconnected!');
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.connect();
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, []);
  const value = useMemo(() => ({
    socket,
    isConnected,
  }), [isConnected]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};