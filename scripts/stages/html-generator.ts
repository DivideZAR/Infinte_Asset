import fs from 'fs-extra'
import path from 'path'

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
  duration: 5
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

function stripExports(code) {
  let result = code
  
  result = result.replace(/export\s+default\s+/g, '')
  result = result.replace(/export\s+const\s+/g, 'const ')
  result = result.replace(/export\s+function\s+/g, 'function ')
  result = result.replace(/export\s+/g, '')
  
  const reactImports = []
  
  const importReactBoth = result.match(/import\s+React\s*,\s*\{\s*([^}]+)\s*\}\s*from\s+['"]react['"];?/g)
  if (importReactBoth) {
    importReactBoth.forEach(match => {
      const hookMatch = match.match(/import\s+React\s*,\s*\{\s*([^}]+)\s*\}\s*from\s+['"]react['"];?/)
      if (hookMatch && hookMatch[1]) {
        const hooks = hookMatch[1].split(',').map(h => h.trim()).filter(h => h)
        reactImports.push(...hooks)
      }
    })
    result = result.replace(/import\s+React\s*,\s*\{\s*[^}]+\s*\}\s*from\s+['"]react['"];?/g, '')
  }
  
  const importReactOnly = result.match(/import\s+React\s+from\s+['"]react['"];?/g)
  if (importReactOnly) {
    result = result.replace(/import\s+React\s+from\s+['"]react['"];?/g, '')
  }
  
  const importHooksOnly = result.match(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]react['"];?/g)
  if (importHooksOnly) {
    importHooksOnly.forEach(match => {
      const hookMatch = match.match(/import\s+\{\s*([^}]+)\s*\}\s*from\s+['"]react['"];?/)
      if (hookMatch && hookMatch[1]) {
        const hooks = hookMatch[1].split(',').map(h => h.trim()).filter(h => h)
        reactImports.push(...hooks)
      }
    })
    result = result.replace(/import\s+\{\s*[^}]+\s*\}\s*from\s+['"]react['"];?/g, '')
  }
  
  result = result.replace(/import\s+[^'"]+from\s+['"][^'"]+['"];?/g, '')
  
  const uniqueHooks = [...new Set(reactImports)].filter(h => h)
  if (uniqueHooks.length > 0) {
    result = `const { ${uniqueHooks.join(', ')} } = React;\n\n` + result
  }
  
  return result
}

async function generateHtml(animationDir: string, outputDir: string, config?: Partial<AnimationConfig>): Promise<HtmlResult> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }
  
  await fs.ensureDir(outputDir)
  
  const animationFiles = await collectAnimationFiles(animationDir)
  
  let combinedCode = ''
  
  for (const file of animationFiles) {
    let content = await fs.readFile(file, 'utf-8')
    const relativePath = path.relative(animationDir, file)
    combinedCode += `// File: ${relativePath}\n${content}\n\n`
  }
  
  combinedCode = stripExports(combinedCode)
  
  const componentMatch = combinedCode.match(/function\s+(\w+)\s*\(/)?.[1] ||
                        combinedCode.match(/export\s+function\s+(\w+)\s*\(/)?.[1] ||
                        'App'
  
  combinedCode += `\n\n// Auto-generated render call\nReactDOM.createRoot(document.getElementById('root')).render(React.createElement(${componentMatch}));`
  
  const htmlContent = HTML_TEMPLATE
    .replace('{ANIMATION_CODE}', combinedCode)
  
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

async function validateAnimationForHtml(animationDir: string): Promise<{ valid: boolean; errors: string[] }> {
  const result = { valid: true, errors: [] as string[] }
  
  if (!await fs.pathExists(animationDir)) {
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

export { generateHtml, validateAnimationForHtml, HtmlResult, AnimationConfig, DEFAULT_CONFIG }
