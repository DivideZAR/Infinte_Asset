# System Architecture

## Overview

Infinte_Asset is a specialized toolchain for converting React-based animations into high-quality MP4 video files. It leverages a multi-stage pipeline that combines server-side code transformation, headless browser automation, and video encoding.

## Core Components

### 1. Agents

The project utilizes specialized sub-agents to automate development and operational workflows.

*   **Git Agent** (`scripts/Git_Agent.js`)
    *   **Role**: Version Control Automation.
    *   **Capabilities**: Committing, branching, pushing/pulling, status checks.
    *   **CLI**: Exposed via `git-agent`.

*   **Tester Agent** (`scripts/Tester_Agent.js`)
    *   **Role**: Quality Assurance.
    *   **Capabilities**: Running test suites, linting, type-checking, auto-fixing issues.
    *   **CLI**: Exposed via `node scripts/tester.js`.

### 2. Conversion Pipeline

The core functionality is orchestrated by `scripts/stages/pipeline.ts`.

```mermaid
graph TD
    Input[React Animation Source] --> Stage1
    
    subgraph Stage 1: HTML Generation
    Stage1[html-generator.ts]
    Step1A[Load Source Files]
    Step1B[Transform AST (TypeScript API)]
    Step1C[Embed Local React/ReactDOM]
    Step1D[Inject Animation Ready Signal]
    Step1E[Generate Offline-Ready HTML]
    
    Step1A --> Step1B --> Step1C --> Step1D --> Step1E
    end
    
    Stage1 --> HTML[animation.html]
    HTML --> Stage2
    
    subgraph Stage 2: Browser Rendering
    Stage2[browser-renderer.ts]
    Step2A[Launch Playwright (Chromium)]
    Step2B[Load HTML]
    Step2C[Wait for window.animationReady]
    Step2D[Loop: Capture Frames]
    
    subgraph Capture Loop
    Loop1[Fast Forward Clock]
    Loop2{Has Canvas?}
    Loop3A[canvas.toDataURL]
    Loop3B[page.screenshot]
    
    Loop1 --> Loop2
    Loop2 -- Yes --> Loop3A
    Loop2 -- No --> Loop3B
    end
    
    Step2A --> Step2B --> Step2C --> Step2D
    Step2D --> Loop1
    end
    
    Stage2 --> Frames[PNG Sequence]
    Frames --> Stage3
    
    subgraph Stage 3: Video Encoding
    Stage3[video-encoder.ts]
    Step3A[FFmpeg Input Sequence]
    Step3B[Apply Filters (Scale/Pad)]
    Step3C[Encode H.264 MP4]
    
    Step3A --> Step3B --> Step3C
    end
    
    Stage3 --> Output[Final MP4]
```

## Detailed Data Flow

### Stage 1: HTML Generation (`scripts/stages/html-generator.ts`)
*   **Input**: A directory containing a React component (`index.jsx`).
*   **Process**:
    *   Uses the **TypeScript Compiler API** to parse the source code.
    *   Strips `import` and `export` statements to make the code browser-compatible without a bundler.
    *   Identifies the main component (e.g., `export default function MyAnimation`).
    *   Injects **local vendor scripts** (`react.production.min.js`, `react-dom.production.min.js`) for offline support.
    *   Appends a `ReactDOM.createRoot(...).render(...)` call.
    *   Appends `window.animationReady = true` to signal readiness.
*   **Output**: A standalone `animation.html` file.

### Stage 2: Browser Rendering (`scripts/stages/browser-renderer.ts`)
*   **Input**: `animation.html`.
*   **Process**:
    *   Launches a headless **Chromium** instance via **Playwright**.
    *   Uses **Playwright's Clock API** to override the browser's native time.
    *   Waits for `window.animationReady`.
    *   **Frame Capture Loop**:
        1.  Fast-forwards time by exactly `1000 / fps` ms.
        2.  Checks for a `<canvas>` element.
        3.  **Optimization**: If a canvas exists, captures data via `toDataURL()` (faster).
        4.  **Fallback**: Otherwise, takes a full viewport screenshot.
*   **Output**: A directory of numbered PNG files (`frame_0001.png`, etc.).

### Stage 3: Video Encoding (`scripts/stages/video-encoder.ts`)
*   **Input**: PNG frame sequence.
*   **Process**:
    *   Uses **fluent-ffmpeg** to wrap the FFmpeg binary.
    *   Applies scaling and padding filters to match the requested output resolution (default 1920x1080).
    *   Encodes video using `libx264` (H.264 codec) with configurable CRF (quality) and preset.
*   **Output**: A `.mp4` video file.

## Technical Decisions

*   **Deterministic Timing**: We rely on synthetic time control (`page.clock`) rather than real-time capturing to ensure zero dropped frames and perfect synchronization, regardless of system load.
*   **Offline First**: By bundling React/ReactDOM and pre-compiling JSX, the pipeline runs without an internet connection and avoids CDN latency.
*   **AST Transformation**: We replaced regex-based code parsing with AST transformations to handle complex React code structures robustly.
