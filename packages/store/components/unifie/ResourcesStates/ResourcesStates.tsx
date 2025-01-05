import gql from 'graphql-tag';
import { useEffect, useState } from 'react';
import { Popover, Skeleton, Space, Tag, Typography } from 'antd';
import {
  CheckCircleOutlined,
  ThunderboltOutlined,
  PoweroffOutlined,
  RocketOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  WarningOutlined,
  SyncOutlined,
  FieldTimeOutlined,
  FireOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useQuery } from '@apollo/client';

const blueColor: any = { color: 'blue' };
const buttonColor: any = { color: '#00A58E' };
const redColor: any = { color: 'red' };
const { Text } = Typography;

export interface Pod {
  name: string;
  id: string;
  containers?: any;
}

interface iResourcesStatesProps {
  teamSlug: string;
}

export interface iOneMetric {
  name: string;
  labels: any;
  memory: number;
  cpu: number;
  nodeName: string;
}

interface iRequestLimit {
  cpuRequest: string;
  ephemeralRequest: string;
  memoryRequest: string;
  cpuLimit: string;
  ephemeralLimit: string;
  memoryLimit: string;
}

export const ResourcesStates = (props: iResourcesStatesProps) => {
  const podsQuery = useQuery(
    gql`
      query uStore_getPodsMetrics($teamSlug: String!) {
        uStore_getPodsMetrics(teamSlug: $teamSlug) {
          error
          metrics {
            labels
            cpu
            memory
            name
            nodeName
          }
        }
        uStore_getPodsStatus(teamSlug: $teamSlug) {
          error
          status {
            labels
            name
            nodeName
            status_phase
            status_startTime
            creationTimestamp
            containers
            status_conditions
            status_containerStatuses
          }
        }
      }
    `,
    {
      skip: !props.teamSlug,
      variables: { teamSlug: String(props.teamSlug) },
    }
  );

  const { loading, error, data } = podsQuery || {};

  const newStatus = data?.uStore_getPodsStatus?.status;
  const newMetrics = data?.uStore_getPodsMetrics?.metrics;

  const [oldStatus, setOldStatus] = useState(null);
  const [oldMetrics, setOldMetrics] = useState(null);

  useEffect(() => {
    if (newStatus && !newStatus?.error) {
      setOldStatus(newStatus);
    }
    if (newMetrics && !newMetrics?.error) {
      setOldMetrics(newMetrics);
    }
    return podsQuery.stopPolling;
  }, [newStatus, newMetrics]);

  podsQuery.startPolling(5000);

  if (podsQuery.loading) {
    return <Skeleton active={true} loading={true} />;
  }

  if (!podsQuery.error && !newStatus) {
    return <> No pods found </>;
  }

  if (podsQuery.error || !newStatus || newStatus.error === 401) {
    return <> Error: {JSON.stringify(podsQuery.error || newStatus?.error)} </>;
  }

  let metricsObj = newMetrics;
  if (newMetrics?.error) {
    metricsObj = oldMetrics;
    if (!oldMetrics) {
      console.error('Tunnel error', newStatus?.error);
      return <Skeleton active={true} loading={true} />;
    }
  }

  const metrics: iOneMetric[] = metricsObj;

  const getCpuData = (data: any[]): iRequestLimit => {
    const requestLimit = {
      cpuRequest: 0,
      ephemeralRequest: 0,
      memoryRequest: 0,
      cpuLimit: 0,
      ephemeralLimit: 0,
      memoryLimit: 0,
    };

    data.forEach(({ resources }) => {
      requestLimit.cpuRequest += parseInt(resources?.requests?.cpu || '0', 10);
      requestLimit.ephemeralRequest += parseInt(
        resources?.requests?.['ephemeral-storage'] || '0',
        10
      );
      requestLimit.memoryRequest += parseInt(
        resources?.requests?.memory || '0',
        10
      );
      requestLimit.cpuLimit += parseInt(resources?.limits?.cpu || '0', 10);
      requestLimit.ephemeralLimit += parseInt(
        resources?.limits?.['ephemeral-storage'] || '0',
        10
      );
      requestLimit.memoryLimit += parseInt(
        resources?.limits?.memory || '0',
        10
      );
    });

    return {
      cpuRequest: `${requestLimit.cpuRequest}m`,
      ephemeralRequest: `${requestLimit.ephemeralRequest}Mi`,
      memoryRequest: `${requestLimit.memoryRequest}Mi`,
      cpuLimit: `${requestLimit.cpuLimit}m`,
      memoryLimit: `${requestLimit.memoryLimit}Mi`,
      ephemeralLimit: `${requestLimit.ephemeralLimit}Mi`,
    };
  };

  let status = newStatus;
  if (newStatus?.error) {
    status = oldStatus;
    if (!oldStatus) {
      console.error('Tunnel error', newStatus?.error);
      return <Skeleton active={true} loading={true} />;
    }
  }

  const metricsByPodName = (podName: string): iOneMetric | undefined => {
    if (!metrics || metrics?.length === 0 || Array.isArray(metrics) === false) {
      return undefined;
    }
    return (metrics || []).find((m) => m?.name === podName);
  };

  if (!status) {
    return null;
  }

  if (status?.ErrorBody || Array.isArray(status) === false) {
    return (
      <Text type="danger">
        {' '}
        {status?.ErrorBody?.message ||
          status?.message ||
          JSON.stringify(status)}{' '}
      </Text>
    );
  }

  return (
    <Space direction="vertical">
      {status &&
        status.map((service) => {
          let checkError = getCheckError(service);
          // console.log(service.name, checkError);
          const podName = service.name;
          const nodeName = service?.nodeName || ``;
          const containerList = service.containers;
          const usage: iOneMetric | undefined = metricsByPodName(podName);
          const last = service.last_condition;

          // const { lastTransitionTime, message, reason, status, type } = last;
          const {
            cpuRequest,
            ephemeralRequest,
            memoryRequest,
            cpuLimit,
            ephemeralLimit,
            memoryLimit,
          }: iRequestLimit = getCpuData(containerList);

          return (
            <Space>
              <Tag key={service.name} icon={serviceToIcon(service)}>
                <span style={{ minWidth: '90px' }}>
                  <Popover
                    placement="left"
                    content={
                      <Space direction="vertical">
                        <Text strong> {getTitleHelp(checkError)} </Text>
                        <Text italic> Node {nodeName} </Text>
                        <p style={{ maxWidth: '300px' }}>
                          {last?.lastTransitionTime ? (
                            <ul>
                              {last?.lastTransitionTime ? (
                                <li>
                                  {' '}
                                  Last transition time:{' '}
                                  {last?.lastTransitionTime}{' '}
                                </li>
                              ) : (
                                ''
                              )}
                              {last?.message ? (
                                <li> Message: {last?.message} </li>
                              ) : (
                                ''
                              )}
                              {last?.reason ? (
                                <li> Reason: {last?.reason} </li>
                              ) : (
                                ''
                              )}
                              {last?.status ? (
                                <li> Status: {last?.status} </li>
                              ) : (
                                ''
                              )}
                              {last?.type ? <li> Type: {last?.type} </li> : ''}
                              {cpuRequest ? (
                                <li>CPU Request : {cpuRequest}</li>
                              ) : (
                                ''
                              )}
                              {ephemeralRequest ? (
                                <li> Ephemeral Request: {ephemeralRequest} </li>
                              ) : (
                                ''
                              )}
                              {memoryRequest ? (
                                <li> Memory Request: {memoryRequest} </li>
                              ) : (
                                ''
                              )}
                              {cpuLimit ? (
                                <li> CPU Limit : {cpuLimit} </li>
                              ) : (
                                ''
                              )}
                              {ephemeralLimit ? (
                                <li> Memory Limit: {ephemeralLimit} </li>
                              ) : (
                                ''
                              )}
                              {memoryLimit ? (
                                <li> Ephemeral Limit: {memoryLimit} </li>
                              ) : (
                                ''
                              )}
                            </ul>
                          ) : (
                            ''
                          )}
                        </p>
                      </Space>
                    }
                    title={`Phase: ${checkError}`}
                  >
                    {/* ToDo: Add link to logs */}
                    {getServiceNameForUI(service)}
                  </Popover>
                </span>
              </Tag>
              {usage && <Text> CPU usage {Math.floor(usage?.cpu)}m </Text>}
              {usage && (
                <Text>
                  {' '}
                  Memory usage {Math.floor(usage?.memory * 100) / 100}Mi{' '}
                </Text>
              )}
            </Space>
          );
        })}
    </Space>
  );
};

