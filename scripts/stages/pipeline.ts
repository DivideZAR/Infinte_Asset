/* eslint-disable no-console */
import fs from 'fs-extra'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { generateHtml, validateAnimationForHtml } from './html-generator'
import { captureFrames, validateBrowser } from './browser-renderer'
import { encodeFrames } from './video-encoder'

interface FullPipelineConfig {
  width: number
  height: number
  fps: number
  duration: number
  quality: 'low' | 'medium' | 'high'
}

interface PipelineResult {
  success: boolean
  outputPath: string
  frameCount: number
  fileSize: number
  duration: number
  config: FullPipelineConfig
  tempDir: string
}

const DEFAULT_PIPELINE_CONFIG: FullPipelineConfig = {
  width: 800,
  height: 600,
  fps: 30,
  duration: 5,
  quality: 'medium',
}

class PipelineError extends Error {
  constructor(
    message: string,
    public stage?: string,
    public cause?: Error,
  ) {
    super(message)
    this.name = 'PipelineError'
  }
}

async function checkPrerequisites(): Promise<{ playwright: boolean; ffmpeg: boolean }> {
  const results = { playwright: false, ffmpeg: false }

  try {
    const playwrightResult = await validateBrowser()
    results.playwright = playwrightResult.available
    if (playwrightResult.version) {
      console.log(`Playwright: ${playwrightResult.version}`)
    }
  } catch {
    results.playwright = false
  }

  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)
    await execAsync('ffmpeg -version')
    results.ffmpeg = true
    console.log('FFmpeg: available')
  } catch {
    results.ffmpeg = false
  }

  return results
}

