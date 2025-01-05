import { Card, Space } from 'antd';
import { ResourcesStates } from './ResourcesStates';

export const PodsMetrics = ({ teamSlug }: { teamSlug: string }) => {
  return (
    <>
      <Card title="Resources" bordered={false}>
        <Space direction="vertical">
          <ResourcesStates key="ResourcesStates" teamSlug={teamSlug} />
        </Space>
      </Card>
    </>
  );
};
