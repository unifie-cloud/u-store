/**
 * Unifie API
 * @file unifieApi.ts
 *
 * Dependencies:
 * - npm add graphql-request
 */

import { GraphQLClient } from 'graphql-request';

export interface iUnifieCluster {
  id: number;
  name: string;
  regionName: string;
  title: string;
  cloudProvider: string;
  allowToAddDeployments: boolean;
}

export interface iUnifieApplication {
  id: number;
  name: string;
  domain: string;
  extUuid: string;
  extData: any;
  projectId: number;
  specsErrors: string;
  specsWarns: string;
  isReady: boolean;
  isEnabled: boolean;
  region: string;
  version: string;
  ClusterModel: {
    id: number;
    title: string;
  };
  VersionModel: {
    id: number;
    name: string;
    title: string;
    description: string;
  };
  env: string;
  services: string;
  tags: string;
}
export interface iUnifieApplicationInput {
  name: string;
  domain: string;
  extUuid: string;
  extData: any;
  projectId: number;
  isReady: boolean;
  isEnabled: boolean;
  region: number;
  version: number;
  env: any;
  services: any;
  tags: number[];
}

export interface UnifieApiOptions {
  apiKey: string;
  apiHost: string;
  defaultTemplateId?: number;
}

class UnifieApi {
  protected client;
  protected defaultTemplateId: number | null = Number(
    process.env.UNIFIE_DEFAULT_TEMPLATE_ID
  );
  constructor() {
    // ...
  }

  public async init(options: UnifieApiOptions) {
    // ...
    this.client = new GraphQLClient(options.apiHost, {
      headers: {
        'x-auth-token': options.apiKey,
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
  public async Clusters_getClustersForTemplate(
    templateId: number
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
    extData?: any;
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

export default UnifieApi;
