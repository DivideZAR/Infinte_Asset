/* eslint-disable no-console */
import fs from 'fs-extra'
import path from 'path'
import { chromium, Browser, BrowserContext } from 'playwright'

declare global {
  interface Window {
    animationReady: boolean
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

    try {
      await page.waitForFunction(() => window.animationReady === true, {
        timeout: 10000,
      })
      console.log('Animation ready!')
    } catch {
      console.warn('Animation ready signal not received, continuing anyway...')
    }

    // Auto-start animation - wait for button to appear then click it
    try {
      // Wait for button to be rendered by React (up to 3 seconds)
      const buttonFound = await page.waitForFunction(
        () => {
          const buttons = document.querySelectorAll('button')
          for (const btn of buttons) {
            const text = (btn.textContent || '').toLowerCase()
            const html = btn.innerHTML.toLowerCase()
            if (text.includes('start') || html.includes('start') || html.includes('▶')) {
              return true
            }
          }
          return false
        },
        { timeout: 3000 },
      )

      if (buttonFound) {
        // Click using dispatchEvent with real MouseEvent (works better with React)
        try {
          const clicked = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button')
            for (const btn of buttons) {
              const text = (btn.textContent || '').toLowerCase()
              const html = btn.innerHTML.toLowerCase()
              if (text.includes('start') || html.includes('start') || html.includes('▶')) {
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
            console.log('Animation auto-started via START button')
          } else {
            throw new Error('Click not dispatched')
          }
        } catch {
          // Fallback: try page.click
          try {
            await page.click('button:has-text("START")', { timeout: 5000 })
            console.log('Animation auto-started via page.click')
          } catch {
            // Fallback: try any button with start text
            await page.evaluate(() => {
              const buttons = document.querySelectorAll('button')
              for (const btn of buttons) {
                const text = (btn.textContent || '').toLowerCase()
                const html = btn.innerHTML.toLowerCase()
                if (text.includes('start') || html.includes('start') || html.includes('▶')) {
                  btn.click()
                  return
                }
              }
            })
            console.log('Animation auto-started via fallback click')
          }
        }
      }
    } catch (e) {
      // Fallback: try space key
      try {
        await page.keyboard.press('Space')
        console.log('Animation started via space key')
      } catch (e2) {
        console.warn('Could not auto-start animation:', (e as Error).message)
      }
    }

    // Give animation time to start after auto-trigger
    await page.waitForTimeout(500)

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

    for (let i = 0; i < totalFrames; i++) {
      const framePath = path.join(frameDir, `frame_${String(i).padStart(4, '0')}.png`)

      try {
        // Advance time and trigger animation frames
        const msPerFrame = Math.round(1000 / fullConfig.fps)
        await page.evaluate((ms: number) => {
          // Advance Date.now() by ms milliseconds
          const now = Date.now()
          Date.now = () => now + ms

          // Trigger any pending requestAnimationFrame callbacks immediately
          if (typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame = ((cb: (time: number) => void) => {
              // Execute immediately with current time
              try {
                cb(Date.now())
              } catch {
                // Ignore errors
              }
              return 0
            }) as typeof window.requestAnimationFrame

            // Also trigger setTimeout callbacks immediately
            window.setTimeout = ((cb: () => void, _delay: number) => {
              try {
                cb()
              } catch {
                // Ignore errors
              }
              return 0
            }) as typeof window.setTimeout
          }
        }, msPerFrame)

        // Force canvas repaint
        await page.evaluate(() => {
          const canvas = document.querySelector('canvas')
          if (canvas) {
            // Force reflow
            canvas.offsetHeight
          }
        })

        // Render frame explicitly for smooth animation
        if (hasFrameBasedRendering) {
          await page.evaluate((frameNumber) => {
            if (typeof window.renderFrame === 'function') {
              window.renderFrame(frameNumber)
            }
          }, i)
        }

        if (hasCanvas) {
          // Use screenshot instead of toDataURL for more reliable capture
          await page.screenshot({
            path: framePath,
            fullPage: false,
            timeout: 60000,
          })
        } else {
          // Standard: Full page screenshot
          await page.screenshot({
            path: framePath,
            fullPage: false,
            timeout: 60000,
          })
        }

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
