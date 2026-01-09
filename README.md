# Infinte_Asset

Convert React animation code to MP4 video files using Node.js with Playwright browser rendering.

## Features

- Convert React animation components to MP4 video format
- Real browser rendering via Playwright
- Support for custom resolution, frame rate, and duration
- Built-in animation validation
- Stage-by-stage testing for debugging
- Comprehensive test suite

For a detailed deep-dive into how the system works, see [ARCHITECTURE.md](ARCHITECTURE.md).

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

2. **Convert the example animations:**

   ```bash
   # Convert bouncing balls animation
   npm run convert:pipeline -- animations/example-animation output/demo.mp4 --fps 30 --duration 5 --quality high

   # Convert beach ball animation
   npm run convert:pipeline -- animations/beach-ball output/beach-ball.mp4 --fps 30 --duration 5

   # Convert pulsing circles animation
   npm run convert:pipeline -- animations/pulse-circles output/pulse.mp4 --fps 30 --duration 5
   ```

3. **Output files:** Check the `output/` directory for generated MP4 files

## Project Structure

```
infinte-asset/
├── animations/              # YOUR ANIMATIONS GO HERE
│   ├── example-animation/   # Bouncing balls on canvas
│   │   └── index.jsx
│   ├── beach-ball/          # Beach ball with bouncing animation
│   │   └── index.jsx
│   ├── pulse-circles/       # Pulsing circles animation
│   │   └── index.jsx
│   └── my-animation/        # Your custom animation
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

**Included Example Animations:**

| Animation           | Description                 | Technique            |
| ------------------- | --------------------------- | -------------------- |
| `example-animation` | Bouncing colored balls      | Canvas API           |
| `beach-ball`        | Beach ball bouncing on sand | SVG + CSS animations |
| `pulse-circles`     | Pulsing colored circles     | Canvas API           |

**To convert any animation:**

```bash
npm run convert:pipeline -- animations/<name> output/video.mp4
```

**Key directories:**

- `animations/` - Place your React animation files here
- `output/` - Converted MP4 files appear here
- `scripts/stages/` - Pipeline implementation (do not modify)

## How It Works

The conversion pipeline consists of 3 stages:

1. **HTML Generator** - Converts React JSX files into a self-contained HTML page. It uses the **TypeScript Compiler API** to pre-compile JSX and bundles local React/ReactDOM libraries for **offline support**.
2. **Browser Renderer** - Loads the HTML in a headless Playwright browser and captures frames as PNG images. It uses the **Clock API** for perfect frame synchronization and **Canvas optimization** for high performance.
3. **Video Encoder** - Combines PNG frames into an MP4 video using FFmpeg.

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
├── example-animation/          # Bouncing balls (canvas-based)
│   └── index.jsx
├── beach-ball/                 # Beach ball with sand and sky (SVG + CSS)
│   └── index.jsx
├── pulse-circles/              # Pulsing circles (canvas-based)
│   └── index.jsx
└── my-animation/               # Your custom animation
    ├── index.jsx
    └── assets/
        └── image.png           # Optional assets
```

animations/
├── example-animation/ # Canvas-based bouncing balls
│ └── index.jsx
├── beach-ball/ # SVG beach ball with CSS animations
│ └── index.jsx
├── pulse-circles/ # Canvas-based pulsing circles
│ └── index.jsx
└── my-animation/ # Your custom animation
├── index.jsx
└── assets/
└── image.png # Optional assets

````

### Animation Code Guidelines

## Supported React Code

When creating animations for conversion to MP4, follow these guidelines to ensure compatibility with the browser-based rendering pipeline.

### Supported React Features

| Feature | Example | Notes |
|---------|---------|-------|
| React hooks | `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo` | Fully supported |
| Functional components | `export function MyAnimation() { ... }` | Use named or default exports |
| Canvas API | `canvas.getContext('2d')` | Render graphics with requestAnimationFrame |
| SVG elements | `<svg><circle /></svg>` | Full SVG support with CSS styling |
| Inline styles | `style={{ display: 'flex', color: '#ff0000' }}` | Use JavaScript object syntax |
| CSS animations | `<style>{`@keyframes fade { ... }`}</style>` | Embed in style tags |
| Conditional rendering | `{show && <div>...</div>}` | Supported |
| Array.map for lists | `{items.map(item => <div key={item.id} />)}` | Include unique keys |

