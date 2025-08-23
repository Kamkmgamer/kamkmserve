import type { NextRequest } from 'next/server'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export type LogContext = Record<string, unknown>

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  requestId?: string
  userId?: string
  userRole?: string
  path?: string
  method?: string
  userAgent?: string
  ip?: string
  duration?: number
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
}

class Logger {
  private get isDevelopment() { return process.env.NODE_ENV === 'development' }
  private get isProduction() { return process.env.NODE_ENV === 'production' }

  private safeStringify(obj: unknown): string {
    try {
      return JSON.stringify(obj)
    } catch {
      return '[Circular or non-serializable object]'
    }
  }

  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Development: Human-readable format
      const timestamp = new Date(entry.timestamp).toLocaleTimeString()
      const level = entry.level.toUpperCase().padEnd(5)
      const context = entry.context ? ` ${this.safeStringify(entry.context)}` : ''
      const request = entry.requestId ? ` [${entry.requestId}]` : ''
      const user = entry.userId ? ` (${entry.userId}:${entry.userRole ?? 'USER'})` : ''
      const path = entry.path ? ` ${entry.method ?? 'GET'} ${entry.path}` : ''
      const duration = entry.duration ? ` ${entry.duration}ms` : ''
      
      return `${timestamp} ${level}${request}${user}${path}${duration}: ${entry.message}${context}`
    } else {
      // Production: Structured JSON format
      return JSON.stringify(entry)
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4
    }

    const minLevel = process.env.LOG_LEVEL as LogLevel || 'info'
    return levels[level] >= levels[minLevel]
  }

  private log(level: LogLevel, message: string, context?: LogContext, request?: NextRequest): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    }

    // Add request context if available
    if (request) {
      entry.requestId = request.headers.get('x-request-id') ?? undefined
      entry.path = request.nextUrl?.pathname
      entry.method = request.method
      entry.userAgent = request.headers.get('user-agent') ?? undefined
      entry.ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
    }

    const formattedLog = this.formatLog(entry)

    // Output to appropriate destination
    switch (level) {
      case 'debug':
        console.debug(formattedLog)
        break
      case 'info':
        console.info(formattedLog)
        break
      case 'warn':
        console.warn(formattedLog)
        break
      case 'error':
      case 'fatal':
        console.error(formattedLog)
        break
    }

    // In production, you might want to send logs to external services
    if (this.isProduction && level === 'fatal') {
      // TODO: Send to external monitoring service (e.g., Sentry, DataDog)
      this.sendToExternalService(entry)
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // TODO: Implement external logging service integration
    // This could be Sentry, DataDog, CloudWatch, etc.
    console.error('FATAL ERROR - should be sent to external service:', entry)
  }

  // Public logging methods
  debug(message: string, context?: LogContext, request?: NextRequest): void {
    this.log('debug', message, context, request)
  }

  info(message: string, context?: LogContext, request?: NextRequest): void {
    this.log('info', message, context, request)
  }

  warn(message: string, context?: LogContext, request?: NextRequest): void {
    this.log('warn', message, context, request)
  }

  error(message: string, context?: LogContext, request?: NextRequest): void {
    this.log('error', message, context, request)
  }

  fatal(message: string, context?: LogContext, request?: NextRequest): void {
    this.log('fatal', message, context, request)
  }

  // Specialized logging methods
  request(request: NextRequest, duration: number, statusCode: number, error?: Error): void {
    const context: LogContext = {
      duration,
      statusCode,
      path: request.nextUrl?.pathname,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip')
    }

    if (error) {
      context.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as { code?: string }).code
      }
    }

    const level = error ? 'error' : 'info'
    const message = error 
      ? `Request failed: ${request.method} ${request.nextUrl?.pathname}`
      : `Request completed: ${request.method} ${request.nextUrl?.pathname}`

    this.log(level, message, context, request)
  }

  security(event: string, context?: LogContext, request?: NextRequest): void {
    const securityContext = {
      ...context,
      securityEvent: true,
      timestamp: new Date().toISOString()
    }
    
    this.warn(`Security event: ${event}`, securityContext, request)
  }

  database(operation: string, table: string, duration: number, context?: LogContext): void {
    const dbContext = {
      ...context,
      operation,
      table,
      duration,
      database: true
    }
    
    this.info(`Database operation: ${operation} on ${table}`, dbContext)
  }

  performance(operation: string, duration: number, context?: LogContext): void {
    const perfContext = {
      ...context,
      operation,
      duration,
      performance: true
    }
    
    if (duration > 1000) {
      this.warn(`Slow operation: ${operation} took ${duration}ms`, perfContext)
    } else {
      this.debug(`Operation: ${operation} took ${duration}ms`, perfContext)
    }
  }

  // User activity logging
  userActivity(userId: string, action: string, resource: string, context?: LogContext, request?: NextRequest): void {
    const activityContext = {
      ...context,
      userId,
      action,
      resource,
      userActivity: true
    }
    
    this.info(`User activity: ${userId} performed ${action} on ${resource}`, activityContext, request)
  }

  // Access control logging
  accessControl(userId: string, action: string, resource: string, allowed: boolean, context?: LogContext, request?: NextRequest): void {
    const accessContext = {
      ...context,
      userId,
      action,
      resource,
      allowed,
      accessControl: true
    }
    
    const level = allowed ? 'debug' : 'warn'
    const message = allowed 
      ? `Access granted: ${userId} can ${action} ${resource}`
      : `Access denied: ${userId} cannot ${action} ${resource}`
    
    this.log(level, message, accessContext, request)
  }
}

// Create singleton instance
export const logger = new Logger()

// Convenience functions for common logging patterns
export const log = {
  debug: (message: string, context?: LogContext, request?: NextRequest) => logger.debug(message, context, request),
  info: (message: string, context?: LogContext, request?: NextRequest) => logger.info(message, context, request),
  warn: (message: string, context?: LogContext, request?: NextRequest) => logger.warn(message, context, request),
  error: (message: string, context?: LogContext, request?: NextRequest) => logger.error(message, context, request),
  fatal: (message: string, context?: LogContext, request?: NextRequest) => logger.fatal(message, context, request),
  request: (request: NextRequest, duration: number, statusCode: number, error?: Error) => logger.request(request, duration, statusCode, error),
  security: (event: string, context?: LogContext, request?: NextRequest) => logger.security(event, context, request),
  database: (operation: string, table: string, duration: number, context?: LogContext) => logger.database(operation, table, duration, context),
  performance: (operation: string, duration: number, context?: LogContext) => logger.performance(operation, duration, context),
  userActivity: (userId: string, action: string, resource: string, context?: LogContext, request?: NextRequest) => logger.userActivity(userId, action, resource, context, request),
  accessControl: (userId: string, action: string, resource: string, allowed: boolean, context?: LogContext, request?: NextRequest) => logger.accessControl(userId, action, resource, allowed, context, request)
}
