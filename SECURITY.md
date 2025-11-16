# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this project, please report it by emailing the maintainers directly. **Do not create a public GitHub issue.**

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Best Practices

### Environment Variables and Secrets

**CRITICAL**: Never commit secrets, API keys, or sensitive credentials to the repository.

#### ✅ DO:
- Use environment variables for all sensitive data
- Keep `.env` files in `.gitignore` (already configured)
- Use different secrets for development, staging, and production
- Rotate secrets immediately if they are exposed
- Use strong, randomly generated secrets (minimum 32 characters)
- Store production secrets in secure secret management systems (AWS Secrets Manager, Azure Key Vault, etc.)

#### ❌ DON'T:
- Commit `.env` files
- Share secrets in issue descriptions, pull requests, or comments
- Use simple or default secrets in production
- Reuse secrets across environments
- Store secrets in code, logs, or screenshots

### Generating Secure Secrets

Use these commands to generate secure random secrets:

```bash
# Generate SESSION_SECRET (64 bytes base64)
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Generate JWT_SECRET (32 bytes hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -base64 64
```

### Required Environment Variables

See `.env.example` for a complete list. Critical variables include:

- `JWT_SECRET` - Must be a strong random string (never use default values)
- `DB_PASSWORD` - Strong database password
- `REDIS_PASSWORD` - Redis authentication password
- API keys for external services (OpenAI, Anthropic, etc.)

### Secret Rotation

If a secret is exposed:

1. **Immediately** generate a new secret
2. Update the environment variable in all deployments
3. Revoke/invalidate the old secret at the provider (for API keys)
4. Restart all services using the secret
5. Review git history - if committed, consider the branch compromised
6. Notify the security team

### Known Exposed Secrets (for tracking)

The following secrets were **accidentally exposed** in a development environment and must be considered compromised:

- **SESSION_SECRET**: `jYbS0m7xBY/5hJUtSUGrjoL2ofd/dyBcSbigi6qtAI16XG86O9s9LcBHrZchgZJSaFLPbw9mk/QGfbfCZb8NKA==`
  - **Status**: REVOKED - Do not use
  - **Action**: Generated new secret for all environments

- **GEMINI_API_KEY**: `AIzaSyAJMqJy6WejEwQ3JgHx1hv9FQxdfoAe3FU`
  - **Status**: REVOKED - Do not use  
  - **Action**: Key disabled in Google Cloud Console, new key generated

**These secrets should never be used again.** If you find them in any configuration, replace them immediately.

## Security Measures Implemented

### 1. Git Configuration
- `.gitignore` configured to exclude `.env` files and secrets
- Pre-commit hooks recommended (see Development Setup)

### 2. CI/CD Pipeline
- Secret scanning in GitHub Actions
- Dependency vulnerability scanning
- CodeQL analysis for security issues
- npm audit checks

### 3. Application Security
- JWT authentication with secure token handling
- Password hashing with bcrypt (10+ rounds)
- Input validation with class-validator
- SQL injection prevention via TypeORM parameterized queries
- CORS configuration
- Rate limiting (recommended for production)

### 4. Dependencies
- Regular dependency updates
- Automated vulnerability scanning
- No packages with known critical vulnerabilities

## Development Setup

### Recommended: Pre-commit Hook for Secret Detection

Install and configure git-secrets or similar tools:

```bash
# Using git-secrets
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
make install

# Configure for your repo
cd /path/to/Droid
git secrets --install
git secrets --register-aws
git secrets --add 'AIza[0-9A-Za-z\\-_]{35}'  # Google API keys
git secrets --add '[A-Za-z0-9+/]{64,}={0,2}'  # Base64 secrets
```

### Environment Setup Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Generate new secrets (don't reuse examples)
- [ ] Never commit `.env` file
- [ ] Use different secrets for each environment
- [ ] Document which secrets are required in your deployment

## Production Deployment

### Security Checklist

- [ ] All secrets are stored in a secure secret management system
- [ ] `NODE_ENV=production` is set
- [ ] Database uses strong passwords and SSL connections
- [ ] Redis requires authentication
- [ ] CORS is properly configured (not `*` in production)
- [ ] Rate limiting is enabled
- [ ] All dependencies are up to date
- [ ] Security headers are configured
- [ ] Logs don't contain sensitive data
- [ ] API endpoints use proper authentication
- [ ] File upload validation is in place (if applicable)

## Compliance

This project follows security best practices including:

- OWASP Top 10 protection
- Secure coding guidelines
- Regular security updates
- Dependency vulnerability monitoring

## Contact

For security concerns, contact the maintainers directly:
- GitHub: [@dronreef2](https://github.com/dronreef2)

---

**Last Updated**: 2025-11-16  
**Version**: 1.0
