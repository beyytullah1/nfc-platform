/**
 * Environment helper utilities
 * Centralized base URL management and environment variable validation
 */

/**
 * Require an environment variable to be set
 * @param key - Environment variable name
 * @param defaultValue - Optional default value (only for non-production)
 * @returns The environment variable value
 * @throws Error if variable is missing and no default is provided
 */
function requireEnv(key: string, defaultValue?: string): string {
  const value = process.env[key]

  if (value) {
    return value
  }

  // In production, warn but don't crash (next-auth will handle missing secret at runtime)
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      `⚠️  Missing environment variable: ${key}. ` +
      `Make sure it is set in your production environment.`
    )
    return defaultValue || ''
  }

  // In development, allow defaults but warn
  if (defaultValue) {
    console.warn(
      `⚠️  Environment variable ${key} not set, using default. ` +
      `This should not happen in production!`
    )
    return defaultValue
  }

  throw new Error(
    `Missing required environment variable: ${key}. ` +
    `Please set it in your .env.local file.`
  )
}

/**
 * Get an optional environment variable
 * @param key - Environment variable name
 * @param defaultValue - Default value if not set
 * @returns The environment variable value or default
 */
function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue
}

// Required environment variables
// In development, allow a fallback secret (NOT for production!)
export const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  requireEnv(
    'AUTH_SECRET',
    // Development fallback - MUST be set in production
    process.env.NODE_ENV === 'development'
      ? 'dev-fallback-secret-change-in-production-please-generate-with-openssl-rand-base64-32'
      : undefined
  )

// Optional environment variables
export const DATABASE_URL = getEnv(
  'DATABASE_URL',
  'file:./prisma/dev.db'
)

export const NEXTAUTH_URL = getEnv(
  'NEXTAUTH_URL',
  'http://localhost:3000'
)

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

/**
 * Get the base URL for the application
 * - Server-side: Uses NEXT_PUBLIC_BASE_URL env variable with fallback
 * - Client-side: Uses window.location.origin
 * 
 * This allows easy switching between localhost and production domains
 */
export function getBaseUrl(): string {
  // Server-side rendering
  if (typeof window === 'undefined') {
    return getEnv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
  }

  // Client-side
  return window.location.origin
}

/**
 * Build a full URL with the base URL
 * @param path - Path to append to base URL (with or without leading slash)
 */
export function buildUrl(path: string): string {
  const base = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

/**
 * Get card public URL
 * @param slug - Card slug/username or card ID
 */
export function getCardUrl(slug: string): string {
  // If it's a CUID (starts with 'c' and has specific length), use /c/ prefix
  // CUIDs typically start with 'c' followed by random characters
  const isCuid = /^c[a-z0-9]{24,25}$/i.test(slug)

  if (isCuid) {
    return buildUrl(`/c/${slug}`)
  }

  // Otherwise it's a username, use direct path
  return buildUrl(`/${slug}`)
}
