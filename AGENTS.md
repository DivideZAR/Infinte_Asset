# Agent Guidelines for Infinte_Asset

This project converts React animation code to MP4 video files using Node.js.

## Build/Lint/Test Commands

```bash
# Install dependencies
npm install

# Run development server (if applicable)
npm run dev

# Lint code
npm run lint

# Type checking (if using TypeScript)
npm run typecheck

# Run all tests
npm test

# Run single test file
npm test -- path/to/test.test.js

# Run tests with specific pattern
npm test -- --grep "animation.*conversion"

# Build for production
npm run build

# Convert a React animation to MP4
npm run convert -- input-dir output-file.mp4

# Validate animation code before conversion
npm run validate -- path/to/animation
```

## Technology Stack

- **Runtime**: Node.js (v18+ recommended)
- **Language**: JavaScript/TypeScript (prefer TypeScript)
- **Frontend**: React (for animation code)
- **Video Capture**: Puppeteer or Playwright (for recording)
- **Video Encoding**: FFmpeg (via fluent-ffmpeg)
- **Testing**: Jest or Vitest
- **Linting**: ESLint + Prettier

## Project Structure

```
/
├── animations/          # React animation components
│   └── example-animation/
│       ├── index.jsx
│       └── assets/
├── scripts/             # Build and conversion scripts
│   ├── convert.js
│   └── validate.js
├── output/              # Generated MP4 files
├── tests/               # Test files
├── package.json
└── README.md            # User guide
```

## Code Style Guidelines

### Imports

- Use ES6 imports: `import React from 'react'`
- Group imports in this order:
  1. Node.js built-ins
  2. External packages
  3. Internal modules (with relative paths)
- Use named exports for animations, default only for main components
- Example:
  ```javascript
  import { exec } from 'child_process'
  import React from 'react'
  import { AnimationWrapper } from '../components/wrapper'
  ```

### Formatting

- Use Prettier with default settings
- Maximum line length: 100 characters
- Use single quotes for strings
- Use trailing commas in multi-line objects/arrays
- No semicolons (preferred) or consistent semicolons

### Types

- Prefer TypeScript with strict mode enabled
- Use interfaces for object shapes
- Use type aliases for unions/primitives
- Export types used by other modules
- Avoid `any` - use `unknown` when type is truly unknown
- Example:
  ```typescript
  interface ConversionOptions {
    duration: number
    fps: number
    quality: 'low' | 'medium' | 'high'
  }
  ```

### Naming Conventions

- **Files**: kebab-case for utilities, PascalCase for components
  - `animation-validator.js`
  - `AnimationWrapper.jsx`
- **Variables/Functions**: camelCase
  - `convertAnimation()`, `outputPath`
- **Constants**: UPPER_SNAKE_CASE
  - `MAX_VIDEO_DURATION`, `DEFAULT_FPS`
- **Classes**: PascalCase
  - `VideoConverter`, `AnimationRenderer`
- **React Components**: PascalCase
  - `AnimationPlayer`, `VideoExporter`

### Error Handling

- Always use async/await with try-catch for async operations
- Create custom error classes for specific error types
- Provide clear, actionable error messages
- Log errors with context (using console.error or logging library)
- Validate inputs before processing
- Example:
  ```javascript
  class ConversionError extends Error {
    constructor(message, public cause) {
      super(message)
      this.name = 'ConversionError'
    }
  }
  
  async function convertAnimation(source) {
    try {
      validateSource(source)
      return await performConversion(source)
    } catch (error) {
      throw new ConversionError('Failed to convert animation', error)
    }
  }
  ```

### React Component Guidelines

- Use functional components with hooks
- Extract complex logic into custom hooks
- Use TypeScript props interfaces
- Keep components focused on one responsibility
- Use key props when rendering lists
- Example:
  ```typescript
  interface AnimationPlayerProps {
    source: string
    autoPlay?: boolean
    onComplete?: () => void
  }
  
  export const AnimationPlayer: React.FC<AnimationPlayerProps> = ({
    source,
    autoPlay = true,
    onComplete
  }) => {
    // Component logic
  }
  ```

### Code Organization

- Keep functions small and focused (single responsibility)
- Extract reusable logic into utility functions
- Use JSDoc comments for public API functions
- Avoid deeply nested code (max 3-4 levels)
- Prefer composition over inheritance

### Testing Guidelines

- Write unit tests for utility functions
- Write integration tests for conversion pipelines
- Use descriptive test names (should describe the behavior)
- Mock external dependencies (file system, browser automation)
- Test error cases alongside success cases
- Example:
  ```javascript
  describe('AnimationConverter', () => {
    it('should convert valid animation to MP4', async () => {
      const result = await convertAnimation(validSource)
      expect(result.success).toBe(true)
      expect(result.outputPath).toMatch(/\.mp4$/)
    })
    
    it('should throw error for invalid animation', async () => {
      await expect(
        convertAnimation(invalidSource)
      ).rejects.toThrow(ValidationError)
    })
  })
  ```

## Best Practices

- Always handle cleanup (temp files, browser instances)
- Provide progress feedback for long-running operations
- Use environment variables for configuration
- Validate animation code before conversion (syntax, dependencies)
- Document complex algorithms with inline comments
- Use absolute paths when working with file system
- Check for required tools (FFmpeg, Node.js) at startup

## Security Considerations

- Sanitize file paths to prevent directory traversal
- Validate animation code to prevent code injection
- Set timeouts for conversion processes
- Don't expose system paths in error messages
- Use safe temp file directories
