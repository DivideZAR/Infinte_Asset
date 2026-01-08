/* eslint-disable no-console */
import fs from 'fs-extra'
import path from 'path'

const TAILWIND_TO_STYLE: Record<string, string> = {
  // Layout
  'flex': 'display: flex',
  'inline-flex': 'display: inline-flex',
  'grid': 'display: grid',
  'block': 'display: block',
  'inline-block': 'display: inline-block',
  'hidden': 'display: none',
  'items-center': 'align-items: center',
  'items-start': 'align-items: flex-start',
  'items-end': 'align-items: flex-end',
  'justify-center': 'justify-content: center',
  'justify-start': 'justify-content: flex-start',
  'justify-end': 'justify-content: flex-end',
  'justify-between': 'justify-content: space-between',
  'flex-wrap': 'flex-wrap: wrap',
  'flex-col': 'flex-direction: column',
  'flex-row': 'flex-direction: row',

  // Sizing
  'w-full': 'width: 100%',
  'w-1/2': 'width: 50%',
  'w-1/3': 'width: 33.333%',
  'w-2/3': 'width: 66.666%',
  'w-1/4': 'width: 25%',
  'w-3/4': 'width: 75%',
  'h-full': 'height: 100%',
  'h-screen': 'height: 100vh',
  'min-h-screen': 'min-height: 100vh',
  'min-h-full': 'min-height: 100%',
  'p-0': 'padding: 0',
  'p-1': 'padding: 4px',
  'p-2': 'padding: 8px',
  'p-3': 'padding: 12px',
  'p-4': 'padding: 16px',
  'p-5': 'padding: 20px',
  'p-6': 'padding: 24px',
  'p-8': 'padding: 32px',
  'p-12': 'padding: 48px',
  'px-2': 'padding-left: 8px; padding-right: 8px',
  'px-4': 'padding-left: 16px; padding-right: 16px',
  'px-6': 'padding-left: 24px; padding-right: 24px',
  'py-2': 'padding-top: 8px; padding-bottom: 8px',
  'py-4': 'padding-top: 16px; padding-bottom: 16px',
  'py-8': 'padding-top: 32px; padding-bottom: 32px',
  'm-0': 'margin: 0',
  'm-1': 'margin: 4px',
  'm-2': 'margin: 8px',
  'm-4': 'margin: 16px',
  'm-6': 'margin: 24px',
  'm-8': 'margin: 32px',
  'mx-auto': 'margin-left: auto; margin-right: auto',
  'space-x-2 > *': 'margin-left: 8px',
  'space-x-4 > *': 'margin-left: 16px',
  'space-y-2 > *': 'margin-top: 8px',
  'space-y-4 > *': 'margin-top: 16px',

  // Typography
  'text-xs': 'font-size: 12px',
  'text-sm': 'font-size: 14px',
  'text-base': 'font-size: 16px',
  'text-lg': 'font-size: 18px',
  'text-xl': 'font-size: 20px',
  'text-2xl': 'font-size: 24px',
  'text-3xl': 'font-size: 30px',
  'text-4xl': 'font-size: 36px',
  'text-5xl': 'font-size: 48px',
  'font-normal': 'font-weight: 400',
  'font-medium': 'font-weight: 500',
  'font-semibold': 'font-weight: 600',
  'font-bold': 'font-weight: 700',
  'text-left': 'text-align: left',
  'text-center': 'text-align: center',
  'text-right': 'text-align: right',
  'text-white': 'color: white',
  'text-black': 'color: black',
  'text-slate-400': 'color: #94a3b8',
  'text-slate-500': 'color: #64748b',
  'text-slate-900': 'color: #0f172a',
  'text-indigo-600': 'color: #4f46e5',
  'text-violet-500': 'color: #8b5cf6',
  'leading-tight': 'line-height: 1.25',
  'leading-normal': 'line-height: 1.5',
  'leading-relaxed': 'line-height: 1.625',
  'tracking-tight': 'letter-spacing: -0.025em',
  'tracking-normal': 'letter-spacing: 0',

  // Colors & Backgrounds
  'bg-white': 'background-color: white',
  'bg-black': 'background-color: black',
  'bg-transparent': 'background-color: transparent',
  'bg-slate-50': 'background-color: #f8fafc',
  'bg-slate-100': 'background-color: #f1f5f9',
  'bg-slate-200': 'background-color: #e2e8f0',
  'bg-zinc-100': 'background-color: #f4f4f5',
  'bg-blue-500': 'background-color: #3b82f6',
  'bg-indigo-500': 'background-color: #6366f1',
  'bg-indigo-600': 'background-color: #4f46e5',
  'bg-violet-500': 'background-color: #8b5cf6',
  'bg-gradient-to-br': 'background: linear-gradient(to bottom right',
  'bg-gradient-to-t': 'background: linear-gradient(to top',
  'bg-gradient-to-r': 'background: linear-gradient(to right',
  'from-slate-50': 'from: #f8fafc',
  'via-white': 'via: white',
  'to-zinc-100': 'to: #f4f4f5',
  'from-violet-500': 'from: #8b5cf6',
  'to-indigo-600': 'to: #4f46e5',
  'from-indigo-500': 'from: #6366f1',
  'to-purple-600': 'to: #9333ea',
  'from-amber-200': 'from: #fde68a',
  'to-yellow-200': 'to: #fde68a',
  'from-red-500': 'from: #ef4444',
  'to-pink-500': 'to: #ec4899',

  // Borders
  'border': 'border: 1px solid #e2e8f0',
  'border-0': 'border: 0',
  'border-2': 'border: 2px solid #e2e8f0',
  'border-4': 'border: 4px solid #e2e8f0',
  'rounded': 'border-radius: 4px',
  'rounded-md': 'border-radius: 6px',
  'rounded-lg': 'border-radius: 8px',
  'rounded-xl': 'border-radius: 12px',
  'rounded-2xl': 'border-radius: 16px',
  'rounded-full': 'border-radius: 9999px',

  // Shadows
  'shadow': 'box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1)',
  'shadow-md': 'box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)',
  'shadow-lg': 'box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1)',
  'shadow-xl': 'box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1)',
  'shadow-indigo-200': 'box-shadow: 0 10px 25px rgba(99,102,241,0.3)',
  'shadow-lg shadow-indigo-200':
    'box-shadow: 0 10px 25px -3px rgba(0,0,0,0.1), 0 10px 25px rgba(99,102,241,0.3)',

  // Positioning
  'relative': 'position: relative',
  'absolute': 'position: absolute',
  'fixed': 'position: fixed',
  'sticky': 'position: sticky',
  'inset-0': 'top: 0; right: 0; bottom: 0; left: 0',
  'top-0': 'top: 0',
  'top-2': 'top: 8px',
  'top-4': 'top: 16px',
  'top-8': 'top: 32px',
  'top-12': 'top: 48px',
  'bottom-0': 'bottom: 0',
  'bottom-2': 'bottom: 8px',
  'bottom-4': 'bottom: 16px',
  'bottom-8': 'bottom: 32px',
  'left-0': 'left: 0',
  'left-1/2': 'left: 50%',
  'right-0': 'right: 0',
  'right-4': 'right: 16px',
  'right-8': 'right: 32px',
  'right-16': 'right: 64px',
  'z-10': 'z-index: 10',
  'z-20': 'z-index: 20',

  // Transforms
  'translate-x-1/2': 'transform: translateX(50%)',
  '-translate-x-1/2': 'transform: translateX(-50%)',
  'translate-y-0': 'transform: translateY(0)',
  '-translate-y-1/2': 'transform: translateY(-50%)',
  'scale-100': 'transform: scale(1)',
  'scale-105': 'transform: scale(1.05)',
  'scale-110': 'transform: scale(1.1)',
  'rotate-45': 'transform: rotate(45deg)',

  // Opacity
  'opacity-0': 'opacity: 0',
  'opacity-20': 'opacity: 0.2',
  'opacity-30': 'opacity: 0.3',
  'opacity-40': 'opacity: 0.4',
  'opacity-50': 'opacity: 0.5',
  'opacity-80': 'opacity: 0.8',
  'opacity-90': 'opacity: 0.9',
  'opacity-100': 'opacity: 1',

  // Overflow
  'overflow-hidden': 'overflow: hidden',
  'overflow-visible': 'overflow: visible',
  'overflow-auto': 'overflow: auto',

  // Gaps
  'gap-1': 'gap: 4px',
  'gap-2': 'gap: 8px',
  'gap-3': 'gap: 12px',
  'gap-4': 'gap: 16px',
  'gap-6': 'gap: 24px',
  'gap-8': 'gap: 32px',

  // Inset (for positioning)
  'inset-x-0': 'left: 0; right: 0',

  // SVG specific
  'h-4': 'height: 16px',
  'h-6': 'height: 24px',
  'h-8': 'height: 32px',
  'h-10': 'height: 40px',
  'h-12': 'height: 48px',
  'h-16': 'height: 64px',
  'h-20': 'height: 80px',
  'h-24': 'height: 96px',
  'h-32': 'height: 128px',
  'w-4': 'width: 16px',
  'w-6': 'width: 24px',
  'w-8': 'width: 32px',
  'w-10': 'width: 40px',
  'w-12': 'width: 48px',
  'w-16': 'width: 64px',
  'w-20': 'width: 80px',
  'w-24': 'width: 96px',
  'w-32': 'width: 128px',

  // Rounded full for non-square elements
  'rounded-3xl': 'border-radius: 24px',
}

