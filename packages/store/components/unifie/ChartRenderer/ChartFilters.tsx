import { Radio, Space } from 'antd';
import { useState } from 'react';

export interface iFilter {
  name?: string;
  value: string;
  type: string;
  options?: any;
}

interface iChartFilters {
  filters: iFilter[];
  setFilters: (filters: iFilter[]) => void;
}

interface iChartFilterElement {
  allFilters: iFilter[];
  filter: iFilter;
  onChange: (iFilter) => void;
}

const DateRangeFilter = (props: iChartFilterElement) => {
  const options = props.filter?.options || [
    { label: '24h', value: 'Last 1440 minute' },
    { label: '12h', value: 'Last 720 minute' },
    { label: '6h', value: 'Last 360 minute' },
    { label: '1h', value: 'Last 60 minute' },
    { label: '30m', value: 'Last 30 minute' },
    { label: '15m', value: 'Last 15 minute' },
    { label: '5m', value: 'Last 5 minute' },
  ];
  const [value, setValue] = useState(props.filter.value);

  return (
    <Radio.Group
      key={`DateRangeFilter`}
      data-qa={`DateRangeFilter`}
      onChange={(e) => {
        const newFilters = { ...props.filter, value: e.target.value };
        props.onChange(newFilters);
        setValue(e.target.value);
      }}
      value={value || props.filter.value}
      optionType="button"
      buttonStyle="solid"
    >
      {options.map((option, index) => {
        return (
          <Radio.Button key={index} value={option.value}>
            {option.label}
          </Radio.Button>
        );
      })}
    </Radio.Group>
  );
};

const GranularityFilter = (props: iChartFilterElement) => {
  const options = props.filter?.options || [
    { label: 'Minutes', value: 'minute' },
    { label: 'Hour', value: 'hour' },
  ];
  const [value, setValue] = useState(props.filter.value);
  return (
    <Radio.Group
      key={`GranularityFilter`}
      data-qa={`GranularityFilter`}
      options={options}
      onChange={(e) => {
        setValue(e.target.value);
        const newFilters = { ...props.filter, value: e.target.value };
        props.onChange(newFilters);
      }}
      value={value || props.filter.value}
      optionType="button"
      buttonStyle="solid"
    />
  );
};

export const ChartFilters = (props: iChartFilters) => {
  return (
    <Space direction="horizontal">
      {props.filters.map((filter, index) => {
        if (filter.type === 'dateRange') {
          return (
            <DateRangeFilter
              key={filter.type}
              data-qa={filter.type}
              filter={filter}
              allFilters={props.filters}
              onChange={(newFilter) => {
                const newFilters = [...props.filters];
                newFilters[index] = newFilter;
                props.setFilters(newFilters);
              }}
            />
          );
        }
        if (filter.type === 'granularity') {
          return (
            <GranularityFilter
              key={filter.type}
              data-qa={filter.type}
              filter={filter}
              allFilters={props.filters}
              onChange={(newFilter) => {
                const newFilters = [...props.filters];
                newFilters[index] = newFilter;
                props.setFilters(newFilters);
              }}
            />
          );
        }

        return null;
      })}
    </Space>
  );
};
