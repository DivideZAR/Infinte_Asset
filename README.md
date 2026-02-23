# Infinte_Asset

Convert React animation code to MP4 video files using Node.js with Playwright browser rendering.

## Features

- Convert React animation components to MP4 video format
- Real browser rendering via Playwright
- Support for custom resolution, frame rate, and duration
- Built-in animation validation
- Stage-by-stage testing for debugging
- Comprehensive test suite

For a detailed deep-dive into how our system works, see [ARCHITECTURE.md](ARCHITECTURE.md).

## OpenCode AI Agents

This project includes configured OpenCode AI subagents for specialized tasks:

### Git Agent (`@git-agent`)

- **Purpose**: Git operations and repository management
- **Capabilities**: Branch management, commits, merges, repository analysis
- **Usage**: Automatically invoked for git-related tasks, or use `@git-agent [command]`

### Tester Agent (`@tester-agent` / `tester`)

- **Purpose**: Testing pipeline and code quality validation
- **Capabilities**: TypeScript checking, linting, test execution, build validation
- **Usage**: Automatically invoked for testing tasks, or use `@tester-agent [command]` or global `tester [command]`
- **Global Commands**: `tester all`, `tester status`, `tester typecheck`, `tester lint`, `tester test`, `tester build`

### Automatic Invocation

Primary agents automatically invoke subagents when they encounter matching tasks:

- Git-related tasks → `@git-agent`
- Testing/validation tasks → `@tester-agent`

### Manual Invocation

Invoke subagents directly using `@` mentions:

```bash
@git-agent create a feature branch for user authentication
@tester-agent run the full test suite and report issues
```

For detailed agent configuration, see [`.opencode/README.md`](.opencode/README.md).

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

6. **Add your React animations** to the `animations/` directory (see "Where to Add Animations" below)

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

1. **HTML Generator** - Converts React JSX files into a self-contained HTML page. It uses **TypeScript Compiler API** to pre-compile JSX and bundles local React/ReactDOM libraries for **offline support**.
2. **Browser Renderer** - Loads the HTML in a headless Playwright browser and captures frames as PNG images. It uses **Clock API** for perfect frame synchronization and **Canvas optimization** for high performance.
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
└── my-animation/
    ├── index.jsx
    └── assets/
        └── image.png           # Optional assets
```

## Supported React Code

When creating animations for conversion to MP4, follow these guidelines to ensure compatibility with the browser-based rendering pipeline.

### Supported React Features

| Feature               | Example                                                     | Notes                                      |
| --------------------- | ----------------------------------------------------------- | ------------------------------------------ |
| React hooks           | `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo` | Fully supported                            |
| Functional components | `export function MyAnimation() { ... }`                     | Use named or default exports               |
| Canvas API            | `canvas.getContext('2d')`                                   | Render graphics with requestAnimationFrame |
| SVG elements          | `<svg><circle /></svg>`                                     | Full SVG support with CSS styling          |
| Inline styles         | `style={{ display: 'flex', color: '#ff0000' }}`             | Use JavaScript object syntax               |
| CSS animations        | `<style>{`@keyframes fade { ... }`}</style>`                | Embed in style tags                        |
| Conditional rendering | `{show && <div>...</div>}`                                  | Supported                                  |
| Array.map for lists   | `{items.map(item => <div key={item.id} />)}`                | Include unique keys                        |

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
```

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
```

---

========================================
🎯 COPY START HERE: AI SYSTEM PROMPT 🎯
========================================

Copy and paste this prompt when asking an AI (like ChatGPT, Claude, or Gemini) to generate animation code for this project.

You are an expert React Animation developer. Your task is to generate a standalone React component that renders a high-quality animation for video export.

**Constraints & Environment:**

- **Environment:** The code runs in a headless browser environment (Playwright) without a runtime bundler. It uses a custom AST transformer to pre-compile JSX.
- **Offline Support:** The system bundles React, ReactDOM, and **Three.js** locally. Do NOT rely on external CDNs or network requests for scripts/styles.
- **Imports:**
  - You MAY include `import React, { useState, useEffect, useRef } from 'react'` and `import * as THREE from 'three'`.
  - The build system will automatically strip these imports and injects global `React` and `THREE` objects.
- **No External Libraries:** Do NOT import other external NPM packages. Stick to native HTML5 Canvas API, SVG, CSS animations, or **Three.js**.
- **Assets:** Do NOT import local files (images, CSS). Embed styles using a `<style>` tag or inline `style` objects. Embed images as Base64 Data URIs if strictly necessary.
- **Timing:**
  - For Canvas animations, use `requestAnimationFrame`. The rendering engine manages the clock deterministically.
  - For CSS animations, standard keyframes work perfectly.
- **Export:** Export your main component as a default export: `export default function MyAnimation() { ... }`.

**Code Structure:**

1. Return a single Functional Component file in index.jsx.
2. Ensure the container takes up the full view (`width: 100%`, `height: 100%`) or matches specific requested dimensions (e.g. 800x600).
3. If using Canvas, use a `ref` to access the element and `useEffect` to start/cleanup animation loop.

**Goal:** Create a visually appealing animation that loops seamlessly if possible.

---

## Animation Code Template for AI Developers

This section provides a template for AI code generators to create animations that work with this video conversion pipeline.

---

### YOUR ANIMATION DESCRIPTION

Describe your animation here when using this template with an AI code generator:

```
Example: "Create a 3D scene with a rotating red cube on a dark background.
The cube should rotate on both X and Y axes continuously."
```

---

### IMPORTANT: Required Setup for Video Conversion

For your animation to be converted to MP4, it MUST follow one of these patterns:

| ✅ WORKS               | ❌ DOESN'T WORK                                    |
| ---------------------- | -------------------------------------------------- |
| THREE.js (frame-based) | React useState + useEffect + requestAnimationFrame |
| Canvas (frame-based)   | framer-motion                                      |
| WebGL (frame-based)    | Remotion                                           |
|                        | Canvas with real-time RAF                          |
|                        | CSS animations                                     |

**Critical:** Use `window.renderFrame(frameNumber)` for frame-based rendering!

---

### Template Option 1: THREE.js (FRAME-BASED - Recommended)

```jsx
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function MyAnimation() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // === YOUR SCENE SETUP HERE ===
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)

    // === YOUR ANIMATION OBJECTS HERE ===
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    camera.position.z = 5

    // === FRAME-BASED RENDERING (required for video capture) ===
    // The video capture system calls this function for each frame
    window.renderFrame = (frameNumber) => {
      // Calculate progress (0 to 1) based on frame number
      // Default: 30fps, 5 seconds = 150 frames
      const fps = 30
      const duration = 5
      const totalFrames = fps * duration
      const t = frameNumber / totalFrames // t from 0 to 1

      // Update animation based on 't' (progress)
      cube.rotation.x = t * Math.PI * 2 // Full rotation over video
      cube.rotation.y = t * Math.PI * 2

      renderer.render(scene, camera)
    }

    // Initial render
    renderer.render(scene, camera)

    // === SIGNAL READY ===
    window.animationReady = true

    // === CLEANUP ===
    return () => {
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100vh', background: '#000' }} />
}
```

---

### Template Option 2: HTML5 Canvas (FRAME-BASED - Recommended)

```jsx
import React, { useEffect, useRef } from 'react'

