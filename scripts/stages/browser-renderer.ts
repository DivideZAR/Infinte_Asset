import fs from 'fs-extra'
import path from 'path'
import { chromium, Browser, Page, BrowserContext } from 'playwright'

interface RenderConfig {
  width: number
  height: number
  fps: number
  duration: number
}

interface RenderResult {
  frameDir: string
  frameCount: number
  config: RenderConfig
}

const DEFAULT_CONFIG: RenderConfig = {
  width: 800,
  height: 600,
  fps: 30,
  duration: 5
}

async function launchBrowser(): Promise<Browser> {
  console.log('Launching browser...')
  
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--enable-unsafe-swiftshader'
    ]
  })
  
  return browser
}

async function createContext(browser: Browser, config: RenderConfig): Promise<BrowserContext> {
  const context = await browser.newContext({
    viewport: { width: config.width, height: config.height },
    deviceScaleFactor: 1
  })
  
  return context
}

async function captureFrames(
  htmlPath: string,
  outputDir: string,
  config?: Partial<RenderConfig>
): Promise<RenderResult> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }
  
  await fs.ensureDir(outputDir)
  const frameDir = path.join(outputDir, 'frames')
  await fs.ensureDir(frameDir)
  
  console.log('Starting frame capture...')
  console.log(`Resolution: ${fullConfig.width}x${fullConfig.height}`)
  console.log(`FPS: ${fullConfig.fps}, Duration: ${fullConfig.duration}s`)
  
  const browser = await launchBrowser()
  
  try {
    const context = await createContext(browser, fullConfig)
    const page = await context.newPage()
    
    const consoleMessages: string[] = []
    const consoleErrors: string[] = []
    
    page.on('console', msg => {
      const text = msg.text()
      consoleMessages.push(text)
      if (msg.type() === 'error') {
        consoleErrors.push(text)
      }
    })
    
    page.on('pageerror', err => {
      consoleErrors.push(err.message)
    })
    
    console.log(`Loading: file://${htmlPath}`)
    
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })
    
    console.log('Waiting for animation to be ready...')
    
    try {
      await page.waitForFunction(() => window.animationReady === true, {
        timeout: 10000
      })
      console.log('Animation ready!')
    } catch {
      console.warn('Animation ready signal not received, continuing anyway...')
    }
    
    await page.waitForTimeout(1000)
    
    const frameInterval = 1000 / fullConfig.fps
    const totalFrames = Math.ceil(fullConfig.fps * fullConfig.duration)
    let frameCount = 0
    
    console.log(`Capturing ${totalFrames} frames...`)
    
    for (let i = 0; i < totalFrames; i++) {
      const framePath = path.join(frameDir, `frame_${String(i).padStart(4, '0')}.png`)
      
      try {
        await page.screenshot({
          path: framePath,
          fullPage: false,
          timeout: 60000
        })
        
        frameCount++
        
        if ((i + 1) % 12 === 0 || i === totalFrames - 1) {
          console.log(`Progress: ${i + 1}/${totalFrames} frames`)
        }
        
        await page.waitForTimeout(200)
      } catch (error) {
        console.error(`Error capturing frame ${i + 1}:`, (error as Error).message)
        break
      }
    }
    
    console.log(`Captured ${frameCount} frames to ${frameDir}`)
    
    if (consoleErrors.length > 0) {
      console.warn('Console errors detected:')
      consoleErrors.forEach(err => console.warn(`  - ${err}`))
    }
    
    await context.close()
    
    return {
      frameDir,
      frameCount,
      config: fullConfig
    }
    
  } finally {
    await browser.close()
    console.log('Browser closed')
  }
}

async function validateBrowser(): Promise<{ available: boolean; version?: string }> {
  try {
    const browser = await chromium.launch({ headless: true })
    const version = browser.version()
    await browser.close()
    return { available: true, version }
  } catch (error) {
    return { available: false }
  }
}

export { captureFrames, validateBrowser, RenderConfig, RenderResult, DEFAULT_CONFIG }
