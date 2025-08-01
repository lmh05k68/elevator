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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [elevatorForm] = Form.useForm();
  const [requestForm] = Form.useForm();

  const handleAddElevator = async (values) => {
    setIsSubmitting(true);
    try {
      await apiService.createElevator(values);
      message.success('Tạo thang máy thành công!');
      setIsElevatorModalOpen(false);
      elevatorForm.resetFields();
    } catch (error) {
      console.error('Failed to create elevator:', error);
      message.error(error?.response?.data?.message || 'Tạo thang máy thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRequest = async (values) => {
    setIsSubmitting(true);
    try {
      await apiService.createRequest(values);
      message.success('Tạo yêu cầu thành công!');
      setIsRequestModalOpen(false);
      requestForm.resetFields();
    } catch (error) {
      console.error('Failed to create request:', error);
      message.error(error?.response?.data?.message || 'Tạo yêu cầu thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm này đã xử lý đúng logic hiển thị
  const renderContent = () => {
    if (loading) {
      return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    if (!Array.isArray(elevators) || elevators.length === 0) {
      return (
        <div style={{ marginTop: '24px' }}>
          <Empty description="Chưa có thang máy nào. Hãy thêm một thang máy mới để bắt đầu." />
        </div>
      );
    }

    return (
      <Row gutter={[16, 24]} style={{ marginTop: '24px' }}>
        {elevators.map((elevator) => (
          <Col key={elevator.id} xs={24} sm={12} md={8} lg={6}>
            <ElevatorCard elevator={elevator} />
          </Col>
        ))}
      </Row>
    );
  }

  // SỬA LỖI: Xóa bỏ khối if-return sớm ở đây.
  // if (!Array.isArray(elevators) || elevators.length === 0) {
  //   return <Empty description="Chưa có thang máy nào. Hãy thêm một thang máy mới để bắt đầu." />;
  // }

  // Khối return chính của component, luôn được render
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
          <Form.Item name="capacity" label="Sức chứa (người)" initialValue={8} rules={[{ required: true, message: 'Vui lòng nhập sức chứa!' }]}>
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
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="toFloor" label="Đến Tầng" rules={[{ required: true, message: 'Vui lòng nhập tầng đến!' }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DashboardPage;