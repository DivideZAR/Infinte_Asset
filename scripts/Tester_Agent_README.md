# Tester Agent

A comprehensive code testing and correction agent for the Infinte_Asset project.

## Features

- **Full Test Suite**: Run typecheck, lint, tests, and build in sequence
- **Individual Commands**: Run any test-related command independently
- **Test Analysis**: Parse and display test results, errors, and coverage
- **Auto-fixing**: Automatically fix ESLint issues and verify with re-run tests
- **Coverage Reporting**: Generate and analyze coverage reports with threshold checking
- **Artifact Management**: Clean up test/build artifacts

## Usage

### Quick Start

```bash
# Run full test suite
node scripts/tester.js full

# Run quick test
node scripts/tester.js test

# Fix linting issues and re-test
node scripts/tester.js fix

# Start watch mode
node scripts/tester.js watch
```

### Available Commands

| Command        | Description                                               |
| -------------- | --------------------------------------------------------- |
| `full`         | Run complete test suite: typecheck → lint → tests → build |
| `test`         | Run tests only                                            |
| `fix`          | Auto-fix ESLint issues and re-run tests                   |
| `watch`        | Start test watch mode for TDD                             |
| `coverage`     | Generate coverage report with 80% threshold               |
| `find-failing` | List all failing tests                                    |
| `clean`        | Remove dist/, build/, coverage/, node_modules/.cache      |
| `typecheck`    | Run TypeScript type check only                            |
| `lint`         | Run ESLint only                                           |
| `build`        | Run build only                                            |
| `all`          | Alias for `full` - run all checks in sequence             |

## Programmatic Usage

```javascript
import TesterAgent from './scripts/Tester_Agent.js'

const tester = new TesterAgent()

// Run individual commands
await tester.runTypeCheck()
await tester.runLint()
await tester.runTests()
await tester.runBuild()

// Run full suite
await tester.runFullSuite()

// Get test files
const testFiles = await tester.getTestFiles()

// Find failing tests
await tester.findFailingTests()

// Generate coverage with custom threshold
await tester.generateCoverage(85)

// Auto-fix and verify
const fixResult = await tester.fixLint()
const testResult = await tester.runTests()
```

## Output

The agent provides color-coded output:

- ✅ Success / Passed
- ❌ Failure / Failed
- ⚠️ Warning
- 🔧 Tool operations (build, fix, etc.)
- 🧪 Test operations
- 🔍 Code analysis
- 📊 Results & metrics

## Examples

### Example 1: Full Development Cycle

```bash
# 1. Run full check
node scripts/tester.js full

# 2. Fix any issues
node scripts/tester.js fix

# 3. Verify with full check
node scripts/tester.js full
```

### Example 2: Watch Mode for TDD

```bash
# Start watching for changes
node scripts/tester.js watch

# In another terminal, make changes
# Tests will auto-re-run on file changes
```

### Example 3: Coverage Analysis

```bash
# Generate coverage with 80% threshold
node scripts/tester.js coverage

# Output will show:
# - Coverage percentages for statements, branches, functions, lines
# - Which metrics are below threshold
```

## CI/CD Integration

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: node scripts/tester.js full

- name: Generate coverage
  run: node scripts/tester.js coverage
  if: success()
```

## Error Handling

The agent handles errors gracefully:

- **TypeScript Errors**: Parses and displays first 20 errors with file:line format
- **ESLint Errors**: Categorizes errors and warnings, shows first 10
- **Test Failures**: Identifies failing test suites and individual tests
- **Build Errors**: Captures and displays build error output

## Advanced Usage

### Custom Test Patterns

```javascript
await tester.runTests({
  pattern: 'convert',
  coverage: true,
  verbose: false,
})
```

### Run Specific NPM Scripts

```javascript
await tester.runScript('test:unit', ['--verbose'])
await tester.runScript('typecheck')
```

### Get Package Information

```javascript
const info = await tester.getPackageInfo()

console.log(info.name) // Project name
console.log(info.version) // Version
console.log(info.scripts) // Available scripts
```

## Tips

1. **Watch Mode**: Best for Test-Driven Development (TDD)
2. **Fix Command**: Automatically fixes ESLint issues, but always review changes
3. **Coverage**: Run coverage before pushing to ensure quality thresholds
4. **Clean**: Use clean command to clear cache when tests behave unexpectedly
5. **Full Suite**: Run `full` command before creating pull requests

## Troubleshooting

### Tests Keep Failing

```bash
# Find failing tests
node scripts/tester.js find-failing

# Get details
node scripts/tester.js test --verbose
```

### Lint Won't Fix

```bash
# Try manual fix
node scripts/tester.js lint

# Clean cache
node scripts/tester.js clean
```

### Type Check Errors

```bash
# Get detailed errors
npm run typecheck 2>&1 | head -50

# Fix errors, then verify
node scripts/tester.js typecheck
```
