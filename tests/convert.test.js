import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { describe, it, expect } from '@jest/globals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import {
  convertAnimation,
  validateSource,
  ConversionError,
  ValidationError,
} from '../scripts/convert'

describe('AnimationConverter', () => {
  const testAnimationDir = path.join(__dirname, 'fixtures', 'valid-animation')
  const testOutputPath = path.join(__dirname, 'output', 'test.mp4')

  describe('validateSource', () => {
    it('should throw ValidationError for non-existent directory', async () => {
      await expect(validateSource('/non/existent')).rejects.toThrow(ValidationError)
    })
  })

  describe('convertAnimation', () => {
    it('should throw ValidationError when validation fails', async () => {
      await expect(convertAnimation('/invalid', testOutputPath)).rejects.toThrow(ValidationError)
    })
  })

  describe('ConversionError', () => {
    it('should create error with message and cause', () => {
      const originalError = new Error('Original error')
      const error = new ConversionError('Conversion failed', originalError)

      expect(error.message).toBe('Conversion failed')
      expect(error.name).toBe('ConversionError')
      expect(error.cause).toBe(originalError)
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
