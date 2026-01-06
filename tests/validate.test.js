import path from 'path'
import { jest, describe, it, expect } from '@jest/globals'
import { validateAnimationDir, ValidationError, ValidationOptions } from '../scripts/validate.ts'

describe('AnimationValidator', () => {
  const testAnimationDir = path.join(__dirname, 'fixtures', 'test-animation')

  describe('validateAnimationDir', () => {
    it('should return invalid result for non-existent directory', async () => {
      const result = await validateAnimationDir('/non/existent')
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should return invalid result for non-directory path', async () => {
      const result = await validateAnimationDir('/some/file.jsx')
      
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('not a directory'))).toBe(true)
    })

    it('should handle validation options', async () => {
      const options: ValidationOptions = {
        checkSyntax: true,
        checkImports: true,
        checkDependencies: true
      }
      
      const result = await validateAnimationDir(testAnimationDir, options)
      
      expect(result).toBeDefined()
    })
  })

  describe('ValidationError', () => {
    it('should create error with message and errors array', () => {
      const errors = ['Error 1', 'Error 2']
      const error = new ValidationError('Validation failed', errors)
      
      expect(error.message).toBe('Validation failed')
      expect(error.name).toBe('ValidationError')
      expect(error.errors).toEqual(errors)
    })
  })
})
