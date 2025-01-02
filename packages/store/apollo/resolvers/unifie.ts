// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against

import { iApolloResolver, QL } from '../backend';

export const unifieStoreFrontendApi: iApolloResolver = {
  schema: `#graphql
    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

    type ClusterModel {
        id: Int
        name: String
        regionName: String
        title: String
        kubernetesVersion: String
        cloudProvider: String
        loadBalancerURL: String
        loadBalancerType: String
        allowToAddDeployments: Boolean
        lastSyncTime: Float
        noSyncTime: Float
    }

    # The "Query" type is special: it lists all of the available queries that
    # clients can execute, along with the return type for each. In this
    # case, the "books" query returns an array of zero or more Books (defined above).
    extend type Query { 
      """
      Returns clusters list. get request
      """
      Clusters_getClustersList: [ClusterModel]
    }
 
  `,
  Query: {
    Clusters_getClustersList: QL(
      async (args: any, context: any): Promise<any[]> => {
        debugger;
        console.log('Clusters_getClustersList', args, context);
        return [
          {
            id: 1,
            name: 'cluster1',
            regionName: 'us-west-2',
            title: 'cluster1',
          },
        ];
      }
    ),
  },
  Mutation: {},
};