const getCheckError = (service: any): string => {
  // let stateError = null;
  // if (service.status_containerStatuses.state && service.status_containerStatuses.state[0].reason) {
  //   stateError = `${service.status_containerStatuses.state[0].reason} - ${service.status_containerStatuses.state[0].message}`;
  // }

  if (!service) {
    return 'Unknown';
  }

  const wasTermenated = service?.status_containerStatuses?.state?.find(
    (v: any) => v.stateType === 'terminated'
  );
  const age =
    (new Date().getTime() - new Date(service.status_startTime).getTime()) /
    1000;

  let status =
    service?.last_condition?.reason ||
    service?.status_phase ||
    service?.last_condition?.message;
  let checkError = status;
  if (wasTermenated && status == 'ContainersNotReady') {
    checkError = 'CrashLoopBackOff';
  }

  if (wasTermenated && wasTermenated.reason == 'ContainerStatusUnknown') {
    checkError = 'ContainerStatusUnknown';
  }

  if (age < 180 && status == 'ContainersNotReady') {
    checkError = 'ContainerCreating';
  }

  if (
    service?.status_conditions?.length === 0 &&
    status === 'Failed' &&
    service?.last_condition?.lastTransitionTime == 0
  ) {
    checkError = 'Evicted';
  }
  return checkError;
};

