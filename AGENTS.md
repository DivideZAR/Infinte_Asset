# Agent Guidelines for Infinte_Asset

Converts React animation code to MP4 video files using Node.js, Playwright, and FFmpeg.

## Build/Lint/Test Commands

```bash
# Dependencies & Setup
npm install

# Development & Build
npm run dev              # Start dev server
npm run build            # Build TypeScript to dist/

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run typecheck        # TypeScript type checking
npm run format           # Run Prettier

# Testing
npm test                 # Run all tests (Jest, ESM mode, tests/ root)
npm test -- path/to/test.test.js  # Run single test file
npm test:watch           # Watch mode for TDD
npm test:coverage        # Generate coverage report

# Animation Conversion
npm run convert -- input-dir output.mp4        # Convert animation
npm run convert:pipeline -- input-dir output   # Full pipeline
npm run validate -- path/to/animation          # Validate animation
```

## Technology Stack

- **Runtime**: Node.js v18+ (ESM modules)
- **Language**: TypeScript (strict mode enabled)
- **Frontend**: React 18 with hooks
- **Rendering**: Playwright (headless browser)
- **Video**: FFmpeg (fluent-ffmpeg)
- **Testing**: Jest with ESM support
- **Linting**: ESLint + Prettier

## Project Structure

```
/
├── animations/          # React animation components (index.jsx/tsx)
├── scripts/             # Build & conversion scripts
│   └── stages/          # Pipeline stages (html-generator, browser-renderer, video-encoder)
├── tests/               # Jest tests (fixtures/, *.test.js)
├── vendor/              # Bundled libraries (React, ReactDOM, Three.js)
├── output/              # Generated MP4 files
├── temp/                # Temporary build files
└── src/                 # Main entry point
```

## Code Style Guidelines

### Imports

- ES6 imports only: `import React from 'react'`
- Order: Node built-ins → external packages → internal modules
- Use `@typescript-eslint/consistent-type-imports` (ESLint enforced)
- Example:
  ```javascript
  import fs from 'fs'
  import { exec } from 'child_process'
  import React from 'react'
  import { validateSource } from '../scripts/validate'
  ```

### Formatting (Prettier)

- Single quotes, 2 spaces, 100 char width
- No semicolons, trailing commas in multi-line
- Arrow parens always
- Configured in `.prettierrc`

### Types (TypeScript)

- Strict mode: `noImplicitAny`, `noImplicitReturns`, `noUnusedLocals`
- Use interfaces for object shapes, type aliases for unions
- Export types used by other modules
- Avoid `any` - use `unknown` for truly unknown types

### Naming Conventions

- **Files**: kebab-case utilities (`animation-validator.ts`), PascalCase components (`AnimationPlayer.tsx`)
- **Variables/Functions**: camelCase (`convertAnimation`, `outputPath`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_VIDEO_DURATION`, `DEFAULT_FPS`)
- **Classes**: PascalCase (`VideoConverter`, `PipelineError`)
- **React Components**: PascalCase (`AnimationPlayer`, `VideoExporter`)

### Error Handling

- Always use async/await with try-catch for async operations
- Create custom error classes extending Error
- Provide context in error messages
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

### React Components

- Use functional components with hooks
- TypeScript props interfaces
- Keep components focused on one responsibility
- Use key props when rendering lists

### Testing (Jest)

- Root: `tests/` directory
- Pattern: `**/*.test.{js,ts}`
- Use descriptive test names
- Mock external dependencies (file system, browser automation)
- Test error cases alongside success cases

### ESLint Rules (Key Enforcement)

- `@typescript-eslint/consistent-type-imports`: error
- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: error (ignore `^_` prefix)
- `react/react-in-jsx-scope`: off
- `import/order`: error (builtin, external, internal, parent, sibling, index, alphabetical)
- `import/no-unresolved`: error

## Best Practices

- Always handle cleanup (temp files, browser instances) in finally blocks
- Provide progress feedback for long-running operations
- Validate animation code before conversion (syntax, dependencies)
- Use absolute paths when working with file system
- Check for required tools (FFmpeg, Playwright) at startup
- Use JSDoc comments for public API functions
- Avoid deeply nested code (max 3-4 levels)

## Security

- Sanitize file paths to prevent directory traversal
- Validate animation code to prevent code injection
- Set timeouts for conversion processes
- Don't expose system paths in error messages
- Use safe temp file directories

## Git Workflow

- Create feature branches: `feature/name`, `fix/name`, `docs/name`
- Use conventional commits: `type(scope): subject`
- Run full test suite before commits: `npm run typecheck && npm run lint && npm test && npm run build`
- Use `git-agent` CLI for git operations
