/**
 * Unifie API
 * @file unifieApi.ts
 *
 * Dependencies:
 * - npm add graphql-request
 */

import { GraphQLClient } from 'graphql-request';
import env from '../env';
import {
  UnifieApiOptions,
  iUnifieCluster,
  iUnifieApplication,
  iUnifieApplicationInput,
  iApplicationExtData,
} from 'types/unifieApi';

export class UnifieCloudApi {
  protected client;
  protected defaultTemplateId: number | null = Number(
    process.env.UNIFIE_DEFAULT_TEMPLATE_ID
  );
  constructor(options?: UnifieApiOptions) {
    const opt = options || env.unifie;
    if (!opt.apiKey) {
      console.error('UnifieCloudApi: apiKey is not set');
      throw new Error('UnifieCloudApi: apiKey is not set');
    }

    if (!opt.apiHost) {
      console.error('UnifieCloudApi: apiHost is not set');
      throw new Error('UnifieCloudApi: apiHost is not set');
    }

    this.client = new GraphQLClient(opt.apiHost, {
      headers: {
        'x-auth-token': opt.apiKey,
      },
    });
  }

  public async Clusters_getClustersList(): Promise<iUnifieCluster[]> {
    const query = await this.client.rawRequest(
      `query Clusters_getClustersList {
            Clusters_getClustersList {
                id
                name
                regionName
                title 
                cloudProvider 
                allowToAddDeployments 
            }
        }`,
      {}
    );
    return query?.data?.Clusters_getClustersList || [];
  }

  public async Application_getMonitoringTokenByExtUuid(
    extUuid: string
  ): Promise<{ token: string; url: string; error: string }> {
    const query = await this.client.rawRequest(
      `query Application_getMonitoringTokenByExtUuid($extUuid: String!) {
          Application_getMonitoringTokenByExtUuid(extUuid: $extUuid) { 
            error
            token
            url
          }
        }`,
      { extUuid: extUuid }
    );

    return query?.data?.Application_getMonitoringTokenByExtUuid || null;
  }
  public async Application_getPodsStatusByExtUuid(
    extUuid: string
  ): Promise<{ error: string; status: any[] }> {
    const query = await this.client.rawRequest(
      `query Application_getPodsStatusByExtUuid($extUuid: String!) {
          Application_getPodsStatusByExtUuid(extUuid: $extUuid) { 
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
        }`,
      { extUuid: extUuid }
    );

    return (
      query?.data?.Application_getPodsStatusByExtUuid || {
        error: 'No data',
        status: [],
      }
    );
  }

  public async Application_getPodsMetricsByExtUuid(
    extUuid: string
  ): Promise<{ error: string; metrics: any[] }> {
    try {
      const query = await this.client.rawRequest(
        `query Application_getPodsMetricsByExtUuid($extUuid: String!) {
          Application_getPodsMetricsByExtUuid(extUuid: $extUuid) { 
            error
            metrics {
              labels
              cpu
              memory
              name
              nodeName
            }
          }
        }`,
        { extUuid: extUuid }
      );

      return (
        query?.data?.Application_getPodsMetricsByExtUuid || {
          error: 'No data',
          metrics: [],
        }
      );
    } catch (e: any) {
      console.error(e?.message);
      return {
        error: 'No data',
        metrics: [],
      };
    }
  }
  public async Clusters_getClustersForTemplate(
    templateId?: number
  ): Promise<iUnifieCluster[]> {
    const query = await this.client.rawRequest(
      `query Clusters_getClustersForTemplate($projectId: Int!) {
            Clusters_getClustersForTemplate(projectId: $projectId) {
                id
                name
                regionName
                title 
                cloudProvider 
                allowToAddDeployments 
            }
        }`,
      { projectId: templateId || this.defaultTemplateId }
    );

    return query?.data?.Clusters_getClustersList || [];
  }
  public async Application_getApplicationByExtUuid(
    extUuid: string
  ): Promise<iUnifieApplication | null> {
    const query = await this.client.rawRequest(
      `query Application_getApplicationByExtUuid($extUuid: String!) {
          Application_getApplicationByExtUuid(extUuid: $extUuid) { 
            id
            name
            domain 
            projectId 
            isReady
            isEnabled 
            ClusterModel {
              id
              title
            }
            VersionModel {
              id
              name
              title
              description
            } 
            tags
          }
        }`,
      { extUuid: extUuid }
    );

    return query?.data?.Application_getApplicationByExtUuid || null;
  }

  public async Application_getApplicationsList(): Promise<
    iUnifieApplication[]
  > {
    const query = await this.client.rawRequest(
      `query Application_getApplicationsList {
          Application_getApplicationsList {
            id
            name
            domain 
            projectId 
            isReady
            isEnabled 
            ClusterModel {
              id
              title
            }
            VersionModel {
              id
              name
              title
              description
            } 
            tags
          }
        }`,
      {}
    );

    return query?.data?.Application_getApplicationsList || [];
  }

  public async Application_createFromTemplate(data: {
    templateId?: number;
    name: string;
    clusterId: number;
    extUuid?: string;
    extData?: iApplicationExtData;
  }): Promise<iUnifieApplication> {
    const query = await this.client.rawRequest(
      `mutation Application_createFromTemplate($templateId: Int!, $name: String!, $clusterId: Int!, $extUuid: String, $extData: JSON) {
          Application_createFromTemplate(templateId: $templateId, name: $name, clusterId: $clusterId, extUuid: $extUuid, extData: $extData) {
            id
            extUuid
          }
        }`,
      {
        templateId: Number(data.templateId || this.defaultTemplateId),
        name: String(data.name),
        clusterId: Number(data.clusterId),
        extUuid: String(data.extUuid),
        extData: data.extData,
      }
    );

    return query?.data?.Application_createFromTemplate;
  }

  public async Application_updateByExtUuid(
    extUuid: string,
    fields: Partial<iUnifieApplicationInput>
  ): Promise<{ error: string }> {
    const query = await this.client.rawRequest(
      `mutation Application_updateByExtUuid($extUuid: String!, $fields: JSON!) {
        Application_updateByExtUuid(extUuid: $extUuid, fields: $fields) {
          error  
        }
      }`,
      {
        extUuid: extUuid,
        fields: fields,
      }
    );

    return query?.data?.Application_updateByExtUuid;
  }
}

export const unifieApi = new UnifieCloudApi();
