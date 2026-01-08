import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'

class TesterAgent {
  constructor(cwd = null) {
    this.cwd = cwd || process.cwd()
    this.todoFile = path.join(this.cwd, 'todo.md')
  }

  run(command, options = {}) {
    try {
      const result = execSync(command, {
        cwd: this.cwd,
        encoding: 'utf-8',
        stdio: 'pipe',
        ...options,
      })
      return {
        success: true,
        stdout: result?.toString() || '',
        stderr: '',
        code: 0,
      }
    } catch (error) {
      return {
        success: false,
        stdout: error.stdout?.toString() || '',
        stderr: error.stderr?.toString() || error.message,
        code: error.status || 1,
      }
    }
  }

  readProjectTodo() {
    try {
      if (!fs.existsSync(this.todoFile)) {
        console.log('No todo.md found')
        return []
      }

      const content = fs.readFileSync(this.todoFile, 'utf-8')
      return this.parseTodos(content)
    } catch (error) {
      console.log('Error reading todo.md:', error.message)
      return []
    }
  }

  parseTodos(content) {
    const todos = []
    const lines = content.split('\n')
    let currentSection = 'medium'
    let currentTask = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (!line) continue

      if (line.startsWith('##')) {
        const section = line
          .replace(/^##\s*/, '')
          .trim()
          .toLowerCase()
        if (section.includes('high') || section.includes('critical')) {
          currentSection = 'high'
        } else if (section.includes('low')) {
          currentSection = 'low'
        } else {
          currentSection = 'medium'
        }
        continue
      }

      if (line.startsWith('###') || line.startsWith('---')) {
        continue
      }

      if (line.startsWith('- [completed]')) {
        const contentMatch = line.match(/-\s+\[completed\]\s*\{\s*"id":\s*"([^"]+)"/)
        if (contentMatch) {
          currentTask = {
            id: contentMatch[1],
            status: 'completed',
            content: contentMatch[2].trim(),
            priority: currentSection,
          }
          todos.push(currentTask)
        }
        continue
      }

      if (line.startsWith('- [pending]')) {
        const contentMatch = line.match(/-\s+\[pending\]\s*\{\s*"id":\s*"([^"]+)"/)
        if (contentMatch) {
          currentTask = {
            id: contentMatch[1],
            status: 'pending',
            content: contentMatch[2].trim(),
            priority: currentSection,
          }
          todos.push(currentTask)
        }
        continue
      }

      if (line.startsWith('- [in_progress]')) {
        const contentMatch = line.match(/-\s+\[in_progress\]\s*\{\s*"id":\s*"([^"]+)"/)
        if (contentMatch) {
          currentTask = {
            id: contentMatch[1],
            status: 'in_progress',
            content: contentMatch[2].trim(),
            priority: currentSection,
          }
          todos.push(currentTask)
        }
        continue
      }

      if (line.startsWith('- [cancelled]')) {
        const contentMatch = line.match(/-\s+\[cancelled\]\s*\{\s*"id":\s*"([^"]+)"/)
        if (contentMatch) {
          currentTask = {
            id: contentMatch[1],
            status: 'cancelled',
            content: contentMatch[2].trim(),
            priority: currentSection,
          }
          todos.push(currentTask)
        }
        continue
      }
    }

    return todos
  }

  markTodoComplete(id) {
    const todos = this.readProjectTodo()
    const found = todos.find((t) => t.id === id)

    if (!found) {
      console.log('Todo #' + id + ' not found')
      return false
    }

    console.log('Completing todo #' + id + ': ' + found.content.substring(0, 60))
    this.updateTodoStatus(id, 'completed')
    return true
  }

  markTodoInProgress(id) {
    const todos = this.readProjectTodo()
    const found = todos.find((t) => t.id === id)

    if (!found) {
      console.log('Todo #' + id + ' not found')
      return false
    }

    console.log('Starting todo #' + id + ': ' + found.content.substring(0, 60))
    this.updateTodoStatus(id, 'in_progress')
    return true
  }

  addTodo(content, priority = 'medium') {
    const todos = this.readProjectTodo()
    const newId = this.generateId()

    const newTodo = `- [pending]{"id": "${newId}", "content": "${content}", "status": "pending", "priority": "${priority}"}`

    try {
      if (fs.existsSync(this.todoFile)) {
        fs.appendFileSync(this.todoFile, '\n' + newTodo)
      } else {
        fs.writeFileSync(this.todoFile, newTodo)
      }
      console.log('Todo added successfully')
      return { success: true }
    } catch (error) {
      console.log('Error adding todo:', error.message)
      return { success: false }
    }
  }

