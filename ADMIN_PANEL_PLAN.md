# 🎛️ Admin Panel Geliştirme Planı
**Tarih:** 8 Ocak 2026  
**Hedef:** NFC Platform için kapsamlı yönetim paneli

---

## 📋 Genel Bakış
Bu admin panel, platform yöneticilerinin tüm sistemi tek bir yerden yönetmesini sağlar. Kullanıcı yönetimi, içerik moderasyonu, istatistikler ve güvenlik kontrolleri içerir.

---

## 🎯 Ana Özellikler

### 1. 📊 Admin Dashboard (Ana Sayfa)
Sistem genelinde özet istatistikler:

**Kullanıcı İstatistikleri:**
- Toplam kullanıcı sayısı
- Bu ay yeni kayıtlar
- Aktif kullanıcılar (Son 7 gün)
- Pasif kullanıcılar (90+ gün)

**Modül İstatistikleri:**
- Toplam Kartvizit sayısı (Tiplerine göre dağılım)
- Toplam Bitki sayısı
- Toplam Kupa sayısı  
- Toplam Hediye sayısı
- Toplam Sayfa (Canvas) sayısı

**NFC İstatistikleri:**
- Toplam NFC etiketi
- Aktif etiketler (Bağlı)
- Pasif etiketler (Henüz bağlanmamış)
- Etiket kullanım oranı

**En Son Aktiviteler:**
- Son 10 kayıt olan kullanıcı
- Son 10 oluşturulan kartvizit
- Son 10 hediye

---

### 2. 👥 Kullanıcı Yönetimi

**Tablo Görünümü:**
- Kullanıcı ID
- İsim
- Email
- Kullanıcı adı (@username)
- Kayıt tarihi
- Son giriş tarihi
- Rol (User / Admin)
- Durum (Aktif / Pasif / Askıya Alınmış)

**Filtreler:**
- Rolüne göre (Admin / User)
- Duruma göre (Aktif / Pasif)
- Tarih aralığı (Kayıt tarihi)

**Detay Sayfası (Her Kullanıcı İçin):**
- Profil bilgileri (Avatar, Bio, İletişim)
- **Sahip Olduğu İçerikler:**
  - Kartvizitler (Sayı + Liste)
  - Bitkiler (Sayı + Liste)
  - Kupalar (Sayı + Liste)
  - Hediyeler (Sayı + Liste)
  - NFC Etiketleri (Sayı + Liste)
- **İstatistikler:**
  - Toplam bağlantı sayısı (Networking)
  - Toplam bildirim sayısı
  - Toplam transfer işlemi
- **Aksiyonlar:**
  - Kullanıcı bilgilerini düzenle
  - Şifre sıfırla (Yeni şifre oluştur ve göster)
  - Kullanıcıyı askıya al / aktifleştir
  - Kullanıcıyı sil (Onay ile)
  - Admin yetkisi ver / kaldır

---

### 3. 🏷️ NFC Etiketi Yönetimi

**Tablo Görünümü:**
- Etiket ID (`tagId`)
- Public Code (`/t/XXXX`)
- Sahip (User)
- Modül Tipi (Card / Plant / Mug / Gift)
- Durum (Claimed / Unclaimed)
- Oluşturulma Tarihi
- Bağlanma Tarihi

**Filtreler:**
- Modül Tipine göre
- Duruma göre (Bağlı / Bağlanmamış)
- Sahibine göre

**Aksiyonlar:**
- Etiket detaylarını görüntüle
- Etiketi farklı bir modüle yeniden bağla
- Etiket sahipliğini değiştir
- Etiketi sıfırla (Unclaimed yap)
- Etiketi sil

---

### 4. 💳 Kartvizit Yönetimi

**Tablo Görünümü:**
- Kart ID
- Başlık
- Sahip (User)
- Kart Tipi (Personal / Health / Child vb.)
- Alan Sayısı (Field Count)
- Görüntülenme Sayısı
- Oluşturulma Tarihi

**Aksiyonlar:**
- Kartı görüntüle (Public View)
- Kart detaylarını düzenle
- Kartı sil
- Kart istatistiklerini gör

---

### 5. 🌱 Bitki, ☕ Kupa, 🎁 Hediye Yönetimi

