import fs from 'fs-extra'
import path from 'path'

export interface AnimationMetadata {
  duration: number
  fps: number
  width: number
  height: number
  renderPattern: 'frame-based' | 'real-time' | 'unknown'
  sourceFile: string | null
}

const DEFAULT_METADATA: AnimationMetadata = {
  duration: 5,
  fps: 30,
  width: 800,
  height: 600,
  renderPattern: 'unknown',
  sourceFile: null,
}

async function collectAnimationFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
        const subFiles = await collectAnimationFiles(fullPath)
        files.push(...subFiles)
      }
    } else if (/\.(jsx?|tsx?)$/i.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

export async function extractAnimationMetadata(animationDir: string): Promise<AnimationMetadata> {
  const metadata: AnimationMetadata = { ...DEFAULT_METADATA }

  if (!(await fs.pathExists(animationDir))) {
    console.warn(`Animation directory does not exist: ${animationDir}`)
    return metadata
  }

  const files = await collectAnimationFiles(animationDir)

  if (files.length === 0) {
    console.warn('No JavaScript/JSX files found in animation directory')
    return metadata
  }

  let allContent = ''

  const variableMap: Record<string, number> = {}

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8')

    const constMatches = content.matchAll(/const\s+([A-Z])\s*=\s*(\d+)/g)
    for (const match of constMatches) {
      variableMap[match[1]] = parseInt(match[2], 10)
    }

    allContent += content + '\n'

    const relativePath = path.relative(animationDir, file)
    if (!metadata.sourceFile) {
      metadata.sourceFile = relativePath
    }
  }

  const patterns = {
    durationMs: /DURATION\s*=\s*(\d+)/,
    durationSec: /duration\s*=\s*(\d+(?:\.\d+)?)/,
    fps: /fps\s*=\s*(\d+)/,
    canvasWidth: /canvas\.width\s*=\s*([A-Z]|\d+)/,
    canvasHeight: /canvas\.height\s*=\s*([A-Z]|\d+)/,
    renderFrame: /window\.renderFrame\s*=/,
    raf: /requestAnimationFrame\s*\(/,
  }

  const durationMsMatch = allContent.match(patterns.durationMs)
  if (durationMsMatch) {
    metadata.duration = Math.ceil(parseInt(durationMsMatch[1], 10) / 1000)
  } else {
    const durationSecMatch = allContent.match(patterns.durationSec)
    if (durationSecMatch) {
      metadata.duration = Math.ceil(parseFloat(durationSecMatch[1]))
    }
  }

  const fpsMatch = allContent.match(patterns.fps)
  if (fpsMatch) {
    metadata.fps = parseInt(fpsMatch[1], 10)
  }

  const widthMatch = allContent.match(patterns.canvasWidth)
  if (widthMatch) {
    const widthValue = widthMatch[1]
    metadata.width = variableMap[widthValue] || parseInt(widthValue, 10)
  }

  const heightMatch = allContent.match(patterns.canvasHeight)
  if (heightMatch) {
    const heightValue = heightMatch[1]
    metadata.height = variableMap[heightValue] || parseInt(heightValue, 10)
  }

  if (patterns.renderFrame.test(allContent)) {
    metadata.renderPattern = 'frame-based'
  } else if (patterns.raf.test(allContent)) {
    metadata.renderPattern = 'real-time'
  }

  return metadata
}

export function formatMetadataForDisplay(metadata: AnimationMetadata): string {
  const patternEmoji = {
    'frame-based': '🎬',
    'real-time': '⏱️',
    'unknown': '❓',
  }

  return `
  Detected Animation Metadata:
  ${patternEmoji[metadata.renderPattern]} Render: ${metadata.renderPattern}
  ⏱️ Duration: ${metadata.duration}s
  📹 FPS: ${metadata.fps}
  🖼️ Resolution: ${metadata.width}×${metadata.height}
  📁 Source: ${metadata.sourceFile || 'unknown'}
  `.trim()
}
