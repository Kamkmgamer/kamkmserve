import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger, log, type LogContext } from '../src/lib/logger'

// Mock console methods
const mockConsole = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}

describe('Logger System', () => {
  beforeEach(() => {
    // Mock console methods
    vi.spyOn(console, 'debug').mockImplementation(mockConsole.debug)
    vi.spyOn(console, 'info').mockImplementation(mockConsole.info)
    vi.spyOn(console, 'warn').mockImplementation(mockConsole.warn)
    vi.spyOn(console, 'error').mockImplementation(mockConsole.error)
    
    // Reset mocks
    vi.clearAllMocks()
    
    // Set environment to development for consistent testing
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('LOG_LEVEL', 'debug')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  describe('Basic Logging', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message')
      expect(mockConsole.debug).toHaveBeenCalledWith(expect.stringContaining('DEBUG'))
      expect(mockConsole.debug).toHaveBeenCalledWith(expect.stringContaining('Debug message'))
    })

    it('should log info messages', () => {
      logger.info('Info message')
      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('INFO'))
      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('Info message'))
    })

    it('should log warning messages', () => {
      logger.warn('Warning message')
      expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('WARN'))
      expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('Warning message'))
    })

    it('should log error messages', () => {
      logger.error('Error message')
      expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('ERROR'))
      expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('Error message'))
    })

    it('should log fatal messages', () => {
      logger.fatal('Fatal message')
      expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('FATAL'))
      expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('Fatal message'))
    })
  })

  describe('Context Logging', () => {
    it('should include context in logs', () => {
      const context: LogContext = { userId: '123', action: 'login' }
      logger.info('User action', context)
      
      const logCall = mockConsole.info.mock.calls[0]![0] as string
      expect(logCall).toContain('"userId":"123"')
      expect(logCall).toContain('"action":"login"')
    })

    it('should handle empty context', () => {
      logger.info('Message without context')
      expect(mockConsole.info).toHaveBeenCalledWith(expect.not.stringContaining('undefined'))
    })
  })

  describe('Log Level Filtering', () => {
    it('should respect LOG_LEVEL environment variable', () => {
      vi.stubEnv('LOG_LEVEL', 'warn')
      
      logger.debug('Debug message')
      logger.info('Info message')
      logger.warn('Warning message')
      logger.error('Error message')
      
      expect(mockConsole.debug).not.toHaveBeenCalled()
      expect(mockConsole.info).not.toHaveBeenCalled()
      expect(mockConsole.warn).toHaveBeenCalled()
      expect(mockConsole.error).toHaveBeenCalled()
    })

    it('should default to info level when LOG_LEVEL not set', () => {
      vi.unstubAllEnvs()
      vi.stubEnv('NODE_ENV', 'development')
      // LOG_LEVEL not set
      
      logger.debug('Debug message')
      logger.info('Info message')
      
      expect(mockConsole.debug).not.toHaveBeenCalled()
      expect(mockConsole.info).toHaveBeenCalled()
    })
  })

  describe('Development vs Production Formatting', () => {
    it('should use human-readable format in development', () => {
      vi.stubEnv('NODE_ENV', 'development')
      
      logger.info('Test message')
      
      const logCall = mockConsole.info.mock.calls[0]![0] as string
      // Should contain timestamp, level, and message in readable format
      expect(logCall).toMatch(/^\d{1,2}:\d{2}:\d{2} [AP]M INFO : Test message/)
    })

    it('should use JSON format in production', () => {
      vi.stubEnv('NODE_ENV', 'production')
      
      logger.info('Test message')
      
      const logCall = mockConsole.info.mock.calls[0]![0] as string
      const parsed = JSON.parse(logCall)
      
      expect(parsed).toHaveProperty('timestamp')
      expect(parsed).toHaveProperty('level', 'info')
      expect(parsed).toHaveProperty('message', 'Test message')
    })
  })

  describe('Specialized Logging Methods', () => {
    it('should log request information', () => {
      const mockRequest = {
        method: 'POST',
        nextUrl: { pathname: '/api/users' },
        headers: new Map([['user-agent', 'TestAgent']]),
        ip: '192.168.1.1'
      } as any

      logger.request(mockRequest, 150, 200)
      
      const logCall = mockConsole.info.mock.calls[0]![0] as string
      expect(logCall).toContain('POST /api/users')
      expect(logCall).toContain('200')
      // Duration is in the context part
      expect(logCall).toContain('"duration":150')
    })

    it('should log failed requests with errors', () => {
      const mockRequest = {
        method: 'GET',
        nextUrl: { pathname: '/api/orders' },
        headers: new Map(),
        ip: '192.168.1.1'
      } as any

      const error = new Error('Database connection failed')
      logger.request(mockRequest, 5000, 500, error)
      
      const logCall = mockConsole.error.mock.calls[0]![0] as string
      expect(logCall).toContain('Request failed')
      expect(logCall).toContain('Database connection failed')
    })

    it('should log security events', () => {
      logger.security('Failed login attempt', { ip: '192.168.1.1', attempts: 5 })
      
      const logCall = mockConsole.warn.mock.calls[0]![0] as string
      expect(logCall).toContain('Security event: Failed login attempt')
      expect(logCall).toContain('"securityEvent":true')
    })

    it('should log database operations', () => {
      logger.database('SELECT', 'users', 25)
      
      const logCall = mockConsole.info.mock.calls[0]![0] as string
      expect(logCall).toContain('Database operation: SELECT on users')
      expect(logCall).toContain('"duration":25')
    })

    it('should log performance metrics', () => {
      logger.performance('Database query', 1500)
      
      const logCall = mockConsole.warn.mock.calls[0]![0] as string
      expect(logCall).toContain('Slow operation: Database query took 1500ms')
    })

    it('should log fast operations at debug level', () => {
      logger.performance('Cache lookup', 5)
      
      const logCall = mockConsole.debug.mock.calls[0]![0] as string
      expect(logCall).toContain('Operation: Cache lookup took 5ms')
    })

    it('should log user activity', () => {
      logger.userActivity('user-123', 'create', 'order')
      
      const logCall = mockConsole.info.mock.calls[0]![0] as string
      expect(logCall).toContain('User activity: user-123 performed create on order')
      expect(logCall).toContain('"userActivity":true')
    })

    it('should log access control decisions', () => {
      logger.accessControl('user-123', 'read', 'order-456', true)
      
      const logCall = mockConsole.debug.mock.calls[0]![0] as string
      expect(logCall).toContain('Access granted: user-123 can read order-456')
    })

    it('should log denied access at warn level', () => {
      logger.accessControl('user-123', 'delete', 'order-456', false)
      
      const logCall = mockConsole.warn.mock.calls[0]![0] as string
      expect(logCall).toContain('Access denied: user-123 cannot delete order-456')
    })
  })

  describe('Convenience Functions', () => {
    it('should provide convenience logging functions', () => {
      log.info('Convenience message')
      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('Convenience message'))
    })

    it('should handle all convenience function types', () => {
      const context: LogContext = { test: true }
      
      log.debug('debug', context)
      log.info('info', context)
      log.warn('warn', context)
      log.error('error', context)
      log.fatal('fatal', context)
      
      expect(mockConsole.debug).toHaveBeenCalled()
      expect(mockConsole.info).toHaveBeenCalled()
      expect(mockConsole.warn).toHaveBeenCalled()
      expect(mockConsole.error).toHaveBeenCalledTimes(2) // error + fatal
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined context gracefully', () => {
      expect(() => {
        logger.info('Message', undefined)
      }).not.toThrow()
    })

    it('should handle null context gracefully', () => {
      expect(() => {
        logger.info('Message', null as any)
      }).not.toThrow()
    })

    it('should handle complex context objects', () => {
      const complexContext: LogContext = {
        nested: { value: 'test' },
        array: [1, 2, 3],
        boolean: true,
        number: 42
      }
      
      expect(() => {
        logger.info('Complex context', complexContext)
      }).not.toThrow()
    })

    it('should handle circular references in context', () => {
      const circular: any = { name: 'test' }
      circular.self = circular
      
      expect(() => {
        logger.info('Circular reference', circular)
      }).not.toThrow()
    })
  })

  describe('Production Environment', () => {
    it('should send fatal errors to external service in production', () => {
      vi.stubEnv('NODE_ENV', 'production')
      
      // Mock the private method
      const mockSendToExternalService = vi.fn()
      Object.defineProperty(logger, 'sendToExternalService', {
        value: mockSendToExternalService,
        writable: true
      })
      
      logger.fatal('Critical error')
      
      expect(mockSendToExternalService).toHaveBeenCalled()
    })

    it('should not send non-fatal errors to external service', () => {
      vi.stubEnv('NODE_ENV', 'production')
      
      const mockSendToExternalService = vi.fn()
      Object.defineProperty(logger, 'sendToExternalService', {
        value: mockSendToExternalService,
        writable: true
      })
      
      logger.error('Non-critical error')
      
      expect(mockSendToExternalService).not.toHaveBeenCalled()
    })
  })
})
