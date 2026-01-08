/* eslint-disable no-console */
import express from 'express'
import fs from 'fs-extra'
import path from 'path'
import { glob } from 'glob'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.static(path.join(process.cwd(), 'animations')))

app.get('/api/animations', async (_req, res) => {
  try {
    const animationsDir = path.join(process.cwd(), 'animations')
    if (!(await fs.pathExists(animationsDir))) {
      return res.json({ animations: [] })
    }

    const entries = await fs.readdir(animationsDir, { withFileTypes: true })
    const animations = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const animationPath = path.join(animationsDir, entry.name)
        const files = await glob('**/*', { cwd: animationPath })
        const hasMainFile = files.some((f) => /^index\.(jsx?|tsx?)$/i.test(f))

        if (hasMainFile) {
          animations.push({
            name: entry.name,
            path: `/animations/${entry.name}/index.jsx`,
            files: files.length,
          })
        }
      }
    }

    return res.json({ animations })
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message })
  }
})

app.get('/api/render/:animationName', async (req, res) => {
  const { animationName } = req.params
  const animationPath = path.join(process.cwd(), 'animations', animationName)

  try {
    if (!(await fs.pathExists(animationPath))) {
      return res.status(404).json({ error: 'Animation not found' })
    }

    const files = await glob('**/*.{jsx,tsx,js,ts}', { cwd: animationPath })
    const mainFile = files.find((f) => /^index\.(jsx?|tsx?)$/i.test(f))

    if (!mainFile) {
      return res.status(404).json({ error: 'No main entry file found' })
    }

    return res.json({
      animation: animationName,
      mainFile,
      files,
    })
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message })
  }
})

app.post('/api/render/:animationName', async (req, res) => {
  const { animationName } = req.params
  const { duration = 5, width = 1920, height = 1080 } = req.body

  res.json({
    status: 'rendering',
    animation: animationName,
    duration,
    width,
    height,
    message: 'Animation rendering initiated',
  })
})

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

async function startServer(): Promise<void> {
  try {
    await new Promise<void>((resolve) => {
      app.listen(PORT, () => {
        console.log(`Development server running at http://localhost:${PORT}`)
        console.log(`API available at http://localhost:${PORT}/api`)
        resolve()
      })
    })
  } catch (error) {
    console.error('Failed to start server:', (error as Error).message)
    process.exit(1)
  }
}

export { app, startServer }

/* eslint-enable no-console */

if (require.main === module) {
  startServer()
}
