import fs from 'fs-extra'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'

interface EncoderConfig {
  fps: number
  quality: 'low' | 'medium' | 'high'
  width?: number
  height?: number
}

interface EncodeResult {
  outputPath: string
  frameCount: number
  fileSize: number
}

const DEFAULT_CONFIG: EncoderConfig = {
  fps: 30,
  quality: 'medium'
}

function getQualityArgs(quality: EncoderConfig['quality']): string[] {
  switch (quality) {
    case 'low':
      return ['-crf', '28', '-preset', 'fast']
    case 'high':
      return ['-crf', '18', '-preset', 'slow']
    case 'medium':
    default:
      return ['-crf', '23', '-preset', 'medium']
  }
}

async function getFrameCount(frameDir: string): Promise<number> {
  const files = await fs.readdir(frameDir)
  const pngFiles = files.filter(f => f.startsWith('frame_') && f.endsWith('.png'))
  return pngFiles.length
}

async function getFrameSize(frameDir: string): Promise<{ width: number; height: number } | null> {
  const files = await fs.readdir(frameDir)
  const firstFrame = files.find(f => f.startsWith('frame_') && f.endsWith('.png'))
  
  if (!firstFrame) return null
  
  const { imageSize } = await import('image-size')
  
  try {
    const dimensions = imageSize(path.join(frameDir, firstFrame))
    return { width: dimensions.width || 0, height: dimensions.height || 0 }
  } catch {
    return null
  }
}

async function encodeFrames(
  frameDir: string,
  outputPath: string,
  config?: Partial<EncoderConfig>
): Promise<EncodeResult> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }
  
  const outputDir = path.dirname(outputPath)
  await fs.ensureDir(outputDir)
  
  const frameCount = await getFrameCount(frameDir)
  
  if (frameCount === 0) {
    throw new Error('No frames found in directory')
  }
  
  console.log(`Encoding ${frameCount} frames to video...`)
  
  const framePattern = path.join(frameDir, 'frame_%04d.png')
  const frameSize = await getFrameSize(frameDir)
  
  let width = fullConfig.width
  let height = fullConfig.height
  
  if (!width && !height && frameSize) {
    width = frameSize.width
    height = frameSize.height
  }
  
  return new Promise((resolve, reject) => {
    const command = ffmpeg()
      .input(framePattern)
      .inputOptions([
        '-framerate', fullConfig.fps.toString()
      ])
      .output(outputPath)
    
    if (width && height) {
      command.outputOptions([
        '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`
      ])
    }
    
    command.outputOptions(getQualityArgs(fullConfig.quality))
    
    command
      .on('start', (cmd) => {
        console.log('FFmpeg command:', cmd)
      })
      .on('progress', (progress) => {
        if ((progress as any).percent) {
          console.log(`Encoding: ${Math.round((progress as any).percent)}%`)
        }
      })
      .on('end', async () => {
        if (!await fs.pathExists(outputPath)) {
          reject(new Error('Output file was not created'))
          return
        }
        
        const stats = await fs.stat(outputPath)
        const fileSize = stats.size
        
        console.log(`\nVideo encoded: ${outputPath}`)
        console.log(`File size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`)
        console.log(`Frames: ${frameCount}`)
        console.log(`FPS: ${fullConfig.fps}`)
        console.log(`Quality: ${fullConfig.quality}`)
        
        resolve({
          outputPath,
          frameCount,
          fileSize
        })
      })
      .on('error', (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`))
      })
      .run()
  })
}

async function generateThumbnail(
  frameDir: string,
  outputPath: string,
  frameNumber: number = 0
): Promise<string> {
  const frameFiles = await fs.readdir(frameDir)
  const frames = frameFiles.filter(f => f.startsWith('frame_') && f.endsWith('.png'))
  
  if (frames.length === 0) {
    throw new Error('No frames found')
  }
  
  const targetFrame = frameNumber < frames.length 
    ? frames[frameNumber] 
    : frames[frames.length - 1]
  
  const sourcePath = path.join(frameDir, targetFrame)
  
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(sourcePath)
      .output(outputPath)
      .outputOptions(['-frames:v', '1'])
      .on('end', () => {
        console.log(`Thumbnail saved: ${outputPath}`)
        resolve(outputPath)
      })
      .on('error', (err) => {
        reject(new Error(`Thumbnail error: ${err.message}`))
      })
      .run()
  })
}

async function getVideoInfo(outputPath: string): Promise<{
  duration: number
  bitrate: number
  resolution: string
}> {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(outputPath)
      .ffprobe((err, data) => {
        if (err) {
          reject(err)
          return
        }
        
        const videoStream = data.streams?.find(s => s.codec_type === 'video')
        
        if (!videoStream) {
          reject(new Error('No video stream found'))
          return
        }
        
        resolve({
          duration: videoStream.duration || 0,
          bitrate: parseInt(data.format.bit_rate || '0', 10),
          resolution: `${videoStream.width}x${videoStream.height}`
        })
      })
  })
}

export { 
  encodeFrames, 
  generateThumbnail, 
  getVideoInfo, 
  getFrameCount, 
  DEFAULT_CONFIG 
}
export type { EncoderConfig, EncodeResult }
