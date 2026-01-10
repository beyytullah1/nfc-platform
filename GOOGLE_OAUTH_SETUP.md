# Google OAuth Setup Guide

## Google Cloud Console Kurulumu

### 1. Google Cloud Project Oluştur

1. https://console.cloud.google.com/ adresine git
2. Yeni proje oluştur veya mevcut projeyi seç
3. Proje adı: "Temasal Platform" (veya istediğin isim)

### 2. OAuth Consent Screen Ayarla

1. Sol menüden **APIs & Services** → **OAuth consent screen**
2. User Type: **External** seç
3. **Create** tıkla
4. Bilgileri doldur:
   - App name: `Temasal`
   - User support email: `your-email@gmail.com`
   - Developer contact: `your-email@gmail.com`
5. **Save and Continue**
6. Scopes: Varsayılan bırak (email, profile, openid)
7. **Save and Continue**
8. Test users: Email adresini ekle (geliştirme için)
9. **Save and Continue**

### 3. OAuth 2.0 Client ID Oluştur

1. Sol menüden **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: `Temasal Web Client`
5. **Authorized redirect URIs** ekle:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   Production için:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
6. **Create** tıkla
7. **Client ID** ve **Client Secret** kopyala

### 4. .env Dosyasını Güncelle

```env
# Google OAuth
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxx"
```

### 5. Test Et

1. Dev server'ı restart et
2. `http://localhost:3000/login`
3. "Google ile Giriş Yap" butonuna tıkla
4. Google hesabınla giriş yap
5. İlk girişte izin ver
6. Dashboard'a yönlendirileceksin

## Özellikler

✅ **Hızlı Kayıt:** Şifre gerektirmez
✅ **Güvenli:** Google OAuth 2.0
✅ **Avatar:** Google profil fotoğrafı otomatik gelir
✅ **Email Verified:** Google zaten doğrulamış

## Nasıl Çalışır?

1. User "Google ile Giriş" tıklar
2. Google login sayfasına yönlendirilir
3. İzin verirse Google callback yapar
4. NextAuth user'ı oluşturur/bulur:
   - Email Google'dan
   - Name Google'dan
   - Avatar Google'dan
   - Role: "user" (default)
5. Dashboard'a redirect

## Production Notları

### Domain Değişince:

1. Google Cloud Console'a git
2. Credentials → OAuth 2.0 Client ID
3. Authorized redirect URIs'e ekle:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
4. `.env` dosyasında `NEXTAUTH_URL` güncelle:
   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   ```

### OAuth Consent Screen:

- Development: "Testing" modunda kalabilir (max 100 user)
- Production: "Publishing" için verification gerekli
- Verification süreci 1-2 hafta sürebilir

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Authorized redirect URIs kontrol et
- Tam URL olmalı (trailing slash yok)
- http vs https dikkat et

### "Access blocked: This app's request is invalid"
- OAuth consent screen tamamlanmamış
- Test users ekle (development için)

### User oluşuyor ama role yok
- NextAuth callback'de role set ediliyor
- Default "user" olmalı
- Admin yapmak için database'de manuel güncelle

## Email vs Google Login

| Özellik | Email/Password | Google OAuth |
|---------|---------------|--------------|
| Kayıt Hızı | Yavaş (form doldur) | Hızlı (1 tık) |
| Şifre | Gerekli | Gerekmez |
| Şifre Sıfırlama | Email gönder | Gerek yok |
| Avatar | Manuel upload | Otomatik |
| Email Doğrulama | Gerekebilir | Google doğrulamış |
| Güvenlik | Şifreye bağlı | Google'a bağlı |

## Öneriler

✅ Her iki yöntemi de destekle (kullanıcı seçsin)
✅ Google ile kayıt olanlar şifre belirleyebilsin (opsiyonel)
✅ Email değişikliği dikkatli yap (Google email'i değişmez)
