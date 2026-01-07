# 📋 NFC Platform - Kod İnceleme Raporu

**Tarih:** 2026-01-06  
**Kapsam:** Kod Kalitesi, Güvenlik, Performans

---

## 1️⃣ KOD KALİTESİ ANALİZİ

### ✅ İyi Yanlar

#### 1.1 TypeScript Kullanımı
- ✅ Proje tamamen TypeScript ile yazılmış
- ✅ Type safety sağlanmış
- ✅ Prisma ORM tip güvenliği sağlıyor

#### 1.2 Kod Organizasyonu
- ✅ İyi bir klasör yapısı mevcut (`app/`, `lib/`, `prisma/`)
- ✅ Server actions ve API routes ayrılmış
- ✅ Component'ler modüler yapıda

#### 1.3 Error Handling
- ✅ Try-catch blokları kullanılmış
- ✅ API route'larda uygun HTTP status kodları döndürülüyor
- ✅ Kullanıcı dostu hata mesajları var

### ⚠️ İyileştirme Gereken Alanlar

#### 1.4 Aşırı Console.log Kullanımı
**Problem:**
- 286 adet `console.log/error/warn` kullanılmış
- Production'da log spam oluşturabilir
- Hassas bilgi sızıntısı riski

**Örnekler:**
```typescript
// app/api/connections/route.ts:164
console.error('Connection error:', error)

// app/dashboard/connections/page.tsx:63-66
console.log('=== DEBUG CONNECTIONS ===')
console.log('User ID:', session.user.id)
console.log('User Email:', session.user.email)
```

**Öneri:**
```typescript
// lib/logger.ts oluştur
export const logger = {
  error: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV === 'production') {
      // Production logging service (Sentry, LogRocket, etc.)
    } else {
      console.error(message, error)
    }
  },
  // ...
}
```

#### 1.5 Any Type Kullanımı
**Problem:**
- 29 adet `any` type kullanılmış
- Type safety kaybı

**Örnekler:**
```typescript
// lib/card-actions.ts:87
interface FieldData { type: string; value: string; label?: string; privacyLevel: number }

// app/api/connections/route.ts:93
senderUsername: (session.user as any).username
```

**Öneri:**
```typescript
// lib/types.ts'de proper type tanımla
interface SessionUser {
  id: string
  name: string | null
  email: string | null
  username?: string
  bio?: string
}
```

#### 1.6 Kod Tekrarı (DRY Violations)
**Problem:**
- Benzer query'ler tekrarlanıyor
- Authentication kontrolü her yerde tekrar yazılmış

**Örnekler:**
```typescript
// Her API route'ta aynı pattern:
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 })
}
```

**Öneri:**
```typescript
// lib/auth-middleware.ts
export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new UnauthorizedError()
  }
  return session
}
```

#### 1.7 Magic Numbers/Strings
**Problem:**
- Hardcoded değerler var
- Bakım zorluğu

**Örnekler:**
```typescript
// app/api/upload/route.ts:21
if (file.size > 5 * 1024 * 1024) // 5MB

// lib/card-actions.ts:42
theme: JSON.stringify({ color: "#3b82f6", style: "modern" })
```

**Öneri:**
```typescript
// lib/constants.ts
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", ...]
} as const
```

#### 1.8 Eksik Input Validation
**Problem:**
- Bazı API route'larda yeterli validation yok
- Zod/Joi gibi validation library kullanılmamış

**Örnek:**
```typescript
// app/api/claim/route.ts:9
const { code, moduleType, name } = body
// Sadece null check var, format validation yok
```

**Öneri:**
```typescript
import { z } from 'zod'

const claimSchema = z.object({
  code: z.string().min(3).max(50),
  moduleType: z.enum(['card', 'plant', 'mug', 'gift', 'canvas']),
  name: z.string().min(1).max(100)
})
```

---

## 2️⃣ GÜVENLİK ANALİZİ

### ✅ İyi Yanlar

#### 2.1 SQL Injection Koruması
- ✅ Prisma ORM kullanılıyor (parametrized queries)
- ✅ SQL injection riski yok

#### 2.2 XSS Koruması
- ✅ React otomatik escaping yapıyor
- ✅ Kullanıcı girişleri doğrudan render edilmiyor

#### 2.3 Authentication & Authorization
- ✅ NextAuth v5 kullanılıyor
- ✅ JWT session yönetimi
- ✅ Password hashing (bcrypt)
- ✅ Authorization kontrolleri mevcut

#### 2.4 CSRF Koruması
- ✅ NextAuth built-in CSRF protection
- ✅ SameSite cookie ayarları

