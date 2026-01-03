# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| 1.1.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in NFC Platform, please report it by emailing **security@nfcplatform.com** (or create a private security advisory on GitHub).

**Please do not report security vulnerabilities through public GitHub issues.**

### What to include

- Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
- Full paths of source file(s) related to the manifestation of the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue

### Response Timeline

- **24 hours**: Initial response acknowledging receipt
- **72 hours**: Assessment of vulnerability
- **7 days**: Fix development and testing
- **14 days**: Public disclosure (after fix is deployed)

## Security Measures

### Authentication
- ✅ NextAuth v5 with secure session management
- ✅ HTTPOnly cookies for session tokens
- ✅ CSRF protection built-in
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Secure password reset flow

### Database
- ✅ Prisma ORM (SQL injection protection)
- ✅ Parameterized queries only
- ✅ Connection pooling
- ✅ Environment-based credentials
- ⚠️ Row Level Security (TODO)

### API Security
- ✅ Input validation (client + server)
- ✅ Type safety with TypeScript
- ✅ Authentication checks on all protected routes
- ⚠️ Rate limiting (TODO)
- ⚠️ API key rotation (TODO)

### Privacy & Data Protection
- ✅ 3-tier privacy system for user data
- ✅ Encrypted sensitive fields (bcrypt)
- ✅ User-controlled data visibility
- ✅ GDPR-compliant data handling
- ✅ Secure cookie settings (httpOnly, secure, sameSite)

### Frontend Security
- ✅ Content Security Policy headers (TODO: enhance)
- ✅ XSS protection (React automatic escaping)
- ✅ Secure external links (rel="noopener noreferrer")
- ✅ Input sanitization
- ⚠️ Subresource Integrity (TODO)

## Known Security Considerations

### Current State
1. **Rate Limiting**: Not implemented - Add for production
2. **Email Verification**: Not enforced - Optional enhancement
3. **2FA**: Not available - Could be added
4. **Audit Logging**: Basic - Could be enhanced
5. **Session Timeout**: Uses NextAuth defaults

### Recommendations for Production

1. **Add Rate Limiting**
```typescript
// Example with next-rate-limit
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

2. **Enable Database SSL**
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

3. **Add Security Headers**
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

4. **Environment Secrets**
- Never commit .env files
- Use different secrets for dev/staging/prod
- Rotate secrets regularly
- Use secret management service (AWS Secrets Manager, etc.)

## Security Checklist for Deployment

- [ ] All environment variables set correctly
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database uses SSL connection
- [ ] HTTPS enabled (not HTTP)
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Dependencies updated (npm audit)
- [ ] Sensitive data not in logs
- [ ] Backup strategy in place
- [ ] Monitoring and alerts set up

## Dependency Security

### Regular Updates
```bash
# Check for vulnerabilities
npm audit

# Fix automatically fixable issues
npm audit fix

# Update to latest secure versions
npm update
```

### Lock File
- Always commit `package-lock.json`
- Review changes to dependencies
- Test after updates

## Contact

For security concerns, contact:
- **Email**: security@nfcplatform.com
- **GitHub**: Create a private security advisory

## Acknowledgments

We appreciate responsible disclosure. Contributors who report valid security issues will be acknowledged (with permission) in our security hall of fame.
