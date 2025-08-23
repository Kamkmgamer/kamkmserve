import type { NextRequest } from 'next/server'
import { log } from './logger'

export interface MetricData {
  name: string
  value: number
  unit: string
  timestamp: number
  tags?: Record<string, string>
}

export interface RequestMetrics {
  path: string
  method: string
  statusCode: number
  duration: number
  timestamp: number
  userAgent?: string
  ip?: string
  userId?: string
  error?: string
}

export interface SystemMetrics {
  timestamp: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  cpu?: {
    percentage: number
  }
  uptime: number
}

export interface DatabaseMetrics {
  operation: string
  table: string
  duration: number
  success: boolean
  timestamp: number
  error?: string
}

export interface ErrorMetrics {
  type: string
  message: string
  stack?: string
  path?: string
  method?: string
  userId?: string
  timestamp: number
  count: number
}

class MetricsCollector {
  private metrics: MetricData[] = []
  private requestMetrics: RequestMetrics[] = []
  private errorCounts = new Map<string, number>()
  private readonly maxStoredMetrics = 1000
  private readonly maxStoredRequests = 500

  // System metrics collection
  getSystemMetrics(): SystemMetrics {
    const memoryUsage = process.memoryUsage()
    
    return {
      timestamp: Date.now(),
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      },
      uptime: process.uptime()
    }
  }

  // Record a custom metric
  recordMetric(name: string, value: number, unit = 'count', tags?: Record<string, string>): void {
    const metric: MetricData = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags
    }

    this.metrics.push(metric)
    
    // Keep only recent metrics to prevent memory leaks
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics = this.metrics.slice(-this.maxStoredMetrics)
    }

    // Log significant metrics
    if (this.shouldLogMetric(name, value, unit)) {
      log.info(`Metric recorded: ${name}`, { 
        value, 
        unit, 
        tags,
        metric: true 
      })
    }
  }

  // Record request metrics
  recordRequest(request: NextRequest, duration: number, statusCode: number, error?: Error): void {
    const requestMetric: RequestMetrics = {
      path: request.nextUrl?.pathname || 'unknown',
      method: request.method,
      statusCode,
      duration,
      timestamp: Date.now(),
      userAgent: request.headers.get('user-agent') ?? undefined,
      ip: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined,
      error: error?.message
    }

    this.requestMetrics.push(requestMetric)
    
    // Keep only recent requests
    if (this.requestMetrics.length > this.maxStoredRequests) {
      this.requestMetrics = this.requestMetrics.slice(-this.maxStoredRequests)
    }

    // Record performance metrics
    this.recordMetric('http_request_duration', duration, 'ms', {
      method: request.method,
      path: request.nextUrl?.pathname || 'unknown',
      status: statusCode.toString()
    })

    this.recordMetric('http_request_count', 1, 'count', {
      method: request.method,
      path: request.nextUrl?.pathname || 'unknown',
      status: statusCode.toString()
    })

    // Log slow requests
    if (duration > 1000) {
      log.warn(`Slow request detected: ${request.method} ${request.nextUrl?.pathname}`, {
        duration,
        statusCode,
        slowRequest: true
      })
    }

    // Log errors
    if (error) {
      this.recordError(error, request)
    }
  }

  // Record database operation metrics
  recordDatabaseOperation(operation: string, table: string, duration: number, success: boolean, error?: Error): void {

    this.recordMetric('db_operation_duration', duration, 'ms', {
      operation,
      table,
      success: success.toString()
    })

    this.recordMetric('db_operation_count', 1, 'count', {
      operation,
      table,
      success: success.toString()
    })

    // Log slow database operations
    if (duration > 500) {
      log.warn(`Slow database operation: ${operation} on ${table}`, {
        duration,
        success,
        error: error?.message,
        slowDbOperation: true
      })
    }

    // Log database errors
    if (error) {
      log.error(`Database operation failed: ${operation} on ${table}`, {
        duration,
        error: error.message,
        stack: error.stack,
        dbError: true
      })
    }
  }

  // Record error metrics
  recordError(error: Error, request?: NextRequest): void {
    const errorKey = `${error.name}:${error.message}`
    const currentCount = this.errorCounts.get(errorKey) ?? 0
    this.errorCounts.set(errorKey, currentCount + 1)

    // Track error for metrics

    this.recordMetric('error_count', 1, 'count', {
      type: error.name,
      path: request?.nextUrl?.pathname ?? 'unknown'
    })

    // Log errors with security context
    log.security(`Error occurred: ${error.name}`, {
      message: error.message,
      stack: error.stack,
      path: request?.nextUrl?.pathname,
      method: request?.method,
      count: currentCount + 1,
      errorTracking: true
    }, request)
  }

  // Get metrics summary
  getMetricsSummary(timeWindowMs = 300000): { // Default 5 minutes
    requests: {
      total: number
      avgDuration: number
      errorRate: number
      slowRequests: number
    }
    system: SystemMetrics
    errors: { type: string; count: number }[]
  } {
    const now = Date.now()
    const recentRequests = this.requestMetrics.filter(r => now - r.timestamp < timeWindowMs)
    
    const totalRequests = recentRequests.length
    const errorRequests = recentRequests.filter(r => r.statusCode >= 400).length
    const slowRequests = recentRequests.filter(r => r.duration > 1000).length
    const avgDuration = totalRequests > 0 
      ? recentRequests.reduce((sum, r) => sum + r.duration, 0) / totalRequests 
      : 0

    const errorSummary = Array.from(this.errorCounts.entries())
      .map(([key, count]) => {
        const [type] = key.split(':')
        return { type: type ?? 'Unknown', count }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 errors

    return {
      requests: {
        total: totalRequests,
        avgDuration: Math.round(avgDuration),
        errorRate: totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0,
        slowRequests
      },
      system: this.getSystemMetrics(),
      errors: errorSummary
    }
  }

  // Get all metrics (for export/monitoring)
  getAllMetrics(): {
    metrics: MetricData[]
    requests: RequestMetrics[]
    system: SystemMetrics
  } {
    return {
      metrics: [...this.metrics],
      requests: [...this.requestMetrics],
      system: this.getSystemMetrics()
    }
  }

  // Clear old metrics (for memory management)
  clearOldMetrics(maxAgeMs = 3600000): void { // Default 1 hour
    const cutoff = Date.now() - maxAgeMs
    
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff)
    this.requestMetrics = this.requestMetrics.filter(r => r.timestamp > cutoff)
    
    // Clear error counts periodically
    if (Math.random() < 0.1) { // 10% chance to clear on each call
      this.errorCounts.clear()
    }
  }

  // Reset all metrics (for testing)
  reset(): void {
    this.metrics = []
    this.requestMetrics = []
    this.errorCounts.clear()
  }

  // Health check for metrics system
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical'
    metrics: {
      memoryUsage: number
      errorRate: number
      avgResponseTime: number
    }
    issues: string[]
  } {
    const summary = this.getMetricsSummary()
    const issues: string[] = []
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'

    // Check memory usage
    if (summary.system.memory.percentage > 90) {
      issues.push('High memory usage')
      status = 'critical'
    } else if (summary.system.memory.percentage > 75) {
      issues.push('Elevated memory usage')
      if (status === 'healthy') status = 'warning'
    }

    // Check error rate
    if (summary.requests.errorRate > 10) {
      issues.push('High error rate')
      status = 'critical'
    } else if (summary.requests.errorRate > 5) {
      issues.push('Elevated error rate')
      if (status === 'healthy') status = 'warning'
    }

    // Check response time
    if (summary.requests.avgDuration > 2000) {
      issues.push('High response time')
      status = 'critical'
    } else if (summary.requests.avgDuration > 1000) {
      issues.push('Elevated response time')
      if (status === 'healthy') status = 'warning'
    }

    return {
      status,
      metrics: {
        memoryUsage: summary.system.memory.percentage,
        errorRate: summary.requests.errorRate,
        avgResponseTime: summary.requests.avgDuration
      },
      issues
    }
  }

  private shouldLogMetric(name: string, value: number, unit: string): boolean {
    // Log significant events
    if (name.includes('error') || name.includes('failure')) return true
    if (unit === 'ms' && value > 1000) return true // Slow operations
    if (name.includes('memory') && value > 75) return true // High memory usage
    return false
  }
}

// Create singleton instance
export const metrics = new MetricsCollector()

// Convenience functions
export const recordMetric = (name: string, value: number, unit?: string, tags?: Record<string, string>) => 
  metrics.recordMetric(name, value, unit, tags)

export const recordRequest = (request: NextRequest, duration: number, statusCode: number, error?: Error) =>
  metrics.recordRequest(request, duration, statusCode, error)

export const recordDatabaseOperation = (operation: string, table: string, duration: number, success: boolean, error?: Error) =>
  metrics.recordDatabaseOperation(operation, table, duration, success, error)

export const recordError = (error: Error, request?: NextRequest) =>
  metrics.recordError(error, request)

// Periodic cleanup (call this from a scheduled job)
export const cleanupMetrics = () => metrics.clearOldMetrics()

// Reset metrics (for testing)
export const resetMetrics = () => metrics.reset()

// Export metrics for monitoring systems
export const getMetricsForExport = () => metrics.getAllMetrics()

// Get health status
export const getHealthStatus = () => metrics.getHealthStatus()

// Get summary for dashboards
export const getMetricsSummary = (timeWindowMs?: number) => metrics.getMetricsSummary(timeWindowMs)
