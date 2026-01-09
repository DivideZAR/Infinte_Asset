#!/usr/bin/env node
import { execSync } from 'child_process'

class TesterAgent {
  constructor(cwd = null) {
    this.cwd = cwd || process.cwd()
  }

  run(command, options = {}) {
    return execSync(command, {
      cwd: this.cwd,
      encoding: 'utf-8',
      stdio: 'inherit',
      ...options,
    })
  }

  runSilent(command, options = {}) {
    return execSync(command, {
      cwd: this.cwd,
      encoding: 'utf-8',
      ...options,
    })
  }
}

const tester = new TesterAgent()

console.log('=== Tester Agent: Code Quality & Testing Tool ===\n')

async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'help'

  try {
    switch (command) {
      case 'all':
        console.log('🔍 Running comprehensive test suite...\n')
        console.log('1️⃣ TypeScript Type Checking...')
        tester.run('npm run typecheck')
        console.log('\n2️⃣ ESLint Code Quality...')
        tester.run('npm run lint')
        console.log('\n3️⃣ Jest Unit Tests...')
        tester.run('npm run test')
        console.log('\n4️⃣ Build Verification...')
        tester.run('npm run build')
        console.log('\n✅ All tests completed successfully!')
        break

      case 'typecheck':
      case 'types':
        console.log('🔍 Running TypeScript type checking...\n')
        tester.run('npm run typecheck')
        console.log('\n✅ TypeScript compilation successful!')
        break

      case 'lint':
        console.log('🔍 Running ESLint code quality checks...\n')
        tester.run('npm run lint')
        break

      case 'test':
      case 'jest':
        console.log('🧪 Running Jest unit tests...\n')
        tester.run('npm run test')
        break

      case 'build':
        console.log('🔨 Running build verification...\n')
        tester.run('npm run build')
        console.log('\n✅ Build completed successfully!')
        break

      case 'coverage':
        console.log('📊 Running test coverage analysis...\n')
        tester.run('npm run test:coverage')
        break

      case 'watch':
        console.log('👀 Starting test watch mode...\n')
        tester.run('npm run test:watch')
        break

      case 'fix':
        console.log('🔧 Running auto-fix for linting issues...\n')
        tester.run('npm run lint:fix')
        break

      case 'format':
        console.log('🎨 Running code formatting...\n')
        tester.run('npm run format')
        break

      case 'status':
        console.log('📋 Checking project status...\n')

        // TypeScript check
        try {
          const tsOutput = tester.runSilent('npm run typecheck 2>&1', { stdio: 'pipe' })
          const tsStatus = tsOutput.includes('error') ? '❌' : '✅'
          console.log(`TypeScript: ${tsStatus}`)
        } catch (e) {
          console.log('TypeScript: ❌')
        }

        // ESLint check
        try {
          const lintOutput = tester.runSilent('npm run lint 2>&1', { stdio: 'pipe' })
          const hasErrors = lintOutput.includes('✖')
          const lintStatus = hasErrors ? '⚠️' : '✅'
          console.log(`ESLint: ${lintStatus}`)
        } catch (e) {
          console.log('ESLint: ⚠️')
        }

        // Test check
        try {
          const testOutput = tester.runSilent('npm run test 2>&1', { stdio: 'pipe' })
          const testStatus = testOutput.includes('failed') || testOutput.includes('✖') ? '❌' : '✅'
          console.log(`Tests: ${testStatus}`)
        } catch (e) {
          console.log('Tests: ❌')
        }

        // Build check
        try {
          const buildOutput = tester.runSilent('npm run build 2>&1', { stdio: 'pipe' })
          const buildStatus = buildOutput.includes('error') ? '❌' : '✅'
          console.log(`Build: ${buildStatus}`)
        } catch (e) {
          console.log('Build: ❌')
        }

        console.log('\n💡 Use "tester all" for comprehensive testing')
        break

      case 'help':
      default:
        console.log('Usage: tester [command]')
        console.log('')
        console.log('Commands:')
        console.log('  all          Run comprehensive test suite (typecheck + lint + test + build)')
        console.log('  typecheck    Run TypeScript type checking only')
        console.log('  lint         Run ESLint code quality checks only')
        console.log('  test         Run Jest unit tests only')
        console.log('  build        Run build verification only')
        console.log('  coverage     Run test coverage analysis')
        console.log('  watch        Start test watch mode')
        console.log('  fix          Auto-fix linting issues')
        console.log('  format       Format code with Prettier')
        console.log('  status       Quick project health check')
        console.log('  help         Show this help message')
        console.log('')
        console.log('Examples:')
        console.log('  tester all           # Full test suite')
        console.log('  tester typecheck     # TypeScript only')
        console.log('  tester fix           # Auto-fix issues')
        break
    }
  } catch (error) {
    console.error(`\n❌ Command failed: ${error.message}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('\n💥 Fatal error:', err.message)
  process.exit(1)
})