Her modül için benzer yapı:
- **Liste Görünümü:** İsim, Sahip, Oluşturulma Tarihi, Durum
- **Detay Görünümü:** Tam bilgiler + Log geçmişi
- **Aksiyonlar:** Görüntüle, Düzenle, Sil

---

### 6. 🔐 Güvenlik ve Loglar

**Admin Aktivite Logu:**
- Her admin aksiyonu kayıt altına alınır:
  - Kim (Admin kullanıcı)
  - Ne zaman
  - Ne yaptı (Kullanıcı sildi, Şifre sıfırladı vb.)
  - Hangi kullanıcı/nesne üzerinde

**Güvenlik Ayarları:**
- Admin kullanıcıları listele
- Yeni admin kullanıcı ekle
- Admin yetkisi kaldır

---

## 🛠️ Teknik Yapı

### Rota Yapısı
```
/admin
  ├── /dashboard         (Ana İstatistik Sayfası)
  ├── /users             (Kullanıcı Listesi)
  │   └── /[id]          (Kullanıcı Detay)
  ├── /nfc-tags          (NFC Etiket Listesi)
  ├── /cards             (Kartvizit Listesi)
  ├── /plants            (Bitki Listesi)
  ├── /mugs              (Kupa Listesi)
  ├── /gifts             (Hediye Listesi)
  ├── /logs              (Admin Aktivite Logları)
  └── /settings          (Admin Ayarları)
```

### Veritabanı Değişiklikleri

**1. User Modelinde `role` Alanı Ekle:**
```prisma
model User {
  // Mevcut alanlar...
  role String @default("user") // "user" veya "admin"
}
```

**2. AdminLog Modeli Ekle:**
```prisma
model AdminLog {
  id        String   @id @default(cuid())
  adminId   String   @map("admin_id")
  action    String   // "user_deleted", "password_reset" vb.
  targetType String?  @map("target_type") // "user", "card", "nfc_tag"
  targetId   String?  @map("target_id")
  details    String?  // JSON formatında ek bilgi
  createdAt DateTime @default(now()) @map("created_at")

  admin User @relation("AdminActions", fields: [adminId], references: [id])

  @@map("admin_logs")
}
```

### Auth ve Middleware Güncellemesi

**middleware.ts güncelleme:**
```typescript
// /admin/* rotalarını koru
if (pathname.startsWith('/admin')) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}
```

### UI Bileşenleri

**Gerekli Bileşenler:**
- `<AdminLayout>`: Yan menü ve header
- `<StatsCard>`: İstatistik kartı
- `<DataTable>`: Filtreleme ve pagination desteği olan tablo
- `<UserDetailPanel>`: Kullanıcı detay görünümü
- `<ActionButton>`: Onay modalı ile tehlikeli aksiyonlar

---

## 📝 Geliştirme Adımları (Step-by-Step)

### Faz 1: Temel Yapı (1-2 Gün)
1. **Veritabanı Güncellemesi:**
   - `User` modeline `role` alanı ekle
   - Migration çalıştır
   - Mevcut admin kullanıcıya (admin@nfc.com) `role: "admin"` ata

2. **Auth Güvenliği:**
   - `middleware.ts` dosyasını güncelle
   - `/admin` rotalarını koru

3. **Admin Layout:**
   - `app/admin/layout.tsx` oluştur
   - Sidebar menü ekle (Dashboard, Users, NFC Tags vb.)

### Faz 2: Dashboard ve İstatistikler (1 Gün)
4. **Admin Dashboard:**
   - `app/admin/dashboard/page.tsx` oluştur
   - Prisma ile istatistikleri çek:
     ```typescript
     const [userCount, cardCount, plantCount, ...] = await Promise.all([
       prisma.user.count(),
       prisma.card.count(),
       prisma.plant.count(),
       // ...
     ])
     ```
   - Stats Card bileşenleri ile göster

### Faz 3: Kullanıcı Yönetimi (2-3 Gün)
5. **Kullanıcı Listesi:**
   - `app/admin/users/page.tsx` oluştur
   - Arama, filtreleme ve pagination ekle
   - DataTable bileşeni ile listele

6. **Kullanıcı Detay Sayfası:**
   - `app/admin/users/[id]/page.tsx` oluştur
   - Kullanıcı bilgileri + sahip olduğu içerikleri göster

