const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Veritabanı bağlantısı kontrol ediliyor...\n')

    try {
        // Basit bir sorgu ile bağlantıyı test et
        await prisma.$queryRaw`SELECT 1 as test`

        console.log('✅ PostgreSQL bağlantısı BAŞARILI!')
        console.log('✅ Veritabanı çalışıyor\n')

        // Admin kullanıcıyı kontrol et
        const admin = await prisma.user.findUnique({
            where: { email: 'admin@nfc.com' }
        })

        if (admin) {
            console.log('✅ Admin kullanıcı bulundu:')
            console.log(`   Email: ${admin.email}`)
            console.log(`   İsim: ${admin.name}`)
            console.log(`   ID: ${admin.id}`)
            console.log('\n🔑 Şifre: 123123\n')
        } else {
            console.log('⚠️ Admin kullanıcı BULUNAMADI!')
        }

    } catch (error) {
        console.error('❌ BAĞLANTI HATASI!')
        console.error('PostgreSQL servisi çalışmıyor olabilir.\n')
        console.error('Hata:', error.message)
        console.log('\n📋 Yapılacaklar:')
        console.log('1. PostgreSQL servisini başlat')
        console.log('2. pgAdmin\'i aç ve veritabanını kontrol et')
        console.log('3. .env dosyasındaki DATABASE_URL\'i kontrol et')
    }
}

main()
    .catch((e) => {
        console.error('❌ Kritik Hata:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
