// @ts-nocheck
import React, { Children, useContext } from 'react';
import { QueryRenderer } from '@cubejs-client/react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useDeepCompareMemo } from 'use-deep-compare';
import { Row, Col, Statistic, Spin, Table } from 'antd';
import ChartModal from './ChartModal';
import { FullScreenContext } from './DashboardItem';

Chart.register(...registerables);
const COLORS_SERIES = ['#5B8FF9', '#5AD8A6', '#5E7092', '#F6BD18', '#6F5EFA', '#6EC8EC', '#945FB9', '#FF9845', '#299796', '#FE99C3'];
const PALE_COLORS_SERIES = ['#D7E3FD', '#DAF5E9', '#D6DBE4', '#FDEECD', '#DAD8FE', '#DBF1FA', '#E4D7ED', '#FFE5d2', '#CCE5E4', '#FFE6F0'];
const commonOptions = {
  maintainAspectRatio: false,
  interaction: { intersect: false },
  plugins: { legend: { position: 'bottom' } },
  scales: { x: { ticks: { autoSkip: true, maxRotation: 0, padding: 12, minRotation: 0 } } },
};

const useDrilldownCallback = ({ datasets, labels, onDrilldownRequested, pivotConfig }) => {
  return React.useCallback(
    elements => {
      if (elements.length <= 0) return;
      const { datasetIndex, index } = elements[0];
      const { yValues } = datasets[datasetIndex];
      const xValues = [labels[index]];
      if (typeof onDrilldownRequested === 'function') onDrilldownRequested({ xValues, yValues }, pivotConfig);
    },
    [datasets, labels, onDrilldownRequested],
  );
};

const LineChartRenderer = ({ height, resultSet, pivotConfig, onDrilldownRequested }) => {
  const datasets = useDeepCompareMemo(
    () =>
      resultSet.series(pivotConfig).map((s, index) => ({
        label: s.title,
        data: s.series.map(r => r.value),
        yValues: [s.key],
        borderColor: COLORS_SERIES[index],
        pointRadius: 1,
        tension: 0.1,
        pointHoverRadius: 1,
        borderWidth: 2,
        tickWidth: 1,
        fill: false,
      })),
    [resultSet, pivotConfig],
  );
  const data = { labels: resultSet.categories(pivotConfig).map(c => c.x), datasets };
  const getElementAtEvent = useDrilldownCallback({ datasets: data.datasets, labels: data.labels, pivotConfig, onDrilldownRequested });
  return <Line style={{ height: height }} type="line" data={data} options={commonOptions} getElementAtEvent={getElementAtEvent} />;
};

const BarChartRenderer = ({ height, resultSet, pivotConfig, onDrilldownRequested }) => {
  const datasets = useDeepCompareMemo(
    () =>
      resultSet.series(pivotConfig).map((s, index) => ({
        label: s.title,
        data: s.series.map(r => r.value),
        yValues: [s.key],
        backgroundColor: COLORS_SERIES[index],
        fill: false,
      })),
    [resultSet, pivotConfig],
  );
  const data = { labels: resultSet.categories(pivotConfig).map(c => c.x), datasets };
  const stacked = !(pivotConfig.x || []).includes('measures');
  const options = { ...commonOptions, scales: { x: { ...commonOptions.scales.x, stacked }, y: { ...commonOptions.scales.y, stacked } } };
  const getElementAtEvent = useDrilldownCallback({ datasets: data.datasets, labels: data.labels, onDrilldownRequested, pivotConfig });
  return <Bar type="bar" style={{ height: height }} data={data} options={options} getElementAtEvent={getElementAtEvent} />;
};

const AreaChartRenderer = ({ height, resultSet, pivotConfig, onDrilldownRequested }) => {
  const datasets = useDeepCompareMemo(
    () =>
      resultSet.series(pivotConfig).map((s, index) => ({
        label: s.title,
        data: s.series.map(r => r.value),
        yValues: [s.key],
        pointRadius: 1,
        pointHoverRadius: 1,
        backgroundColor: PALE_COLORS_SERIES[index],
        borderWidth: 0,
        fill: true,
        tension: 0,
      })),
    [resultSet, pivotConfig],
  );
  const data = { labels: resultSet.categories(pivotConfig).map(c => c.x), datasets };
  const options = { ...commonOptions, scales: { ...commonOptions.scales, y: { stacked: true } } };
  const getElementAtEvent = useDrilldownCallback({ datasets: data.datasets, labels: data.labels, pivotConfig, onDrilldownRequested });
  return <Line type="area" style={{ height: height }} data={data} options={options} getElementAtEvent={getElementAtEvent} />;
};