export default function MyAnimation() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = 800
    canvas.height = 600

    // === DRAW FUNCTION (called by render system) ===
    const drawScene = (t) => {
      // t = animation progress from 0 to 1
      // This is called by the video capture system, not RAF

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // === YOUR DRAWING CODE HERE ===
      // Use 't' parameter for animation progress (0 = start, 1 = end)
      const x = t * canvas.width
      ctx.fillStyle = '#00ff00'
      ctx.fillRect(x, 300, 50, 50)
    }

    // === FRAME-BASED RENDERING (required for video capture) ===
    // The video capture system calls this function for each frame
    window.renderFrame = (frameNumber) => {
      // Calculate progress (0 to 1) based on frame number
      // Default: 30fps, 5 seconds = 150 frames
      const fps = 30
      const duration = 5
      const totalFrames = fps * duration
      const t = frameNumber / totalFrames

      drawScene(t)
    }

    // === SIGNAL READY ===
    window.animationReady = true
  }, [])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
}
```

---

### Template Option 3: HTML5 Canvas (REAL-TIME - Not Recommended)

This approach uses requestAnimationFrame but may not work reliably with video capture:

```jsx
import React, { useEffect, useRef } from 'react'

export default function MyAnimation() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = 800
    canvas.height = 600

    let x = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // === YOUR DRAWING CODE HERE ===
      ctx.fillStyle = '#00ff00'
      ctx.fillRect(x, 300, 50, 50)
      x = (x + 2) % canvas.width

      requestAnimationFrame(animate)
    }

    animate()

    // === IMPORTANT: SIGNAL READY ===
    window.animationReady = true
  }, [])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
}
```

---

### What NOT to Use

These patterns will NOT work with the video conversion pipeline:

```jsx
// ❌ BAD: React state-based animation (produces static video)
const [progress, setProgress] = useState(0)
useEffect(() => {
  const loop = () => {
    setProgress((p) => p + 0.01) // Won't animate in video!
    requestAnimationFrame(loop)
  }
  loop()
}, [])

// ❌ BAD: framer-motion (not supported)
import { motion } from 'framer-motion'

// ❌ BAD: Remotion (not supported)
import { Composition } from 'remotion'
```

---

### Quick Checklist for AI Developers

- [ ] Using THREE.js or Canvas API
- [ ] Uses window.renderFrame(frameNumber) for frame-based rendering
- [ ] Includes window.animationReady = true signal
- [ ] Exports as default function
- [ ] NO useState for animation progress
- [ ] NO real-time requestAnimationFrame loop
- [ ] NO framer-motion or Remotion

**Key:** Use `window.renderFrame = (frameNumber) => { ... }` instead of RAF!

---

## System Prompt Template for AI Agents
