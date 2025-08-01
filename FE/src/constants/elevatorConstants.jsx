// src/constants/elevatorConstants.jsx

import React from 'react'; // Bắt buộc phải import React khi dùng JSX
import { 
  CheckCircleOutlined, 
  SyncOutlined, 
  StopOutlined, 
  ToolOutlined, 
  ExclamationCircleOutlined, 
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined
} from '@ant-design/icons';

// Định nghĩa các hằng số trạng thái, tương tự Enum bên backend
export const ElevatorStatus = {
  IDLE: 'Idle',
  MOVING: 'Moving',
  STOPPED: 'Stopped',
  DOOR_OPEN: 'DoorOpen',
  DOOR_CLOSED: 'DoorClosed',
  MAINTENANCE: 'Maintenance',
  ERROR: 'Error',
  OVERLOADED: 'Overloaded',
};
export const Direction = {
  UP: 'Up',
  DOWN: 'Down',
  IDLE: 'Idle',
};
export const STATUS_CONFIG = {
  [ElevatorStatus.IDLE]: { color: 'success', icon: <CheckCircleOutlined />, text: 'Rảnh rỗi' },
  [ElevatorStatus.MOVING]: { color: 'processing', icon: <SyncOutlined spin />, text: 'Di chuyển' },
  [ElevatorStatus.STOPPED]: { color: 'default', icon: <StopOutlined />, text: 'Đã dừng' },
  [ElevatorStatus.DOOR_OPEN]: { color: 'cyan', icon: <StopOutlined />, text: 'Mở cửa' },
  [ElevatorStatus.DOOR_CLOSED]: { color: 'blue', icon: <StopOutlined />, text: 'Đóng cửa' },
  [ElevatorStatus.MAINTENANCE]: { color: 'warning', icon: <ToolOutlined />, text: 'Bảo trì' },
  [ElevatorStatus.ERROR]: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Lỗi' },
  [ElevatorStatus.OVERLOADED]: { color: 'magenta', icon: <UserOutlined />, text: 'Quá tải' },
};
export const DIRECTION_ICONS = {
  [Direction.UP]: <ArrowUpOutlined style={{ color: '#52c41a' }} />,
  [Direction.DOWN]: <ArrowDownOutlined style={{ color: '#f5222d' }} />,
  [Direction.IDLE]: <MinusOutlined />,
};