# Infinte_Asset Project Context

## Project Overview

Infinte_Asset is a specialized Node.js tool that converts React animation code to MP4 video files using a multi-stage pipeline. It leverages Playwright for browser rendering and FFmpeg for video encoding to create high-quality videos from React-based animations.

### Key Features
- Convert React animation components to MP4 video format
- Real browser rendering via Playwright
- Support for custom resolution, frame rate, and duration
- Built-in animation validation
- Stage-by-stage testing for debugging
- Comprehensive test suite

### Architecture
The system operates through a 3-stage pipeline:
1. **HTML Generator** - Converts React JSX files into a self-contained HTML page using TypeScript Compiler API
2. **Browser Renderer** - Captures frames with Playwright in a headless browser using Clock API for perfect frame synchronization
3. **Video Encoder** - Combines PNG frames into an MP4 video using FFmpeg

## Prerequisites

- Node.js v18 or higher
- FFmpeg installed on your system
- Playwright browsers (installed automatically)

### Installing Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Install FFmpeg (Ubuntu/Debian)
sudo apt update && sudo apt install ffmpeg
```

## Project Structure

```
infinte-asset/
├── animations/              # Animation files go here
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

## Building and Running

### Main Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

### Animation Conversion
```bash
# Convert bouncing balls animation
npm run convert:pipeline -- animations/example-animation output/demo.mp4 --fps 30 --duration 5 --quality high

# Convert beach ball animation
npm run convert:pipeline -- animations/beach-ball output/beach-ball.mp4 --fps 30 --duration 5

# Convert with custom options
npm run convert:pipeline -- animations/example-animation output/video.mp4 \
  --fps 60 \
  --duration 10 \
  --width 1920 \
  --height 1080 \
  --quality high
```

### Stage Testing
```bash
# Test individual stages for debugging
npm run convert:test1  # HTML generation
npm run convert:test2  # Frame capture
npm run convert:test3  # Video encoding
npm run convert:test   # All stages
```

### Animation Validation
```bash
# Validate animation code
npm run validate -- animations/example-animation

# With additional checks
npm run validate -- animations/example-animation \
  --check-syntax \
  --check-imports
```

## Animation Development Guidelines

### Supported React Features
- React hooks (useState, useEffect, useRef, useCallback, useMemo)
- Functional components (named or default exports)
- Canvas API with requestAnimationFrame
- SVG elements with inline styles
- Inline styles with JavaScript object syntax
- CSS animations embedded in style tags
- Conditional rendering and array mapping

### Not Supported
- Node.js APIs (fs, path, crypto, etc.)
- CSS imports or external stylesheets
- CSS Modules or styled-components
- Local file imports (images, assets)
- Tailwind CSS classes (must be converted to inline styles)

### Animation File Requirements
- Main file must be named `index.jsx` (not .js, .ts, or .tsx)
- Must export a React component (named export or default export)
- Must use browser-compatible JavaScript (no Node.js APIs)
- Imports should use CDN packages or be removed for browser execution

### Example Animation Structure
```jsx
import React, { useRef, useEffect } from 'react'

export function MyAnimation() {
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

export default MyAnimation
```

### Tailwind CSS Conversion
A built-in tool converts Tailwind CSS classes to inline styles:
```bash
# Convert a single TSX file
npx tsx scripts/tailwind-converter.ts ./src/App.tsx ./animations/my-project

# Convert an entire React project directory
npx tsx scripts/tailwind-converter.ts ./my-react-project ./animations/converted
```

## Development Conventions

### Code Quality
- TypeScript is used throughout the project
- ESLint and Prettier for code formatting and linting
- Jest for testing with coverage reports
- Husky for pre-commit hooks

### Type Safety
- Strict TypeScript configuration
- Type definitions for all major dependencies
- Comprehensive type checking with `npm run typecheck`

### Testing
- Unit tests for individual pipeline stages
- Integration tests for the full conversion pipeline
- Test coverage reports to ensure code quality

## API Endpoints (Development Server)

When running `npm run dev`:

- `GET /api/animations` - List all available animations
- `GET /api/render/:name` - Get animation details
- `POST /api/render/:name` - Start rendering an animation
- `GET /health` - Health check

## Troubleshooting

### Common Issues
- **Animation not found**: Ensure animation is in `animations/<your-animation>/index.jsx`
- **FFmpeg not found**: Install FFmpeg and ensure it's in your system PATH
- **Playwright not available**: Run `npx playwright install chromium`
- **Conversion fails**: Test individual stages with `npm run convert:test1/2/3`

### Memory Issues
- Reduce video resolution or duration in conversion options
- Process animations in smaller chunks if needed

## Specialized Agents

The project includes specialized automation agents:
- **Git Agent**: Automates version control operations
- **Tester Agent**: Handles quality assurance tasks (tests, linting, type-checking)

## License

MIT License