# Temasal - Production Deployment Guide

## Sunucu Gereksinimleri

- **İşletim Sistemi:** Ubuntu 22.04/24.04 LTS
- **Node.js:** v20+ LTS
- **PostgreSQL:** v15+
- **RAM:** Minimum 2GB (Önerilen 4GB)
- **Disk:** 25GB+ SSD

## Deployment Adımları

### 1. Sunucuya Bağlan ve Projeyi Klonla

```bash
git clone https://github.com/beyytullah1/nfc-platform.git
cd nfc-platform
```

### 2. Environment Dosyasını Oluştur

```bash
cp .env.example .env
nano .env
```

**Kritik:** Aşağıdaki değerleri mutlaka güncelle:

```env
# PostgreSQL Bağlantısı
DATABASE_URL="postgresql://kullanici:sifre@localhost:5432/veritabani_adi?schema=public"
DIRECT_URL="postgresql://kullanici:sifre@localhost:5432/veritabani_adi?schema=public"

# NextAuth (güvenli bir secret oluştur: openssl rand -base64 32)
NEXTAUTH_SECRET="buraya-gercek-secret-yaz"
NEXTAUTH_URL="https://yourdomain.com"  # veya http://sunucu-ip:3000

# Google OAuth (opsiyonel)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 3. Docker ile PostgreSQL Başlat (Opsiyonel)

Eğer PostgreSQL Docker ile çalıştırılacaksa:

```bash
# docker-compose.yml oluştur (örnek)
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  db:
    container_name: temasal-postgres
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: GÜÇLÜ_ŞİFRE_BURAYA
      POSTGRES_DB: temasal_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
EOF

docker-compose up -d
```

### 4. Dependencies Yükle

```bash
npm ci  # veya npm install
```

### 5. Prisma Migrate

```bash
# Production için migration kullan
npx prisma migrate deploy

# Eğer migration yoksa (ilk kurulum)
npx prisma db push
```

### 6. Build

```bash
npm run build
```

### 7. PM2 ile Başlat

```bash
# PM2 yükle (global)
npm install -g pm2

# Uygulamayı başlat
pm2 start npm --name "temasal" -- start

# Otomatik başlatma
pm2 startup
pm2 save
```

### 8. Nginx Reverse Proxy (Önerilen)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 9. SSL Sertifikası (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Güncelleme (Update) Akışı

```bash
# 1. Son kodu çek
git pull origin main

# 2. Dependencies güncelle
npm ci

# 3. Prisma migrate
npx prisma migrate deploy

# 4. Build
npm run build

# 5. PM2 restart
pm2 restart temasal
```

## Önemli Notlar

⚠️ **CSP Uyarısı:** `next.config.ts` içinde `upgrade-insecure-requests` kullanma. HTTP üzerinde CSS/JS yüklenmez.

⚠️ **DIRECT_URL:** Prisma schema'da `directUrl` kullanılıyorsa `.env` içinde mutlaka `DIRECT_URL` tanımla.

⚠️ **Port 3000:** Production'da 3000 portunu internete açık bırakma. Nginx ile 80/443 → 3000 proxy yap.

⚠️ **Secrets:** `docker-compose.yml` ve `.env` asla git'e ekleme. `.gitignore` kontrol et.

## Sorun Giderme

### CSS Gelmiyor
- Nginx proxy headers doğru mu kontrol et
- Browser console'da 404/CORS hatası var mı bak
- `_next/static` yolu erişilebilir mi test et

### Database Bağlantı Hatası
- PostgreSQL çalışıyor mu: `docker ps` veya `systemctl status postgresql`
- `.env` içinde `DATABASE_URL` ve `DIRECT_URL` doğru mu
- Firewall 5432 portunu engelliyor mu

### Build Hatası
- Node.js versiyonu 20+ mı: `node -v`
- Disk alanı yeterli mi: `df -h`
- RAM yeterli mi: `free -h`

## Destek

Sorun yaşarsan:
1. PM2 loglarına bak: `pm2 logs temasal`
2. Nginx loglarına bak: `sudo tail -f /var/log/nginx/error.log`
3. PostgreSQL loglarına bak: `docker logs temasal-postgres`
