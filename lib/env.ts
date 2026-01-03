/**
 * Environment helper utilities
 * Centralized base URL management for dynamic domain support
 */

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
        return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
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
 * @param slug - Card slug/username
 */
export function getCardUrl(slug: string): string {
    return buildUrl(`/${slug}`)
}
