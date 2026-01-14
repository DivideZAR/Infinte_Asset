# Infinte_Asset Project Context

## Overview
**Infinte_Asset** is a specialized tool for converting **React-based animations** into **MP4 video files**. It leverages a headless browser (Playwright) to render frames from React components and uses FFmpeg to stitch them into high-quality videos.

## Architecture
The conversion process follows a strict **3-stage pipeline**:

1.  **HTML Generation (`scripts/stages/html-generator.ts`)**
    *   Takes a user-provided React component (`index.jsx`).
    *   Wraps it in a standalone HTML file with React/ReactDOM injected via CDN.
    *   Output: `temp/<uuid>/animation.html`

2.  **Browser Rendering (`scripts/stages/browser-renderer.ts`)**
    *   Launches a headless Playwright browser.
    *   Loads the generated HTML.
    *   Captures individual frames as PNG images at the specified FPS.
    *   Output: `temp/<uuid>/frames/*.png`

3.  **Video Encoding (`scripts/stages/video-encoder.ts`)**
    *   Uses FFmpeg (`fluent-ffmpeg`) to compile the PNG sequence into an MP4 file.
    *   Output: User-specified output path (e.g., `output/video.mp4`).

## Key Directories
*   `animations/`: **Input directory.** Users place their React animation projects here. Each subfolder (e.g., `animations/my-project/`) must contain an `index.jsx` entry point.
*   `output/`: **Output directory.** Destination for the final MP4 files.
*   `scripts/`: Contains the pipeline logic (`stages/`), validation tools (`validate.ts`), and dev server (`dev-server.ts`).
*   `tests/`: Jest unit tests.

## Development & Usage

### Prerequisites
*   Node.js (v18+)
*   FFmpeg (System-wide install required)
*   Playwright Browsers (`npx playwright install chromium`)

### Core Commands
*   **Convert an Animation:**
    ```bash
    npm run convert:pipeline -- animations/<name> output/<name>.mp4 [options]
    # Options: --fps 30 --duration 5 --width 800 --height 600
    ```
*   **Validate an Animation:**
    ```bash
    npm run validate -- animations/<name> --check-syntax --check-imports
    ```
*   **Run Dev Server:**
    ```bash
    npm run dev
    # Starts Express API at http://localhost:3000
    ```
*   **Run Tests:**
    ```bash
    npm test
    # Individual stages: npm run convert:test1 | test2 | test3
    ```

### Animation Guidelines
*   **Entry Point:** Must be `index.jsx`.
*   **Export:** Must export a React component (default or named).
*   **Environment:** Code runs in the **browser**, not Node.js. Avoid `fs`, `path`, or other Node-only modules. Use standard Web APIs (Canvas, DOM).

## Common Issues
*   **Missing FFmpeg:** The pipeline will fail immediately if `ffmpeg` is not in the system PATH.
*   **Node.js APIs in Animation:** Using `require('fs')` in `index.jsx` will crash the browser renderer stage.
*   **Validation:** Always run `npm run validate` if the conversion fails mysteriously.
