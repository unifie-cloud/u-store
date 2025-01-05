import { Link } from 'react-router-dom';
import { useCubeQuery } from '@cubejs-client/react';
import { Statistic, Tag } from 'antd';
import { BugOutlined, ClockCircleOutlined, LoadingOutlined, SyncOutlined } from '@ant-design/icons';
import { statisticText } from 'utils/styles';
import { TipBottom } from 'components/SharedComponents/Tooltip/Tooltip';

const DeploymentUptimeComponent = ({ deploymentId, minutes, title = `Uptime `, size = 'small' }) => {
  let color = `default`;
  let cssColor = `#CCCCCC`;
  let cssColour = `purple`;

  const statisticContent = () => (
    <Statistic
      data-qa="DeploymentUptimeComponent"
      title="No Data"
      value={`...`}
      precision={2}
      valueStyle={{ color: cssColour, ...statisticText }}
      prefix={<ClockCircleOutlined />}
    />
  );

  const filters = [];
  if (deploymentId) filters.push({ member: 'Monitoring.deploymentId', operator: 'equals', values: [`${deploymentId}`] });

  const { resultSet, isLoading, error, progress } = useCubeQuery({
    measures: ['Monitoring.okRate'],
    timeDimensions: [{ dimension: 'Monitoring.createdAt', dateRange: `Last ${minutes} minute` }],
    order: { 'Monitoring.createdAt': 'asc' },
    filters: filters,
  });

  if (isLoading) {
    return size === 'small' ? (
      <Tag data-qa="DeploymentUptimeComponent" icon={<SyncOutlined spin />} color={'default'}>
        Loading
      </Tag>
    ) : (
      <Statistic
        data-qa="DeploymentUptimeComponent"
        title="Loading"
        value={` `}
        valueStyle={{ color: cssColor, ...statisticText }}
        prefix={<LoadingOutlined />}
      />
    );
  }

  if (error) {
    return size === 'small' ? (
      <Tag data-qa="DeploymentUptimeComponent" color={'error'} title={error.toString()}>
        Data not loaded
      </Tag>
    ) : (
      <Statistic
        data-qa="DeploymentUptimeComponent"
        title="Error"
        value="Data not loaded"
        precision={2}
        valueStyle={{ color: `#CF1322`, ...statisticText }}
        prefix={<BugOutlined />}
      />
    );
  }

  if (!resultSet) {
    return size === 'small' ? (
      <Tag data-qa="DeploymentUptimeComponent" color={cssColour}>
        <TipBottom tip="No Data"> No data for uptime </TipBottom>
      </Tag>
    ) : (
      statisticContent()
    );
  }

  const dataSource = resultSet.tablePivot();

  let okRate = null;
  if (dataSource[0] && dataSource[0]['Monitoring.okRate']) okRate = dataSource[0]['Monitoring.okRate'];
  else {
    return size === 'small' ? (
      <Tag data-qa="DeploymentUptimeComponent" color={cssColour}>
        <TipBottom tip="No Data"> No data for uptime </TipBottom>
      </Tag>
    ) : (
      statisticContent()
    );
  }

  color = okRate > 98 ? 'success' : okRate > 70 ? 'warning' : 'error';
  cssColor = okRate > 98 ? '#52C41A' : okRate > 70 ? '#FAAD14' : '#CF1322';

  if (size === 'small') {
    return (
      <Link data-qa="DeploymentUptimeComponent" to={`/monitoring/${deploymentId}`}>
        <Tag color={color}>
          <TipBottom tip={`Uptime for last ${minutes} minutes`}>
            {title}
            {okRate}%
          </TipBottom>
        </Tag>
      </Link>
    );
  }

  const statisticContentFinal = () => (
    <Statistic
      data-qa="DeploymentUptimeComponent"
      // valueStyle={{ float: 'left', color: cssColor, ...statisticText }}
      valueStyle={{ color: cssColor, ...statisticText }}
      // title={`Uptime for last ${minutes} minutes`}
      title={`Last ${minutes} min`}
      value={okRate}
      suffix="%"
      precision={2}
    />
  );

  return statisticContentFinal();
};

export default DeploymentUptimeComponent;
