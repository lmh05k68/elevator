// src/App.jsx

import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Typography, Menu, Tag } from 'antd';
import { 
  DashboardOutlined, 
  ToolOutlined, 
  CheckCircleOutlined, 
  SyncOutlined 
} from '@ant-design/icons';
import { WebSocketProvider, useWebSocket } from './contexts/WebSocketContext';
import { ElevatorProvider } from './contexts/ElevatorContext';
import DashboardPage from './pages/DashboardPage';
import MaintenancePage from './pages/MaintenancePage';
import './App.css';

const { Header, Content, Footer } = Layout;

// Component hiển thị trạng thái kết nối (đã viết tốt, giữ nguyên)
const ConnectionStatus = () => {
  const { isConnected } = useWebSocket();
  return isConnected ? (
    <Tag icon={<CheckCircleOutlined />} color="success" style={{ margin: 0 }}>
      Đã kết nối
    </Tag>
  ) : (
    <Tag icon={<SyncOutlined spin />} color="warning" style={{ margin: 0 }}>
      Đang kết nối...
    </Tag>
  );
};

// TỐI ƯU 1: Định nghĩa menu items bên ngoài component để không phải tạo lại mỗi lần render.
// Sử dụng path làm key để dễ dàng đồng bộ với URL.
const menuItems = [
  {
    key: '/', // Key là path của route
    icon: <DashboardOutlined />,
    label: <Link to="/">Dashboard</Link>, // Link được đặt trực tiếp trong label
  },
  {
    key: '/maintenance',
    icon: <ToolOutlined />,
    label: <Link to="/maintenance">Bảo trì</Link>,
  },
];


function AppContent() {
  // TỐI ƯU 2: Dùng `useLocation` để lấy path hiện tại của URL
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', paddingInline: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography.Title level={3} style={{ color: 'white', margin: 0, marginRight: '32px' }}>
            Hệ Thống Quản Lý Thang Máy
          </Typography.Title>
          {/* TỐI ƯU 3: Sử dụng prop `items` thay vì `Menu.Item` (chuẩn AntD mới) */}
          {/* Đồng bộ `selectedKeys` với path hiện tại của URL */}
          <Menu 
            theme="dark" 
            mode="horizontal" 
            selectedKeys={[location.pathname]} 
            items={menuItems}
            style={{ flexGrow: 1, borderBottom: 'none', minWidth: 0 }}
          />
        </div>
        <ConnectionStatus />
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <div className="site-layout-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
          </Routes>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        Elevator Management System ©2024
      </Footer>
    </Layout>
  );
}
function App() {
  return (
    <WebSocketProvider>
      <ElevatorProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ElevatorProvider>
    </WebSocketProvider>
  );
}

export default App;