import { Card, Statistic, Tag, Space, Typography, Progress } from 'antd';
import {  QuestionCircleOutlined } from '@ant-design/icons';
import ElevatorPathVisualizer from './ElevatorPathVisualizer';
import { ElevatorStatus, STATUS_CONFIG, DIRECTION_ICONS } from '../../constants/elevatorConstants.jsx'; 

const ElevatorCard = ({ elevator }) => {
  // --- BƯỚC 1: KIỂM TRA DỮ LIỆU ĐẦU VÀO MỘT CÁCH NGHIÊM NGẶT ---
  if (!elevator || typeof elevator.id === 'undefined') {
    return (
      <Card title="Dữ liệu không hợp lệ" variant="outlined">
        <Typography.Text type="danger">Component ElevatorCard nhận được prop không hợp lệ.</Typography.Text>
      </Card>
    );
  }

  // --- BƯỚC 2: XỬ LÝ DỮ LIỆU VÀ CUNG CẤP GIÁ TRỊ DỰ PHÒNG ---
  // Sử dụng giá trị dự phòng AN TOÀN nếu key không tồn tại
  const statusKey = elevator.status;
  const directionKey = elevator.direction;

  const currentStatusConfig = STATUS_CONFIG[statusKey] || {
    color: 'default',
    icon: <QuestionCircleOutlined />,
    text: `Không rõ (${statusKey})`,
  };

  const currentDirectionIcon = DIRECTION_ICONS[directionKey] || null; // Nếu không có hướng, không hiển thị icon

  // Log lại để gỡ lỗi nếu có key lạ
  if (!STATUS_CONFIG[statusKey]) {
    console.warn(`[ElevatorCard] Trạng thái không xác định: "${statusKey}" cho thang máy "${elevator.name}".`);
  }
  if (!DIRECTION_ICONS[directionKey] && directionKey !== 'Idle') {
    console.warn(`[ElevatorCard] Hướng không xác định: "${directionKey}" cho thang máy "${elevator.name}".`);
  }

  const loadPercentage = elevator.capacity > 0 ? Math.round((elevator.currentLoad / elevator.capacity) * 100) : 0;

  const handleMaintenanceClick = () => { /* ... giữ nguyên ... */ };
  const isMaintenanceDisabled = elevator.status === ElevatorStatus.MAINTENANCE || elevator.status === ElevatorStatus.ERROR;

  return (
    <Card
      title={elevator.name}
      variant="outlined"
      hoverable
      className="elevator-card"
      actions={[ /* ... giữ nguyên ... */ ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Statistic
          title="Tầng Hiện Tại"
          value={elevator.currentFloor}
          precision={0}
          valueStyle={{ fontSize: '2.5rem', fontWeight: 500 }}
          prefix={currentDirectionIcon}
        />
        
        <div>
          <Typography.Text strong>Trạng thái: </Typography.Text>
          <Tag icon={currentStatusConfig.icon} color={currentStatusConfig.color}>
            {currentStatusConfig.text}
          </Tag>
        </div>

        <div>
          <Typography.Text strong>Số người: </Typography.Text>
          <Progress
            percent={loadPercentage}
            steps={elevator.capacity}
            strokeColor={loadPercentage > 80 ? '#f5222d' : '#1677ff'}
            format={() => `${elevator.currentLoad}/${elevator.capacity}`}
          />
        </div>

        <div style={{ minHeight: '40px' }}>
          <Typography.Text strong>Đích đến: </Typography.Text>
          <Typography.Text type="secondary">
            {Array.isArray(elevator.targetFloors) && elevator.targetFloors.length > 0
              ? elevator.targetFloors.join(', ')
              : 'Chưa có'}
          </Typography.Text>
        </div>

        <div>
          <Typography.Text strong>Lộ trình gần đây:</Typography.Text>
          <div style={{ marginTop: '4px' }}>
            <ElevatorPathVisualizer path={elevator.path} />
          </div>
        </div>
      </Space>
    </Card>
  );
};

export default ElevatorCard;