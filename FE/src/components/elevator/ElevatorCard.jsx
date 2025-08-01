import { useState } from 'react';
import { Card, Statistic, Tag, Space, Typography, Progress, Tooltip, message, Modal, Form, InputNumber, Button, Alert } from 'antd';
import { 
  QuestionCircleOutlined,
  ToolOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import ElevatorPathVisualizer from './ElevatorPathVisualizer';
import { ElevatorStatus, STATUS_CONFIG, DIRECTION_ICONS } from '../../constants/elevatorConstants.jsx'; 
import { apiService } from '../../services/apiService';

const ElevatorCard = ({ elevator }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  if (!elevator || typeof elevator.id === 'undefined') {
    return (
      <Card title="Dữ liệu không hợp lệ" variant="outlined">
        <Typography.Text type="danger">Component ElevatorCard nhận được prop không hợp lệ.</Typography.Text>
      </Card>
    );
  }
  const handleToggleMaintenance = async () => {
    const isEnteringMaintenance = elevator.status !== ElevatorStatus.MAINTENANCE;
    const newStatus = isEnteringMaintenance ? ElevatorStatus.MAINTENANCE : ElevatorStatus.IDLE;
    const actionText = isEnteringMaintenance ? 'Bảo trì' : 'Kích hoạt';
    
    message.loading({ content: `Đang ${actionText.toLowerCase()}...`, key: 'maintenance' });
    try {
      await apiService.updateElevator(elevator.id, { status: newStatus });
      message.success({ content: `Đã ${actionText} thang máy ${elevator.name} thành công!`, key: 'maintenance' });
    } catch (error) {
      message.error({ content: `Lỗi khi ${actionText} thang máy.`, key: 'maintenance' });
      console.error('Failed to toggle maintenance:', error);
    }
  };

  const handleResetError = async () => {
    message.loading({ content: 'Đang xóa lỗi...', key: 'reset' });
    try {
      await apiService.updateElevator(elevator.id, { status: ElevatorStatus.IDLE });
      message.success({ content: `Đã gửi yêu cầu xóa lỗi cho thang máy ${elevator.name}.`, key: 'reset' });
    } catch (error) {
      message.error({ content: `Lỗi khi xóa lỗi thang máy.`, key: 'reset' });
      console.error('Failed to reset error:', error);
    }
  };
  const showRequestModal = () => setIsModalOpen(true);
  const handleModalCancel = () => setIsModalOpen(false);

  const handleModalOk = async (values) => {
    message.loading({ content: 'Đang tạo yêu cầu...', key: 'request' });
    try {
      await apiService.createRequest(values);
      message.success({ content: 'Tạo yêu cầu thành công!', key: 'request' });
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error({ content: error?.response?.data?.message || 'Tạo yêu cầu thất bại.', key: 'request' });
      console.error('Failed to create request:', error);
    }
  };
  const statusKey = elevator.status;
  const directionKey = elevator.direction;

  const currentStatusConfig = STATUS_CONFIG[statusKey] || {
    color: 'default',
    icon: <QuestionCircleOutlined />,
    text: `Không rõ (${statusKey})`,
  };

  const currentDirectionIcon = DIRECTION_ICONS[directionKey] || null; 
  const loadPercentage = elevator.capacity > 0 ? Math.round((elevator.currentLoad / elevator.capacity) * 100) : 0;
  const isOverloaded = elevator.currentLoad > elevator.capacity;
  const cardActions = [];
  if (elevator.status === ElevatorStatus.ERROR) {
    cardActions.push(
      <Tooltip title="Xóa lỗi và khởi động lại" key="reset">
        <div onClick={handleResetError}><ReloadOutlined style={{ color: '#ff4d4f' }} /></div>
      </Tooltip>
    );
  } else {
    const isInMaintenance = elevator.status === ElevatorStatus.MAINTENANCE;
    cardActions.push(
      <Tooltip title={isInMaintenance ? 'Kích hoạt lại thang máy' : 'Chuyển sang bảo trì'} key="maintenance">
        <div onClick={handleToggleMaintenance}><ToolOutlined style={{ color: isInMaintenance ? '#faad14' : undefined }} /></div>
      </Tooltip>
    );
    cardActions.push(
      <Tooltip title="Tạo yêu cầu mới" key="request">
        <div 
          onClick={isInMaintenance ? undefined : showRequestModal} 
          style={{ cursor: isInMaintenance ? 'not-allowed' : 'pointer', color: isInMaintenance ? '#bfbfbf' : undefined }}
        ><PlusCircleOutlined /></div>
      </Tooltip>
    );
  }

  return (
    <>
      <Card
        title={elevator.name}
        variant="outlined"
        hoverable
        className="elevator-card"
        actions={cardActions}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {isOverloaded && (
            <Alert
              message="Quá Tải!"
              description={`Vượt quá ${elevator.currentLoad - elevator.capacity} người.`}
              type="error"
              showIcon
              icon={<WarningOutlined />}
            />
          )}
          <Statistic
            title="Tầng Hiện Tại"
            value={elevator.currentFloor}
            precision={0}
            valueStyle={{ fontSize: '2.5rem', fontWeight: 500 }}
            prefix={currentDirectionIcon}
          />
          <div><Typography.Text strong>Trạng thái: </Typography.Text><Tag icon={currentStatusConfig.icon} color={currentStatusConfig.color}>{currentStatusConfig.text}</Tag></div>
          <div><Typography.Text strong>Số người: </Typography.Text><Progress percent={loadPercentage} steps={elevator.capacity} strokeColor={isOverloaded ? '#f5222d' : '#1677ff'} format={() => `${elevator.currentLoad}/${elevator.capacity}`} /></div>
          <div style={{ minHeight: '40px' }}><Typography.Text strong>Đích đến: </Typography.Text><Typography.Text type="secondary">{Array.isArray(elevator.targetFloors) && elevator.targetFloors.length > 0 ? elevator.targetFloors.join(', ') : 'Chưa có'}</Typography.Text></div>
          <div><Typography.Text strong>Lộ trình gần đây:</Typography.Text><div style={{ marginTop: '4px' }}><ElevatorPathVisualizer path={elevator.path} /></div></div>
        </Space>
      </Card>
      <Modal title="Tạo Yêu Cầu Di Chuyển Mới" open={isModalOpen} onCancel={handleModalCancel} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleModalOk} initialValues={{ fromFloor: elevator.currentFloor }}>
          <Form.Item name="fromFloor" label="Đi từ tầng" rules={[{ required: true, message: 'Vui lòng nhập tầng bắt đầu!' }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="toFloor" label="Đến tầng" rules={[{ required: true, message: 'Vui lòng nhập tầng kết thúc!' }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" block>Gửi Yêu Cầu</Button></Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ElevatorCard;