import { iApolloResolver } from 'apollo/backend';
import { unifieStoreApplicationApi } from './unifie/unifie';
import { unifieStoreMonyApi } from './unifie/mony';

/**
 * Array with all Graphql resolvers.
 */
export const GraphqlApiResolvers: iApolloResolver[] = [
  // Add your resolvers here
  unifieStoreApplicationApi,
  unifieStoreMonyApi,
];
