# Git & GitHub Cheat Sheet

## Quick Reference

### The Three Areas
```
Working Directory → Staging Area → Git Repository
     (your files)        (staged)          (committed)
```

### Daily Workflow (7 Commands)
```bash
1. git checkout main && git pull origin main    # Start fresh
2. git checkout -b feature/your-feature         # Create branch
3. git add .                                     # Stage changes
4. git commit -m "type: description"            # Save changes
5. git push origin feature/your-feature         # Upload to GitHub
6. (Create PR on GitHub, then merge)
7. git checkout main && git pull origin main    # Sync local
```

---

## Essential Commands

### Check Status
```bash
git status              # What's changed?
git diff                # Show detailed changes
git log --oneline       # Recent commits
git log --graph         # Visual branch history
```

### Save Changes
```bash
git add file.js         # Stage one file
git add .               # Stage all changed files
git add -A              # Stage all (including deleted)
git commit -m "message" # Commit
```

### Undo Changes
```bash
git checkout -- file.js     # Discard local changes
git reset --soft HEAD~1     # Undo commit, keep changes
git reset --hard HEAD~1     # Undo commit, discard changes
git restore --staged file.js # Unstage file
```

### Sync with GitHub
```bash
git pull origin main        # Download & merge
git fetch origin            # Download only
git push origin main        # Upload
```

### Branches
```bash
git branch                  # List branches
git branch -a               # List all (including remote)
git checkout -b name        # Create & switch
git checkout name           # Switch
git branch -d name          # Delete local branch
git push origin --delete name # Delete remote branch
```

---

## Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting |
| `refactor` | Code improvement |
| `test` | Tests |
| `chore` | Maintenance |

### Examples
```bash
feat(pipeline): add WebM output support
fix(browser-renderer): resolve timeout error
docs(readme): update installation steps
ci(workflow): add build verification
```

---

## Branch Naming

| Pattern | Example | Purpose |
|---------|---------|---------|
| `feature/*` | `feature/add-wave` | New feature |
| `fix/*` | `fix/frame-capture` | Bug fix |
| `docs/*` | `docs/readme` | Documentation |
| `refactor/*` | `refactor/html-gen` | Improvement |
| `hotfix/*` | `hotfix/security` | Urgent fix |

---

## GitHub Workflow

### For New Feature
```
1. Create branch: git checkout -b feature/new-feature
2. Make changes
3. Commit: git add . && git commit -m "feat: description"
4. Push: git push origin feature/new-feature
5. GitHub: Create Pull Request
6. GitHub: Review & Merge
7. Local: git checkout main && git pull origin main
```

### For Bug Fix
```
1. Create branch: git checkout -b fix/issue-description
2. Fix the bug
3. Commit: git add . && git commit -m "fix: description"
4. Push & merge (same as above)
```

---

## Merge Conflicts

### When Conflicts Happen
Git can't automatically merge because both branches changed the same code.

### Resolve Conflicts
```bash
# 1. Open conflicted file
# 2. Look for: <<<<<<< HEAD ... ======= ... >>>>>>> branch
# 3. Edit to keep desired changes
# 4. Save file
git add resolved-file.js
git commit -m "fix: resolve merge conflict"
```

### Avoid Conflicts
```bash
# Always pull latest before creating branch
git checkout main && git pull origin main

# Keep branches short-lived
# Merge frequently
```

---

## Tagging Releases

```bash
# Create tag
git tag -a v1.0.0 -m "Version 1.0.0"

# Push tag
git push origin v1.0.0

# List tags
git tag -l
```

---

## Useful Aliases

Add to `~/.gitconfig`:

```bash
[alias]
  s = status
  d = diff
  l = log --oneline
  co = checkout
  cb = checkout -b
  br = branch
  aa = add -A
  cm = commit -m
  pl = pull origin main
  ps = push origin main
  df = diff --stat
  lg = log --graph --oneline --decorate
```

Usage:
```bash
git s          # instead of git status
git co main    # instead of git checkout main
git cm "fix: bug"  # instead of git commit -m "fix: bug"
```

---

## Ignore Files

Create `.gitignore`:
```
node_modules/      # Dependencies
dist/              # Build output
coverage/          # Test coverage
output/*.mp4       # Generated videos
temp/              # Temporary files
.env               # Environment variables
*.log              # Log files
.DS_Store          # macOS files
.vscode/           # VS Code settings
```

---

## SSH Setup

### Generate Key
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

### Add to GitHub
1. Copy: `cat ~/.ssh/id_ed25519.pub`
2. Go to: https://github.com/settings/keys
3. Add SSH key

### Test Connection
```bash
ssh -T git@github.com
```

---

## Testing Before Push

Always test your code:
```bash
npm run typecheck      # TypeScript errors
npm run lint           # Code style
npm test               # Run tests
npm run convert:pipeline -- animations/example-animation output/test.mp4
```

---

## Undo Everything

```bash
# Discard all local changes
git checkout -- .
git clean -fd

# Reset to remote
git reset --hard origin/main
```

---

## Useful Links

- Git Cheat Sheet: https://education.github.com/git-cheat-sheet
- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com

---

## Emergency Commands

| Situation | Command |
|-----------|---------|
| Messed up locally | `git checkout -- .` |
| Messed up commit | `git reset --soft HEAD~1` |
| Start over | `git reset --hard origin/main` |
| Can't push | `git pull --rebase origin main` |
| Too many merge commits | `git pull --rebase origin main` |
