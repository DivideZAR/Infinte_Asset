import GitAgent from './Git_Agent.js'

const git = new GitAgent()

console.log('=== Git Agent: Custom Commit ===\n')

try {
  // Stage all changes
  console.log('1. Staging changes...')
  git.addFiles('.')
  const staged = git.getStagedFiles()
  console.log(`Staged ${staged.length} files.`)

  if (staged.length === 0) {
      console.log('No changes to commit.')
      process.exit(0)
  }

  // Create commit
  console.log('\n2. Creating commit...')
  const message = `fix: resolve Jest configuration and ESM module resolution issues\n
- Update tsconfig.json to support ESNext modules and Node resolution
- Refactor scripts/convert.ts and scripts/validate.ts for ESM compatibility
- Fix tests/convert.test.js and tests/validate.test.js to handle ESM and updated logic
- Ensure all tests pass with npm test
- Update todo.md status`

  git.commit(message)
  console.log('✓ Commit created successfully.')

  // Show commit log
  console.log('\n3. Latest commit:')
  console.log(git.getLog(1))

} catch (error) {
  console.error('An error occurred:', error.message)
  process.exit(1)
}
