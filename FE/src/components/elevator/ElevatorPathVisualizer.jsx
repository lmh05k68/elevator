import { Typography } from 'antd';
import { Space, Tag } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';

const ElevatorPathVisualizer = ({ path }) => {
  if (!path || path.length < 2) {
    return <Typography.Text type="secondary">Chưa có lộ trình</Typography.Text>;
  }

  return (
    <Space wrap>
      {path.map((floor, index) => (
        <Space key={index}>
          <Tag>{floor}</Tag>
          {index < path.length - 1 && <ArrowRightOutlined />}
        </Space>
      ))}
    </Space>
  );
};

export default ElevatorPathVisualizer;