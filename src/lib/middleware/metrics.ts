import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { recordRequest } from '../metrics'

export async function metricsMiddleware(
  request: NextRequest,
  next: () => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = performance.now()
  let response: NextResponse
  let error: Error | undefined

  try {
    response = await next()
  } catch (err) {
    error = err instanceof Error ? err : new Error('Unknown error')
    // Create error response
    response = NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }

  const endTime = performance.now()
  const duration = Math.round(endTime - startTime)

  // Record request metrics
  recordRequest(request, duration, response.status, error)

  // Add performance headers for debugging
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-Response-Time', `${duration}ms`)
    response.headers.set('X-Timestamp', new Date().toISOString())
  }

  return response
}

// Helper function to wrap API routes with metrics collection
export function withMetrics<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    return metricsMiddleware(request, () => handler(request, ...args))
  }
}

// Helper function to measure database operations
export async function measureDatabaseOperation<T>(
  operation: string,
  table: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now()
  let success = true
  let error: Error | undefined

  try {
    const result = await fn()
    return result
  } catch (err) {
    success = false
    error = err instanceof Error ? err : new Error('Database operation failed')
    throw error
  } finally {
    const duration = Math.round(performance.now() - startTime)
    const { recordDatabaseOperation } = await import('../metrics')
    recordDatabaseOperation(operation, table, duration, success, error)
  }
}

// Helper function to measure any async operation
export async function measureOperation<T>(
  operationName: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const startTime = performance.now()
  
  try {
    const result = await fn()
    const duration = Math.round(performance.now() - startTime)
    
    const { recordMetric } = await import('../metrics')
    recordMetric(`operation_duration`, duration, 'ms', {
      operation: operationName,
      success: 'true',
      ...tags
    })
    
    return result
  } catch (error) {
    const duration = Math.round(performance.now() - startTime)
    
    const { recordMetric, recordError } = await import('../metrics')
    recordMetric(`operation_duration`, duration, 'ms', {
      operation: operationName,
      success: 'false',
      ...tags
    })
    
    if (error instanceof Error) {
      recordError(error)
    }
    
    throw error
  }
}
