/* eslint-disable no-console */
import fs from 'fs-extra'
import path from 'path'
import { chromium, Browser, BrowserContext } from 'playwright'

declare global {
  interface Window {
    animationReady: boolean
    isAnimating: boolean
    startAnimation: () => void
    __frameConfig: {
      fps: number
      duration: number
      isFrameBased: boolean
    }
    __animationScene: any
    renderFrame: (frameNumber: number) => void
  }
}

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
  duration: 5,
}

async function launchBrowser(): Promise<Browser> {
  console.log('Launching browser...')

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--enable-unsafe-swiftshader',
    ],
  })

  return browser
}

async function createContext(browser: Browser, config: RenderConfig): Promise<BrowserContext> {
  const context = await browser.newContext({
    viewport: { width: config.width, height: config.height },
    deviceScaleFactor: 1,
  })

  return context
}

async function captureFrames(
  htmlPath: string,
  outputDir: string,
  config?: Partial<RenderConfig>,
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

    const consoleErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    page.on('pageerror', (err) => {
      consoleErrors.push(err.message)
    })

    console.log(`Loading: file://${htmlPath}`)

    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    console.log('Waiting for animation to be ready...')

    // Wait for React to fully mount and render
    await page.waitForTimeout(3000)

    try {
      await page.waitForFunction(() => window.animationReady === true, {
        timeout: 10000,
      })
      console.log('Animation ready!')
    } catch {
      console.warn('Animation ready signal not received, continuing anyway...')
    }

    // Additional wait for React to complete rendering
    await page.waitForTimeout(1000)

    // Auto-start animation - multiple strategies
    console.log('Attempting to start animation...')

    // Check if animation already started
    const alreadyAnimating = await page.evaluate(() => window.isAnimating === true)
    console.log(`Already animating: ${alreadyAnimating}`)

    // Strategy 1: Direct function call (most reliable for React components)
    try {
      const started = await page.evaluate(() => {
        // Try to find and call startAnimation function
        if (typeof window.startAnimation === 'function') {
          window.startAnimation()
          return true
        }
        // Try to find the startAnimation in global scope
        const scripts = document.querySelectorAll('script[type="module"]')
        for (const script of scripts) {
          if (script.textContent?.includes('startAnimation')) {
            // Extract and execute the function
            const match = script.textContent.match(/const\s+startAnimation\s*=\s*([^{]+)/)
            if (match) {
              try {
                eval(`(${match[1]})()`)
                return true
              } catch (e) {
                // Ignore eval errors
              }
            }
          }
        }
        return false
      })
      if (started) {
        console.log('Animation started via direct function call')
      }
    } catch (e) {
      console.warn('Direct function call failed:', (e as Error).message)
    }

    // Strategy 2: Click START button if present
    if (!alreadyAnimating) {
      console.log('Looking for START button...')

      try {
        // Try multiple button detection methods
        const buttonFound = await page.waitForFunction(
          () => {
            // Method 1: Find button by text content (including unicode)
            const buttons = document.querySelectorAll('button')
            for (const btn of buttons) {
              const text = btn.textContent || ''
              // Check for "START" text, with or without unicode play button
              if (text.includes('START') || text.includes('▶') || text.includes('\u25B6')) {
                return true
              }
            }

            // Method 2: Find button by style class or inline style
            const allElements = document.querySelectorAll('*')
            for (const el of allElements) {
              const style = el.getAttribute('style') || ''
              if (style.includes('startButton') || style.includes('start-button')) {
                if (el.tagName.toLowerCase() === 'button') {
                  return true
                }
              }
            }

            // Method 3: Find any button in the overlay
            const overlays = document.querySelectorAll('[style*="zIndex"], [style*="z-index"]')
            for (const overlay of overlays) {
              const btns = overlay.querySelectorAll('button')
              if (btns.length > 0) {
                return true
              }
            }

            return false
          },
          { timeout: 5000 },
        )
        console.log('START button found, attempting click...')

        if (buttonFound) {
          try {
            // First try: DispatchEvent with MouseEvent
            const clicked = await page.evaluate(() => {
              const buttons = document.querySelectorAll('button')
              for (const btn of buttons) {
                const text = btn.textContent || ''
                if (text.includes('START') || text.includes('▶') || text.includes('\u25B6')) {
                  const event = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                  })
                  return btn.dispatchEvent(event)
                }
              }
              return false
            })
            if (clicked) {
              console.log('Animation started via START button DispatchEvent')
              await page.waitForTimeout(500)
              const isNowAnimating = await page.evaluate(() => window.isAnimating)
              console.log(`isAnimating after click: ${isNowAnimating}`)
            } else {
              throw new Error('DispatchEvent returned false')
            }
          } catch (e) {
            console.warn('DispatchEvent failed, trying page.click:', (e as Error).message)
            // Second try: page.click
            try {
              await page.click('button:has-text("START")', { timeout: 5000 })
              console.log('Animation started via page.click')
              await page.waitForTimeout(500)
              const isNowAnimating = await page.evaluate(() => window.isAnimating)
              console.log(`isAnimating after page.click: ${isNowAnimating}`)
            } catch (e2) {
              console.warn('page.click failed, trying evaluate click:', (e2 as Error).message)
              // Third try: evaluate click
              await page.evaluate(() => {
                const buttons = document.querySelectorAll('button')
                for (const btn of buttons) {
                  const text = btn.textContent || ''
                  if (text.includes('START') || text.includes('▶') || text.includes('\u25B6')) {
                    btn.click()
                    console.log('Clicked button via evaluate')
                    return
                  }
                }
              })
              await page.waitForTimeout(500)
              const isNowAnimating = await page.evaluate(() => window.isAnimating)
              console.log(`isAnimating after evaluate click: ${isNowAnimating}`)
            }
          }
        }
      } catch (e) {
        console.warn('Button not found or click failed:', (e as Error).message)
      }
    }

    // Strategy 3: Space key fallback
    if (
      !(await page.evaluate(() => typeof window.isAnimating === 'boolean' && window.isAnimating))
    ) {
      try {
        await page.keyboard.press('Space')
        console.log('Animation started via space key')
      } catch (e) {
        console.warn('Space key fallback failed:', (e as Error).message)
      }
    }

    // Wait for animation to actually start
    await page.waitForTimeout(1500)

    // Verify animation is running
    const isAnimating = await page.evaluate(() => {
      return window.isAnimating === true
    })
    console.log(`Animation running: ${isAnimating}`)

    const totalFrames = Math.ceil(fullConfig.fps * fullConfig.duration)
    let frameCount = 0

    console.log(`Capturing ${totalFrames} frames...`)

    // Check if animation has frame-based rendering infrastructure
    const hasFrameBasedInfrastructure = await page.evaluate(() => {
      return typeof window.__frameConfig !== 'undefined'
    })

    // Set up frame configuration if animation supports it
    if (hasFrameBasedInfrastructure) {
      await page.evaluate(
        (config) => {
          window.__frameConfig = config
        },
        { fps: fullConfig.fps, duration: fullConfig.duration, isFrameBased: true },
      )
    }

    // Check if a valid canvas element exists for optimized capture
    const hasCanvas = await page.evaluate(() => {
      const canvases = Array.from(document.querySelectorAll('canvas'))
      // Check for 2D canvas elements
      const validCanvas = canvases.filter((c) => c.width > 0 && c.height > 0)
      // Check for Three.js WebGL renderer (uses renderer.domElement)
      const hasWebGLRenderer = Array.from(document.querySelectorAll('canvas')).some(
        (c) => c.width > 0 && c.height > 0 && c.getContext('webgl'),
      )
      // Use whichever is available
      return !!validCanvas || hasWebGLRenderer
    })
    console.log(
      `Optimization: ${
        hasCanvas ? 'Canvas found (using toDataURL)' : 'No canvas (using screenshot fallback)'
      }`,
    )

    // Check if frame-based rendering is available
    const hasFrameBasedRendering = await page.evaluate(() => {
      return typeof window.renderFrame === 'function' && typeof window.__animationScene !== null
    })
    console.log(
      `Rendering mode: ${hasFrameBasedRendering ? 'Frame-based (smooth)' : 'Continuous (may flicker)'}`,
    )

    // Get canvas for reference
    const canvasInfo = await page.evaluate(() => {
      // Try multiple selectors to find the canvas
      const selectors = ['canvas', '#root canvas', 'body canvas']
      for (const selector of selectors) {
        const canvas = document.querySelector(selector) as HTMLCanvasElement | null
        if (canvas) {
          return {
            width: canvas.width,
            height: canvas.height,
            hasContext: !!canvas.getContext('2d'),
          }
        }
      }
      // Try getting all canvases
      const canvases = document.querySelectorAll('canvas')
      if (canvases.length > 0) {
        const canvas = canvases[0] as HTMLCanvasElement
        return {
          width: canvas.width,
          height: canvas.height,
          hasContext: !!canvas.getContext('2d'),
        }
      }
      return null
    })
    console.log(`Canvas: ${canvasInfo ? `${canvasInfo.width}x${canvasInfo.height}` : 'Not found'}`)

    // Capture frames
    for (let i = 0; i < totalFrames; i++) {
      const framePath = path.join(frameDir, `frame_${String(i).padStart(4, '0')}.png`)

      try {
        // For non-frame-based animations, wait longer to let animation progress
        if (!hasFrameBasedRendering) {
          // Wait for React to update state
          await page.waitForTimeout(100)

          // Trigger animation frame
          await page.evaluate(() => {
            // Try multiple canvas selectors
            const selectors = ['canvas', '#root canvas', 'body canvas']
            for (const selector of selectors) {
              const canvas = document.querySelector(selector) as HTMLCanvasElement | null
              if (canvas) {
                // Force canvas redraw by accessing context
                const ctx = canvas.getContext('2d')
                if (ctx) {
                  // Small change to force repaint
                  canvas.width = canvas.width
                }
                break
              }
            }
            // Trigger requestAnimationFrame
            if (typeof window.requestAnimationFrame === 'function') {
              window.requestAnimationFrame(() => {})
            }
          })

          // Additional wait for animation updates
          await page.waitForTimeout(50)
        } else {
          // For frame-based rendering, advance time
          const msPerFrame = Math.round(1000 / fullConfig.fps)
          await page.evaluate((ms: number) => {
            const now = Date.now()
            Date.now = () => now + ms

            if (typeof window.requestAnimationFrame === 'function') {
              window.requestAnimationFrame = ((cb: (time: number) => void) => {
                try {
                  cb(Date.now())
                } catch {
                  // Ignore errors
                }
                return 0
              }) as typeof window.requestAnimationFrame
            }
          }, msPerFrame)

          // Call renderFrame if available
          await page.evaluate((frameNumber) => {
            if (typeof window.renderFrame === 'function') {
              window.renderFrame(frameNumber)
            }
          }, i)
        }

        // Capture the frame
        await page.screenshot({
          path: framePath,
          fullPage: false,
          timeout: 60000,
        })

        frameCount++

        if ((i + 1) % 12 === 0 || i === totalFrames - 1) {
          console.log(`Progress: ${i + 1}/${totalFrames} frames`)
        }
      } catch (error) {
        console.error(`Error capturing frame ${i + 1}:`, (error as Error).message)
        break
      }
    }

    console.log(`Captured ${frameCount} frames to ${frameDir}`)

    if (consoleErrors.length > 0) {
      console.warn('Console errors detected:')
      consoleErrors.forEach((err) => console.warn(`  - ${err}`))
    }

    await context.close()

    return {
      frameDir,
      frameCount,
      config: fullConfig,
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

/* eslint-enable no-console */

export { captureFrames, validateBrowser, RenderConfig, RenderResult, DEFAULT_CONFIG }
