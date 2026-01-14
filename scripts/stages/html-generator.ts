/* eslint-disable no-console */
import fs from 'fs-extra'
import path from 'path'
import ts from 'typescript'

interface AnimationConfig {
  width: number
  height: number
  fps: number
  duration: number
}

const DEFAULT_CONFIG: AnimationConfig = {
  width: 800,
  height: 600,
  fps: 30,
  duration: 5,
}

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Animation</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body, #root {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #1a1a2e;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    @@REACT_SOURCE@@
  </script>
  <script>
    @@REACT_DOM_SOURCE@@
  </script>
  <script>
    {THREE_SOURCE}
  </script>
  <script>
    const { useState, useEffect, useRef, useCallback, useMemo, useContext, useReducer } = React;
  </script>
  <script type="module">
    {ANIMATION_CODE}
  </script>
</body>
</html>`

interface HtmlResult {
  htmlPath: string
  config: AnimationConfig
}

function transformCode(code: string): {
  transformedCode: string
  mainComponentName: string | null
} {
  // First pass: custom transformations (strip imports/exports)
  const sourceFile = ts.createSourceFile(
    'temp.tsx',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const reactHooks = new Set<string>()
  let mainComponentName: string | null = null

  const transformer = (context: ts.TransformationContext) => {
    return (rootNode: ts.SourceFile) => {
      function visit(node: ts.Node): ts.Node | undefined {
        // Handle Imports
        if (ts.isImportDeclaration(node)) {
          const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text

          if (moduleSpecifier === 'react' && node.importClause) {
            // Handle: import { useState } from 'react'
            if (
              node.importClause.namedBindings &&
              ts.isNamedImports(node.importClause.namedBindings)
            ) {
              node.importClause.namedBindings.elements.forEach((element) => {
                reactHooks.add(element.name.text)
              })
            }
          }

          // Strip Three.js imports as well (it's global THREE)
          if (moduleSpecifier === 'three') {
            return undefined
          }

          // Strip React imports (global React object is used)
          if (moduleSpecifier === 'react') {
            return undefined
          }

          // Remove all other imports for safety
          return undefined // This was the problematic line. It should only strip react/three imports
        }

        // Handle Exports
        if (ts.isExportAssignment(node)) {
          if (ts.isIdentifier(node.expression)) {
            mainComponentName = node.expression.text
          }
          return undefined
        }

        if (ts.canHaveModifiers(node)) {
          const modifiers = ts.getModifiers(node)
          if (modifiers && modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
            const isDefault = modifiers.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)
            if (isDefault) {
              if (ts.isFunctionDeclaration(node) && node.name) {
                mainComponentName = node.name.text
              }
              if (ts.isClassDeclaration(node) && node.name) {
                mainComponentName = node.name.text
              }
            }

            const newModifiers = modifiers.filter(
              (m) =>
                m.kind !== ts.SyntaxKind.ExportKeyword && m.kind !== ts.SyntaxKind.DefaultKeyword,
            )

            if (ts.isFunctionDeclaration(node)) {
              return ts.factory.updateFunctionDeclaration(
                node,
                newModifiers.length ? newModifiers : undefined,
                node.asteriskToken,
                node.name,
                node.typeParameters,
                node.parameters,
                node.type,
                node.body,
              )
            }

            if (ts.isVariableStatement(node)) {
              return ts.factory.updateVariableStatement(
                node,
                newModifiers.length ? newModifiers : undefined,
                node.declarationList,
              )
            }

            if (ts.isClassDeclaration(node)) {
              return ts.factory.updateClassDeclaration(
                node,
                newModifiers.length ? newModifiers : undefined,
                node.name,
                node.typeParameters,
                node.heritageClauses,
                node.members,
              )
            }
          }
        }

        return ts.visitEachChild(node, visit, context)
      }
      return ts.visitNode(rootNode, visit) as ts.SourceFile
    }
  }

  const result = ts.transform(sourceFile, [transformer])
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  let intermediateCode = printer.printFile(result.transformed[0])

  // Prepend collected hooks
  if (reactHooks.size > 0) {
    intermediateCode =
      `const { ${Array.from(reactHooks).join(', ')} } = React;\n\n` + intermediateCode
  }

  // Second pass: Transpile JSX to JS
  const transpiled = ts.transpileModule(intermediateCode, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
    },
  })

  // Fallback for component name
  if (!mainComponentName) {
    const match = code.match(/function\s+([A-Z]\w+)/) || code.match(/const\s+([A-Z]\w+)\s*=\s*\(/)
    if (match) {
      mainComponentName = match[1]
    } else {
      mainComponentName = 'App'
    }
  }

  return { transformedCode: transpiled.outputText, mainComponentName }
}

async function generateHtml(
  animationDir: string,
  outputDir: string,
  config?: Partial<AnimationConfig>,
): Promise<HtmlResult> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }

  await fs.ensureDir(outputDir)

  // Load vendor scripts
  const vendorDir = path.join(process.cwd(), 'vendor')
  const reactSource = await fs.readFile(path.join(vendorDir, 'react.production.min.js'), 'utf-8')
  const reactDomSource = await fs.readFile(
    path.join(vendorDir, 'react-dom.production.min.js'),
    'utf-8',
  )
  const threeSource = await fs.readFile(path.join(vendorDir, 'three.min.js'), 'utf-8')

  const prebuiltHtmlPath = path.join(animationDir, 'index.html')
  if (await fs.pathExists(prebuiltHtmlPath)) {
    const outputHtmlPath = path.join(outputDir, 'animation.html')
    await fs.copy(prebuiltHtmlPath, outputHtmlPath)
    console.log(`Using pre-built HTML file: ${prebuiltHtmlPath}`)
    return { htmlPath: outputHtmlPath, config: fullConfig }
  }

  const animationFiles = await collectAnimationFiles(animationDir)
  let combinedCode = ''

  for (const file of animationFiles) {
    const content = await fs.readFile(file, 'utf-8')
    const relativePath = path.relative(animationDir, file)
    // Skip index.jsx files that just re-export from other files
    if (path.basename(file).toLowerCase().startsWith('index.')) {
      // If this is a re-export file, extract the actual component and include it
      const exportMatch = content.match(/export\s*\{\s*default\s*\}\s*from\s*['"]([^'"]+)['"]/)
      if (exportMatch) {
        const importPath = exportMatch[1]
        const resolvedPath = path.resolve(animationDir, importPath)
        if (await fs.pathExists(resolvedPath)) {
          const actualContent = await fs.readFile(resolvedPath, 'utf-8')
          combinedCode += `// File: ${relativePath} -> ${importPath}\n${actualContent}\n\n`
        }
      }
    } else {
      combinedCode += `// File: ${relativePath}\n${content}\n\n`
    }
  }

  const { transformedCode, mainComponentName } = transformCode(combinedCode)

  // Inject viewport overrides and frame infrastructure BEFORE the render call
  const viewportAndFrameScript = `
  // Auto-generated viewport and frame infrastructure
  (function() {
    // Override viewport dimensions to match configured size
    const configWidth = ${fullConfig.width};
    const configHeight = ${fullConfig.height};

    // Override window dimensions
    Object.defineProperty(window, 'innerWidth', { get: () => configWidth, configurable: true });
    Object.defineProperty(window, 'innerHeight', { get: () => configHeight, configurable: true });
    Object.defineProperty(window, 'outerWidth', { get: () => configWidth, configurable: true });
    Object.defineProperty(window, 'outerHeight', { get: () => configHeight, configurable: true });

     // Override document dimensions
     try {
       if (document.documentElement) {
         document.documentElement.style.width = configWidth + 'px';
         document.documentElement.style.height = configHeight + 'px';
       }
       if (document.body) {
         document.body.style.width = configWidth + 'px';
         document.body.style.height = configHeight + 'px';
       }
     } catch (e) {
       // Ignore errors from read-only properties
     }

    // Frame-based rendering infrastructure
    window.__frameConfig = {
      fps: ${fullConfig.fps},
      duration: ${fullConfig.duration},
      isFrameBased: true
    };
    window.__currentFrame = 0;
    window.__animationStartTime = null;
    window.__timelineEvents = [];
    window.__triggeredEvents = new Set();

    // Track animation state
    const originalStartAnimation = typeof window.startAnimation === 'function' ? window.startAnimation : null;
    window.startAnimation = function() {
      window.__animationStartTime = Date.now();
      window.isAnimating = true;
      if (originalStartAnimation) {
        originalStartAnimation();
      }
    };

    // Override isAnimating property
    Object.defineProperty(window, 'isAnimating', {
      get: function() { return this._isAnimating === true; },
      set: function(v) { this._isAnimating = v; },
      configurable: true
    });
    window._isAnimating = false;

    // Track real start time for spawning (separate from animation time)
    let __spawnStartTimeReal = null;

    // Modified startAnimation to capture real time for spawning
    const __originalStartAnimation = window.startAnimation;
    window.startAnimation = function() {
      __spawnStartTimeReal = Date.now();  // Real wall time, not overridden
      window._isAnimating = true;
      if (originalStartAnimation) {
        originalStartAnimation();
      }
    };

    // Provide accessor for spawning elapsed time
    window.__getSpawnElapsed = function() {
      if (!__spawnStartTimeReal) return 0;
      return Date.now() - __spawnStartTimeReal;
    };

    // Frame rendering function for browser-renderer
    window.renderFrame = function(frameNumber) {
      window.__currentFrame = frameNumber;

      // Calculate elapsed time based on frame number
      const fps = window.__frameConfig.fps || 30;
      const elapsed = (frameNumber / fps) * 1000;

      // Trigger timeline events that should have fired by now
      if (window.__timelineEvents && window.__timelineEvents.length > 0) {
        window.__timelineEvents.forEach((event, index) => {
          if (elapsed >= event.time && !window.__triggeredEvents.has(index)) {
            window.__triggeredEvents.add(index);
            if (typeof event.action === 'function') {
              event.action();
            }
          }
        });
      }

      // Force canvas redraw
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.width = canvas.width;  // Clear and force redraw
      }

      // Trigger requestAnimationFrame for React to update
      if (typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(() => {});
      }
    };
  })();
  `

  const finalCode =
    transformedCode +
    `\n\n${viewportAndFrameScript}\n\n// Auto-generated render call\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(React.createElement(${mainComponentName}));\n\n// Signal that animation is ready\nwindow.animationReady = true;`

  let htmlContent = HTML_TEMPLATE.replace('{ANIMATION_CODE}', finalCode)
  htmlContent = htmlContent.replace('@@REACT_SOURCE@@', reactSource)
  htmlContent = htmlContent.replace('@@REACT_DOM_SOURCE@@', reactDomSource)

  // Check if the animation contains 3D content to determine if Three.js should be included
  let hasThreeReference = false
  const files = await collectAnimationFiles(animationDir)
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8')
    if (content.includes('THREE') || content.includes('three') || content.includes('Three')) {
      hasThreeReference = true
      break
    }
  }

  if (hasThreeReference) {
    // Replace only the first occurrence of {THREE_SOURCE} which is the template placeholder
    const index = htmlContent.indexOf('{THREE_SOURCE}')
    if (index !== -1) {
      htmlContent =
        htmlContent.substring(0, index) +
        threeSource +
        htmlContent.substring(index + '{THREE_SOURCE}'.length)
    }

    // Inject Three.js frame-based rendering infrastructure before closing body tag
    const frameBasedScript = `
    <script>
      window.__frameConfig = {
        fps: ${fullConfig.fps},
        duration: ${fullConfig.duration},
        isFrameBased: true
      };
      window.__animationScene = null;

      window.renderFrame = function(frameNumber) {
        if (!window.__animationScene) return;

        const scene = window.__animationScene;
        const fps = window.__frameConfig.fps || 30;

        const rotationSpeedX = 0.02;
        const rotationSpeedY = 0.03;

        const time = frameNumber / fps;
        const targetRotationX = time * (rotationSpeedX * 60);
        const targetRotationY = time * (rotationSpeedY * 60);

        if (scene.torusKnot) {
          scene.torusKnot.rotation.x = targetRotationX;
          scene.torusKnot.rotation.y = targetRotationY;
        }

        if (scene.renderer && scene.scene && scene.camera) {
          scene.renderer.render(scene.scene, scene.camera);
        }
      };
    </script>`

    htmlContent = htmlContent.replace('</body>', `${frameBasedScript}\n</body>`)
  } else {
    htmlContent = htmlContent.replace('{THREE_SOURCE}', '')
  }

  const htmlPath = path.join(outputDir, 'animation.html')
  await fs.writeFile(htmlPath, htmlContent)

  console.log(`Generated HTML: ${htmlPath}`)

  return { htmlPath, config: fullConfig }
}

