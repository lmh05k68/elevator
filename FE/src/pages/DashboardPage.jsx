// src/pages/DashboardPage.jsx
import { useState } from 'react';
import { Row, Col, Spin, Button, Modal, Form, Input, InputNumber, message, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useElevators } from '../contexts/ElevatorContext';
import ElevatorCard from '../components/elevator/ElevatorCard';
import { apiService } from '../services/apiService';
import PageHeader from '../components/common/PageHeader';

const DashboardPage = () => {
  const { elevators, loading } = useElevators();
  const [isElevatorModalOpen, setIsElevatorModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // State quản lý trạng thái submitting của form
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TẠO 2 FORM INSTANCE RIÊNG BIỆT - ĐÂY LÀ PHẦN SỬA LỖI QUAN TRỌNG NHẤT
  const [elevatorForm] = Form.useForm();
  const [requestForm] = Form.useForm();
  const handleAddElevator = async (values) => {
    setIsSubmitting(true);
    try {
      await apiService.createElevator(values);
      message.success('Tạo thang máy thành công!');
      setIsElevatorModalOpen(false); // Tự động đóng modal sau khi thành công
    } catch (error) {
      console.error('Failed to create elevator:', error);
      message.error('Tạo thang máy thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm xử lý cho form tạo yêu cầu
  const handleAddRequest = async (values) => {
    setIsSubmitting(true);
    try {
      await apiService.createRequest(values);
      message.success('Tạo yêu cầu thành công!');
      setIsRequestModalOpen(false); // Tự động đóng modal sau khi thành công
    } catch (error) {
      console.error('Failed to create request:', error);
      message.error('Tạo yêu cầu thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm hiển thị nội dung chính
  const renderContent = () => {
    if (loading) {
      return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    if (elevators.length === 0) {
      return <Empty description="Chưa có thang máy nào. Hãy thêm một thang máy mới để bắt đầu." />;
    }

    return (
      <Row gutter={[16, 24]}>
        {elevators.map((elevator) => (
          <Col key={elevator.id} xs={24} sm={12} md={8} lg={6}>
            <ElevatorCard elevator={elevator} />
          </Col>
        ))}
      </Row>
    );
  }
  if (!Array.isArray(elevators) || elevators.length === 0) {
    return <Empty description="Chưa có thang máy nào. Hãy thêm một thang máy mới để bắt đầu." />;
  }
  return (
    <>
      <PageHeader
        title="Trạng Thái Hoạt Động"
        actions={
          <>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsElevatorModalOpen(true)}>
              Thêm Thang Máy
            </Button>
            <Button onClick={() => setIsRequestModalOpen(true)}>
              Tạo Yêu Cầu
            </Button>
          </>
        }
      />

      {renderContent()}

      {/* Modal for adding elevator */}
      <Modal
        title="Thêm Thang Máy Mới"
        open={isElevatorModalOpen}
        onCancel={() => setIsElevatorModalOpen(false)}
        onOk={() => elevatorForm.submit()}
        confirmLoading={isSubmitting}
        destroyOnHidden
      >
        <Form form={elevatorForm} layout="vertical" onFinish={handleAddElevator} name="elevator_form">
          <Form.Item name="name" label="Tên Thang Máy" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input placeholder="Ví dụ: Thang A, Thang Hàng..." />
          </Form.Item>
          <Form.Item name="capacity" label="Sức chứa (người)" rules={[{ required: true, message: 'Vui lòng nhập sức chứa!' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Ví dụ: 8" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Tạo Yêu Cầu Thủ Công"
        open={isRequestModalOpen}
        onCancel={() => setIsRequestModalOpen(false)}
        onOk={() => requestForm.submit()}
        confirmLoading={isSubmitting}
        destroyOnHidden
      >
        <Form form={requestForm} layout="vertical" onFinish={handleAddRequest} name="request_form">
          <Form.Item name="fromFloor" label="Từ Tầng" rules={[{ required: true, message: 'Vui lòng nhập tầng đi!' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="toFloor" label="Đến Tầng" rules={[{ required: true, message: 'Vui lòng nhập tầng đến!' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DashboardPage;