/**
 * Authentication middleware utilities
 * Reduces code duplication across API routes
 */

import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

/**
 * Require authentication - throws error if not authenticated
 * @returns Session object if authenticated
 */
export async function requireAuth() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new AuthError('Giriş yapmanız gerekiyor.', 401)
  }

  return session
}

/**
 * Custom error class for authentication errors
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Handle auth errors and return appropriate response
 */
export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }

  // Re-throw non-auth errors
  throw error
}

/**
 * Wrapper for API route handlers that require authentication
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withAuth<T extends any[]>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (session: any, ...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      const session = await requireAuth()
      return handler(session, ...args)
    } catch (error) {
      return handleAuthError(error)
    }
  }
}
