# 🏷️ NFC Platform

Fiziksel nesnelerinizi dijital deneyimlere dönüştürün! NFC etiketleriyle kartvizitler, bitkiler, kupalar ve daha fazlasını akıllı, etkileşimli profillere çevirin.

## ✨ Özellikler

### 🎯 Ana Modüller
- **💳 Akıllı Kartvizit** - Dijital kartvizitler, kademeli gizlilik seviyeleri
- **🌱 Akıllı Saksı** - Bitki bakım takibi, sulama logları, AI asistan
- **☕ Akıllı Kupa** - İçecek logları, alışkanlık takibi
- **🎁 Hediye Modu** - Sürpriz mesajlar, müzik ve videolar
- **✨ Serbest Canvas** - Tamamen özelleştirilebilir sayfalar

### 🔐 Güvenlik & Gizlilik
- **3 Seviye Gizlilik Sistemi**
  - Seviye 0: Herkese açık
  - Seviye 1: Şifreli (tier 1)
  - Seviye 2: Gelişmiş şifreli (tier 1+2)
- **Şifreli Alanlar** - Bcrypt hash ile güvenli saklama
- **Session Yönetimi** - NextAuth v5 ile güvenli authentication

### 🎨 Yeni Özellikler
- **🔗 Slug-based URLs** - Temiz, okunabilir URL'ler (`/c/username`)
- **🎯 NFC Onboarding** - Otomatik tag claim sistemi
- **👥 İletişim Ağı** - Gruplar, etiketler, notlar ile kişi yönetimi
- **📱 Responsive Design** - Mobil ve desktop optimize

### 🚀 Kullanıcı Deneyimi
- **Modal-based Workflows** - Akıcı, kesintisiz kullanım
- **Loading States** - Tüm async işlemlerde görsel feedback
- **Error Handling** - Açıklayıcı, kullanıcı dostu hata mesajları
- **Hover Effects** - Modern, canlı arayüz
- **Profile Dropdown** - Kolay navigasyon ve çıkış

## 🛠️ Teknoloji Stack

- **Framework:** Next.js 14 (App Router)
- **Auth:** NextAuth v5
- **Database:** PostgreSQL + Prisma ORM
- **Styling:** CSS Modules + CSS Variables
- **State:** React Hooks + Context API
- **TypeScript:** Tip güvenli kod

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL
- npm veya yarn

### Adımlar

```bash
# Repository'yi klonlayın
git clone <repo-url>
cd deneme

# Bağımlılıkları yükleyin
npm install

# Environment variables ayarlayın
cp .env.example .env.local
# .env.local dosyasını düzenleyin

# Database migration
npx prisma migrate dev

# Seed data (opsiyonel)
npx prisma db seed

# Development server
npm run dev
```

Tarayıcıda açın: `http://localhost:3000`

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nfc_platform"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth (Opsiyonel)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## 📱 NFC Tag Yönetimi

### Public Code Oluşturma
```bash
node generate-public-codes.js
```

### Tag Reset
```bash
node reset-tag.js <tagUid>
```

### Tag Güncelleme
```bash
node update-nfc-code.js <tagUid> <newPublicCode>
```

Detaylar için: [NFC_SCRIPTS_README.md](./NFC_SCRIPTS_README.md)

## 🎯 Kullanım Akışı

### 1. NFC Tag Okutma
```
Telefonu NFC tag'e yaklaştır
  ↓
/t/PUBLIC_CODE URL'sine yönlendir
  ↓
Tag sahipli mi? → Profil göster
Tag sahipsiz mi? → Claim/Login
```

### 2. İlk Kurulum
```
Register → Email/Şifre gir
  ↓
NFC varsa otomatik claim
  ↓
Kart oluştur → Bilgileri doldur
  ↓
NFC tag'i karta bağla
```

### 3. İletişim Ağı
```
Başkasının kartını aç
  ↓
"İletişim Ağına Ekle" tıkla
  ↓
Grup/Etiket/Not ekle
  ↓
Kaydedildi! Profile git butonu aktif
```

## 🏗️ Proje Yapısı

```
deneme/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication
│   │   ├── cards/        # Card operations
│   │   ├── connections/  # Network management
│   │   └── nfc/          # NFC operations
│   ├── components/       # Reusable components
│   │   ├── ThemeToggle.tsx
│   │   ├── ProfileDropdown.tsx
│   │   └── AddToNetworkButton.tsx
│   ├── context/          # React contexts
│   │   └── ThemeContext.tsx
│   ├── dashboard/        # Dashboard pages
│   ├── card/             # Public card view
│   └── claim/            # NFC claiming
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── db.ts             # Prisma client
│   └── actions/          # Server actions
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static files
```

## 🔒 Güvenlik Özellikleri

- ✅ **HTTPOnly Cookies** - XSS koruması
- ✅ **CSRF Protection** - NextAuth built-in
- ✅ **SQL Injection** - Prisma ORM koruması
- ✅ **Password Hashing** - Bcrypt (10 rounds)
- ✅ **Input Validation** - Client + Server side
- ✅ **Rate Limiting** - (TODO: API routes)

## 📈 Performans

- **Lighthouse Score:** 90+ (hedef)
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **CSS Variables:** Theme switching instant
- **Code Splitting:** Next.js automatic

## 🐛 Bilinen Sorunlar

- [ ] Browser subagent test issues (manuel test gerekli)
- [ ] Toast notification sistemi yok (şu an alert() kullanılıyor)

## 🚀 Gelecek Özellikler

- [ ] Progressive Web App (PWA)
- [ ] Push Notifications
- [ ] Analytics Dashboard
- [ ] QR Code Generator improvements
- [ ] Bulk NFC operations
- [ ] Export/Import data
- [ ] Custom themes
- [ ] Multilanguage support

## 📝 Changelog

### v1.2.0 (2026-01-03)
- ✨ ~~Light Mode eklendi~~ (Kaldırıldı - çalışmadı)
- ✨ NFC Onboarding akışı
- ✨ İletişim ağı modal + etiket sistemi
- ✨ Slug-based URL routing
- ✨ Profile dropdown navigation
- 🐛 CSS lint düzeltmeleri
- 🐛 Error handling improvements
- 🎨 Loading states eklendi
- 🎨 Hover effects iyileştirildi

### v1.1.0
- 🎯 NFC Tag sistemi
- 💳 Card modülü
- 🌱 Plant modülü
- ☕ Mug modülü
- 🔐 3-tier privacy

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request açın

## 📄 Lisans

MIT License - detaylar için LICENSE dosyasına bakın.

## 💡 Destek

Sorular için:
- 📧 Email: support@nfcplatform.com
- 📖 Docs: [NFC_SCRIPTS_README.md](./NFC_SCRIPTS_README.md)
- 🐛 Issues: GitHub Issues

---

**Made with ❤️ using Next.js**