### Supported CSS in Inline Styles

```jsx
// All these properties work in inline styles:
style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100vh',
  backgroundColor: '#1a1a2e',
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '600',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  padding: '20px',
  margin: '10px',
  opacity: 0.8,
  transform: 'translateX(50px)',
  animation: 'bounce 1s infinite',
}}
````

### Supported CSS Animation Syntax

```jsx
export function AnimatedComponent() {
  return (
    <div style={{ animation: 'pulse 2s ease-in-out infinite' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.95);
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      Content
    </div>
  )
}
```

### Canvas Animation Pattern

```jsx
import React, { useRef, useEffect } from 'react'

export function BouncingBalls() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId

    function animate() {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw animated content
      ctx.fillStyle = '#ff6b6b'
      ctx.beginPath()
      ctx.arc(400, 300, 50, 0, Math.PI * 2)
      ctx.fill()

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} width={800} height={600} />
}

export default BouncingBalls
```

---

## NOT Supported React Code

### Node.js APIs (Do Not Use)

```jsx
// ❌ WON'T WORK - Node.js APIs
import fs from 'fs' // File system access
import path from 'path' // Path manipulation
import crypto from 'crypto' // Cryptography
import http from 'http' // HTTP server
import process from 'process' // Process (limited)
const data = require('./data') // CommonJS require
```

### CSS Frameworks (Do Not Use Directly)

```jsx
// ❌ WON'T WORK - Tailwind CSS classes
<div className="flex min-h-screen bg-blue-500 text-white p-4" />

// ✅ INSTEAD - Use inline styles (or run through tailwind-converter)
<div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#3b82f6', color: 'white', padding: '16px' }} />
```

### CSS Imports (Do Not Use)

```jsx
// ❌ WON'T WORK - CSS imports
import './styles.css'
import './App.css'
import styles from './App.module.css'

// ✅ INSTEAD - Embed CSS in style tags
;<style>{`
  .container {
    display: flex;
    background: #1a1a2e;
  }
`}</style>
```

### External Assets Without URL

```jsx
// ❌ WON'T WORK - Local file imports
import logo from './logo.png'
import background from './bg.jpg'

// ✅ INSTEAD - Use SVG, data URLs, or remote URLs
<img src="https://example.com/image.png" alt="logo" />
// Or embed SVG directly
<svg>...</svg>
```

### CSS Modules

```jsx
// ❌ WON'T WORK - CSS Modules
import styles from './Button.module.css'
<button className={styles.button}>Click</button>

// ✅ INSTEAD - Use inline styles or global style tags
<button style={{ background: '#3b82f6', padding: '8px 16px' }}>Click</button>
```

### Styled Components / Emotion

```jsx
// ❌ WON'T WORK - Runtime CSS-in-JS libraries
import styled from 'styled-components'
const Button = styled.button`background: blue;`

// ✅ INSTEAD - Use inline styles or CSS modules pattern
const buttonStyle = { background: '#3b82f6', padding: '8px 16px' }
<button style={buttonStyle}>Click</button>
```

---

## Complete AI Code Generation Guidelines

### Complete AI Code Generation Guidelines

========================================
🎯 COPY START HERE: AI SYSTEM PROMPT 🎯
========================================

Copy and paste this prompt when asking an AI (like ChatGPT, Claude, or Gemini) to generate animation code for this project.

You are an expert React Animation developer. Your task is to generate a standalone React component that renders a high-quality animation for video export.

========================================
🎯 COPY END HERE: AI SYSTEM PROMPT 🎯
========================================

========================================
🎯 COPY START HERE: AI SYSTEM PROMPT 🎯
========================================

Copy and paste this prompt when asking an AI (like ChatGPT, Claude, or Gemini) to generate animation code for this project.

You are an expert React Animation developer. Your task is to generate a standalone React component that renders a high-quality animation for video export.

========================================
🎯 COPY END HERE: AI SYSTEM PROMPT 🎯
========================================

## System Prompt Template for AI Agents

Copy and paste this prompt when asking an AI (like ChatGPT, Claude, or Gemini) to generate animation code for this project:

```text
You are an expert React Animation developer. Your task is to generate a standalone React component that renders a high-quality animation for video export.

