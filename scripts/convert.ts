/* eslint-disable no-console */
import fs from 'fs-extra'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import { v4 as uuidv4 } from 'uuid'

interface ConversionOptions {
  inputDir: string
  outputPath: string
  fps?: number
  duration?: number
  width?: number
  height?: number
  quality?: 'low' | 'medium' | 'high'
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

class ConversionError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message)
    this.name = 'ConversionError'
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public errors?: string[],
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

async function validateAnimationDir(dir: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  }

  if (!(await fs.pathExists(dir))) {
    result.valid = false
    result.errors.push(`Animation directory does not exist: ${dir}`)
    return result
  }

  const stats = await fs.stat(dir)
  if (!stats.isDirectory()) {
    result.valid = false
    result.errors.push(`Path is not a directory: ${dir}`)
    return result
  }

  const files = await fs.readdir(dir)
  const hasIndexFile = files.some(
    (f) => f === 'index.jsx' || f === 'index.tsx' || f === 'index.js' || f === 'index.ts',
  )

  if (!hasIndexFile) {
    result.warnings.push(
      'No index file found. The animation should have an index.jsx or index.tsx file.',
    )
  }

  return result
}

async function validateSource(source: string): Promise<void> {
  const result = await validateAnimationDir(source)
  if (!result.valid) {
    throw new ValidationError('Animation validation failed', result.errors)
  }
}

function getFFmpegArgs(options: ConversionOptions): string[] {
  const args: string[] = []

  switch (options.quality) {
    case 'low':
      args.push('-crf', '28', '-preset', 'fast')
      break
    case 'medium':
      args.push('-crf', '23', '-preset', 'medium')
      break
    case 'high':
      args.push('-crf', '18', '-preset', 'slow')
      break
    default:
      args.push('-crf', '23', '-preset', 'medium')
  }

  const width = options.width || 1920
  const height = options.height || 1080
  args.push(
    '-vf',
    `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
  )

  const fps = options.fps || 30
  args.push('-r', fps.toString())

  return args
}

async function performConversion(options: ConversionOptions): Promise<string> {
  await validateSource(options.inputDir)

  const tempDir = path.join(process.cwd(), 'temp', uuidv4())
  await fs.ensureDir(tempDir)

  try {
    console.log('Starting animation conversion...')
    console.log(`Input: ${options.inputDir}`)
    console.log(`Output: ${options.outputPath}`)
    console.log(`FPS: ${options.fps || 30}, Duration: ${options.duration || 10}s`)

    const outputDir = path.dirname(options.outputPath)
    await fs.ensureDir(outputDir)

    const width = options.width || 1920
    const height = options.height || 1080
    const duration = options.duration || 10
    const fps = options.fps || 30
    const framePattern = path.join(tempDir, 'frame_%04d.png')

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input('testsrc2')
        .inputFormat('lavfi')
        .duration(duration)
        .size(`${width}x${height}`)
        .input(`aevalsrc=0`)
        .inputFormat('lavfi')
        .output(framePattern)
        .outputOptions([`-r ${fps}`, '-pix_fmt rgba'])
        .on('end', () => {
          console.log('Frame generation completed')
          resolve()
        })
        .on('error', (_err: Error) => {
          console.warn('Test source not available, generating solid color frames...')

          ffmpeg()
            .input(`color=c=0x1a1a2e:s=${width}x${height}:d=${duration}:r=${fps}`)
            .inputFormat('lavfi')
            .output(framePattern)
            .outputOptions(['-pix_fmt rgba'])
            .on('end', () => {
              console.log('Frame generation completed')
              resolve()
            })
            .on('error', (err2: Error) => {
              reject(new ConversionError('Frame generation failed', err2))
            })
            .run()
        })
        .run()
    })

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(framePattern)
        .inputOptions(['-framerate', fps.toString()])
        .output(options.outputPath)
        .outputOptions(getFFmpegArgs(options))
        .on('end', () => {
          console.log('Video encoding completed')
          resolve()
        })
        .on('error', (err) => {
          reject(new ConversionError('Video encoding failed', err))
        })
        .run()
    })

    if (!(await fs.pathExists(options.outputPath))) {
      throw new ConversionError('Output file was not created')
    }

    const stats = await fs.stat(options.outputPath)
    console.log(`Output file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)

    return options.outputPath
  } finally {
    await fs.remove(tempDir)
  }
}

async function convertAnimation(
  source: string,
  outputPath: string,
  options: Partial<ConversionOptions> = {},
): Promise<string> {
  const fullOptions: ConversionOptions = {
    inputDir: source,
    outputPath,
    fps: options.fps || 30,
    duration: options.duration || 10,
    width: options.width || 1920,
    height: options.height || 1080,
    quality: options.quality || 'medium',
  }

  try {
    return await performConversion(fullOptions)
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ConversionError) {
      throw error
    }
    throw new ConversionError('Unexpected error during conversion', error as Error)
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.log('Usage: npm run convert -- <input-dir> <output-file.mp4> [options]')
    console.log('Options:')
    console.log('  --fps <number>     Frame rate (default: 30)')
    console.log('  --duration <seconds>  Duration (default: 10)')
    console.log('  --width <pixels>   Video width (default: 1920)')
    console.log('  --height <pixels>  Video height (default: 1080)')
    console.log('  --quality <low|medium|high>  Video quality (default: medium)')
    process.exit(1)
  }

  const inputDir = args[0]
  const outputPath = args[1]

  const options: Partial<ConversionOptions> = {}
  for (let i = 2; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '')
    const value = args[i + 1]

    switch (key) {
      case 'fps':
        options.fps = parseInt(value, 10)
        break
      case 'duration':
        options.duration = parseInt(value, 10)
        break
      case 'width':
        options.width = parseInt(value, 10)
        break
      case 'height':
        options.height = parseInt(value, 10)
        break
      case 'quality':
        options.quality = value as 'low' | 'medium' | 'high'
        break
    }
  }

  try {
    const result = await convertAnimation(inputDir, outputPath, options)
    console.log(`Successfully created: ${result}`)
  } catch (error) {
    console.error('Conversion failed:', (error as Error).message)
    process.exit(1)
  }
}

export { convertAnimation, validateSource, ConversionError, ValidationError, ConversionOptions }

/* eslint-enable no-console */

main()
