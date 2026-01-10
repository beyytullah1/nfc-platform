const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

const envContent = `DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/nfc_platform?schema=public"
# DIRECT_URL kaldırıldı çünkü localdeyiz
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gizli-anahtar-123"
`;

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env dosyası BAŞARIYLA güncellendi!');
    console.log('📝 Yeni Şifre: mysecretpassword');
    console.log('-----------------------------------');
    console.log('Lütfen şimdi "npm run dev" komutunu durdurup tekrar başlatın.');
} catch (error) {
    console.error('❌ Hata oluştu:', error);
}