**Constraints & Environment:**
- **Environment:** The code runs in a headless browser environment (Playwright) without a runtime bundler. It uses a custom AST transformer to pre-compile JSX.
- **Offline Support:** The system bundles React, ReactDOM, and **Three.js** locally. Do NOT rely on external CDNs or network requests for scripts/styles.
- **Imports:**
  - You MAY include `import React, { useState, useEffect, useRef } from 'react'` and `import * as THREE from 'three'`.
  - The build system will automatically strip these imports and inject the global `React` and `THREE` objects.
- **No External Libraries:** Do NOT import other external NPM packages. Stick to native HTML5 Canvas API, SVG, CSS animations, or **Three.js**.
- **Assets:** Do NOT import local files (images, CSS). Embed styles using a `<style>` tag or inline `style` objects. Embed images as Base64 Data URIs if strictly necessary.
- **Timing:**
  - For Canvas animations, use `requestAnimationFrame`. The rendering engine manages the clock deterministically.
  - For CSS animations, standard keyframes work perfectly.
- **Export:** Export your main component as the default export: `export default function MyAnimation() { ... }`.

**Code Structure:**
1. Return a single Functional Component.
2. Ensure the container takes up the full view (`width: 100%`, `height: 100%`) or matches specific requested dimensions (e.g. 800x600).
3. If using Canvas, use a `ref` to access the element and `useEffect` to start/cleanup the animation loop.

**Goal:** Create a visually appealing animation that loops seamlessly if possible.
```

When generating React animation code, follow these rules:

### ✅ DO:

1. **Use React hooks for state and effects**

   ```jsx
   import React, { useState, useEffect, useRef } from 'react'
   ```

2. **Use inline styles with JavaScript objects**

   ```jsx
   style={{ display: 'flex', backgroundColor: '#1a1a2e', color: '#ffffff' }}
   ```

3. **Embed CSS animations in `<style>` tags**

   ```jsx
   <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } }`}</style>
   ```

4. **Use Canvas API with requestAnimationFrame**

   ```jsx
   const animate = () => {
     /* drawing code */ requestAnimationFrame(animate)
   }
   ```

5. **Use SVG elements with inline styles**

   ```jsx
   <svg>
     <circle cx="50" cy="50" r="40" fill="#ff6b6b" />
   </svg>
   ```

6. **Export a single named or default function**

   ```jsx
   export function MyAnimation() { ... }
   // or
   export default function MyAnimation() { ... }
   ```

7. **Use standard HTML elements with camelCase CSS properties**

   ```jsx
   <div style={{ minHeight: '100vh', flexDirection: 'column' }}>
   ```

8. **Use hex colors, rgb(), or named colors**
   ```jsx
   style={{ backgroundColor: '#ff6b6b', color: 'rgb(255,255,255)' }}
   ```

### ❌ DO NOT:

1. **Do not use Tailwind CSS classes**
   - ❌ `className="flex min-h-screen bg-blue-500"`
   - ✅ Use `style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#3b82f6' }}`
   - Or run through: `npm run convert:tailwind -- input.tsx output-dir`

2. **Do not import CSS files**
   - ❌ `import './styles.css'`
   - ✅ Use `<style>{`...css content...`}</style>`

3. **Do not use Node.js modules**
   - ❌ `import fs from 'fs'`
   - ❌ `import path from 'path'`
   - ❌ `require('./data')`

4. **Do not use CSS Modules**
   - ❌ `import styles from './Button.module.css'`
   - ❌ `className={styles.button}`

