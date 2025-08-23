import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getMetricsSummary, getMetricsForExport, getHealthStatus } from '~/lib/metrics'
import { getCurrentUserRole } from '~/server/auth/roles'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Check if user has admin access for detailed metrics
  const authResult = await getCurrentUserRole()
  const isAdmin = authResult.ok && (authResult.role === 'ADMIN' || authResult.role === 'SUPERADMIN')

  // Get query parameters
  const { searchParams } = request.nextUrl
  const format = searchParams.get('format') ?? 'summary'
  const timeWindow = parseInt(searchParams.get('window') ?? '300000') // Default 5 minutes

  try {
    switch (format) {
      case 'health':
        // Health status is available to everyone for monitoring systems
        const healthStatus = getHealthStatus()
        return NextResponse.json({
          status: healthStatus.status,
          timestamp: new Date().toISOString(),
          metrics: healthStatus.metrics,
          issues: healthStatus.issues
        })

      case 'summary':
        // Summary metrics require admin access
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Unauthorized - Admin access required' },
            { status: 403 }
          )
        }

        const summary = getMetricsSummary(timeWindow)
        return NextResponse.json({
          timestamp: new Date().toISOString(),
          timeWindow,
          ...summary
        })

      case 'full':
        // Full metrics export requires admin access
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Unauthorized - Admin access required' },
            { status: 403 }
          )
        }

        const fullMetrics = getMetricsForExport()
        return NextResponse.json({
          timestamp: new Date().toISOString(),
          ...fullMetrics
        })

      case 'prometheus':
        // Prometheus format for external monitoring (admin only)
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Unauthorized - Admin access required' },
            { status: 403 }
          )
        }

        const prometheusMetrics = generatePrometheusFormat()
        return new NextResponse(prometheusMetrics, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8'
          }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid format. Use: health, summary, full, or prometheus' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generatePrometheusFormat(): string {
  const summary = getMetricsSummary()
  const systemMetrics = summary.system
  
  const lines: string[] = []
  
  // System metrics
  lines.push('# HELP nodejs_memory_usage_bytes Node.js memory usage in bytes')
  lines.push('# TYPE nodejs_memory_usage_bytes gauge')
  lines.push(`nodejs_memory_usage_bytes{type="used"} ${systemMetrics.memory.used}`)
  lines.push(`nodejs_memory_usage_bytes{type="total"} ${systemMetrics.memory.total}`)
  
  lines.push('# HELP nodejs_memory_usage_percentage Node.js memory usage percentage')
  lines.push('# TYPE nodejs_memory_usage_percentage gauge')
  lines.push(`nodejs_memory_usage_percentage ${systemMetrics.memory.percentage}`)
  
  lines.push('# HELP nodejs_uptime_seconds Node.js uptime in seconds')
  lines.push('# TYPE nodejs_uptime_seconds counter')
  lines.push(`nodejs_uptime_seconds ${systemMetrics.uptime}`)
  
  // Request metrics
  lines.push('# HELP http_requests_total Total number of HTTP requests')
  lines.push('# TYPE http_requests_total counter')
  lines.push(`http_requests_total ${summary.requests.total}`)
  
  lines.push('# HELP http_request_duration_ms Average HTTP request duration in milliseconds')
  lines.push('# TYPE http_request_duration_ms gauge')
  lines.push(`http_request_duration_ms ${summary.requests.avgDuration}`)
  
  lines.push('# HELP http_request_error_rate HTTP request error rate percentage')
  lines.push('# TYPE http_request_error_rate gauge')
  lines.push(`http_request_error_rate ${summary.requests.errorRate}`)
  
  lines.push('# HELP http_slow_requests_total Total number of slow HTTP requests')
  lines.push('# TYPE http_slow_requests_total counter')
  lines.push(`http_slow_requests_total ${summary.requests.slowRequests}`)
  
  // Error metrics
  summary.errors.forEach(error => {
    const sanitizedType = error.type.replace(/[^a-zA-Z0-9_]/g, '_')
    lines.push(`# HELP error_${sanitizedType}_total Total number of ${error.type} errors`)
    lines.push(`# TYPE error_${sanitizedType}_total counter`)
    lines.push(`error_${sanitizedType}_total ${error.count}`)
  })
  
  return lines.join('\n') + '\n'
}