function extractAnimations(content: string): string {
  const animations: string[] = []

  const keyframesMap: Record<string, string> = {
    'animate-bounce': `@keyframes bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(0.95); }
}`,
    'animate-pulse': `@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(0.95); }
}`,
    'animate-spin': `@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,
    'animate-ping': `@keyframes ping {
  0% { transform: scale(1); opacity: 1; }
  75%, 100% { transform: scale(2); opacity: 0; }
}`,
    'animate-fade-in': `@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`,
    'animate-float': `@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}`,
  }

  Object.keys(keyframesMap).forEach((key) => {
    if (content.includes(key)) {
      animations.push(keyframesMap[key])
    }
  })

  return animations.join('\n')
}

const TAILWIND_COLORS: Record<string, string> = {
  'slate-50': 'f8fafc',
  'slate-100': 'f1f5f9',
  'slate-200': 'e2e8f0',
  'slate-300': 'cbd5e1',
  'slate-400': '94a3b8',
  'slate-500': '64748b',
  'slate-600': '475569',
  'slate-700': '334155',
  'slate-800': '1e293b',
  'slate-900': '0f172a',
  'zinc-50': 'fafafa',
  'zinc-100': 'f4f4f5',
  'zinc-200': 'e4e4e7',
  'zinc-300': 'd4d4d8',
  'zinc-400': 'a1a1aa',
  'zinc-500': '71717a',
  'zinc-600': '52525b',
  'zinc-700': '3f3f46',
  'zinc-800': '27272a',
  'zinc-900': '18181b',
  'white': 'ffffff',
  'black': '000000',
  'violet-500': '8b5cf6',
  'violet-600': '7c3aed',
  'indigo-500': '6366f1',
  'indigo-600': '4f46e5',
  'blue-500': '3b82f6',
  'red-500': 'ef4444',
  'pink-500': 'ec4899',
  'yellow-200': 'fde68a',
  'amber-200': 'fde68a',
}

function convertTailwindToInline(classes: string): string {
  const styles: Record<string, string> = {}
  const classList = classes.trim().split(/\s+/)

  const gradientColors: string[] = []
  let gradientDirection = '135deg'

  for (const cls of classList) {
    if (!cls) continue

    if (cls.startsWith('bg-gradient-to-')) {
      const direction = cls.replace('bg-gradient-to-', '')
      if (direction === 'r') gradientDirection = '90deg'
      else if (direction === 'l') gradientDirection = '270deg'
      else if (direction === 't') gradientDirection = '0deg'
      else if (direction === 'b') gradientDirection = '180deg'
      else if (direction === 'br') gradientDirection = '135deg'
      else if (direction === 'bl') gradientDirection = '225deg'
      else if (direction === 'tr') gradientDirection = '45deg'
      else if (direction === 'tl') gradientDirection = '315deg'
    } else if (cls.startsWith('from-')) {
      const colorName = cls.replace('from-', '')
      gradientColors[0] = TAILWIND_COLORS[colorName] || colorName
    } else if (cls.startsWith('via-')) {
      const colorName = cls.replace('via-', '')
      gradientColors[1] = TAILWIND_COLORS[colorName] || colorName
    } else if (cls.startsWith('to-')) {
      const colorName = cls.replace('to-', '')
      gradientColors[2] = TAILWIND_COLORS[colorName] || colorName
    } else if (TAILWIND_TO_STYLE[cls]) {
      const styleValue = TAILWIND_TO_STYLE[cls]
      if (styleValue.includes(':')) {
        const [prop, val] = styleValue.split(': ')
        if (prop === 'box-shadow' && styles[prop]) {
          styles[prop] = styles[prop] + ', ' + val
        } else {
          styles[prop] = val
        }
      }
    }
  }

  if (gradientColors.length > 0) {
    const color1 = gradientColors[0] || gradientColors[gradientColors.length - 1]
    const color2 = gradientColors[1] || gradientColors[gradientColors.length - 1]
    const color3 = gradientColors[2] || gradientColors[gradientColors.length - 1]

    const hex1 = color1 && !color1.startsWith('#') ? '#' + color1 : color1 || ''
    const hex2 = color2 && !color2.startsWith('#') ? '#' + color2 : color2 || ''
    const hex3 = color3 && !color3.startsWith('#') ? '#' + color3 : color3 || ''

    if (gradientColors.length === 2) {
      styles.background = `linear-gradient(${gradientDirection}, ${hex1}, ${hex2})`
    } else if (gradientColors.length === 3) {
      styles.background = `linear-gradient(${gradientDirection}, ${hex1} 0%, ${hex2} 50%, ${hex3} 100%)`
    } else {
      styles.background = `linear-gradient(${gradientDirection}, ${hex1}, ${hex2})`
    }
  }

  return Object.entries(styles)
    .map(([key, value]) => `${kebabToCamel(key)}: '${value}'`)
    .join(', ')
}

function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

function convertJsxToBrowserCompatible(content: string): string {
  let result = content

  result = result.replace(/import\s+React.*from\s+['"]react['"];?/g, '')

  const animationCSS = extractAnimations(content)
  if (animationCSS) {
    result = result.replace(/(<style[^>]*>.*?<\/style>)/, `<style>${animationCSS}</style>`)
    if (!result.includes('<style>') && result.includes('animate-')) {
      result = result.replace(/(<div[^>]*>)/, `<style>${animationCSS}</style>\n$1`)
    }
  }

  result = result.replace(/className="([^"]*)"/g, (_match, classes) => {
    const inlineStyle = convertTailwindToInline(classes)
    if (inlineStyle) {
      return `style={{ ${inlineStyle} }}`
    }
    return ''
  })

  result = result.replace(/className=\{[^}]+\}/g, '')

  result = result.replace(/import\s+['"][^'"]+['"];?/g, '')

  const hasUseState =
    result.includes('useState') || result.includes('useEffect') || result.includes('useRef')
  if (hasUseState && !result.includes('import')) {
    result = `import { useState, useEffect, useRef } from "react"\n\n${result}`
  }

  return result
}

function findReactFiles(dir: string): string[] {
  const files: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        files.push(...findReactFiles(fullPath))
      }
    } else if (/\.(jsx?|tsx?)$/i.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

async function processAnimation(inputPath: string, outputDir: string): Promise<void> {
  await fs.ensureDir(outputDir)

  let content: string
  let outputFilename = 'index.jsx'

  if ((await fs.pathExists(inputPath)) && (await fs.stat(inputPath)).isFile()) {
    if (
      inputPath.endsWith('.tsx') ||
      inputPath.endsWith('.ts') ||
      inputPath.endsWith('.jsx') ||
      inputPath.endsWith('.js')
    ) {
      content = await fs.readFile(inputPath, 'utf-8')
      outputFilename = path.basename(inputPath).replace(/\.(tsx|ts)$/, '.jsx')
    } else {
      return
    }
  } else if ((await fs.pathExists(inputPath)) && (await fs.stat(inputPath)).isDirectory()) {
    const files = findReactFiles(inputPath)

    const mainFile =
      files.find(
        (f) =>
          f.includes('App.') ||
          f.includes('app.') ||
          f.endsWith('/App.tsx') ||
          f.endsWith('/App.jsx'),
      ) || files[0]

    if (!mainFile) {
      console.error('No React files found in', inputPath)
      return
    }

    content = await fs.readFile(mainFile, 'utf-8')
    outputFilename = 'index.jsx'

    const assetsDir = path.join(outputDir, 'assets')
    await fs.ensureDir(assetsDir)

    for (const file of files) {
      if (file !== mainFile) {
        const relPath = path.relative(inputPath, file)
        const destPath = path.join(outputDir, relPath)
        await fs.ensureDir(path.dirname(destPath))
        await fs.copy(file, destPath)
      }
    }
  } else {
    console.error('Input path does not exist:', inputPath)
    return
  }

  const browserCompatible = convertJsxToBrowserCompatible(content)

  const outputPath = path.join(outputDir, outputFilename)
  await fs.writeFile(outputPath, browserCompatible)

  console.log(`✓ Created browser-compatible version: ${outputPath}`)
  console.log(`  Original: ${inputPath}`)

  const animationCSS = extractAnimations(content)
  if (animationCSS) {
    console.log('  ✓ Extracted CSS animations')
  }

  const hasTailwind =
    content.includes('className=') && content.match(/className="[^"]*(flex|bg-|text-|p-|m-|w-|h-)/)
  if (hasTailwind) {
    console.log('  ✓ Converted Tailwind classes to inline styles')
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.log(`
🐕 Walling Dog - Tailwind to Browser Converter

Usage:
  npx tsx scripts/tailwind-converter.ts <input> <output>

Arguments:
  <input>   React file or project directory
  <output>  Output directory for browser-compatible version

Examples:
  npx tsx scripts/tailwind-converter.ts ./src/App.tsx ./animations/my-project
  npx tsx scripts/tailwind-converter.ts ./my-react-project ./animations/converted

What it does:
  • Converts Tailwind CSS classes to inline styles
  • Extracts CSS animations to <style> tags
  • Removes Node.js imports
  • Makes React components browser-compatible
    `)
    process.exit(1)
  }

  const [inputPath, outputDir] = args

  try {
    await processAnimation(inputPath, outputDir)
    console.log('\n✅ Conversion complete!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

export { convertJsxToBrowserCompatible, processAnimation, TAILWIND_TO_STYLE }

/* eslint-enable no-console */

if (require.main === module) {
  main()
}