5. **Do not use styled-components or emotion**
   - ❌ `import styled from 'styled-components'`
   - ❌ `const Box = styled.div`background: blue```

6. **Do not reference local image files**
   - ❌ `import img from './logo.png'`
   - ✅ Use remote URLs or embed SVG

7. **Do not use hyphens in CSS property names**
   - ❌ `style={{ 'min-height': '100vh' }}`
   - ✅ Use camelCase: `style={{ minHeight: '100vh' }}`

8. **Do not use `@import` in style tags**
   - ❌ `<style>@import url('https://fonts.googleapis.com/css2?family=Roboto');</style>`
   - ✅ Use inline styles for fonts or include font-family directly

---

## Quick Reference: Code Patterns

### Canvas Animation

```jsx
import React, { useRef, useEffect } from 'react'

export function CanvasAnimation() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let frameId

    const render = () => {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // Draw your animation here
      frameId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(frameId)
  }, [])

  return <canvas ref={canvasRef} width={800} height={600} />
}

export default CanvasAnimation
```

### CSS Animation

```jsx
export function CSSAnimation() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1a2e',
      }}
    >
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        .bouncing {
          animation: bounce 1s ease-in-out infinite;
        }
      `}</style>
      <div
        className="bouncing"
        style={{ width: '100px', height: '100px', backgroundColor: '#ff6b6b', borderRadius: '50%' }}
      />
    </div>
  )
}
```

### SVG Animation

```jsx
export function SVGAnimation() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1a2e',
      }}
    >
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="#4ecdc4" />
        <circle cx="100" cy="100" r="60" fill="#ff6b6b" />
        <circle cx="100" cy="100" r="40" fill="#ffe66d" />
        <circle cx="100" cy="100" r="20" fill="#1a535c" />
      </svg>
    </div>
  )
}
```

### Combined Animation

```jsx
import React, { useState } from 'react'

export function CombinedAnimation() {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => (r + 1) % 360)
    }, 16)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1a2e',
      }}
    >
      <div
        style={{
          width: '150px',
          height: '150px',
          backgroundColor: '#ff6b6b',
          borderRadius: '50%',
          transform: `rotate(${rotation}deg)`,
          boxShadow: '0 0 30px rgba(255,107,107,0.5)',
        }}
      />
    </div>
  )
}
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

## Converting Existing React Projects

You can convert existing React project files to MP4 video. Here's how:

### Step 1: Copy Your React Files

```bash
# Copy your React project files to the animations directory
cp /path/to/your/react-project/src/App.jsx animations/my-project/index.jsx
```

### Step 2: Adapt for Browser

Your React code must be **browser-compatible**:

| Supported                                       | Not Supported                                      |
| ----------------------------------------------- | -------------------------------------------------- |
| React hooks (`useState`, `useEffect`, `useRef`) | Node.js APIs (`fs`, `path`, `require`)             |
| Inline styles (`style={{...}}`)                 | CSS frameworks (Tailwind - must convert to inline) |
| CSS animations (`@keyframes`)                   | CSS imports (`import './styles.css'`)              |
| SVG elements                                    | External assets (images must be embedded or URL)   |
| Canvas API                                      | CSS Modules                                        |

### Step 3: Convert to Browser-Compatible Format

**Tailwind CSS to Inline Styles Converter:**

A built-in tool converts Tailwind CSS classes to inline styles automatically:

```bash
npx tsx scripts/tailwind-converter.ts <input-path> <output-directory>
```

Arguments:

- `<input-path>` - React file (`.tsx`, `.ts`, `.jsx`, `.js`) or project directory
- `<output-directory>` - Output directory for browser-compatible version

Examples:

```bash
# Convert a single TSX file
npx tsx scripts/tailwind-converter.ts ./src/App.tsx ./animations/my-project

# Convert an entire React project directory
npx tsx scripts/tailwind-converter.ts ./my-react-project ./animations/converted
```

What it does:

- Converts Tailwind CSS classes (`flex`, `min-h-screen`, `bg-blue-500`) to inline styles
- Handles gradient colors (`from-slate-50`, `to-indigo-600`)
- Extracts CSS animations to `<style>` tags
- Removes Node.js imports (`fs`, `path`, etc.)
- Converts hyphenated CSS properties to camelCase (`min-height` → `minHeight`)

**Before (Tailwind):**

```jsx
<div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-indigo-600" />
```

**After (Browser-compatible):**

```jsx
<div
  style={{
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #4f46e5 100%)',
  }}
