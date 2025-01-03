import { iApolloResolver } from 'apollo/backend';
import { unifieStoreFrontendApi } from './unifie/unifie';

/**
 * Array with all Graphql resolvers.
 */
export const GraphqlApiResolvers: iApolloResolver[] = [
  // Add your resolvers here
  unifieStoreFrontendApi,
];
