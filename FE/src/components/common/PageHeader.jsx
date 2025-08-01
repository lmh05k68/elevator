import { Typography, Space } from 'antd';

const PageHeader = ({ title, actions }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <Typography.Title level={2} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      <Space>{actions}</Space>
    </div>
  );
};

export default PageHeader;