  updateTodoStatus(id, status) {
    const todos = this.readProjectTodo()
    const found = todos.find((t) => t.id === id)

    if (!found) {
      console.log('Todo #' + id + ' not found')
      return false
    }

    const content = fs.readFileSync(this.todoFile, 'utf-8')
    const updatedContent = content.replace(
      new RegExp(`-\\s*\\[${status}\\]\\s*\\{[^}]*"id":\\s*"${id}"`),
      `- [${status}]{"id": "${id}", "content": "${found.content}", "status": "${status}", "priority": "${found.priority}"}`,
    )

    fs.writeFileSync(this.todoFile, updatedContent)
    console.log('Todo status updated')
    return true
  }

  generateId() {
    return Date.now().toString(36)
  }

  displayTodos() {
    const todos = this.readProjectTodo()

    if (todos.length === 0) {
      console.log('No todos found')
      return
    }

    const pending = todos.filter((t) => t.status === 'pending')
    const inProgress = todos.filter((t) => t.status === 'in_progress')
    const completed = todos.filter((t) => t.status === 'completed')

    console.log('Current Todos:')
    console.log(`  Pending: ${pending.length}`)
    console.log(`  In Progress: ${inProgress.length}`)
    console.log(`  Completed: ${completed.length}`)

    if (inProgress.length > 0) {
      console.log('Currently Working On:')
      inProgress.forEach((t) => {
        console.log(
          `  • [#${t.id} ${t.status === 'completed' ? '✓' : '○'}]: ${t.content.substring(0, 60)}${t.content.length > 60 ? '...' : ''}`,
        )
      })
    }

    if (pending.length > 0 && pending.length <= 5) {
      console.log('Up Next:')
      pending.slice(0, 5).forEach((t) => {
        console.log(
          `  • [#${t.id} ○]: ${t.content.substring(0, 60)}${t.content.length > 60 ? '...' : ''}`,
        )
      })
    }

    if (pending.length > 5) {
      console.log(`Up Next: ${pending.length} items`)
    }
  }

  runTests(options = {}) {
    const { pattern = null, coverage = false, verbose = false, watch = false } = options

    let command = 'npm test'
    const args = []

    if (pattern) args.push(`-- ${pattern}`)
    if (coverage) args.push('-- --coverage')
    if (verbose) args.push('-- --verbose')
    if (watch) args.push('-- --watch')

    if (args.length > 0) {
      command += args.join('')
    }

    console.log('Running tests...')
    console.log(`Command: ${command}`)

    const result = this.run(command)

    this.displayTestResults(result)
    return result
  }

  runTypeCheck() {
    console.log('Running TypeScript type check...')
    console.log('Command: npm run typecheck')

    const result = this.run('npm run typecheck')

    if (result.success) {
      console.log('Type check passed!')
    } else {
      console.log('Type check failed!')
      this.displayTypeScriptErrors(result)
    }

    return result
  }

  runLint(options = {}) {
    const { fix = false, file = null } = options

    let command = 'npm run lint'
    if (fix) command += ':fix'
    if (file) command += ` -- ${file}`

    console.log('Running ESLint...')
    console.log(`Command: ${command}`)

    const result = this.run(command)

    if (result.success && !result.stderr.includes('error')) {
      console.log('Linting passed!')
    } else {
      console.log('Linting failed!')
      this.displayLintErrors(result)
    }

    return result
  }

  runBuild() {
    console.log('Running build...')
    console.log('Command: npm run build')

    const result = this.run('npm run build')

    if (result.success) {
      console.log('Build successful!')
    } else {
      console.log('Build failed!')
      console.log(result.stderr)
    }

    return result
  }

  displayTestResults(result) {
    if (result.success) {
      console.log('Tests passed!')
    } else {
      console.log('Tests failed!')
      console.log(result.stderr)
    }

    const testSummary = this.parseTestOutput(result.stdout + result.stderr)
    if (testSummary && Object.keys(testSummary).length > 0) {
      console.log('Test Summary:')
      console.log(`  Test Suites: ${testSummary.suites}`)
      console.log(`  Tests: ${testSummary.tests}`)
      console.log(`  Failures: ${testSummary.failures}`)
      console.log(`  Duration: ${testSummary.duration}`)
    }
  }

