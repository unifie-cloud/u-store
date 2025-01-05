import DashboardItem from './DashboardItem';
import { Col, Row } from 'antd';
import { ChartRenderer } from './ChartRenderer';
import { ChartFilters, iFilter } from './ChartFilters';
import React, { useState } from 'react';

const ChartDashboard = ({ children }) => (
  <Row justify="space-around" align="top" gutter={24}>
    {children}
  </Row>
);

interface iCubeJsOneChart {
  chartType: string;
  query: {
    measures: string[];
    timeDimensions: any[];
    dimensions: string[];
    filters: any[];
  };
}
export interface iDashboardOneChart {
  id?: number;
  span: number | string;
  name: string;
  height?: number;
  vizState: iCubeJsOneChart;
}

interface iChartDashboardMap {
  stats: iDashboardOneChart[];
  filters?: iFilter[];
}
export const ChartDashboardMap = (props: iChartDashboardMap) => {
  const [filters, setFilters] = useState<iFilter[]>(
    props.filters || [
      {
        type: 'dateRange',
        value: `Last 15 minute`,
      },
      {
        type: 'granularity',
        value: `minute`,
      },
    ]
  );
  const dateRangeValue = filters.find((f) => f.type === 'dateRange')?.value;
  const granularityValue = filters.find((f) => f.type === 'granularity')?.value;

  const stats = props.stats.map((stat: iDashboardOneChart) => {
    if (stat?.vizState?.query?.timeDimensions) {
      stat.vizState.query.timeDimensions =
        stat.vizState.query.timeDimensions.map((td) => {
          return {
            ...td,
            dateRange: dateRangeValue,
            granularity: granularityValue,
          };
        });
    }
    return stat;
  });
  console.log(`stats`, filters);
  return (
    <>
      <ChartFilters filters={filters} setFilters={setFilters} />
      {filters?.length > 0 && (
        <>
          <br />
          <br />
        </>
      )}
      <ChartDashboard>
        {stats.map((stat, index) => (
          <Col
            span={stat.span || 24}
            key={stat.id || index}
            style={{ marginBottom: '24px' }}
          >
            <DashboardItem title={stat.name}>
              <ChartRenderer vizState={stat.vizState} height={stat?.height} />
            </DashboardItem>
          </Col>
        ))}
      </ChartDashboard>
    </>
  );
};

export default ChartDashboard;
