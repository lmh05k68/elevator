// src/contexts/ElevatorContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useWebSocket } from './WebSocketContext';
import { apiService } from '../services/apiService';
import { message } from 'antd';

const ElevatorContext = createContext(undefined);

export const ElevatorProvider = ({ children }) => {
  // State được lưu dưới dạng object để truy cập O(1) qua ID
  const [elevators, setElevators] = useState({});
  const [loading, setLoading] = useState(true);
  
  const { socket, isConnected } = useWebSocket();

  // Load dữ liệu ban đầu một lần khi component được mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const response = await apiService.getElevators();
        const elevatorsData = response.data.reduce((acc, elevator) => {
          acc[elevator.id] = { 
            ...elevator, 
            path: [elevator.currentFloor] 
          };
          return acc;
        }, {});
        setElevators(elevatorsData);
      } catch (error) {
        console.error('Failed to fetch initial elevator data:', error);
        message.error('Không thể tải dữ liệu thang máy từ server!');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Lắng nghe các sự kiện socket real-time
  useEffect(() => {
    if (!isConnected || !socket) {
      return;
    }

    const handleElevatorUpdate = (updatedElevator) => {
      // console.log('>>>> FRONTEND: Đã nhận được sự kiện [elevator_update] với dữ liệu:', updatedElevator);
      setElevators((prevElevators) => {
        const currentElevatorState = prevElevators[updatedElevator.id];
        
        if (!currentElevatorState) {
          return {
            ...prevElevators,
            [updatedElevator.id]: { 
              ...updatedElevator, 
              path: [updatedElevator.currentFloor]
            },
          };
        }

        const newElevatorState = { ...currentElevatorState, ...updatedElevator };

        if (currentElevatorState.currentFloor !== updatedElevator.currentFloor) {
          const newPath = [...currentElevatorState.path, updatedElevator.currentFloor];
          if (newPath.length > 10) { // Giới hạn lộ trình
            newPath.shift(); 
          }
          newElevatorState.path = newPath;
        }

        return {
          ...prevElevators,
          [updatedElevator.id]: newElevatorState,
        };
      });
    };

    const handleNewElevator = (newElevator) => {
      // console.log('>>>> FRONTEND: Đã nhận được sự kiện [new_elevator] với dữ liệu:', newElevator);
      message.success(`Thang máy mới "${newElevator.name}" đã được thêm vào hệ thống.`);
      setElevators((prev) => ({
        ...prev,
        [newElevator.id]: { ...newElevator, path: [newElevator.currentFloor] },
      }));
    };

    // === SỬA LỖI: THAY ĐỔI TÊN SỰ KIỆN ĐỂ KHỚP VỚI BACKEND ===
    socket.on('elevator_update', handleElevatorUpdate);
    socket.on('new_elevator', handleNewElevator);

    // Cleanup listeners
    return () => {
      socket.off('elevator_update', handleElevatorUpdate);
      socket.off('new_elevator', handleNewElevator);
    };
  }, [isConnected, socket]);

  // Chuyển đổi từ object state thành array để các component dễ dàng map qua
  return (
    <ElevatorContext.Provider value={{ elevators: Object.values(elevators).sort((a,b) => a.name.localeCompare(b.name)), loading }}>
      {children}
    </ElevatorContext.Provider>
  );
};

export const useElevators = () => {
  const context = useContext(ElevatorContext);
  if (context === undefined) {
    throw new Error('useElevators must be used within an ElevatorProvider');
  }
  return context;
};