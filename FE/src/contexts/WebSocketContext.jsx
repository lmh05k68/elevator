// FE/src/contexts/WebSocketContext.jsx

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';

// =========================================================
// === SỬA LỖI: CHỈ ĐỊNH RÕ RÀNG URL CỦA SERVER BACKEND ===
// =========================================================
const BACKEND_URL = 'http://localhost:3000';
// =========================================================

// Khởi tạo socket instance bên ngoài component để nó là một singleton
const socket = io(BACKEND_URL, {
  autoConnect: false, // Chúng ta sẽ kết nối thủ công trong useEffect
});

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // Lắng nghe các sự kiện kết nối mặc định của socket.io
    const onConnect = () => {
      console.log(`WebSocket: Connected successfully to ${BACKEND_URL}!`);
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log('WebSocket: Disconnected!');
      setIsConnected(false);
    };

    const onConnectError = (err) => {
      // Thêm log lỗi chi tiết để dễ debug
      console.error(`WebSocket connection error to ${BACKEND_URL}:`, err.message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError); // Lắng nghe lỗi kết nối

    // Bắt đầu kết nối
    socket.connect();

    // Cleanup khi component unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
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