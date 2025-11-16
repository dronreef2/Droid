# Pre-commit Hook Configuration
# Install: npm install --save-dev husky lint-staged
# Setup: npx husky install

# This file is for documentation purposes
# Actual pre-commit hooks should be configured with husky

## Recommended Git Hooks

### 1. Pre-commit: Secret Detection
```bash
#!/bin/bash
# .husky/pre-commit

echo "🔍 Scanning for secrets before commit..."

# Check for .env files
if git diff --cached --name-only | grep -q "^\.env$"; then
  echo "❌ Error: Attempting to commit .env file!"
  echo "   .env files should never be committed."
  echo "   Use .env.example for templates."
  exit 1
fi

# Check for common secret patterns
FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Google API keys
if echo "$FILES" | xargs grep -H "AIza[0-9A-Za-z\-_]\{35\}" 2>/dev/null; then
  echo "❌ Error: Google API key pattern detected!"
  exit 1
fi

# AWS keys
if echo "$FILES" | xargs grep -H "AKIA[0-9A-Z]\{16\}" 2>/dev/null; then
  echo "❌ Error: AWS access key pattern detected!"
  exit 1
fi

# Private keys
if echo "$FILES" | xargs grep -H "BEGIN.*PRIVATE KEY" 2>/dev/null; then
  echo "❌ Error: Private key detected!"
  exit 1
fi

# Known exposed secrets
if echo "$FILES" | xargs grep -H "jYbS0m7xBY\|AIzaSyAJMqJy6WejEwQ3JgHx1hv9FQxdfoAe3FU" 2>/dev/null; then
  echo "❌ Error: Known compromised secret detected!"
  echo "   These secrets were previously exposed and must not be used."
  exit 1
fi

echo "✅ No secrets detected"
```

### 2. Pre-commit: Linting
```bash
#!/bin/bash
# Part of .husky/pre-commit

echo "🔧 Running linter..."
npm run lint --quiet || {
  echo "❌ Linting failed. Please fix errors before committing."
  exit 1
}
echo "✅ Linting passed"
```

### 3. Pre-commit: Type Checking
```bash
#!/bin/bash
# Part of .husky/pre-commit

echo "📘 Running TypeScript type check..."
npx tsc --noEmit || {
  echo "❌ Type check failed. Please fix type errors before committing."
  exit 1
}
echo "✅ Type check passed"
```

### 4. Commit Message Validation
```bash
#!/bin/bash
# .husky/commit-msg

COMMIT_MSG=$(cat "$1")

# Conventional Commits format
if ! echo "$COMMIT_MSG" | grep -qE "^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .+"; then
  echo "❌ Invalid commit message format!"
  echo "   Use: <type>(<scope>): <subject>"
  echo "   Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
  echo "   Example: feat(auth): add JWT authentication"
  exit 1
fi

# Check for secrets in commit message
if echo "$COMMIT_MSG" | grep -qE "AIza[0-9A-Za-z\-_]{35}|AKIA[0-9A-Z]{16}"; then
  echo "❌ Error: Secret pattern detected in commit message!"
  exit 1
fi

echo "✅ Commit message format is valid"
```

## Setup Instructions

### Option 1: Using Husky (Recommended)

```bash
# Install husky and lint-staged
npm install --save-dev husky lint-staged

# Initialize husky
npx husky install

# Create pre-commit hook
npx husky add .husky/pre-commit "npm run pre-commit"

# Create commit-msg hook
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'

# Add to package.json
```

Add to `package.json`:
```json
{
  "scripts": {
    "pre-commit": "lint-staged && npm run type-check",
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ],
    "*": [
      "bash -c 'git diff --cached --name-only | xargs -I {} bash -c \"grep -l \\\"AIza[0-9A-Za-z\\\\-_]\\{35\\}\\\" {} && exit 1 || exit 0\"' || (echo 'Secret detected!' && exit 1)"
    ]
  }
}
```

### Option 2: Using Git Secrets

```bash
# Install git-secrets
# Mac
brew install git-secrets

# Linux
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
make install

# Configure for repository
cd /path/to/Droid
git secrets --install
git secrets --register-aws

# Add custom patterns
git secrets --add 'AIza[0-9A-Za-z\\-_]{35}'  # Google API keys
git secrets --add 'sk-[0-9A-Za-z]{48}'       # OpenAI keys
git secrets --add '[A-Za-z0-9+/]{64,}={0,2}' # Base64 secrets (may have false positives)
git secrets --add 'jYbS0m7xBY'               # Known exposed secret
git secrets --add 'AIzaSyAJMqJy6WejEwQ3JgHx1hv9FQxdfoAe3FU'  # Known exposed key

# Scan repository
git secrets --scan

# Scan history
git secrets --scan-history
```

### Option 3: Manual Git Hook

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash

# Make executable: chmod +x .git/hooks/pre-commit

echo "🔍 Pre-commit checks..."

# Check for .env files
if git diff --cached --name-only | grep -q "^\.env$"; then
  echo "❌ Error: .env file detected in commit"
  exit 1
fi

# Scan for secrets
FILES=$(git diff --cached --name-only)
if [ -n "$FILES" ]; then
  # Check patterns
  if echo "$FILES" | xargs grep -l "AIza[0-9A-Za-z\-_]\{35\}" 2>/dev/null; then
    echo "❌ Google API key detected!"
    exit 1
  fi
  
  if echo "$FILES" | xargs grep -l "jYbS0m7xBY\|AIzaSyAJMqJy6WejEwQ3JgHx1hv9FQxdfoAe3FU" 2>/dev/null; then
    echo "❌ Known compromised secret detected!"
    exit 1
  fi
fi

# Run linter
npm run lint --quiet || exit 1

echo "✅ Pre-commit checks passed"
exit 0
```

## Testing Hooks

```bash
# Test secret detection
echo "AIzaSyAJMqJy6WejEwQ3JgHx1hv9FQxdfoAe3FU" > test-file.txt
git add test-file.txt
git commit -m "test: secret detection"
# Should fail

# Clean up
rm test-file.txt
git reset

# Test .env detection
touch .env
echo "SECRET=test" > .env
git add .env
git commit -m "test: env file"
# Should fail

# Clean up
rm .env
git reset
```

## Bypassing Hooks (Emergency Only)

```bash
# Skip pre-commit hooks (use with extreme caution!)
git commit --no-verify -m "emergency fix"

# This should only be used:
# - In true emergencies
# - When you're absolutely certain there are no secrets
# - With approval from team lead
```

## Additional Security Tools

### Gitleaks
```bash
# Install
brew install gitleaks  # Mac
# or download from https://github.com/gitleaks/gitleaks

# Scan repository
gitleaks detect --source . --verbose

# Scan history
gitleaks detect --source . --log-opts="--all"
```

### TruffleHog
```bash
# Install
pip install trufflehog

# Scan repository
trufflehog filesystem /path/to/Droid

# Scan git history
trufflehog git file:///path/to/Droid --since-commit main
```

## CI/CD Integration

The repository includes automated secret scanning in GitHub Actions:
- `.github/workflows/secret-scan.yml` - Runs on every push and PR
- Multiple scanning tools: TruffleHog, Gitleaks, custom patterns
- Fails the build if secrets are detected

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [Git Secrets](https://github.com/awslabs/git-secrets)
- [Gitleaks](https://github.com/gitleaks/gitleaks)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)
- [Pre-commit Framework](https://pre-commit.com/)

---

**Remember: Hooks are a safety net, not a replacement for vigilance!**
