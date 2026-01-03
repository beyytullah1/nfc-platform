# NFC Platform - Environment Variables

## Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nfc_platform"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Google OAuth (Optional but recommended)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Base URL for NFC redirects
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## How to Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy Client ID and Client Secret to .env.local

## Database Setup

### PostgreSQL Installation

**Windows:**
```bash
# Download from postgresql.org
# Or use Chocolatey
choco install postgresql
```

**Mac:**
```bash
brew install postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql
```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nfc_platform;

# Create user (optional)
CREATE USER nfc_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE nfc_platform TO nfc_user;
```

## Environment Files

### .env.local (Development)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/nfc_platform"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generated-secret-here"
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### .env.production (Production)
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="different-secret-for-production"
GOOGLE_CLIENT_ID="production-client-id"
GOOGLE_CLIENT_SECRET="production-client-secret"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
```

## Security Best Practices

1. **Never commit .env files to git**
   - Already in .gitignore
   - Use different secrets for dev/prod

2. **Rotate secrets regularly**
   - Change NEXTAUTH_SECRET periodically
   - Update OAuth credentials if compromised

3. **Use strong database passwords**
   - Minimum 16 characters
   - Mix of letters, numbers, symbols

4. **Production checklist**
   - [ ] Use HTTPS (not HTTP)
   - [ ] Different DATABASE_URL
   - [ ] Different NEXTAUTH_SECRET
   - [ ] Production OAuth credentials
   - [ ] Enable database SSL

## Troubleshooting

### "Invalid environment variable" error
- Check .env.local exists in project root
- Restart dev server after changing .env
- Verify no syntax errors in .env file

### Database connection failed
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Check database user has permissions
- Test connection: `psql -U postgres -d nfc_platform`

### OAuth not working
- Verify redirect URIs match exactly
- Check client ID/secret are correct
- Ensure Google+ API is enabled
- Clear browser cookies and try again

## Example .env.local Template

Copy this to `.env.local` and fill in your values:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/nfc_platform"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""  # Generate with: openssl rand -base64 32

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```