export const getTitleHelp = (service: any): string => {
  if (!service) {
    return 'No data';
  }

  const checkError = getCheckError(service);
  const titleMap = {
    Running: `${checkError} - It is working well`,
    'Init:CrashLoopBackOff': `${checkError} - It won't work, try to fix it. It will not work until you fix it. (check Init container`,
    CrashLoopBackOff: `${checkError} - It won't work, try to fix it. It will not work until you fix it.`,
    ContainerCreating: `${checkError} - Just wait some time, it is okay`,
    ContainersNotInitialized: `${checkError} - Just wait some time, it is okay`,
    Terminating: `${checkError} - Just wait some time, it is okay`,
    'Init:Error': `${checkError} - It is an error (check Init container)`,
    Error: `${checkError} - It is an error`,
    Pending: `${checkError} - Just wait some time, try to fix if this status do not changes more than 5 minutes`,
    ContainersNotReady: `${checkError} - Just wait some time, try to fix if this status do not changes more than 5 minutes`,
    Succeeded: `${checkError} - It is okay`,
    PodCompleted: `${checkError} - It is okay`,
    Unschedulable: `${checkError} - It is an error`,
    PodFailed: `${checkError} - It is an error`,
    ContainerStatusUnknown: `${checkError} - It is not critical if we have at least one green pod for this service`,
    Evicted: `${checkError} - Evicted/Failed`,
  };
  return (
    titleMap[checkError] ||
    (checkError === undefined ? 'No errors' : checkError)
  );
};

export const serviceToIcon = (service: any) => {
  if (!service) {
    return undefined;
  }
  const checkError = getCheckError(service);
  const serviceToIconTitle = { title: getTitleHelp(service) };
  const iconMap = {
    Running: (
      <CheckCircleOutlined
        {...serviceToIconTitle}
        style={{ color: '#00A58E' }}
      />
    ),
    'Init:CrashLoopBackOff': (
      <ThunderboltOutlined {...serviceToIconTitle} style={redColor} />
    ),
    Evicted: (
      <ThunderboltOutlined
        {...serviceToIconTitle}
        style={{ color: '#808080' }}
      />
    ),
    ContainerStatusUnknown: (
      <PoweroffOutlined {...serviceToIconTitle} style={{ color: '#808080' }} />
    ),
    CrashLoopBackOff: (
      <ThunderboltOutlined {...serviceToIconTitle} style={redColor} />
    ),
    ContainerCreating: (
      <RocketOutlined {...serviceToIconTitle} style={blueColor} />
    ),
    ContainersNotInitialized: (
      <RocketOutlined {...serviceToIconTitle} style={blueColor} />
    ),
    Terminating: <DeleteOutlined {...serviceToIconTitle} style={blueColor} />,
    'Init:Error': <WarningOutlined {...serviceToIconTitle} style={redColor} />,
    Error: <WarningOutlined {...serviceToIconTitle} style={redColor} />,
    Pending: (
      <SyncOutlined {...serviceToIconTitle} spin={true} style={blueColor} />
    ),
    ContainersNotReady: (
      <SyncOutlined {...serviceToIconTitle} spin={true} style={blueColor} />
    ),
    Succeeded: (
      <FieldTimeOutlined {...serviceToIconTitle} style={buttonColor} />
    ),
    PodCompleted: (
      <FieldTimeOutlined {...serviceToIconTitle} style={buttonColor} />
    ),
    Unschedulable: (
      <FireOutlined {...serviceToIconTitle} style={{ color: '#FF7300' }} />
    ),
  };
  return (
    iconMap[checkError] || (
      <CloseCircleOutlined {...serviceToIconTitle} style={redColor} />
    )
  );
};

export const getServiceNameForUI = (service: any): string => {
  if (!service) {
    return '';
  }
  const labels = service?.labels || {};
  const keys = ['ui-name', 'name', 'app'];
  for (const key of keys) {
    if (labels[key]) {
      return labels[key];
    }
  }
  return service?.name || 'no-name';
};