const PieChartRenderer = ({ height, resultSet, pivotConfig, onDrilldownRequested }) => {
  const data = {
    labels: resultSet.categories(pivotConfig).map(c => c.x),
    datasets: resultSet.series(pivotConfig).map(s => ({
      label: s.title,
      data: s.series.map(r => r.value),
      yValues: [s.key],
      backgroundColor: COLORS_SERIES,
      hoverBackgroundColor: COLORS_SERIES,
    })),
  };
  const getElementAtEvent = useDrilldownCallback({ datasets: data.datasets, labels: data.labels, pivotConfig, onDrilldownRequested });
  return <Pie type="pie" style={{ height: height }} data={data} options={commonOptions} getElementAtEvent={getElementAtEvent} />;
};

const formatTableData = (columns, data) => {
  function flatten(columns = []) {
    return columns.reduce((memo, column) => {
      if (column.children) return [...memo, ...flatten(column.children)];
      return [...memo, column];
    }, []);
  }

  const typeByIndex = flatten(columns).reduce((memo, column) => {
    return { ...memo, [column.dataIndex]: column };
  }, {});

  function formatValue(value, { type, format } = {}) {
    if (value == undefined) return value;
    if (type === 'boolean') {
      if (typeof value === 'boolean') return value.toString();
      else if (typeof value === 'number') return Boolean(value).toString();
      return value;
    }
    if (type === 'number' && format === 'percent') return [parseFloat(value).toFixed(2), '%'].join('');
    return value.toString();
  }

  function format(row) {
    return Object.fromEntries(
      Object.entries(row).map(([dataIndex, value]) => {
        return [dataIndex, formatValue(value, typeByIndex[dataIndex])];
      }),
    );
  }

  return data.map(format);
};

const TableRenderer = ({ resultSet, pivotConfig }) => {
  const [tableColumns, dataSource] = useDeepCompareMemo(() => {
    const columns = resultSet.tableColumns(pivotConfig);
    return [columns, formatTableData(columns, resultSet.tablePivot(pivotConfig))];
  }, [resultSet, pivotConfig]);
  return <Table pagination={false} columns={tableColumns} dataSource={dataSource} />;
};

const renderChartWithModal = props => {
  const originalChartView = renderChart(props);
  props.height = props.showModal ? 430 : props.height;
  return (
    <>
      <ChartModal originalChartView={originalChartView}>{renderChart(props)}</ChartModal>
    </>
  );
};

const renderChart = ({ height, chartType, resultSet, error, pivotConfig, onDrilldownRequested }) => {
  if (error) return <div> {error.toString()} </div>;
  if (!resultSet) return <Spin />;

  if (chartType == 'line') {
    return <LineChartRenderer height={height} resultSet={resultSet} pivotConfig={pivotConfig} onDrilldownRequested={onDrilldownRequested} />;
  } else if (chartType == 'table') {
    return <TableRenderer height={height} resultSet={resultSet} pivotConfig={pivotConfig} />;
  } else if (chartType == 'pie') {
    return <PieChartRenderer height={height} resultSet={resultSet} pivotConfig={pivotConfig} onDrilldownRequested={onDrilldownRequested} />;
  } else if (chartType == 'area') {
    return <AreaChartRenderer height={height} resultSet={resultSet} pivotConfig={pivotConfig} onDrilldownRequested={onDrilldownRequested} />;
  } else if (chartType == 'bar') {
    return <BarChartRenderer height={height} resultSet={resultSet} pivotConfig={pivotConfig} onDrilldownRequested={onDrilldownRequested} />;
  }
  debugger;
  return <LineChartRenderer height={height} resultSet={resultSet} pivotConfig={pivotConfig} onDrilldownRequested={onDrilldownRequested} />;
};

export const ChartRenderer = props => {
  const { showModal, setShowModal } = useContext(FullScreenContext);

  const key = JSON.stringify(props.vizState.query) + JSON.stringify(props.vizState.chartType) + JSON.stringify(props.vizState.pivotConfig);
  return (
    <QueryRenderer
      key={key}
      query={props.vizState.query}
      resetResultSetOnChange={false}
      render={propsR =>
        renderChartWithModal({
          ...propsR,
          chartType: props.vizState.chartType,
          pivotConfig: props.vizState.pivotConfig,
          height: props.height,
          showModal,
          setShowModal,
        })
      }
    />
  );
};
