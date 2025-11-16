# Security Best Practices Guide

## 🔐 Overview

This guide provides comprehensive security practices for the Droid AI Agents project. Following these practices is **mandatory** for all contributors and deployments.

## 📋 Table of Contents

1. [Environment Variables & Secrets Management](#environment-variables--secrets-management)
2. [API Key Security](#api-key-security)
3. [Database Security](#database-security)
4. [Authentication & Authorization](#authentication--authorization)
5. [Input Validation](#input-validation)
6. [Deployment Security](#deployment-security)
7. [Incident Response](#incident-response)

## 🔑 Environment Variables & Secrets Management

### Critical Rules

**NEVER:**
- ❌ Commit `.env` files to git
- ❌ Share secrets in issues, PRs, or comments
- ❌ Use default or example secrets in production
- ❌ Hardcode secrets in source code
- ❌ Log sensitive data
- ❌ Share secrets via email, Slack, or other insecure channels

**ALWAYS:**
- ✅ Use environment variables for all sensitive data
- ✅ Generate strong, random secrets
- ✅ Use different secrets per environment
- ✅ Rotate secrets regularly (at least quarterly)
- ✅ Store production secrets in secure vaults (AWS Secrets Manager, Azure Key Vault, etc.)
- ✅ Use principle of least privilege for secret access

### Generating Secure Secrets

```bash
# Session secret (64 bytes, base64 encoded)
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# JWT secret (32 bytes, hex encoded)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Alternative using OpenSSL
openssl rand -base64 64

# Alternative using /dev/urandom (Linux/Mac)
head -c 32 /dev/urandom | base64
```

### Environment Setup

```bash
# 1. Copy template
cp .env.example .env

# 2. Generate secrets
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "JWT_SECRET=$JWT_SECRET" >> .env

# 3. Verify .env is in .gitignore
git check-ignore .env
# Should output: .env

# 4. NEVER commit .env
git status --ignored
# Should show .env in ignored files
```

## 🔐 API Key Security

### Google Gemini API

**Pattern**: `AIza[0-9A-Za-z\-_]{35}`

**Security Measures:**
1. Restrict API key by IP address or referrer in Google Cloud Console
2. Enable API key restrictions (only Generative Language API)
3. Monitor usage for anomalies
4. Rotate keys every 90 days
5. Never expose in client-side code

### OpenAI API

**Security Measures:**
1. Use organization-scoped keys
2. Set usage limits in OpenAI dashboard
3. Monitor costs and usage
4. Implement rate limiting in application
5. Use separate keys for dev/prod

### Anthropic API

**Security Measures:**
1. Use workspace-level keys
2. Monitor usage through console
3. Implement request logging
4. Set up billing alerts

## 🗄️ Database Security

### PostgreSQL

```typescript
// ✅ GOOD: Parameterized queries (TypeORM does this automatically)
await userRepository.findOne({ 
  where: { email: userInput } 
});

// ❌ BAD: String concatenation (SQL injection risk)
await entityManager.query(
  `SELECT * FROM users WHERE email = '${userInput}'`
);
```

**Best Practices:**
- Use TypeORM parameterized queries
- Enable SSL for production databases
- Use strong database passwords (20+ characters)
- Restrict database access by IP
- Regularly backup database
- Use read replicas for heavy queries
- Enable audit logging

### Redis

```env
# Development
REDIS_PASSWORD=

# Production - ALWAYS require password
REDIS_PASSWORD=your-strong-redis-password
```

**Best Practices:**
- Always use password authentication in production
- Bind to localhost or private network only
- Use SSL/TLS for remote connections
- Enable persistence for critical data
- Monitor for unusual access patterns

## 🔒 Authentication & Authorization

### JWT Security

```typescript
// Good JWT configuration
{
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: '7d',
    issuer: 'droid-ai-agents',
    audience: 'api-users'
  }
}
```

**Best Practices:**
- Use strong, random JWT secrets (32+ bytes)
- Set reasonable expiration times
- Include issuer and audience claims
- Validate tokens on every request
- Implement token refresh mechanism
- Use HTTPS only for token transmission
- Implement token revocation for logout

### Password Security

```typescript
// ✅ GOOD: bcrypt with high cost factor
import * as bcrypt from 'bcrypt';

const saltRounds = 12; // Adjust based on performance
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verification
const isValid = await bcrypt.compare(password, hashedPassword);
```

**Password Requirements:**
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, symbols
- Not in common password lists
- Use bcrypt with 10+ rounds
- Never store plaintext passwords
- Never log passwords

## ✅ Input Validation

### Using class-validator

```typescript
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;
}
```

**Validation Rules:**
- Validate all user input
- Use whitelist approach (allow known good)
- Sanitize input before processing
- Validate data types, lengths, formats
- Use DTOs with class-validator
- Implement global validation pipe
- Return generic error messages (don't leak internal details)

### XSS Prevention

```typescript
// Auto-sanitization in NestJS with class-transformer
import { Transform } from 'class-transformer';
import * as sanitizeHtml from 'sanitize-html';

export class CreatePostDto {
  @Transform(({ value }) => sanitizeHtml(value))
  @IsString()
  content: string;
}
```

## 🚀 Deployment Security

### Production Checklist

- [ ] `NODE_ENV=production` is set
- [ ] All secrets use production values (not examples)
- [ ] Secrets stored in secure vault
- [ ] Database uses SSL connections
- [ ] Database password is strong (20+ characters)
- [ ] Redis requires authentication
- [ ] CORS configured (not `*`)
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] API keys have usage limits
- [ ] Monitoring and alerting configured
- [ ] Logs don't contain sensitive data
- [ ] Dependencies are up to date
- [ ] Security patches applied

### Environment-Specific Secrets

```bash
# Development
JWT_SECRET=dev_secret_change_me_12345678
DB_PASSWORD=dev_password

# Staging
JWT_SECRET=staging_secret_generated_randomly
DB_PASSWORD=strong_staging_password_20chars

# Production
JWT_SECRET=prod_secret_from_vault_32bytes
DB_PASSWORD=very_strong_production_password_40chars
```

### CORS Configuration

```typescript
// ❌ BAD: Allow all origins
app.enableCors({
  origin: '*'
});

// ✅ GOOD: Specific origins
app.enableCors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
  ],
  credentials: true
});
```

### Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 🚨 Incident Response

### If a Secret is Exposed

**Immediate Actions (within 1 hour):**

1. **Identify the scope**
   - Which secret was exposed?
   - Where was it exposed (git, logs, issue, PR)?
   - For how long was it exposed?
   - Who had access?

2. **Rotate the secret immediately**
   ```bash
   # Generate new secret
   NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   
   # Update in all environments
   # - Update .env files
   # - Update secret vault
   # - Restart services
   ```

3. **Revoke the old secret**
   - For API keys: Disable/delete in provider console
   - For database passwords: Change password
   - For JWT secrets: Invalidate all existing tokens

4. **Clean git history if committed**
   ```bash
   # If secret was committed to git
   # Option 1: Use BFG Repo-Cleaner
   bfg --replace-text passwords.txt
   
   # Option 2: Use git filter-branch (more complex)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (dangerous - coordinate with team)
   git push origin --force --all
   ```

5. **Monitor for abuse**
   - Check API usage logs
   - Review database access logs
   - Check for unauthorized access
   - Monitor billing/usage

6. **Document the incident**
   - What happened?
   - How was it discovered?
   - What was the impact?
   - What actions were taken?
   - How to prevent recurrence?

### Known Exposed Secrets

The following secrets were exposed in a development environment issue description on 2025-11-16:

#### SESSION_SECRET
```
Value: jYbS0m7xBY/5hJUtSUGrjoL2ofd/dyBcSbigi6qtAI16XG86O9s9LcBHrZchgZJSaFLPbw9mk/QGfbfCZb8NKA==
Status: ❌ COMPROMISED - DO NOT USE
Action Taken: Documented as compromised, new secrets generated
Environment: Replit development (not production)
```

#### GEMINI_API_KEY
```
Value: AIzaSyAJMqJy6WejEwQ3JgHx1hv9FQxdfoAe3FU
Status: ❌ COMPROMISED - DO NOT USE
Action Taken: Key should be revoked in Google Cloud Console
Recommended: Generate new API key with IP/referrer restrictions
Environment: Replit development (not production)
```

**If you have access to these systems:**
1. Revoke these keys immediately
2. Generate new keys
3. Verify no unauthorized usage occurred
4. Enable additional restrictions on new keys

## 🛡️ Continuous Security

### Regular Tasks

**Weekly:**
- Review access logs for anomalies
- Check for new dependency vulnerabilities
- Monitor API usage

**Monthly:**
- Update dependencies
- Review and test backup restoration
- Audit user access levels

**Quarterly:**
- Rotate all secrets
- Security audit
- Penetration testing
- Review and update security policies

### Automated Security

Our CI/CD pipeline includes:
- Secret scanning (TruffleHog, Gitleaks)
- Dependency vulnerability scanning
- CodeQL security analysis
- npm audit checks
- Automated pattern matching

### Tools & Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

## 📞 Contact

For security concerns or to report vulnerabilities:
- GitHub Security Advisory: Use private security advisories
- Direct contact: See SECURITY.md

---

**Remember: Security is everyone's responsibility!**

*Last Updated: 2025-11-16*
