# 🔧 Veritabanı Bozulma Sorunu - Çözüm Kılavuzu

**Hata:** `database disk image is malformed`

Bu hata SQLite veritabanının bozulduğunu gösterir.

---

## 🚨 ACİL ÇÖZÜM (Veritabanını Yeniden Oluştur)

### 1. Yedek Alın (Önemli!)
```bash
# Windows PowerShell
Copy-Item prisma\dev.db prisma\dev.db.backup

# veya terminal
cp prisma/dev.db prisma/dev.db.backup
```

### 2. Bozuk Veritabanını Silin
```bash
# Windows PowerShell
Remove-Item prisma\dev.db

# veya terminal
rm prisma/dev.db
```

### 3. Veritabanını Yeniden Oluşturun
```bash
# Seçenek 1: Migration kullanarak (Önerilen)
npx prisma migrate dev

# Seçenek 2: Schema'yı push ederek
npx prisma db push
```

### 4. Seed Data Ekleyin (Opsiyonel)
```bash
npx prisma db seed
```

---

## 🔍 Veritabanı Kontrolü

`scripts/fix-database.js` scriptini çalıştırarak veritabanı durumunu kontrol edin:

```bash
node scripts/fix-database.js
```

Bu script:
- Veritabanı bağlantısını test eder
- Bozulma varsa yedek alır
- Bozuk dosyayı siler
- Yeniden oluşturma talimatları verir

---

## ✅ Yapılan Düzeltmeler

### 1. Auth.ts Güvenlik
- Veritabanı hatası olsa bile logout çalışır
- Try-catch blokları eklendi
- PrismaAdapter optional yapıldı

### 2. Plants Page Error Handling
- Veritabanı hatası durumunda boş array döner
- Sayfa çalışmaya devam eder

---

## 🔄 Veritabanı Yedekleme (Gelecek için)

Düzenli yedekleme için script oluşturun:

```javascript
// scripts/backup-db.js
const fs = require('fs')
const path = require('path')

const dbPath = path.join(__dirname, '../prisma/dev.db')
const backupPath = path.join(__dirname, '../prisma/backups', `dev.db.${Date.now()}`)

if (fs.existsSync(dbPath)) {
  fs.mkdirSync(path.dirname(backupPath), { recursive: true })
  fs.copyFileSync(dbPath, backupPath)
  console.log('✅ Backup created:', backupPath)
}
```

---

## 🚫 Veritabanı Bozulmasını Önleme

1. **Güvenli Kapatma:** Uygulamayı her zaman düzgün şekilde kapatın
2. **Disk Alanı:** Yeterli disk alanı olduğundan emin olun
3. **Eşzamanlı Erişim:** Aynı anda birden fazla process veritabanına yazmamalı
4. **Power Kesintisi:** Ani elektrik kesintilerinden kaçının (UPS kullanın)

---

## 🔐 Logout Sorunu Çözüldü

Logout işlemi artık veritabanı bağımlı değil. JWT kullanıldığı için:
- ✅ Veritabanı bozuk olsa bile logout çalışır
- ✅ Session cookie temizlenir
- ✅ Kullanıcı login sayfasına yönlendirilir

---

## 📝 Sonraki Adımlar

1. ✅ Veritabanını yeniden oluşturun (yukarıdaki komutlar)
2. ✅ Test edin (login/logout çalışıyor mu?)
3. ✅ Düzenli yedekleme sistemi kurun
4. ⚠️ Production için PostgreSQL kullanmayı düşünün (SQLite production için uygun değil)

---

**Not:** SQLite development için iyidir, ancak production için PostgreSQL kullanmanız önerilir.
