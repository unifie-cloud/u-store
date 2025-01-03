// instrumentation.ts

import * as Sentry from '@sentry/nextjs';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function register() {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' ||
    process.env.NEXT_RUNTIME === 'edge'
  ) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: parseFloat(
        process.env.NEXT_PUBLIC_SENTRY_TRACE_SAMPLE_RATE ?? '0.0'
      ),
      debug: false,
    });
  }
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const backend = await import('./instrumentation-backend');
    await backend.init();
  }
}
