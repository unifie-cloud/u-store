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
  dpCreationType: string;
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
}

export default UnifieApi;
