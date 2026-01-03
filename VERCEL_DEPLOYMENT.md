# Vercel Deployment Guide - NFC Platform

## 🚀 Deployment Adımları

### 1️⃣ Vercel Postgres Veritabanı Oluşturma

1. [Vercel Dashboard](https://vercel.com/dashboard)'a git
2. **Storage** sekmesine tıkla
3. **Create Database** → **Postgres** seç
4. Database bilgilerini gir:
   - **Name:** `nfc-platform-db`
   - **Region:** Europe (Frankfurt) veya size yakın bölge seçin
5. **Create** butonuna tıkla

### 2️⃣ Projeyi Vercel'e Bağlama

#### GitHub üzerinden (Önerilen)

1. [Vercel Dashboard](https://vercel.com/new) → **Add New Project**
2. GitHub repository'nizi seçin: `beyytullah1/nfc-platform`
3. **Import** butonuna tıkla

#### Configure Project

- **Framework Preset:** Next.js (otomatik tespit edilecek)
- **Root Directory:** `./` (varsayılan)
- **Build Command:** `prisma generate && next build` (otomatik ayarlanmış)
- **Output Directory:** `.next` (varsayılan)

### 3️⃣ Environment Variables Ekleme

Vercel project ayarlarında **Environment Variables** bölümüne şu değişkenleri ekleyin:

#### DATABASE_URL
```
[Vercel Postgres connection string - otomatik eklenecek]
```
> ℹ️ Vercel Postgres oluşturduğunuzda bu otomatik olarak projenize eklenir.

#### NEXTAUTH_SECRET
```bash
# Terminalinizde bu komutu çalıştırın:
openssl rand -base64 32
```
Çıkan değeri kopyalayıp Vercel'e ekleyin.

#### NEXTAUTH_URL
```
https://your-project-name.vercel.app
```
> ⚠️ Deployment sonrası Vercel size bir URL verecek, onu buraya girin.

### 4️⃣ Database Migration

Deployment başarılı olduktan sonra, veritabanı tablolarını oluşturmalısınız:

1. Vercel Dashboard → Your Project → **Settings** → **General**
2. En altta **Vercel CLI** ile bağlanma talimatları var
3. Terminalinizde:

```bash
# Vercel CLI kurulumu (ilk kez kullanıyorsanız)
npm i -g vercel

# Vercel'e login
vercel login

# Projeye link
vercel link

# Migration çalıştırma
vercel env pull .env.production
prisma migrate deploy
```

**VEYA** Vercel Dashboard'dan:

1. Your Project → **Deployments** → En son deployment
2. Sağ üstte **...** → **View Function Logs**
3. **Edge Functions** dropdown'dan terminaliniz benzeri bir interface bulabilirsiniz (bazı planlarda)

**EN KOLAY YOL:**
Migration'ı bir API route ile yapabilirsiniz (sadece ilk deploy için):

`app/api/setup-db/route.ts` oluşturun:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test connection
    await prisma.$connect()
    return Response.json({ message: 'Database connected!' })
  } catch (error) {
    return Response.json({ error: 'Database connection failed', details: error }, { status: 500 })
  }
}
```

Deploy olduktan sonra `https://your-app.vercel.app/api/setup-db` adresine gidin.

### 5️⃣ Production Migration (Manuel)

Eğer Vercel CLI kullanıyorsanız, lokal migration dosyalarını production'a uygulayın:

```bash
# Migration dosyalarını oluştur (local'de)
npx prisma migrate dev --name init

# Production'a deploy et
DATABASE_URL="vercel-postgres-url" npx prisma migrate deploy
```

### 6️⃣ Test

Deployment tamamlandıktan sonra:

1. ✅ Production URL'ini açın
2. ✅ Kayıt/Giriş yapın  
3. ✅ NFC tag claim edin
4. ✅ Dashboard'u kontrol edin
5. ✅ Tüm modülleri test edin

## 🔧 Troubleshooting

### "Prisma Client bulunamadı" hatası
**Çözüm:** `postinstall` script'inde `prisma generate` var mı kontrol edin.

### "DATABASE_URL bulunamadı" hatası  
**Çözüm:** Vercel Dashboard → Project Settings → Environment Variables bölümünden `DATABASE_URL` eklenmiş mi kontrol edin.

### "NEXTAUTH_SECRET bulunamadı" hatası
**Çözüm:** Environment variables'a `NEXTAUTH_SECRET` ekleyin.

### Build başarısız oluyor
**Çözüm:** Build logs kontrol edin:
- Vercel Dashboard → Deployments → Failed Deployment → View Build Logs

### Database connection timeout
**Çözüm:** 
- Vercel Postgres region'ının Vercel project region'ı ile aynı olduğundan emin olun
- Connection string doğru mu kontrol edin

## 📝 Sonraki Adımlar

✅ Custom domain ekle (Vercel Dashboard → Domains)  
✅ Production environment variables'ı kontrol et  
✅ SSL otomatik aktif (Vercel tarafından)  
✅ Analytics aktif et (Vercel Analytics)  

## 🔗 Faydalı Linkler

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
