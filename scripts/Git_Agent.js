import { execSync } from 'child_process'
import path from 'path'

class GitAgent {
  constructor(cwd = null) {
    this.cwd = cwd || process.cwd()
  }

  run(command, options = {}) {
    return execSync(command, {
      cwd: this.cwd,
      encoding: 'utf-8',
      ...options,
    })
  }

  getStatus() {
    return this.run('git status --porcelain', { description: 'Get git status' })
  }

  getDiff() {
    return this.run('git diff', { description: 'Get git diff' })
  }

  getStagedDiff() {
    return this.run('git diff --staged', { description: 'Get staged diff' })
  }

  getLog(count = 10) {
    return this.run(`git log --oneline -${count}`, { description: `Get last ${count} commits` })
  }

  getCurrentBranch() {
    const result = this.run('git rev-parse --abbrev-ref HEAD', {
      description: 'Get current branch',
    })
    return result.trim() || ''
  }

  addFiles(files = '.') {
    return this.run(`git add ${files}`, { description: `Stage files: ${files}` })
  }

  commit(message, options = {}) {
    const { skipHooks = false, amend = false } = options
    let command = 'git commit'

    if (skipHooks) command += ' --no-verify'
    if (amend) command += ' --amend'

    command += ` -m "${message}"`

    return this.run(command, { description: `Create commit: ${message}` })
  }

  push(remote = 'origin', branch = null) {
    const currentBranch = branch || this.getCurrentBranch()
    return this.run(`git push ${remote} ${currentBranch}`, {
      description: `Push to ${remote}/${currentBranch}`,
    })
  }

  createBranch(name, base = null) {
    const currentBranch = base || this.getCurrentBranch()
    return this.run(`git checkout -b ${name} ${currentBranch}`, {
      description: `Create branch ${name} from ${currentBranch}`,
    })
  }

  checkoutBranch(name) {
    return this.run(`git checkout ${name}`, { description: `Checkout branch ${name}` })
  }

  createPullRequest(title, body = '') {
    return this.run(`gh pr create --title "${title}" --body "${body}"`, {
      description: `Create PR: ${title}`,
    })
  }

  stash(message = 'WIP') {
    return this.run(`git stash push -m "${message}"`, { description: `Stash changes: ${message}` })
  }

  stashPop() {
    return this.run('git stash pop', { description: 'Pop stash' })
  }

  reset(mode = 'soft', commit = 'HEAD~1') {
    return this.run(`git reset --${mode} ${commit}`, { description: `Reset ${mode} to ${commit}` })
  }

  hasChanges() {
    const status = this.getStatus()
    return status.trim().length > 0
  }

  getStagedFiles() {
    const result = this.run('git diff --name-only --cached', { description: 'Get staged files' })
    return result ? result.split('\n').filter(Boolean) : []
  }

  getUntrackedFiles() {
    const result = this.run('git ls-files --others --exclude-standard', {
      description: 'Get untracked files',
    })
    return result ? result.split('\n').filter(Boolean) : []
  }

  isRepoRoot() {
    try {
      this.run('git rev-parse --show-toplevel', { description: 'Check if in git repo' })
      return true
    } catch (error) {
      return false
    }
  }

  getChangedFilesSinceCommit(commit = 'HEAD~1') {
    const result = this.run(`git diff --name-only ${commit} HEAD`, {
      description: `Get files changed since ${commit}`,
    })
    return result ? result.split('\n').filter(Boolean) : []
  }

  formatCommitMessage(type, scope, subject, body = '') {
    let message = `${type}(${scope}): ${subject}`
    if (body) message += `\n\n${body}`
    return message
  }

  isClean() {
    const status = this.getStatus()
    return status.trim().length === 0
  }

  getRemoteUrl() {
    const result = this.run('git config --get remote.origin.url', { description: 'Get remote URL' })
    return result?.trim() || ''
  }

  fetch(remote = 'origin') {
    return this.run(`git fetch ${remote}`, { description: `Fetch from ${remote}` })
  }

  pull(remote = 'origin', branch = null) {
    const currentBranch = branch || this.getCurrentBranch()
    return this.run(`git pull ${remote} ${currentBranch}`, {
      description: `Pull from ${remote}/${currentBranch}`,
    })
  }
}

export default GitAgent
