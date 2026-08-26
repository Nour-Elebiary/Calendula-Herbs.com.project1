/**
 * Sentry client-side configuration.
 * This file is loaded in the browser.
 */
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Link errors to source maps via the git commit SHA
  release: process.env.NEXT_PUBLIC_COMMIT_SHA,

  // Capture 100% of errors in production; reduce for high-traffic sites
  tracesSampleRate: 0.1,

  // Only enable full session replay on error (privacy-safe)
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  integrations: [Sentry.replayIntegration()],

  // Disable in development to reduce noise
  enabled: process.env.NODE_ENV === 'production',

  environment: process.env.NODE_ENV,
})
