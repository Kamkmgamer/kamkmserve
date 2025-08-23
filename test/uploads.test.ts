import { describe, it, expect, vi } from 'vitest'
import { validateUpload, type UploadFile } from '../src/lib/uploads'

describe('validateUpload', () => {
  const createMockFile = (buffer: Buffer, filename: string, mimetype?: string, size?: number): UploadFile => ({
    buffer,
    filename,
    mimetype,
    size,
  })

  describe('file buffer validation', () => {
    it('should reject invalid file buffer', async () => {
      const result = await validateUpload({
        buffer: null as any,
        filename: 'test.png',
      })
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Invalid file buffer')
    })

    it('should reject non-buffer data', async () => {
      const result = await validateUpload({
        buffer: 'not-a-buffer' as any,
        filename: 'test.png',
      })
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Invalid file buffer')
    })
  })

  describe('file size validation', () => {
    it('should reject files exceeding default size limit', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024) // 11MB
      const result = await validateUpload(
        createMockFile(largeBuffer, 'large.png', 'image/png')
      )
      expect(result.ok).toBe(false)
      expect(result.error).toBe('File too large. Max 10485760 bytes')
    })

    it('should accept files within custom size limit', async () => {
      const buffer = Buffer.alloc(5 * 1024 * 1024) // 5MB
      const result = await validateUpload(
        createMockFile(buffer, 'test.png', 'image/png'),
        { maxBytes: 10 * 1024 * 1024 } // 10MB limit
      )
      expect(result.ok).toBe(true)
    })

    it('should use provided size when available', async () => {
      const buffer = Buffer.alloc(100)
      const result = await validateUpload(
        createMockFile(buffer, 'test.png', 'image/png', 15 * 1024 * 1024) // 15MB size
      )
      expect(result.ok).toBe(false)
      expect(result.error).toBe('File too large. Max 10485760 bytes')
    })
  })

  describe('file extension validation', () => {
    it('should accept allowed file extensions', async () => {
      const extensions = ['.png', '.jpg', '.jpeg', '.webp', '.pdf']
      const mimeTypes = ['image/png', 'image/jpeg', 'image/jpeg', 'image/webp', 'application/pdf']
      
      for (let i = 0; i < extensions.length; i++) {
        const ext = extensions[i]
        const mime = mimeTypes[i]
        const buffer = Buffer.alloc(100)
        const result = await validateUpload(
          createMockFile(buffer, `test${ext}`, mime)
        )
        expect(result.ok).toBe(true)
        expect(result.ext).toBe(ext)
      }
    })

    it('should reject disallowed file extensions', async () => {
      const disallowedExtensions = ['.exe', '.bat', '.sh', '.js', '.html']
      
      for (const ext of disallowedExtensions) {
        const buffer = Buffer.alloc(100)
        const result = await validateUpload(
          createMockFile(buffer, `test${ext}`)
        )
        expect(result.ok).toBe(false)
        expect(result.error).toBe(`File extension not allowed: ${ext}`)
      }
    })

    it('should handle files without extensions', async () => {
      const buffer = Buffer.alloc(100)
      const result = await validateUpload(
        createMockFile(buffer, 'noextension')
      )
      expect(result.ok).toBe(false)
      expect(result.error).toBe('File extension not allowed: (none)')
    })

    it('should accept custom allowed extensions', async () => {
      const buffer = Buffer.alloc(100)
      const result = await validateUpload(
        createMockFile(buffer, 'test.txt', 'text/plain'),
        { allowedExt: ['.txt', '.md'], allowedMime: ['text/plain', 'text/markdown'] }
      )
      expect(result.ok).toBe(true)
      expect(result.ext).toBe('.txt')
    })
  })

  describe('MIME type validation', () => {
    it('should detect PNG files by magic numbers', async () => {
      // PNG magic numbers: 89 50 4E 47 0D 0A 1A 0A
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, ...Buffer.alloc(100)])
      const result = await validateUpload(
        createMockFile(pngBuffer, 'test.png')
      )
      expect(result.ok).toBe(true)
      expect(result.mime).toBe('image/png')
    })

    it('should detect JPEG files by magic numbers', async () => {
      // JPEG magic numbers: FF D8 FF
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, ...Buffer.alloc(100)])
      const result = await validateUpload(
        createMockFile(jpegBuffer, 'test.jpg')
      )
      expect(result.ok).toBe(true)
      expect(result.mime).toBe('image/jpeg')
    })

    it('should detect WEBP files by magic numbers', async () => {
      // WEBP magic numbers: RIFF....WEBP
      const webpBuffer = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x00, 0x00, 0x00, 0x00, // size (4 bytes)
        0x57, 0x45, 0x42, 0x50, // WEBP
        ...Buffer.alloc(100)
      ])
      const result = await validateUpload(
        createMockFile(webpBuffer, 'test.webp')
      )
      expect(result.ok).toBe(true)
      expect(result.mime).toBe('image/webp')
    })

    it('should detect PDF files by magic numbers', async () => {
      // PDF magic numbers: 25 50 44 46 2D ('%PDF-')
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, ...Buffer.alloc(100)])
      const result = await validateUpload(
        createMockFile(pdfBuffer, 'test.pdf')
      )
      expect(result.ok).toBe(true)
      expect(result.mime).toBe('application/pdf')
    })

    it('should use provided MIME type when magic number detection fails', async () => {
      const buffer = Buffer.alloc(100)
      const result = await validateUpload(
        createMockFile(buffer, 'test.png', 'image/png')
      )
      expect(result.ok).toBe(true)
      expect(result.mime).toBe('image/png')
    })

    it('should reject files with disallowed MIME types', async () => {
      const buffer = Buffer.alloc(100)
      const result = await validateUpload(
        createMockFile(buffer, 'test.png', 'application/javascript')
      )
      expect(result.ok).toBe(false)
      expect(result.error).toBe('MIME not allowed: application/javascript')
    })

    it('should accept custom allowed MIME types', async () => {
      const buffer = Buffer.alloc(100)
      const result = await validateUpload(
        createMockFile(buffer, 'test.txt', 'text/plain'),
        { allowedExt: ['.txt', '.md'], allowedMime: ['text/plain', 'text/markdown'] }
      )
      expect(result.ok).toBe(true)
      expect(result.mime).toBe('text/plain')
    })
  })

  describe('malware scanning', () => {
    it('should pass when malware scan succeeds', async () => {
      const buffer = Buffer.alloc(100)
      const mockScan = vi.fn().mockResolvedValue({ ok: true })
      
      const result = await validateUpload(
        createMockFile(buffer, 'test.png', 'image/png'),
        { scan: mockScan }
      )
      
      expect(result.ok).toBe(true)
      expect(mockScan).toHaveBeenCalledWith(buffer)
    })

    it('should reject when malware scan fails', async () => {
      const buffer = Buffer.alloc(100)
      const mockScan = vi.fn().mockResolvedValue({ 
        ok: false, 
        reason: 'Suspicious content detected' 
      })
      
      const result = await validateUpload(
        createMockFile(buffer, 'test.png', 'image/png'),
        { scan: mockScan }
      )
      
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Malware scan failed: Suspicious content detected')
    })

    it('should reject when malware scan fails without reason', async () => {
      const buffer = Buffer.alloc(100)
      const mockScan = vi.fn().mockResolvedValue({ ok: false })
      
      const result = await validateUpload(
        createMockFile(buffer, 'test.png', 'image/png'),
        { scan: mockScan }
      )
      
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Malware scan failed')
    })
  })

  describe('integration scenarios', () => {
    it('should validate a complete valid file', async () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, ...Buffer.alloc(100)])
      const mockScan = vi.fn().mockResolvedValue({ ok: true })
      
      const result = await validateUpload(
        createMockFile(pngBuffer, 'valid.png', 'image/png', 1000),
        { 
          maxBytes: 1024 * 1024, // 1MB
          scan: mockScan 
        }
      )
      
      expect(result.ok).toBe(true)
      expect(result.mime).toBe('image/png')
      expect(result.ext).toBe('.png')
      expect(result.bytes).toBe(1000)
      expect(mockScan).toHaveBeenCalledWith(pngBuffer)
    })

    it('should handle case-insensitive validation', async () => {
      const buffer = Buffer.alloc(100)
      
      // Test uppercase extensions
      const result1 = await validateUpload(
        createMockFile(buffer, 'test.PNG', 'image/png')
      )
      expect(result1.ok).toBe(true)
      
      // Test uppercase MIME types
      const result2 = await validateUpload(
        createMockFile(buffer, 'test.png', 'IMAGE/PNG')
      )
      expect(result2.ok).toBe(true)
    })
  })
})
