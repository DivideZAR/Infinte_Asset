#!/usr/bin/env node
import GitAgent from './Git_Agent.js'

const git = new GitAgent()

console.log('=== Git Agent: Version Control Tool ===\n')

async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'help'
  const param1 = args[1]
  const param2 = args[2]

  switch (command) {
    case 'status':
      console.log(git.getStatus())
      break

    case 'log':
      const count = parseInt(param1) || 10
      console.log(git.getLog(count))
      break

    case 'diff':
      if (param1 === '--staged' || param1 === 'staged') {
        console.log(git.getStagedDiff())
      } else {
        console.log(git.getDiff())
      }
      break

    case 'branch':
      if (param1 === 'create') {
        if (!param2) {
          console.error('Error: Branch name required. Usage: branch create <name>')
          process.exit(1)
        }
        console.log(git.createBranch(param2))
      } else {
        console.log(`Current branch: ${git.getCurrentBranch()}`)
      }
      break

    case 'checkout':
      if (!param1) {
        console.error('Error: Branch name required. Usage: checkout <name>')
        process.exit(1)
      }
      console.log(git.checkoutBranch(param1))
      break

    case 'add':
      const files = param1 || '.'
      console.log(git.addFiles(files))
      break

    case 'commit':
      if (!param1) {
        console.error('Error: Commit message required. Usage: commit "message"')
        process.exit(1)
      }
      console.log(git.commit(param1))
      break

    case 'push':
      try {
        console.log(git.push(param1 || 'origin', param2))
      } catch (e) {
        console.error('Push failed:', e.message)
      }
      break

    case 'pull':
      try {
        console.log(git.pull(param1 || 'origin', param2))
      } catch (e) {
        console.error('Pull failed:', e.message)
      }
      break

    case 'stash':
      if (param1 === 'pop') {
        console.log(git.stashPop())
      } else {
        console.log(git.stash(param1 || 'WIP'))
      }
      break

    case 'reset':
      console.log(git.reset(param1 || 'soft', param2 || 'HEAD~1'))
      break

    case 'remote':
      console.log(git.getRemoteUrl())
      break

    case 'help':
    default:
      console.log('Usage: node scripts/git-cli.js [command] [args]')
      console.log('Commands:')
      console.log('  status              Show git status')
      console.log('  log [count]         Show commit logs')
      console.log('  diff [staged]       Show diffs')
      console.log('  branch [create <name>] Show or create branch')
      console.log('  checkout <name>     Switch branch')
      console.log('  add [files]         Stage files (default: .)')
      console.log('  commit <message>    Commit changes')
      console.log('  push [remote] [branch] Push to remote')
      console.log('  pull [remote] [branch] Pull from remote')
      console.log('  stash [msg|pop]     Stash changes')
      console.log('  reset [mode] [ref]  Reset HEAD')
      console.log('  remote              Show remote URL')
      break
  }
}

main().catch((err) => {
  console.error('\nError:', err.message)
  process.exit(1)
})