async function convertAnimation(
  animationDir: string,
  outputPath: string,
  config?: Partial<FullPipelineConfig>,
): Promise<PipelineResult> {
  const fullConfig = { ...DEFAULT_PIPELINE_CONFIG, ...config }

  console.log('='.repeat(50))
  console.log('React Animation to MP4 Pipeline')
  console.log('='.repeat(50))
  console.log(`Input: ${animationDir}`)
  console.log(`Output: ${outputPath}`)
  console.log(`Resolution: ${fullConfig.width}x${fullConfig.height}`)
  console.log(`FPS: ${fullConfig.fps}, Duration: ${fullConfig.duration}s`)
  console.log(`Quality: ${fullConfig.quality}`)
  console.log('='.repeat(50))

  const prereqs = await checkPrerequisites()

  if (!prereqs.playwright) {
    throw new PipelineError('Playwright is not available', 'prerequisites')
  }

  if (!prereqs.ffmpeg) {
    throw new PipelineError('FFmpeg is not available', 'prerequisites')
  }

  const tempDir = path.join(process.cwd(), 'temp', uuidv4())
  await fs.ensureDir(tempDir)

  let htmlPath: string | null = null
  let frameDir: string | null = null

  try {
    console.log('\n[Stage 1/3] Generating HTML...')

    const htmlResult = await generateHtml(animationDir, tempDir, {
      width: fullConfig.width,
      height: fullConfig.height,
      fps: fullConfig.fps,
      duration: fullConfig.duration,
    })
    htmlPath = htmlResult.htmlPath

    console.log(`HTML generated: ${htmlPath}`)

    console.log('\n[Stage 2/3] Capturing frames...')

    frameDir = path.join(tempDir, 'frames')
    const renderResult = await captureFrames(htmlPath, frameDir, {
      width: fullConfig.width,
      height: fullConfig.height,
      fps: fullConfig.fps,
      duration: fullConfig.duration,
    })

    console.log(`Frames captured: ${renderResult.frameCount}`)

    console.log('\n[Stage 3/3] Encoding video...')

    const encodeResult = await encodeFrames(renderResult.frameDir, outputPath, {
      fps: fullConfig.fps,
      quality: fullConfig.quality,
      width: fullConfig.width,
      height: fullConfig.height,
    })

    console.log('\n' + '='.repeat(50))
    console.log('Conversion Complete!')
    console.log('='.repeat(50))
    console.log(`Output: ${outputPath}`)
    console.log(`Size: ${(encodeResult.fileSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`Frames: ${encodeResult.frameCount}`)
    console.log(`Temp dir: ${tempDir}`)

    return {
      success: true,
      outputPath,
      frameCount: encodeResult.frameCount,
      fileSize: encodeResult.fileSize,
      duration: fullConfig.duration,
      config: fullConfig,
      tempDir,
    }
  } catch (error) {
    throw new PipelineError(
      `Pipeline failed: ${(error as Error).message}`,
      'pipeline',
      error as Error,
    )
  } finally {
    // await fs.remove(tempDir) // Keep temp directory for inspection
  }
}

async function testStage1(): Promise<void> {
  console.log('\n=== Testing Stage 1: HTML Generator ===\n')

  const animationDir = path.join(process.cwd(), 'animations', 'example-animation')
  const outputDir = path.join(process.cwd(), 'test-output', 'stage1')

  console.log(`Animation dir: ${animationDir}`)

  const validation = await validateAnimationForHtml(animationDir)

  console.log('Validation:', validation.valid ? 'PASS' : 'FAIL')
  if (validation.errors.length > 0) {
    console.log('Errors:', validation.errors)
  }

  if (validation.valid) {
    const result = await generateHtml(animationDir, outputDir)
    console.log(`\nGenerated: ${result.htmlPath}`)
    console.log('Stage 1: PASS')
  } else {
    console.log('Stage 1: SKIP (validation failed)')
  }
}

async function testStage2(): Promise<void> {
  console.log('\n=== Testing Stage 2: Browser Renderer ===\n')

  const htmlPath = path.join(process.cwd(), 'test-output', 'stage1', 'animation.html')

  if (!(await fs.pathExists(htmlPath))) {
    console.log('Stage 2: SKIP (run stage 1 first)')
    return
  }

  const outputDir = path.join(process.cwd(), 'test-output', 'stage2')

  console.log(`HTML: ${htmlPath}`)

  const prereqs = await checkPrerequisites()

  if (!prereqs.playwright) {
    console.log('Stage 2: SKIP (Playwright not available)')
    return
  }

  const result = await captureFrames(htmlPath, outputDir, {
    width: 800,
    height: 600,
    fps: 10,
    duration: 2,
  })

  console.log(`\nFrames captured: ${result.frameCount}`)
  console.log(`Frame dir: ${result.frameDir}`)
  console.log('Stage 2: PASS')
}

async function testStage3(): Promise<void> {
  console.log('\n=== Testing Stage 3: Video Encoder ===\n')

  const frameDir = path.join(process.cwd(), 'test-output', 'stage2', 'frames')

  if (!(await fs.pathExists(frameDir))) {
    console.log('Stage 3: SKIP (run stage 2 first)')
    return
  }

  const outputPath = path.join(process.cwd(), 'test-output', 'stage3', 'output.mp4')

  console.log(`Frame dir: ${frameDir}`)

  const result = await encodeFrames(frameDir, outputPath, {
    fps: 10,
    quality: 'medium',
  })

  console.log(`\nVideo: ${result.outputPath}`)
  console.log(`Size: ${(result.fileSize / 1024).toFixed(2)} KB`)
  console.log('Stage 3: PASS')
}

async function testAllStages(): Promise<void> {
  console.log('='.repeat(50))
  console.log('Running All Stage Tests')
  console.log('='.repeat(50))

  await fs.ensureDir(path.join(process.cwd(), 'test-output'))

  await testStage1()
  await testStage2()
  await testStage3()

  console.log('\n' + '='.repeat(50))
  console.log('All Stage Tests Complete')
  console.log('='.repeat(50))
}

export {
  convertAnimation,
  checkPrerequisites,
  testStage1,
  testStage2,
  testStage3,
  testAllStages,
  PipelineError,
  FullPipelineConfig,
  DEFAULT_PIPELINE_CONFIG,
}

const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('Usage:')
  console.log('  node pipeline.js test           - Run all stage tests')
  console.log('  node pipeline.js test 1         - Test stage 1 only')
  console.log('  node pipeline.js test 2         - Test stage 2 only')
  console.log('  node pipeline.js test 3         - Test stage 3 only')
  console.log('  node pipeline.js <anim> <out>   - Full conversion')
  console.log('')
  console.log('Full conversion options:')
  console.log('  --width <px>     Video width (default: 800)')
  console.log('  --height <px>    Video height (default: 600)')
  console.log('  --fps <num>      Frame rate (default: 30)')
  console.log('  --duration <s>   Duration (default: 5)')
  console.log('  --quality <l|m|h> Quality (default: medium)')
  process.exit(1)
}

;(async () => {
  if (args[0] === 'test') {
    const stage = args[1]

    switch (stage) {
      case '1':
        await testStage1()
        break
      case '2':
        await testStage2()
        break
      case '3':
        await testStage3()
        break
      default:
        await testAllStages()
    }
  } else {
    const animationDir = args[0]
    const outputPath = args[1]

    const options: Partial<FullPipelineConfig> = {}

    for (let i = 2; i < args.length; i += 2) {
      const key = args[i].replace(/^--/, '')
      const value = args[i + 1]

      switch (key) {
        case 'width':
        case 'height':
        case 'fps':
        case 'duration':
          options[key as keyof FullPipelineConfig] = parseInt(value, 10) as never
          break
        case 'quality':
          options.quality = value as 'low' | 'medium' | 'high'
          break
      }
    }

    await convertAnimation(animationDir, outputPath, options)
    console.log('\nDone!')
  }
})()

/* eslint-enable no-console */
