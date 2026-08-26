/**
 * Sentry Edge runtime configuration.
 * Loaded in Next.js middleware and Edge API routes.
 */
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Link errors to source maps via the git commit SHA
  release: process.env.NEXT_PUBLIC_COMMIT_SHA,

  tracesSampleRate: 0.1,

  enabled: process.env.NODE_ENV === 'production',

  environment: process.env.NODE_ENV,
})
