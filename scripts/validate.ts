import fs from 'fs-extra'
import path from 'path'
import { glob } from 'glob'
import { promisify } from 'util'
import { exec } from 'child_process'

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  info: string[]
}

interface ValidationOptions {
  checkDependencies?: boolean
  checkSyntax?: boolean
  checkImports?: boolean
}

class ValidationError extends Error {
  constructor(message: string, public errors?: string[]) {
    super(message)
    this.name = 'ValidationError'
  }
}

async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    return await fs.pathExists(filePath)
  } catch {
    return false
  }
}

async function validateAnimationDir(dir: string, options: ValidationOptions = {}): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: []
  }

  if (!await checkFileExists(dir)) {
    result.valid = false
    result.errors.push(`Animation directory does not exist: ${dir}`)
    return result
  }

  try {
    const stats = await fs.stat(dir)
    if (!stats.isDirectory()) {
      result.valid = false
      result.errors.push(`Path is not a directory: ${dir}`)
      return result
    }
  } catch {
    result.valid = false
    result.errors.push(`Could not stat path: ${dir}`)
    return result
  }

  result.info.push(`Animation directory found: ${dir}`)

  try {
    const files = await glob('**/*', { cwd: dir })
    result.info.push(`Found ${files.length} files in directory`)

    const codeFiles = files.filter(f => 
      /\.(jsx?|tsx?|js|ts)$/i.test(f)
    )

    if (codeFiles.length === 0) {
      result.valid = false
      result.errors.push('No JavaScript or TypeScript files found in animation directory')
      return result
    }

    result.info.push(`Found ${codeFiles.length} code files`)

    const hasMainFile = files.some(f => 
      /^index\.(jsx?|tsx?)$/i.test(f)
    )
    if (hasMainFile) {
      result.info.push('Main entry file (index.jsx/ts) found')
    } else {
      result.warnings.push('No index.jsx or index.tsx main entry file found')
      result.warnings.push('Animation should have a main entry file for proper loading')
    }

    if (options.checkSyntax) {
      for (const file of codeFiles.slice(0, 5)) {
        const filePath = path.join(dir, file)
        const content = await fs.readFile(filePath, 'utf-8')
        
        try {
          new Function(content)
          result.info.push(`Syntax valid: ${file}`)
        } catch {
          result.warnings.push(`Potential syntax issues in: ${file}`)
        }
      }
    }

    if (options.checkImports) {
      for (const file of codeFiles) {
        const filePath = path.join(dir, file)
        const content = await fs.readFile(filePath, 'utf-8')
        
        const importRegex = /import\s+(?:\{[^}]*\}|\* as \w+|\w+)\s+from\s+['"]([^'"]+)['"]/g
        let match
        
        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1]
          
          if (importPath.startsWith('.') || importPath.startsWith('/')) {
            const resolvedPath = path.resolve(path.dirname(filePath), importPath)
            if (!importPath.endsWith('/') && !await checkFileExists(resolvedPath)) {
              const possibleExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json']
              let found = false
              for (const ext of possibleExtensions) {
                if (await checkFileExists(resolvedPath + ext)) {
                  found = true
                  break
                }
              }
              if (!found) {
                result.warnings.push(`Unresolved import in ${file}: ${importPath}`)
              }
            }
          }
        }
      }
    }

    const assets = files.filter(f => 
      /\.(png|jpg|jpeg|gif|svg|mp3|wav|json)$/i.test(f)
    )
    if (assets.length > 0) {
      result.info.push(`Found ${assets.length} asset files`)
    }

  } catch (error) {
    result.valid = false
    result.errors.push(`Error reading directory: ${(error as Error).message}`)
  }

  return result
}

async function validateAnimation(animationPath: string, options: ValidationOptions = {}): Promise<ValidationResult> {
  const result = await validateAnimationDir(animationPath, options)
  
  if (!result.valid) {
    throw new ValidationError('Animation validation failed', result.errors)
  }
  
  return result
}

function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = []
  
  lines.push('='.repeat(50))
  lines.push('ANIMATION VALIDATION REPORT')
  lines.push('='.repeat(50))
  
  if (result.valid) {
    lines.push('✓ Animation is VALID')
  } else {
    lines.push('✗ Animation has ERRORS')
  }
  
  if (result.info.length > 0) {
    lines.push('\nINFO:')
    result.info.forEach(msg => lines.push(`  • ${msg}`))
  }
  
  if (result.warnings.length > 0) {
    lines.push('\nWARNINGS:')
    result.warnings.forEach(msg => lines.push(`  ⚠ ${msg}`))
  }
  
  if (result.errors.length > 0) {
    lines.push('\nERRORS:')
    result.errors.forEach(msg => lines.push(`  ✗ ${msg}`))
  }
  
  lines.push('='.repeat(50))
  
  return lines.join('\n')
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('Usage: npm run validate -- <path-to-animation> [options]')
    console.log('Options:')
    console.log('  --check-syntax     Check JavaScript syntax')
    console.log('  --check-imports    Check import resolution')
    console.log('  --check-deps       Check package dependencies')
    process.exit(1)
  }

  const animationPath = args[0]
  
  const options: ValidationOptions = {
    checkSyntax: args.includes('--check-syntax'),
    checkImports: args.includes('--check-imports'),
    checkDependencies: args.includes('--check-deps')
  }

  try {
    const result = await validateAnimation(animationPath, options)
    console.log(formatValidationResult(result))
    
    if (!result.valid) {
      process.exit(1)
    }
  } catch (error) {
    console.error('Validation failed:', (error as Error).message)
    process.exit(1)
  }
}

export { validateAnimation, validateAnimationDir, ValidationError }
export type { ValidationResult, ValidationOptions }

if (import.meta.url.startsWith('file:')) {
  const modulePath = new URL('', import.meta.url).pathname
  const mainPath = process.argv[1] || ''
  if (mainPath === modulePath || mainPath.endsWith(modulePath)) {
    main()
  }
}