/>
```

**CSS Animations Example:**

```jsx
// BEFORE (CSS import - won't work)
import './styles.css'

// AFTER (Embedded in style tag)
;<style>{`
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-100px); }
  }
`}</style>
```

### Step 4: Run Conversion

```bash
npm run convert:pipeline -- animations/my-project output/my-video.mp4 --fps 30 --duration 5
```

### Example: Converting a React Project with Tailwind CSS

If you have a React project with Tailwind CSS at `/home/user/my-react-app/src/App.jsx`:

**Step 1: Copy your React files to the animations directory**

```bash
mkdir -p animations/my-react-app
cp /home/user/my-react-app/src/App.jsx animations/my-react-app/index.jsx
```

**Step 2: Convert Tailwind CSS to inline styles (automatic)**

```bash
npx tsx scripts/tailwind-converter.ts animations/my-react-app/index.jsx animations/my-react-app
```

**Step 3: Convert to video**

```bash
npm run convert:pipeline -- animations/my-react-app output/my-react-video.mp4 --fps 30 --duration 5
```

**Full one-liner:**

```bash
mkdir -p animations/my-react-app && \
  cp /home/user/my-react-app/src/App.jsx animations/my-react-app/index.jsx && \
  npx tsx scripts/tailwind-converter.ts animations/my-react-app/index.jsx animations/my-react-app && \
  npm run convert:pipeline -- animations/my-react-app output/my-react-video.mp4 --fps 30 --duration 5
```

### Tips for Converting Complex Animations

1. **Extract CSS** - Copy `@keyframes` and styles into a `<style>` tag
2. **Convert classes** - Change `className="flex items-center"` to `style={{ display: 'flex', alignItems: 'center' }}`
3. **Embed images** - Replace `<img src="./logo.png">` with base64 or SVG
4. **Test in browser** - Open the generated HTML to check for errors

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

| Option       | Description                     | Default |
| ------------ | ------------------------------- | ------- |
| `--fps`      | Frame rate                      | 30      |
| `--duration` | Video duration in seconds       | 5       |
| `--width`    | Video width in pixels           | 800     |
| `--height`   | Video height in pixels          | 600     |
| `--quality`  | Video quality (low/medium/high) | medium  |

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

| Variable   | Description             | Default     |
| ---------- | ----------------------- | ----------- |
| `PORT`     | Development server port | 3000        |
| `NODE_ENV` | Environment mode        | development |

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

## Quick Reference

### Convert React with Tailwind to MP4

```bash
# 1. Copy React file
mkdir -p animations/my-animation
cp /path/to/App.tsx animations/my-animation/index.jsx

# 2. Convert Tailwind to inline styles (choose one)
npm run convert:tailwind -- animations/my-animation/index.jsx animations/my-animation
# or
npx tsx scripts/tailwind-converter.ts animations/my-animation/index.jsx animations/my-animation

# 3. Convert to MP4
npm run convert:pipeline -- animations/my-animation output/video.mp4 --fps 30 --duration 5
```

### Common Commands

| Task                        | Command                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| Convert animation to MP4    | `npm run convert:pipeline -- animations/<name> output/video.mp4` |
| Convert Tailwind React file | `npm run convert:tailwind -- <input> <output>`                   |
| Test HTML generation        | `npm run convert:test1`                                          |
| Test frame capture          | `npm run convert:test2`                                          |
| Test video encoding         | `npm run convert:test3`                                          |
| Validate animation          | `npm run validate -- animations/<name>`                          |
| Lint code                   | `npm run lint`                                                   |

### Options for Conversion

| Option       | Description               | Default |
| ------------ | ------------------------- | ------- |
| `--fps`      | Frame rate                | 30      |
| `--duration` | Duration in seconds       | 5       |
| `--width`    | Width in pixels           | 800     |
| `--height`   | Height in pixels          | 600     |
| `--quality`  | Quality (low/medium/high) | medium  |

## License

MIT
