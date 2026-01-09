# Password Reset Setup Guide

## Gmail SMTP Kurulumu

Şifre sıfırlama özelliği Gmail SMTP kullanıyor. Kurulum adımları:

### 1. Gmail App Password Oluştur

1. Google hesabına gir: https://myaccount.google.com/
2. **Security** (Güvenlik) → **2-Step Verification** (2 Adımlı Doğrulama)
3. 2-Step Verification'ı **aktif et** (eğer değilse)
4. **App Passwords** (Uygulama Şifreleri) → **Generate**
5. App seç: **Mail**
6. Device seç: **Other** → "Temasal Platform" yaz
7. **16 haneli şifreyi** kopyala

### 2. .env Dosyasını Güncelle

```env
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="xxxx xxxx xxxx xxxx"  # 16 haneli app password (boşluksuz)
```

### 3. Prisma Migration Uygula

```bash
# Dev server'ı durdur
# Sonra:
npx prisma db push
# veya
npx prisma migrate dev --name add_password_reset
```

### 4. Test Et

1. `http://localhost:3000/login` → "Şifremi Unuttum?"
2. Email gir
3. Gmail'i kontrol et
4. Linke tıkla
5. Yeni şifre belirle

## Özellikler

✅ **Rate Limiting:** Max 3 istek / 1 saat
✅ **Token Expiry:** 30 dakika
✅ **Tek Kullanımlık:** Token bir kez kullanılabilir
✅ **Güvenli:** Email enumeration koruması
✅ **Güzel Email:** HTML template ile

## Troubleshooting

### Email gönderilmiyor
- App password doğru mu kontrol et
- 2-Step Verification aktif mi?
- Gmail hesabı engellenmiş olabilir (Less secure apps)

### Token geçersiz
- 30 dakika geçmiş olabilir
- Token zaten kullanılmış olabilir
- Yeni istek oluştur

### Prisma hatası
- `npx prisma generate` çalıştır
- Dev server'ı restart et

## Production Notları

- Gmail SMTP günlük 500 email limiti var
- Production'da Resend veya SendGrid kullanmak daha iyi
- NEXTAUTH_URL production domain olmalı
- Email FROM adresi doğrulanmalı (SPF, DKIM)
