// instrumentation.ts front

import env from './lib/env';

/**
 * Init function for the instrumentation backend
 */
export async function init() {
  if (!env.unifie.apiHost) {
    console.log('Env var UNIFIE_API_URL is not set');
    throw new Error('Env var UNIFIE_API_URL is not set');
  }
  if (!env.unifie.apiKey) {
    console.log('Env var UNIFIE_API_KEY is not set');
    throw new Error('Env var UNIFIE_API_KEY is not set');
  }
}
