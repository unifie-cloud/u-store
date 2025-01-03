import { useMemo } from 'react';

import { APOLLO_STATE_PROP_NAME, initializeApollo } from '../apollo';

let apolloClient: any;
function useApollo(pageProps: any) {
  const state = pageProps[APOLLO_STATE_PROP_NAME];
  apolloClient = useMemo(() => initializeApollo(state), [state]);

  return apolloClient;
}

export function getApollo() {
  return apolloClient || initializeApollo();
}

export default useApollo;
