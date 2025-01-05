import { gql, useQuery } from '@apollo/client';
import { CubeProvider } from '@cubejs-client/react';
import cubejs from '@cubejs-client/core';
import {
  ChartDashboardMap,
  iDashboardOneChart,
} from './ChartRenderer/ChartDashboard';
import { Skeleton } from 'antd';

export const DeploymentMonitoring = (props: { teamSlug: string }) => {
  const qToken = useQuery(
    gql`
      query uStore_getMonitoringToken($teamSlug: String!) {
        uStore_getMonitoringToken(teamSlug: $teamSlug) {
          error
          token
          url
        }
      }
    `,
    {
      skip: !props.teamSlug,
      variables: { teamSlug: String(props.teamSlug) },
    }
  );

  if (!qToken?.data?.uStore_getMonitoringToken) {
    return <Skeleton active />;
  }

  const cubeApi: any = cubejs(qToken?.data?.uStore_getMonitoringToken?.token, {
    apiUrl: qToken?.data?.uStore_getMonitoringToken?.url,
  });
  const OverView_usage: iDashboardOneChart[] = [
    {
      id: 0,
      span: `12`,
      name: 'CPU usage avg',
      height: 400,
      vizState: {
        chartType: 'line',
        query: {
          measures: ['PodsMonitoring.cpuUsageAverage'],
          timeDimensions: [
            {
              dimension: 'PodsMonitoring.createdAt',
              granularity: `minute`,
              dateRange: `Last 15 minute`,
            },
          ],
          dimensions: ['PodsMonitoring.uiName'],
          filters: [],
        },
      },
    },
    {
      id: 0,
      span: `12`,
      name: 'Mem usage avg',
      height: 400,
      vizState: {
        chartType: 'line',
        query: {
          measures: ['PodsMonitoring.memUsageAverage'],
          timeDimensions: [
            {
              dimension: 'PodsMonitoring.createdAt',
              granularity: `minute`,
              dateRange: `Last 15 minute`,
            },
          ],
          dimensions: ['PodsMonitoring.uiName'],
          filters: [],
        },
      },
    },
  ];

  const OverView_stats: iDashboardOneChart[] = [
    {
      id: 0,
      span: `12`,
      height: 400,
      name: 'Availability for deployments',
      vizState: {
        chartType: 'line',
        query: {
          measures: ['Monitoring.okRate'],
          timeDimensions: [
            {
              dimension: 'Monitoring.createdAt',
              granularity: `minute`,
              dateRange: `Last 15 minute`,
            },
          ],
          dimensions: ['Monitoring.serviceName'],
          filters: [],
        },
      },
    },
    {
      id: 0,
      span: `12`,
      height: 400,
      name: 'Response time',
      vizState: {
        chartType: 'line',
        query: {
          measures: ['Monitoring.timeResponse'],
          timeDimensions: [
            {
              dimension: 'Monitoring.createdAt',
              granularity: `minute`,
              dateRange: `Last 15 minute`,
            },
          ],
          dimensions: ['Monitoring.serviceName'],
          filters: [],
        },
      },
    },
  ];

  let OverView_charts = [
    ...OverView_usage,
    ...OverView_usage,
    ...OverView_stats,
  ];

  return (
    <CubeProvider cubeApi={cubeApi}>
      <ChartDashboardMap stats={OverView_charts} />
    </CubeProvider>
  );
};