### 🔴 Kritik Güvenlik Sorunları

#### 2.5 Environment Variable Validation Eksik
**Problem:**
```typescript
// lib/auth.ts:9
secret: process.env.AUTH_SECRET || "nfcplatform_super_secret_key_2024_xyz123"
```
- Hardcoded fallback secret VAR!
- Environment variable validation yok
- Production'da yanlış yapılandırma riski

**Çözüm:**
```typescript
// lib/env.ts'e ekle
function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const AUTH_SECRET = requireEnv('AUTH_SECRET')
```

#### 2.6 Rate Limiting Yok
**Problem:**
- API route'larda rate limiting yok
- Brute force saldırılarına açık
- DDoS riski

**Öneri:**
```typescript
// middleware.ts veya API route'larda
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})
```

#### 2.7 File Upload Güvenliği Eksik
**Problem:**
```typescript
// app/api/upload/route.ts
// Sadece MIME type kontrolü var, dosya içeriği kontrol edilmiyor
// Path traversal riski düşük ama yine de var
```

**Öneri:**
```typescript
import fileType from 'file-type'

// Dosya içeriği kontrolü
const detectedType = await fileType.fromBuffer(buffer)
if (!allowedTypes.includes(detectedType?.mime)) {
  throw new Error('Invalid file type')
}

// Dosya adı sanitize et
const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
```

#### 2.8 Password Storage
**Problem:**
- Level 1/2 password'ler plain text olarak saklanıyor olabilir
- Bcrypt hash kontrolü gerekiyor

**Kontrol Gerekli:**
```typescript
// lib/card-actions.ts:122
level1Password: formData.get("level1Password") as string || null,
// Bu şifreler hash'lenmiyor gibi görünüyor!
```

#### 2.9 Session Security
**Problem:**
- Session timeout ayarları yok (NextAuth default kullanılıyor)
- Refresh token mekanizması belirsiz

#### 2.10 Missing Security Headers
**Problem:**
- `next.config.ts` boş
- Security headers eklenmemiş (CSP, HSTS, X-Frame-Options, vb.)

**Öneri:**
```typescript
// next.config.ts
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
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ..."
  }
]
```

#### 2.11 Input Sanitization Eksik
**Problem:**
- User input'ları sanitize edilmiyor
- SQL injection riski yok ama XSS riski var (React escape ediyor ama ekstra güvenlik için)

**Öneri:**
```typescript
import DOMPurify from 'isomorphic-dompurify'

const sanitized = DOMPurify.sanitize(userInput)
```

---

## 3️⃣ PERFORMANS ANALİZİ

### ✅ İyi Yanlar

#### 3.1 Parallel Queries
```typescript
// app/dashboard/page.tsx:15
const [cardCount, plantCount, mugCount, ...] = await Promise.all([...])
```
- ✅ Parallel query execution kullanılmış

#### 3.2 Select Optimization
```typescript
// app/api/user/[username]/route.ts:24
select: {
  id: true,
  name: true,
  // Sadece gerekli field'lar seçiliyor
}
```
- ✅ Gereksiz field'lar select edilmiyor

### 🔴 Performans Sorunları

#### 3.3 N+1 Query Problems
**Problem:**
```typescript
// app/u/[username]/page.tsx:34-59
// 4 ayrı query sıralı çalışıyor (parallel değil)
const cards = await prisma.card.findMany({...})
const plants = await prisma.plant.findMany({...})
const mugs = await prisma.mug.findMany({...})
const gifts = await prisma.gift.findMany({...})
```

**Çözüm:**
```typescript
const [cards, plants, mugs, gifts] = await Promise.all([
  prisma.card.findMany({...}),
  prisma.plant.findMany({...}),
  prisma.mug.findMany({...}),
  prisma.gift.findMany({...})
])
```

**Başka Örnekler:**
```typescript
// app/mug/[id]/page.tsx:26-28
// 3 ayrı count query
const coffeeCount = await prisma.mugLog.count({...})
const teaCount = await prisma.mugLog.count({...})
const waterCount = await prisma.mugLog.count({...})
```

**Çözüm:**
```typescript
const [coffeeCount, teaCount, waterCount] = await Promise.all([
  prisma.mugLog.count({ where: { mugId: id, logType: "coffee" } }),
  prisma.mugLog.count({ where: { mugId: id, logType: "tea" } }),
  prisma.mugLog.count({ where: { mugId: id, logType: "water" } })
])
```

#### 3.4 Gereksiz Include'lar
**Problem:**
```typescript
// app/dashboard/connections/page.tsx:48-58
include: {
  tag: {
    include: {
      plant: true,
      mug: true,
      page: true,
      card: true  // Bu çok fazla nested data çekiyor
    }
  }
}
```

