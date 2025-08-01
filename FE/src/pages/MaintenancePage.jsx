// src/pages/MaintenancePage.jsx

import { Table, Tag, Typography, Button, message, Modal, Spin, Empty } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { apiService } from '../services/apiService';
import PageHeader from '../components/common/PageHeader';
import { useApi } from '../hooks/useApi';

const statusConfig = {
  Pending: { color: 'gold', text: 'Chờ xử lý' },
  InProgress: { color: 'processing', text: 'Đang xử lý' },
  Completed: { color: 'success', text: 'Hoàn tất' },
  Cancelled: { color: 'default', text: 'Đã hủy' },
};

// Hàm helper để format ngày giờ
const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN')}`;
};

const MaintenancePage = () => {
  const { data: logs, loading, refetch } = useApi(apiService.getMaintenanceLogs);

  const handleComplete = (record) => {
    Modal.confirm({
      title: 'Xác nhận hoàn tất bảo trì?',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content: `Bạn có chắc chắn muốn đánh dấu công việc bảo trì cho thang máy "${record.elevator.name}" là đã hoàn tất?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await apiService.updateMaintenanceLog(record.id, { status: 'Completed' });
          message.success('Cập nhật trạng thái bảo trì thành công!');
          refetch(); // Tải lại dữ liệu sau khi cập nhật
        } catch (error) {
          message.error('Cập nhật thất bại!');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Thang máy',
      dataIndex: ['elevator', 'name'],
      key: 'elevatorName',
      width: 120,
    },
    {
      title: 'Mô tả sự cố',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        const config = statusConfig[status] || {};
        return <Tag color={config.color || 'default'}>{config.text || status}</Tag>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (text) => text || <Typography.Text type="secondary">Không có</Typography.Text>,
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => formatDateTime(text),
      width: 180,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleComplete(record)}
          disabled={record.status === 'Completed' || record.status === 'Cancelled'}
        >
          Hoàn tất
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Lịch sử Bảo trì & Sự cố" />
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
      ) : (
        <Table 
          columns={columns} 
          dataSource={logs} 
          rowKey="id" 
          scroll={{ x: 800 }}
          locale={{ emptyText: <Empty description="Không có lịch sử bảo trì nào." /> }}
        />
      )}
    </div>
  );
};

export default MaintenancePage;