  parseTestOutput(output) {
    const lines = output.split('\n')
    const summary = {
      suites: 0,
      tests: 0,
      failures: 0,
      duration: '',
    }

    for (const line of lines) {
      const suiteMatch = line.match(/Test Suites:\s+(\d+)\s+(failed|passed)/i)
      if (suiteMatch) {
        summary.suites = parseInt(suiteMatch[1])
      }

      const testMatch = line.match(/Tests:\s+(\d+)/i)
      if (testMatch) {
        summary.tests = parseInt(testMatch[1])
      }

      const failMatch = line.match(/(\d+)\s+failed/i)
      if (failMatch) {
        summary.failures = parseInt(failMatch[1])
      }

      const timeMatch = line.match(/in\s+([\d.]+)\s+s/i)
      if (timeMatch) {
        summary.duration = timeMatch[1]
      }
    }

    return summary
  }

  displayTypeScriptErrors(result) {
    const errors = result.stderr
      .split('\n')
      .filter((line) => line.includes('error TS'))
      .slice(0, 20)

    if (errors.length === 0) {
      console.log('No TypeScript errors found in output')
      return
    }

    console.log('TypeScript Errors:')
    errors.forEach((error) => {
      const match = error.match(/(.+\.ts\(\d+,\d+\)):\s+error\s+TS\d+:\s+(.+)/)
      if (match) {
        console.log(`  ${match[1].trim()}`)
        console.log(`  ${match[2].trim()}`)
        console.log()
      }
    })

    if (errors.length === 20) {
      console.log(`... and ${this.countTsErrors(result.stderr) - 20} more`)
    }
  }

  countTsErrors(output) {
    return (output.match(/error TS\d+/g) || []).length
  }

  displayLintErrors(result) {
    const lines = result.stderr.split('\n')
    const errors = lines.filter((line) => line.includes('error'))
    const warnings = lines.filter((line) => line.includes('warning'))

    console.log('ESLint Issues:')
    console.log(`  Errors: ${errors.length}`)
    console.log(`  Warnings: ${warnings.length}`)

    if (errors.length > 0 && errors.length <= 10) {
      console.log('First 10 errors:')
      errors.slice(0, 10).forEach((error) => {
        const match = error.match(/(.+:\d+:\d+)\s+(error|warning)\s+(.+)/)
        if (match) {
          console.log(`  ${match[1]}: ${match[3]}`)
        }
      })
    }

    if (errors.length > 10) {
      console.log(`... and ${errors.length - 10} more errors`)
    }
  }

  async runFullSuite() {
    console.log('='.repeat(60))
    console.log('RUNNING FULL TEST SUITE')
    console.log('='.repeat(60))

    const todos = this.readProjectTodo()
    console.log(`Found ${todos.filter((t) => t.status === 'pending').length} incomplete todos`)

    if (todos.filter((t) => t.status === 'pending').length > 0) {
      console.log('Next tasks:')
      const pendingTodos = todos.filter((t) => t.status === 'pending').slice(0, 5)
      pendingTodos.forEach((t) => {
        console.log(
          `  • [#${t.id} ○]: ${t.content.substring(0, 60)}${t.content.length > 60 ? '...' : ''}`,
        )
      })
      if (todos.filter((t) => t.status === 'pending').length > 5) {
        console.log(`  • ... and ${todos.filter((t) => t.status === 'pending').length - 5} more`)
      }
      console.log()
    }

    const results = {}

    console.log('Starting: TypeScript type check')
    results.typecheck = await this.runTypeCheck()
    console.log()

    console.log('Starting: ESLint')
    results.lint = await this.runLint()
    console.log()

    console.log('Starting: Tests')
    results.tests = await this.runTests({ verbose: false })
    console.log()

    console.log('Starting: Build')
    results.build = await this.runBuild()

    const allPassed = Object.values(results).every((r) => r && r.success)

    console.log('='.repeat(60))
    console.log('FINAL RESULTS')
    console.log('='.repeat(60))

    console.log(`TypeScript: ${results.typecheck?.success ? '✓' : '✗'}`)
    console.log(`ESLint:     ${results.lint?.success ? '✓' : '✗'}`)
    console.log(`Tests:      ${results.tests?.success ? '✓' : '✗'}`)
    console.log(`Build:      ${results.build?.success ? '✓' : '✗'}`)
    console.log(`Overall: ${allPassed ? '✓ ALL PASSED' : '✗ SOME FAILED'}`)
    console.log('='.repeat(60))

    if (allPassed) {
      const completed = todos.filter((t) => t.status !== 'completed')
      const toMark = completed.slice(0, 1)
      console.log(`Clearing ${toMark.length} completed todos...`)
      toMark.forEach((t) => this.markTodoComplete(t.id))
    }

    return results
  }

