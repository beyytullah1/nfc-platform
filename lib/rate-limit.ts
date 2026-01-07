/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based solution (Upstash, etc.)
 */

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

interface RequestRecord {
  count: number
  resetAt: number
}

// In-memory store (clears on server restart)
// For production, use Redis or similar
const requestStore = new Map<string, RequestRecord>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of requestStore.entries()) {
    if (record.resetAt < now) {
      requestStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Check if request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and reset time
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; resetAt: number; remaining: number } {
  const now = Date.now()
  const record = requestStore.get(identifier)

  // No record or window expired
  if (!record || record.resetAt < now) {
    const newRecord: RequestRecord = {
      count: 1,
      resetAt: now + config.windowMs
    }
    requestStore.set(identifier, newRecord)
    return {
      allowed: true,
      resetAt: newRecord.resetAt,
      remaining: config.maxRequests - 1
    }
  }

  // Check if limit exceeded
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      resetAt: record.resetAt,
      remaining: 0
    }
  }

  // Increment count
  record.count++
  requestStore.set(identifier, record)

  return {
    allowed: true,
    resetAt: record.resetAt,
    remaining: config.maxRequests - record.count
  }
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Try various headers (proxy/load balancer support)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback (not reliable in serverless environments)
  return 'unknown'
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  // General API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  },
  // Authentication endpoints (stricter)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 login attempts per 15 minutes
  },
  // File upload (very strict)
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20 // 20 uploads per hour
  },
  // NFC operations
  nfc: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10 // 10 NFC operations per minute
  }
} as const

/**
 * Rate limit middleware for API routes
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (request: Request): Promise<Response | null> => {
    const identifier = getClientIP(request)
    const result = checkRateLimit(identifier, config)

    if (!result.allowed) {
      const resetSeconds = Math.ceil((result.resetAt - Date.now()) / 1000)
      return new Response(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          resetAt: new Date(result.resetAt).toISOString(),
          retryAfter: resetSeconds
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
            'Retry-After': resetSeconds.toString()
          }
        }
      )
    }

    return null // Request allowed
  }
}
