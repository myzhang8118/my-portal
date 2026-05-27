# Git Usage and Rollback Guide

Project path: `/opt/my-portal/app`

## 1) Enter project directory

```bash
cd /opt/my-portal/app
```

## 2) Check current status

```bash
git status -sb
git log --oneline -n 15
```

## 3) Release a new version

Use helper script `scripts/release.sh`.

### Release without tag

```bash
./scripts/release.sh "feat: your change description"
```

### Release with tag (recommended)

```bash
./scripts/release.sh "feat: your change description" v1.0.0
```

What it does:
- `git add -A`
- `git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>"`
- optional tag creation
- run deployment (`scripts/deploy-local.sh`)

## 4) Roll back website

Use helper script `scripts/rollback.sh`.

### Roll back to previous commit

```bash
./scripts/rollback.sh HEAD~1
```

### Roll back to a specific commit

```bash
./scripts/rollback.sh <commit-hash>
```

### Roll back to a tag

```bash
./scripts/rollback.sh v1.0.0
```

What rollback does:
1. `git checkout` target version
2. run deployment (`scripts/deploy-local.sh`)

## 5) Useful commands

```bash
# list branches
git branch -a

# recent history
git log --oneline -n 20

# inspect one commit
git show <commit-hash>
```

## 6) Important notes

- Git tracks code only.
- Runtime data is excluded by `.gitignore`:
  - `data/*.db`
  - `data/uploads/`
- Back up DB before schema changes.
- Never commit secrets (private keys/passwords/tokens).

## 7) Quick example

```bash
cd /opt/my-portal/app
./scripts/release.sh "feat: add article management" v1.0.1
# if issue happens
./scripts/rollback.sh v1.0.0
```

Last updated: $(date '+%Y-%m-%d %H:%M:%S %Z')