**Öneri:**
```typescript
// Sadece ihtiyaç duyulan field'ları select et
tag: {
  select: {
    id: true,
    publicCode: true,
    moduleType: true  // İhtiyaç duyulanlar
  }
}
```

#### 3.5 Caching Yok
**Problem:**
- Database query'leri cache'lenmiyor
- Aynı data tekrar tekrar çekiliyor
- React Cache API kullanılmamış

**Öneri:**
```typescript
import { unstable_cache } from 'next/cache'

const getCachedCards = unstable_cache(
  async (userId: string) => {
    return prisma.card.findMany({ where: { userId } })
  },
  ['user-cards'],
  { revalidate: 60 } // 60 saniye cache
)
```

#### 3.6 Image Optimization Eksik
**Problem:**
- Next.js Image component kullanılmamış (muhtemelen)
- Lazy loading yok
- Responsive images yok

**Öneri:**
```typescript
import Image from 'next/image'

<Image
  src={avatarUrl}
  alt={name}
  width={200}
  height={200}
  loading="lazy"
  placeholder="blur"
/>
```

#### 3.7 Database Indexing
**Problem:**
- Prisma schema'da index'ler kontrol edilmeli
- Yaygın query'ler için index eksik olabilir

**Öneri:**
```prisma
model Card {
  // ...
  slug String? @unique  // ✅ Unique index var
  userId String
  
  @@index([userId])  // Eklenmeli
  @@index([slug])    // Slug sorguları için
}
```

#### 3.8 Pagination Yok
**Problem:**
```typescript
// app/api/user/[username]/route.ts:45
// Tüm kartlar çekiliyor, limit yok
const cards = await prisma.card.findMany({...})
```

**Öneri:**
```typescript
const cards = await prisma.card.findMany({
  where: {...},
  take: 20,  // Limit ekle
  skip: page * 20,  // Pagination
  orderBy: { createdAt: 'desc' }
})
```

#### 3.9 Bundle Size
**Problem:**
- Import optimization kontrol edilmeli
- Unused dependencies olabilir

**Kontrol:**
```bash
npm run build
# Bundle analyzer kullan
npx @next/bundle-analyzer
```

---

## 📊 ÖZET SKORLAR

### Kod Kalitesi: 6.5/10
- ✅ TypeScript kullanımı iyi
- ⚠️ Çok fazla console.log
- ⚠️ Any type kullanımı
- ⚠️ Kod tekrarı var

### Güvenlik: 5/10
- ✅ Prisma ORM (SQL injection koruması)
- ✅ NextAuth (authentication)
- 🔴 Environment variable validation yok
- 🔴 Rate limiting yok
- 🔴 Security headers eksik
- 🔴 File upload güvenliği yetersiz

### Performans: 6/10
- ✅ Bazı parallel queries var
- ✅ Select optimization iyi
- 🔴 N+1 query problemleri var
- 🔴 Caching yok
- 🔴 Pagination yok

**GENEL SKOR: 5.8/10** 🟡

---

## 🎯 ÖNCELİKLİ AKSİYONLAR

### 🔴 Kritik (Hemen)
1. **Environment variable validation ekle** (Hardcoded secret kaldır)
2. **Rate limiting ekle** (API route'lara)
3. **Security headers ekle** (next.config.ts)
4. **File upload güvenliği artır** (Content check)

### 🟠 Yüksek Öncelik (1-2 Hafta)
5. **N+1 query problemlerini çöz** (Promise.all kullan)
6. **Caching mekanizması ekle** (React Cache API)
7. **Input validation library ekle** (Zod/Joi)
8. **Console.log'ları temizle** (Logger utility)

### 🟡 Orta Öncelik (1 Ay)
9. **Pagination ekle** (List query'lerine)
10. **Any type'ları düzelt** (Proper types)
11. **Image optimization** (Next.js Image component)
12. **Database index'leri optimize et**

---

## 📝 ÖNERİLER

### 1. Code Quality Tools
```bash
# ESLint rules sıkılaştır
# Prettier ekle
# Husky + lint-staged (pre-commit hooks)
```

### 2. Testing
- Unit tests ekle (Jest/Vitest)
- Integration tests (API routes)
- E2E tests (Playwright)

### 3. Monitoring
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- Database query monitoring

### 4. Documentation
- API documentation (Swagger/OpenAPI)
- Code comments (JSDoc)
- Architecture decision records (ADRs)

---

**Rapor Sonu** - Detaylı inceleme için lütfen her bölümü tek tek ele alın.