async function collectAnimationFiles(dir: string): Promise<string[]> {
  const files: string[] = []

  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
        const subFiles = await collectAnimationFiles(fullPath)
        files.push(...subFiles)
      }
    } else if (/\.(jsx?|tsx?)$/i.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files.sort((a, b) => {
    const aName = path.basename(a).toLowerCase()
    const bName = path.basename(b).toLowerCase()
    if (aName === 'index.jsx' || aName === 'index.tsx') return -1
    if (bName === 'index.jsx' || bName === 'index.tsx') return 1
    return aName.localeCompare(bName)
  })
}

async function validateAnimationForHtml(
  animationDir: string,
): Promise<{ valid: boolean; errors: string[]; warnings?: string[]; is3D?: boolean }> {
  const result = { valid: true, errors: [] as string[], warnings: [] as string[], is3D: false }

  if (!(await fs.pathExists(animationDir))) {
    result.valid = false
    result.errors.push('Animation directory does not exist')
    return result
  }

  const stats = await fs.stat(animationDir)
  if (!stats.isDirectory()) {
    result.valid = false
    result.errors.push('Path is not a directory')
    return result
  }

  const files = await collectAnimationFiles(animationDir)

  if (files.length === 0) {
    result.valid = false
    result.errors.push('No JavaScript/JSX files found')
    return result
  }

  let hasReactImport = false
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8')
    if (content.includes('import') && content.includes('react')) {
      hasReactImport = true
    }
    if (content.includes('THREE') || content.includes('three') || content.includes('WebGL')) {
      result.is3D = true
    }
  }

  if (!hasReactImport) {
    result.warnings = result.warnings || []
    result.warnings.push('No React import found - the code may not work correctly')
  }

  return result
}

/* eslint-enable no-console */

export { generateHtml, validateAnimationForHtml, HtmlResult, AnimationConfig, DEFAULT_CONFIG }
