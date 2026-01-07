/**
 * Centralized logging utility
 * Replaces console.log/error/warn with environment-aware logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogOptions {
  level?: LogLevel
  context?: string
  error?: unknown
  data?: Record<string, unknown>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  /**
   * Format log message
   */
  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString()
    const contextPart = context ? `[${context}]` : ''
    return `${timestamp} ${level.toUpperCase()} ${contextPart} ${message}`
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, options?: LogOptions): void {
    if (!this.isDevelopment) return

    const formatted = this.formatMessage('debug', message, options?.context)
    console.debug(formatted, options?.data || '')
  }

  /**
   * Log info message
   */
  info(message: string, options?: LogOptions): void {
    if (this.isProduction) {
      // In production, send to logging service (Sentry, LogRocket, etc.)
      // For now, just log to console but can be extended
    }

    const formatted = this.formatMessage('info', message, options?.context)
    console.info(formatted, options?.data || '')
  }

  /**
   * Log warning message
   */
  warn(message: string, options?: LogOptions): void {
    const formatted = this.formatMessage('warn', message, options?.context)
    console.warn(formatted, options?.data || '')

    // In production, send to monitoring service
    if (this.isProduction && options?.error) {
      // Example: Sentry.captureMessage(formatted, 'warning')
    }
  }

  /**
   * Log error message
   */
  error(message: string, options?: LogOptions): void {
    const formatted = this.formatMessage('error', message, options?.context)
    
    if (options?.error) {
      console.error(formatted, options?.error, options?.data || '')
      
      // In production, send to error tracking service
      if (this.isProduction) {
        // Example: Sentry.captureException(options.error, { extra: options.data })
      }
    } else {
      console.error(formatted, options?.data || '')
    }
  }

  /**
   * Log API request (for debugging)
   */
  apiRequest(method: string, path: string, status?: number, duration?: number): void {
    if (!this.isDevelopment) return

    const message = `${method} ${path}${status ? ` ${status}` : ''}${duration ? ` (${duration}ms)` : ''}`
    this.debug(message, { context: 'API' })
  }

  /**
   * Log database query (for debugging)
   */
  dbQuery(query: string, duration?: number): void {
    if (!this.isDevelopment) return

    const message = `DB Query: ${query}${duration ? ` (${duration}ms)` : ''}`
    this.debug(message, { context: 'DB' })
  }
}

// Export singleton instance
export const logger = new Logger()

// Export for convenience
export const log = {
  debug: (message: string, options?: LogOptions) => logger.debug(message, options),
  info: (message: string, options?: LogOptions) => logger.info(message, options),
  warn: (message: string, options?: LogOptions) => logger.warn(message, options),
  error: (message: string, options?: LogOptions) => logger.error(message, options),
  api: (method: string, path: string, status?: number, duration?: number) =>
    logger.apiRequest(method, path, status, duration),
  db: (query: string, duration?: number) => logger.dbQuery(query, duration)
}
