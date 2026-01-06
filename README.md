# Infinte_Asset

Convert React animation code to MP4 video files using Node.js with Playwright browser rendering.

## Features

- Convert React animation components to MP4 video format
- Real browser rendering via Playwright
- Support for custom resolution, frame rate, and duration
- Built-in animation validation
- Stage-by-stage testing for debugging
- Comprehensive test suite

## Prerequisites

- Node.js v18 or higher
- FFmpeg installed on your system
- Playwright browsers (installed automatically)

### Installing FFmpeg

FFmpeg is a system-wide video encoding tool. Install it once and it works for all projects.

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS (Homebrew):**
```bash
brew install ffmpeg
```

**Windows (Chocolatey):**
```bash
choco install ffmpeg
```

### Installing Playwright Browsers

Playwright is used to render React animations in a headless browser:

```bash
npx playwright install chromium
```

## Installation

1. Navigate to the project directory (where package.json is located):
   ```bash
   cd /path/to/infinte-asset
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Install FFmpeg:
   ```bash
   sudo apt update && sudo apt install ffmpeg
   ```

4. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

5. Verify installations:
   ```bash
   ffmpeg -version
   ```

6. **Add your React animations** to the `animations/` directory (see "Where to Add Animations")

## Quick Start

1. **Add your animation** to the `animations/` directory (see "Where to Add Animations" below)

2. **Convert the example animation:**
   ```bash
   npm run convert:pipeline -- animations/example-animation output/demo.mp4 --fps 30 --duration 5 --quality high
   ```

3. **Output file:** `output/demo.mp4`

## Project Structure

```
infinte-asset/
├── animations/              # YOUR ANIMATIONS GO HERE
│   ├── example-animation/   # Included example
│   │   └── index.jsx
│   ├── my-animation-1/      # Your custom animation
│   │   └── index.jsx
│   └── my-animation-2/      # Another custom animation
│       └── index.jsx
├── scripts/                 # Build and conversion scripts
│   ├── stages/              # Conversion pipeline stages
│   │   ├── html-generator.ts    # Stage 1: Generate HTML from React
│   │   ├── browser-renderer.ts  # Stage 2: Capture frames with Playwright
│   │   └── video-encoder.ts     # Stage 3: Encode frames to MP4
│   ├── pipeline.ts          # Full conversion pipeline
│   ├── convert.ts           # Legacy conversion script
│   ├── validate.ts          # Animation validation script
│   └── dev-server.ts        # Development server
├── tests/                   # Test files
├── output/                  # Generated MP4 files
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

**Key directories:**
- `animations/` - Place your React animation files here
- `output/` - Converted MP4 files appear here
- `scripts/stages/` - Pipeline implementation (do not modify)

## How It Works

The conversion pipeline consists of 3 stages:

1. **HTML Generator** - Converts React JSX files into a self-contained HTML page with React loaded via CDN
2. **Browser Renderer** - Loads the HTML in a headless Playwright browser and captures frames as PNG images
3. **Video Encoder** - Combines PNG frames into an MP4 video using FFmpeg

## Where to Add Animations

All React animation files must be placed in the `animations/` directory. This is the input location for the conversion pipeline.

### Directory Structure

```
animations/
└── <your-animation-name>/
    └── index.jsx
```

### Steps to Add a New Animation

1. Create a folder inside `animations/` with your animation name:
   ```bash
   mkdir animations/my-bouncing-balls
   ```

2. Create your React component in `index.jsx` inside that folder:
   ```bash
   echo 'export function MyAnimation() { return <div>Hello</div> }' > animations/my-bouncing-balls/index.jsx
   ```

3. Run the conversion:
   ```bash
   npm run convert:pipeline -- animations/my-bouncing-balls output/my-video.mp4
   ```

### Animation File Requirements

- Main file must be named `index.jsx` (not `.js`, `.ts`, or `.tsx`)
- Must export a React component (named export or default export)
- Must use browser-compatible JavaScript (no Node.js APIs)
- Imports should use CDN packages or be removed for browser execution

### Example Animation Structure

```
animations/
├── example-animation/          # Included example
│   └── index.jsx
├── my-bouncing-balls/          # Your custom animation
│   ├── index.jsx
│   └── assets/
│       └── image.png           # Optional assets
└── another-animation/          # Another example
    └── index.jsx
```

### Animation Code Guidelines

**Supported:**
```jsx
import React, { useState, useEffect, useRef } from 'react'

export function BouncingBalls() {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    // Canvas animation code
  }, [])
  
  return <canvas ref={canvasRef} width={800} height={600} />
}

export default BouncingBalls
```