  async watchTests(pattern = null) {
    console.log('Starting test watch mode...')
    console.log('Press Ctrl+C to stop')

    let command = 'npm run test:watch'
    if (pattern) command += ` -- ${pattern}`

    this.run(command, { stdio: 'inherit' })
  }

  async generateCoverage(threshold = 80) {
    console.log('Generating coverage report...')
    console.log(`Threshold: ${threshold}%`)

    const result = this.run('npm run test:coverage')

    if (result.success) {
      const coverage = this.parseCoverage(result.stdout + result.stderr)
      console.log('Coverage Summary:')
      console.log(`  Statements: ${coverage.statements}%`)
      console.log(`  Branches:   ${coverage.branches}%`)
      console.log(`  Functions:  ${coverage.functions}%`)
      console.log(`  Lines:      ${coverage.lines}%`)

      const belowThreshold = Object.values(coverage).filter((v) => v < threshold)

      if (belowThreshold.length > 0) {
        console.log(`Below ${threshold}% threshold:`)
        belowThreshold.forEach((metric) => console.log(`  ${metric}`))
      }
    }

    return result
  }

  parseCoverage(output) {
    const coverage = {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    }

    const lines = output.split('\n')
    lines.forEach((line) => {
      const match = line.match(/(Statements|Branches|Functions|Lines)\s+:\s+([\d.]+)/)
      if (match) {
        const key = match[1].toLowerCase()
        const value = parseFloat(match[2])
        if (coverage.hasOwnProperty(key)) {
          coverage[key] = value
        }
      }
    })

    return coverage
  }

  async findFailingTests() {
    console.log('Finding failing tests...')

    const result = this.run('npm test 2>&1 | grep -A 10 "FAIL|●"')

    if (result.stdout) {
      const failures = result.stdout
        .split('\n')
        .filter((line) => line.includes('FAIL') || line.includes('●'))

      if (failures.length > 0) {
        console.log(`Found ${failures.length} failing test(s):`)
        failures.forEach((f) => console.log(`  ${f}`))
      }
    } else {
      console.log('No failing tests found!')
    }

    return result
  }

  async fixLint() {
    console.log('Running ESLint auto-fix...')

    const result = this.run('npm run lint:fix')

    if (result.success) {
      console.log('Auto-fix completed!')
    } else {
      console.log('Auto-fix failed!')
      console.log(result.stderr)
    }

    return result
  }

  async cleanArtifacts() {
    console.log('Cleaning test artifacts...')

    const dirs = ['dist', 'build', 'coverage', 'node_modules/.cache']
    dirs.forEach((dir) => {
      if (fs.existsSync(dir)) {
        fs.removeSync(dir)
        console.log(`  Removed: ${dir}/`)
      }
    })

    console.log('Cleaned up test artifacts!')
  }

  async getTestFiles() {
    const testPaths = ['tests/**/*.test.{js,ts,jsx,tsx}', 'tests/**/*.spec.{js,ts,jsx,tsx}']

    const files = []
    for (const testPath of testPaths) {
      const result = this.run(`find ${testPath} -type f 2>/dev/null | head -20`)
      if (result.stdout) {
        files.push(...result.stdout.split('\n').filter(Boolean))
      }
    }

    return files
  }

  async getPackageInfo() {
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.cwd, 'package.json'), 'utf-8'))

      return {
        name: packageJson.name,
        version: packageJson.version,
        scripts: packageJson.scripts || {},
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {},
      }
    } catch (error) {
      console.error('Failed to read package.json:', error.message)
      return null
    }
  }

  async runScript(name, args = []) {
    const packageInfo = await this.getPackageInfo()

    if (!packageInfo || !packageInfo.scripts[name]) {
      console.log(`Script '${name}' not found in package.json`)
      return { success: false, stderr: 'Script not found' }
    }

    const command = `npm run ${name} ${args.join(' ')}`
    console.log(`Running: ${command}`)

    const result = this.run(command, { stdio: 'inherit' })
    return result
  }
}

export default TesterAgent
