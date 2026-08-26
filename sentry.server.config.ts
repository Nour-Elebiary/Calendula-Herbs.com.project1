/**
 * Sentry server-side (Node.js runtime) configuration.
 * Loaded by Next.js server components, API routes, and Server Actions.
 */
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Link errors to source maps via the git commit SHA
  release: process.env.NEXT_PUBLIC_COMMIT_SHA,

  tracesSampleRate: 0.1,

  // Disable in development to reduce noise
  enabled: process.env.NODE_ENV === 'production',

  environment: process.env.NODE_ENV,

  // Hook into unhandled promise rejections
  integrations: [Sentry.captureConsoleIntegration({ levels: ['error'] })],
})
