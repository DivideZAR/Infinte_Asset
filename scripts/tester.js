import TesterAgent from './Tester_Agent.js'

const tester = new TesterAgent()

console.log('=== Tester Agent: Code Testing & Correction ===\n')

async function runFullCheck() {
  console.log('\n' + '='.repeat(60))
  console.log('🧪 RUNNING FULL TEST SUITE')
  console.log('='.repeat(60))

  const results = {
    typecheck: null,
    lint: null,
    tests: null,
    build: null,
  }

  // 1. Type Check
  results.typecheck = await tester.runTypeCheck()
  console.log()

  // 2. Lint
  results.lint = await tester.runLint()
  console.log()

  // 3. Tests
  results.tests = await tester.runTests()
  console.log()

  // 4. Build
  results.build = await tester.runBuild()

  const allPassed = Object.values(results).every((r) => r && r.success)

  console.log('\n' + '='.repeat(60))
  console.log('📊 FINAL RESULTS')
  console.log('='.repeat(60))

  console.log('\n   TypeScript: ' + (results.typecheck?.success ? '✅' : '❌'))
  console.log('   ESLint:     ' + (results.lint?.success ? '✅' : '❌'))
  console.log('   Tests:      ' + (results.tests?.success ? '✅' : '❌'))
  console.log('   Build:      ' + (results.build?.success ? '✅' : '❌'))

  console.log('\n   Overall: ' + (allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'))
  console.log('='.repeat(60))

  return results
}

async function quickTest() {
  console.log('\n🧪 Running quick test...')
  const result = await tester.runTests()
  return result
}

async function fixAndCheck() {
  console.log('\n🔧 Fixing lint issues...')
  const fixResult = await tester.fixLint()
  console.log()

  console.log('🧪 Re-running tests after fix...')
  const testResult = await tester.runTests()
  return { fix: fixResult, test: testResult }
}

async function watchMode() {
  console.log('\n👀 Starting test watch mode...')
  await tester.watchTests()
}

async function checkCoverage() {
  console.log('\n📈 Checking code coverage...')
  const result = await tester.generateCoverage(80)
  return result
}

async function findProblems() {
  console.log('\n🔍 Finding failing tests...')
  const result = await tester.findFailingTests()
  return result
}

async function clean() {
  console.log('\n🧹 Cleaning artifacts...')
  await tester.cleanArtifacts()
}

async function showTodos() {
  console.log('\n📋 Displaying project todos...\n')
  tester.displayTodos()
}

// Parse command line arguments
const args = process.argv.slice(2)
const command = args[0] || 'full'

switch (command) {
  case 'todos':
  case 'show-todos':
    await showTodos()
    break

  case 'full':
    await runFullCheck()
    break

  case 'test':
    await quickTest()
    break

  case 'fix':
    await fixAndCheck()
    break

  case 'watch':
    await watchMode()
    break

  case 'coverage':
    await checkCoverage()
    break

  case 'find-failing':
    await findProblems()
    break

  case 'clean':
    await clean()
    break

  case 'typecheck':
    await tester.runTypeCheck()
    break

  case 'lint':
    await tester.runLint()
    break

  case 'build':
    await tester.runBuild()
    break

  case 'all':
    const results = await tester.runFullSuite()
    break

  default:
    console.log('\n📖 Tester Agent - Code Testing & Correction Tool\n')
    console.log('\nUsage: node scripts/tester.js [command]\n')
    console.log('Commands:')
    console.log('  todos/show-todos    Display project todos')
    console.log('  full                Run complete test suite (typecheck, lint, tests, build)')
    console.log('  test                Run quick test')
    console.log('  fix                 Fix lint issues and re-run tests')
    console.log('  watch               Start test watch mode')
    console.log('  coverage            Generate coverage report')
    console.log('  find-failing         Find all failing tests')
    console.log('  clean               Clean test artifacts')
    console.log('  typecheck           Run TypeScript type check')
    console.log('  lint                Run ESLint')
    console.log('  build               Run build')
    console.log('  all                 Run all checks in sequence\n')
    console.log('Examples:')
    console.log('  node scripts/tester.js full')
    console.log('  node scripts/tester.js test')
    console.log('  node scripts/tester.js fix')
    console.log('  node scripts/tester.js todos')
}

console.log('\n=== Done ===')
