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
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script>
    const { useState, useEffect, useRef, useCallback, useMemo, useContext, useReducer } = React;
  </script>
  <script type="text/babel" data-type="module">
    {ANIMATION_CODE}
  </script>
</body>
</html>`

interface HtmlResult {
  htmlPath: string
  config: AnimationConfig
}

function transformCode(code: string): { transformedCode: string; mainComponentName: string | null } {
  const sourceFile = ts.createSourceFile('temp.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const reactHooks = new Set<string>()
  let mainComponentName: string | null = null

  const transformer = (context: ts.TransformationContext) => {
    return (rootNode: ts.SourceFile) => {
      function visit(node: ts.Node): ts.Node | undefined {
        // Handle Imports
        if (ts.isImportDeclaration(node)) {
          const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text
          if (moduleSpecifier === 'react' && node.importClause) {
            // Collect named imports (hooks)
            if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
              node.importClause.namedBindings.elements.forEach((element) => {
                reactHooks.add(element.name.text)
              })
            }
          }
          // Remove all imports
          return undefined
        }

        // Handle Exports
        if (ts.isExportAssignment(node)) {
          // export default App -> const App = ... (handled elsewhere or implicitly)
          // For 'export default function App() {}', we want to strip 'export default'
          // Since it's an assignment, usually it's `export default identifier;`
          // We can remove it, assuming the identifier is defined elsewhere.
           if (ts.isIdentifier(node.expression)) {
               mainComponentName = node.expression.text;
           }
          return undefined
        }
        
        // Handle 'export function', 'export const'
        if (ts.canHaveModifiers(node)) {
            const modifiers = ts.getModifiers(node);
            if (modifiers && modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
                
                // Check if it's the main component (simple heuristic: export default function)
                const isDefault = modifiers.some(m => m.kind === ts.SyntaxKind.DefaultKeyword);
                
                if (isDefault) {
                     if (ts.isFunctionDeclaration(node) && node.name) {
                         mainComponentName = node.name.text;
                     }
                     if (ts.isClassDeclaration(node) && node.name) {
                         mainComponentName = node.name.text;
                     }
                }
                
                // Strip the export keywords
                const newModifiers = modifiers.filter(m => m.kind !== ts.SyntaxKind.ExportKeyword && m.kind !== ts.SyntaxKind.DefaultKeyword);
                
                // Create a clone of the node without export/default modifiers
                // Note: TypeScript AST nodes are immutable-ish, we use factory to update
                 if (ts.isFunctionDeclaration(node)) {
                    return ts.factory.updateFunctionDeclaration(
                        node,
                        newModifiers.length ? newModifiers : undefined,
                        node.asteriskToken,
                        node.name,
                        node.typeParameters,
                        node.parameters,
                        node.type,
                        node.body
                    );
                }
                
                if (ts.isVariableStatement(node)) {
                     return ts.factory.updateVariableStatement(
                        node,
                        newModifiers.length ? newModifiers : undefined,
                         node.declarationList
                     );
                }
                
                if (ts.isClassDeclaration(node)) {
                     return ts.factory.updateClassDeclaration(
                        node,
                        newModifiers.length ? newModifiers : undefined,
                        node.name,
                        node.typeParameters,
                        node.heritageClauses,
                        node.members
                     );
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
  let transformedCode = printer.printFile(result.transformed[0])

  // Prepend collected hooks
  if (reactHooks.size > 0) {
    transformedCode = `const { ${Array.from(reactHooks).join(', ')} } = React;\n\n` + transformedCode
  }
  
  // Fallback for component name if not found via export default
  if (!mainComponentName) {
      // Simple regex fallback to find likely component name if AST didn't catch explicit default export
      const match = code.match(/function\s+([A-Z]\w+)/) || code.match(/const\s+([A-Z]\w+)\s*=\s*\(/);
      if (match) {
          mainComponentName = match[1];
      } else {
          mainComponentName = 'App';
      }
  }

  return { transformedCode, mainComponentName }
}

async function generateHtml(
  animationDir: string,
  outputDir: string,
  config?: Partial<AnimationConfig>,
): Promise<HtmlResult> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }

  await fs.ensureDir(outputDir)

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
    combinedCode += `// File: ${relativePath}\n${content}\n\n`
  }

  const { transformedCode, mainComponentName } = transformCode(combinedCode)

  const finalCode = transformedCode + `\n\n// Auto-generated render call\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(React.createElement(${mainComponentName}));\n\n// Signal that the animation is ready\nwindow.animationReady = true;`

  const htmlContent = HTML_TEMPLATE.replace('{ANIMATION_CODE}', finalCode)

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
): Promise<{ valid: boolean; errors: string[]; warnings?: string[] }> {
  const result = { valid: true, errors: [] as string[], warnings: [] as string[] }

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
      break
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