**Not Supported (Node.js APIs):**
```jsx
import fs from 'fs'           // Won't work in browser
import path from 'path'       // Won't work in browser
const data = require('./data') // Won't work in browser
```

## Creating Animations

All `npm run` commands must be executed from the project root directory (where package.json is located).

1. Create a new folder in the `animations/` directory
2. Add your React animation code with an `index.jsx` entry file
3. Export a named function or default export as the main component

Example animation structure:
```
animations/
└── my-animation/
    ├── index.jsx
    └── assets/
        └── image.png
```

Example animation code (`index.jsx`):
```jsx
import React, { useRef, useEffect } from 'react'

export function MyAnimation() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    function animate() {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, , canvas.height)
      // Your animation code here
     0, canvas.width requestAnimationFrame(animate)
    }
    
    animate()
  }, [])

  return <canvas ref={canvasRef} width={800} height={600} />
}

export default MyAnimation
```

## Converting Animations

Run all commands from the project root directory.

Animations must be in the `animations/` directory. Use the path relative to the project root.

### Basic Conversion

```bash
npm run convert:pipeline -- animations/example-animation output/video.mp4
```

### Converting Your Own Animation

```bash
npm run convert:pipeline -- animations/my-bouncing-balls output/my-video.mp4
```

### With Options

```bash
npm run convert:pipeline -- animations/example-animation output/video.mp4 \
  --fps 60 \
  --duration 10 \
  --width 1920 \
  --height 1080 \
  --quality high
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--fps` | Frame rate | 30 |
| `--duration` | Video duration in seconds | 5 |
| `--width` | Video width in pixels | 800 |
| `--height` | Video height in pixels | 600 |
| `--quality` | Video quality (low/medium/high) | medium |

## Testing Stages Individually

Test each stage of the pipeline independently for debugging:

### Test Stage 1: HTML Generator
```bash
npm run convert:test1
```
Generates HTML from React code and saves to `test-output/stage1/animation.html`

### Test Stage 2: Browser Renderer
```bash
npm run convert:test2
```
Captures frames from the generated HTML and saves to `test-output/stage2/frames/`

### Test Stage 3: Video Encoder
```bash
npm run convert:test3
```
Encodes frames to MP4 and saves to `test-output/stage3/output.mp4`

### Test All Stages
```bash
npm run convert:test
```
Runs all three stages sequentially.

## Validating Animations

Before converting, you can validate your animation code:

```bash
npm run validate -- animations/example-animation
```

With additional checks:

```bash
npm run validate -- animations/example-animation \
  --check-syntax \
  --check-imports
```

## Development

Run from the project root directory:

Start the development server:

```bash
npm run dev
```

This starts an Express server at `http://localhost:3000` with API endpoints for managing animations.

## Testing

Run all commands from the project root directory.

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run a single test file:
```bash
npm test -- tests/convert.test.js
```

## Linting and Formatting

Run all commands from the project root directory.

Lint code:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

Format code:
```bash
npm run format
```

Type checking:
```bash
npm run typecheck
```

## API Endpoints

When running `npm run dev`:

- `GET /api/animations` - List all available animations
- `GET /api/render/:name` - Get animation details
- `POST /api/render/:name` - Start rendering an animation
- `GET /health` - Health check

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Development server port | 3000 |
| `NODE_ENV` | Environment mode | development |

### TypeScript Configuration

Edit `tsconfig.json` to customize TypeScript settings.

### ESLint Configuration

Edit `.eslintrc.js` to customize linting rules.

## Troubleshooting

All commands should be run from the project root directory (where package.json is located).

### Animation not found

Make sure your animation is in the `animations/` directory:
```bash
ls animations/
# Should show your animation folder
```

### FFmpeg not found

Ensure FFmpeg is installed and available in your system PATH:
```bash
which ffmpeg
ffmpeg -version
```

### Playwright not available

Install Playwright browsers:
```bash
npx playwright install chromium
```

### Conversion fails

1. **Check animation location:** Must be in `animations/<your-animation>/index.jsx`
2. Test individual stages: `npm run convert:test1`, then `npm run convert:test2`, then `npm run convert:test3`
3. Check that your animation has a valid component export
4. Ensure all imports are relative or from npm packages (not local modules without file extension)
5. Validate your animation: `npm run validate -- animations/your-animation`

### Animation not rendering correctly

1. Open the generated HTML file in a browser: `test-output/stage1/animation.html`
2. Check browser console for errors
3. Ensure your animation uses only browser-compatible JavaScript (no Node.js APIs)

### Out of memory

Reduce video resolution or duration in the conversion options.

### Frames not being captured

1. Check that Babel transpiles your JSX correctly
2. Ensure `window.animationReady` is set (handled automatically)
3. Try reducing the animation duration

## License

MIT
