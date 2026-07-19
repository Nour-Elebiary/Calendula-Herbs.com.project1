export function getRequiredEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      'Set it in your .env file or Vercel Dashboard before starting the server.'
    )
  }
  return value
}

export function getOptionalEnvVar(name: string, fallback: string): string {
  return process.env[name] || fallback
}