7. **Kullanıcı Aksiyonları:**
   - Server Actions:
     - `updateUser(userId, data)`
     - `resetPassword(userId)` → Yeni şifre oluştur ve döndür
     - `deleteUser(userId)` → Onay sonrası sil
     - `toggleUserRole(userId)` → Admin / User

### Faz 4: NFC ve Modül Yönetimleri (2 Gün)
8. **NFC Etiket Yönetimi:**
   - `app/admin/nfc-tags/page.tsx` oluştur
   - Filtreler ve aksiyonlar ekle

9. **Modül Yönetimleri:**
   - `/admin/cards`, `/admin/plants`, `/admin/mugs`, `/admin/gifts`
   - Her biri için liste ve detay sayfaları

### Faz 5: Log Sistemi (1 Gün)
10. **Admin Log Modeli:**
    - Schema'ya ekle ve migrate et

11. **Log Yakalama:**
    - Her Server Action'da log oluştur:
      ```typescript
      await prisma.adminLog.create({
        data: {
          adminId: session.user.id,
          action: 'user_deleted',
          targetType: 'user',
          targetId: userId,
        }
      })
      ```

12. **Log Görüntüleme:**
    - `app/admin/logs/page.tsx` ile log tablosu

---

## 🔒 Güvenlik Kontrol Listesi

- [ ] Middleware ile `/admin` rotaları korunuyor mu?
- [ ] Server Actions'da `session.user.role === 'admin'` kontrolü var mı?
- [ ] Hassas bilgiler (passwordHash) maskelenmiş mi?
- [ ] Şifre sıfırlama sonrası email gönderiliyor mu?
- [ ] Admin aksiyonları loglanıyor mu?
- [ ] CSRF koruması aktif mi? (Next.js varsayılan olarak koruyor)

---

## 🎨 UI/UX Önerileri

**Renkler:**
- Admin paneli için ayrı bir tema kullan (Dark Blue / Professional)
- Tehlikeli aksiyonlar için KIRMIZI (Sil, Askıya Al)
- Başarılı işlemler için YEŞİL

**Onay Modalları:**
- "Kullanıcıyı Sil" → "Bu kullanıcıyı ve tüm verilerini silmek üzeresiniz. Onaylıyor musunuz?"
- "Şifre Sıfırla" → "Yeni şifre oluşturulacak. Kullanıcıya bildirin."

**Responsive:**
- Admin paneli genelde masaüstünden kullanılır ama mobil responsive olmalı

---

## 📦 Kullanıma Hazır Kod Örnekleri

### 1. Middleware Güncellemesi
```typescript
// middleware.ts
import { auth } from "@/lib/auth"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Admin rotaları için auth kontrolü
  if (pathname.startsWith('/admin')) {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // ... mevcut kodlar
}
```

### 2. Şifre Sıfırlama Server Action
```typescript
// lib/admin-actions.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function resetUserPassword(userId: string) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  // Rastgele güçlü şifre oluştur
  const newPassword = generateRandomPassword(12)
  const passwordHash = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  })

  // Log kaydet
  await prisma.adminLog.create({
    data: {
      adminId: session.user.id,
      action: 'password_reset',
      targetType: 'user',
      targetId: userId
    }
  })

  return { newPassword } // Admin'e göster
}

function generateRandomPassword(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
```

---

## 🚀 Başlangıç Komutu (Cursor İçin)

Yarın şunu söyle:

> "Admin panel geliştirmeye başlıyoruz. `ADMIN_PANEL_PLAN.md` dosyasını oku ve **Faz 1**'den başlayarak adım adım uygula. İlk olarak `User` modeline `role` alanı ekle ve mevcut admin kullanıcıya admin yetkisi ver."

---

## ✅ Tamamlanma Kontrol Listesi

- [ ] Veritabanı güncellemeleri yapıldı
- [ ] Middleware koruması eklendi
- [ ] Admin Layout ve UI oluşturuldu
- [ ] Dashboard istatistikleri çalışıyor
- [ ] Kullanıcı yönetimi tamamlandı
- [ ] NFC etiket yönetimi eklendi
- [ ] Modül yönetimleri eklendi
- [ ] Log sistemi aktif
- [ ] Güvenlik kontrolleri yapıldı

---

**İyi Geceler!** 🌙  
Yarın bu plan ile harika bir admin paneli geliştirebilirsin.
