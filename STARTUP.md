# 🚀 NFC Platform - Başlatma Rehberi

Bu doküman, NFC Platform'u bensiz (yapay zeka olmadan) nasıl başlatabileceğinizi açıklar.

---

## 📋 Gereksinimler

- **Node.js**: v18 veya üzeri
- **npm**: Node ile birlikte gelir

---

## 🎯 Hızlı Başlangıç (İlk Kez)

Proje klasörüne gidin ve aşağıdaki komutları sırasıyla çalıştırın:

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Veritabanını oluştur/güncelle
npm run db:push

# 3. Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda açın: **http://localhost:3000**

---

## 🔄 Sonraki Başlatmalar

```bash
# Sadece bu komutu çalıştırın
npm run dev
```

---

## 📚 Kullanışlı Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusunu başlatır (http://localhost:3000) |
| `npm run build` | Üretim için derler |
| `npm run start` | Derlenmiş uygulamayı çalıştırır |
| `npm run db:push` | Veritabanı şemasını günceller |
| `npm run db:studio` | Prisma Studio (veritabanı yönetimi) açar |
| `npm run lint` | Kod kalitesini kontrol eder |

---

## ⚙️ .env Dosyası

Proje kök dizininde `.env` dosyası olmalıdır. İçeriği:

```env
# Veritabanı (zaten ayarlı)
DATABASE_URL="file:./prisma/dev.db"

# Auth Secret (NextAuth için)
AUTH_SECRET="sizin-gizli-anahtariniz"
```

---

## 🗂️ Proje Yapısı

```
deneme/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoint'leri
│   ├── dashboard/         # Dashboard sayfaları
│   ├── components/        # React bileşenleri
│   └── [modül]/           # Public sayfalar (card, plant, mug vb.)
├── lib/                   # Yardımcı fonksiyonlar
├── prisma/                # Veritabanı şeması
├── public/                # Statik dosyalar
└── dev.db                 # SQLite veritabanı
```

---

## 🆘 Sorun Giderme

### "Module not found" hatası
```bash
npm install
```

### "Prisma client not generated" hatası
```bash
npm run db:generate
```

### Veritabanı hataları
```bash
npm run db:push
```

### Port 3000 meşgul
```bash
# Windows'ta:
npx kill-port 3000
npm run dev
```

---

## 📱 Özellikler

- 💳 **Akıllı Kartvizit** - /dashboard/cards
- 🪴 **Akıllı Saksı** - /dashboard/plants
- ☕ **Akıllı Kupa** - /dashboard/mugs
- 🎁 **Hediye** - /dashboard/gifts
- ✏️ **Canvas** - /dashboard/canvas

---

Hazırladı: NFC Platform AI Assistant
Tarih: 2026-01-01
