// FE/src/pages/MaintenancePage.jsx

import { Table, Tag, Typography, Button, message, Modal, Spin, Empty } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { apiService } from '../services/apiService';
import PageHeader from '../components/common/PageHeader';
import { useApi } from '../hooks/useApi';
import { MaintenanceStatus } from '../constants/maintenanceConstants';

const statusConfig = {
  [MaintenanceStatus.PENDING]: { color: 'gold', text: 'Chờ xử lý' },
  [MaintenanceStatus.IN_PROGRESS]: { color: 'processing', text: 'Đang xử lý' },
  [MaintenanceStatus.COMPLETED]: { color: 'success', text: 'Hoàn tất' },
  [MaintenanceStatus.CANCELLED]: { color: 'default', text: 'Đã hủy' },
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN')}`;
};

const MaintenancePage = () => {
  const { data: logs, loading, setData, refetch } = useApi(apiService.getMaintenanceLogs);

  const handleComplete = (record) => {
    Modal.confirm({
      title: 'Xác nhận hoàn tất bảo trì?',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content: `Bạn có chắc chắn muốn đánh dấu công việc bảo trì cho thang máy "${record.elevator?.name || 'N/A'}" là đã hoàn tất?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      async onOk() {
        try {
          const updatedLog = await apiService.updateMaintenanceLog(record.id, { status: MaintenanceStatus.COMPLETED });
          message.success('Cập nhật trạng thái bảo trì thành công!');
          
          // Tối ưu: Cập nhật UI ngay lập tức thay vì refetch
          setData(prevLogs => prevLogs.map(log => log.id === record.id ? updatedLog.data : log));
          // Hoặc bạn có thể giữ refetch() nếu muốn đảm bảo dữ liệu mới nhất
          // refetch(); 
        } catch (error) {
          // =========================================================
          // === THÊM LOG CHI TIẾT VÀO ĐÂY ===
          // =========================================================
          console.error("API Error updating maintenance log:", error.response || error);
          message.error(error.response?.data?.message || 'Cập nhật thất bại!');
          // =========================================================
        }
      },
    });
  };

  const columns = [
    { title: 'Thang máy', dataIndex: ['elevator', 'name'], key: 'elevatorName', width: 120 },
    { title: 'Mô tả sự cố', dataIndex: 'description', key: 'description' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 150,
      render: (status) => {
        const config = statusConfig[status] || {};
        return <Tag color={config.color || 'default'}>{config.text || status}</Tag>;
      },
    },
    { title: 'Ghi chú', dataIndex: 'notes', key: 'notes', render: (text) => text || <Typography.Text type="secondary">Không có</Typography.Text> },
    { title: 'Thời gian tạo', dataIndex: 'createdAt', key: 'createdAt', render: (text) => formatDateTime(text), width: 180 },
    {
      title: 'Hành động', key: 'action', width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleComplete(record)}
          disabled={record.status === MaintenanceStatus.COMPLETED || record.status === MaintenanceStatus.CANCELLED}
        >
          Hoàn tất
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <>
        <PageHeader title="Lịch sử Bảo trì & Sự cố" />
        <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Lịch sử Bảo trì & Sự cố" />
      <Table 
        columns={columns} 
        dataSource={logs} 
        rowKey="id" 
        scroll={{ x: 800 }}
        locale={{ emptyText: <Empty description="Không có lịch sử bảo trì nào." /> }}
      />
    </>
  );
};

export default MaintenancePage;