# Security Quick Reference Guide

**⚠️ CRITICAL**: If you're here because of exposed secrets, follow the **Emergency Response** section immediately.

## 🚨 Emergency Response (Exposed Secrets)

### If You Exposed Secrets
1. **STOP** - Don't commit anything else
2. **IMMEDIATELY** rotate the exposed secrets:
   ```bash
   # Generate new secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **REVOKE** the old secret at the provider (API keys, database passwords, etc.)
4. **VERIFY** no unauthorized usage
5. **DOCUMENT** the incident (see [SECURITY_INCIDENT_REPORT.md](SECURITY_INCIDENT_REPORT.md))

### Known Compromised Secrets (DO NOT USE)
- ❌ SESSION_SECRET: `jYbS0m7xBY...` 
- ❌ GEMINI_API_KEY: `AIzaSyAJMqJy6WejEwQ3JgHx1hv9FQxdfoAe3FU`

**If you find these in any configuration, replace immediately!**

## ✅ Quick Setup Checklist

### First Time Setup
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Generate JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "JWT_SECRET=$JWT_SECRET" >> .env

# 3. Verify .env is ignored
git check-ignore .env  # Should output: .env

# 4. Install pre-commit hooks (optional but recommended)
npm install --save-dev husky lint-staged
npx husky install
```

### Before Every Commit
```bash
# 1. Check for secrets
git diff --cached

# 2. Verify no .env files
git status --ignored | grep .env

# 3. Run linter
npm run lint
```

## 🔍 Quick Secret Scan

```bash
# Scan for common secret patterns in staged files
git diff --cached | grep -E "AIza[0-9A-Za-z\\-_]{35}|AKIA[0-9A-Z]{16}|sk-[0-9A-Za-z]{48}"

# If anything matches, DO NOT COMMIT!
```

## 🔑 Common Secret Patterns to Avoid

| Type | Pattern | Example |
|------|---------|---------|
| Google API Key | `AIza[0-9A-Za-z\-_]{35}` | AIzaSyAJMqJy6WejEwQ3... |
| AWS Access Key | `AKIA[0-9A-Z]{16}` | AKIAIOSFODNN7EXAMPLE |
| OpenAI API Key | `sk-[0-9A-Za-z]{48}` | sk-proj-abc123... |
| Private Key | `BEGIN.*PRIVATE KEY` | -----BEGIN PRIVATE KEY----- |
| Base64 Secret | `[A-Za-z0-9+/]{64,}=*` | jYbS0m7xBY/5hJUtSU... |

## 📚 Documentation Quick Links

### Essential Reading
- [SECURITY.md](../SECURITY.md) - Security policy (START HERE)
- [SECURITY_BEST_PRACTICES.md](SECURITY_BEST_PRACTICES.md) - Comprehensive guide
- [PRE_COMMIT_HOOKS.md](PRE_COMMIT_HOOKS.md) - Hook setup

### Reference
- [SECURITY_INCIDENT_REPORT.md](SECURITY_INCIDENT_REPORT.md) - Incident details

## 🛠️ Common Commands

### Generate Secrets
```bash
# JWT Secret (32 bytes hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Session Secret (64 bytes base64)
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Using OpenSSL
openssl rand -base64 64
```

### Check Repository Status
```bash
# Check if .env is ignored
git check-ignore .env

# See all ignored files
git status --ignored

# Scan for secrets in history
git log --all --full-history -p | grep -i "api.key\|secret\|password"
```

### Validate Before Commit
```bash
# Check staged files for secrets
git diff --cached --name-only | xargs grep -l "AIza[0-9A-Za-z\-_]\{35\}"

# Lint your changes
npm run lint

# Type check
npx tsc --noEmit
```

## ⚡ Quick Troubleshooting

### "I accidentally committed a secret!"
```bash
# IF NOT YET PUSHED
git reset HEAD~1  # Undo last commit, keep changes
# Remove secret from files
# Commit again without secret

# IF ALREADY PUSHED (more complex - get help!)
# See SECURITY_BEST_PRACTICES.md Incident Response section
# Contact security team
```

### "My .env file is showing in git status"
```bash
# Add to .gitignore if not already there
echo ".env" >> .gitignore

# Remove from git tracking (keeps local file)
git rm --cached .env

# Commit the .gitignore change
git add .gitignore
git commit -m "chore: ensure .env is ignored"
```

### "I need to rotate a secret"
```bash
# 1. Generate new secret
NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 2. Update .env file
# Edit .env and replace old secret with $NEW_SECRET

# 3. Restart your application

# 4. Revoke old secret at provider (for API keys)

# 5. Document the change
```

## 🎯 Best Practices Summary

### ✅ DO
- Use environment variables for all secrets
- Generate strong, random secrets
- Use different secrets per environment
- Keep .env files in .gitignore
- Review your changes before committing
- Set up pre-commit hooks
- Rotate secrets regularly (every 90 days)
- Document secret rotation

### ❌ DON'T
- Commit .env files
- Hardcode secrets in code
- Use example/default secrets in production
- Share secrets in issues/PRs/comments
- Reuse secrets across projects
- Log sensitive data
- Store secrets in screenshots

## 🔒 Security Contacts

### Report a Vulnerability
- Use GitHub Security Advisory (private)
- See [SECURITY.md](../SECURITY.md) for details

### Get Help
- Review [SECURITY_BEST_PRACTICES.md](SECURITY_BEST_PRACTICES.md)
- Check [PRE_COMMIT_HOOKS.md](PRE_COMMIT_HOOKS.md)
- Contact maintainers (see README)

## 📊 Security Checklist for PRs

Before opening a Pull Request:

- [ ] No secrets in code changes
- [ ] No .env files committed
- [ ] Linter passes (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Reviewed own changes for security issues
- [ ] Pre-commit hooks set up (if not, do it!)
- [ ] Read relevant security documentation

## 🎓 Learning Resources

### Internal
- [SECURITY.md](../SECURITY.md) - Our security policy
- [SECURITY_BEST_PRACTICES.md](SECURITY_BEST_PRACTICES.md) - Detailed guide
- [PRE_COMMIT_HOOKS.md](PRE_COMMIT_HOOKS.md) - Prevention tools

### External
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [12 Factor App - Config](https://12factor.net/config)

---

**🔐 Security is everyone's responsibility!**

For detailed information, see the full documentation in the links above.

*Last Updated: 2025-11-16*
