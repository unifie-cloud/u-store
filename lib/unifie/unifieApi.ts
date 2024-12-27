/**
 * Unifie API
 * @file unifieApi.ts
 *
 * Dependencies:
 * - npm add graphql-request
 */

import { GraphQLClient } from 'graphql-request';

export interface UnifieApiOptions {
  apiKey: string;
  apiHost: string;
}

class UnifieApi {
  protected client;
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

  public async Clusters_getClustersList() {
    const query = await this.client.rawRequest(
      `query Clusters_getClustersList {
            Clusters_getClustersList {
                id
                name
                regionName
                title
                kubernetesVersion
                cloudProvider
                loadBalancerURL
                loadBalancerType
                allowToAddDeployments
                lastSyncTime
                noSyncTime
            }
        }`,
      {}
    );

    return query?.data?.Clusters_getClustersList || [];
  }
}

export default UnifieApi;
