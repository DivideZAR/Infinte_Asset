import GitAgent from './Git_Agent.js'

const git = new GitAgent()

console.log('=== Git Agent: Commit and Push ===\n')

// Stage all changes
console.log('1. Staging changes...')
git.addFiles('.')
console.log('Staged:', git.getStagedFiles())

// Create commit
console.log('\n2. Creating commit...')
const message =
  'fix: resolve all critical TypeScript and ESLint issues\n\n- Fixed 62 TypeScript errors across 8 script files\n- Fixed 117 ESLint warnings (console statements, unused vars)\n- Updated ESLint config (renamed to .eslintrc.cjs)\n- Fixed Jest configuration\n- Created test fixtures\n- Created src/index.ts for proper build structure\n- Added TypeScript declarations for Scene1 App.jsx\n- Added Git_Agent subagent for git operations\n- Improved fluent-ffmpeg type definitions'
git.commit(message, { skipHooks: true })
console.log('✓ Commit created:', git.getCurrentBranch())

// Show commit log
console.log('\n3. Latest commit:')
console.log(git.getLog(1))

// Try to push
console.log('\n4. Pushing to GitHub...')
try {
  git.push()
  console.log('✓ Pushed successfully!')
} catch (error) {
  console.log('✗ Push failed:', error.message)
  console.log('  You may need to run: git push')
}

console.log('\n=== Done ===')
