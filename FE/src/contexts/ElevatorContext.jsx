import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { useWebSocket } from './WebSocketContext';
import { apiService } from '../services/apiService';
import { message } from 'antd';

const ElevatorContext = createContext(undefined);
const MAX_PATH_LENGTH = 12; 
export const ElevatorProvider = ({ children }) => {
  const [elevators, setElevators] = useState({});
  const [loading, setLoading] = useState(true);
  
  const { socket, isConnected } = useWebSocket();
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
  useEffect(() => {
    if (!isConnected || !socket) {
      return;
    }

    const handleElevatorUpdate = (updatedElevator) => {
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
        let nextPath = currentElevatorState.path; 
        if (currentElevatorState.currentFloor !== updatedElevator.currentFloor) {
          const updatedPath = [...currentElevatorState.path, updatedElevator.currentFloor];
          if (updatedPath.length > MAX_PATH_LENGTH) {
            updatedPath.shift();
          }
          nextPath = updatedPath;
        }
        const newElevatorState = {
          ...currentElevatorState,
          ...updatedElevator,
          path: nextPath, 
        };
        return {
          ...prevElevators,
          [updatedElevator.id]: newElevatorState,
        };
      });
    };

    const handleNewElevator = (newElevator) => {
      message.success(`Thang máy mới "${newElevator.name}" đã được thêm vào hệ thống.`);
      setElevators((prev) => ({
        ...prev,
        [newElevator.id]: { ...newElevator, path: [newElevator.currentFloor] },
      }));
    };
    socket.on('elevator_update', handleElevatorUpdate);
    socket.on('new_elevator', handleNewElevator);
    return () => {
      socket.off('elevator_update', handleElevatorUpdate);
      socket.off('new_elevator', handleNewElevator);
    };
  }, [isConnected, socket]);
  const sortedElevators = useMemo(() => {
    return Object.values(elevators).sort((a, b) => a.name.localeCompare(b.name));
  }, [elevators]);

  return (
    <ElevatorContext.Provider value={{ elevators: sortedElevators, loading }}>
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