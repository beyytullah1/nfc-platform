const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Admin kullanıcısı (admin@nfc.com) oluşturuluyor...')

    // Şifreyi hashle: 123123
    const passwordHash = await bcrypt.hash('123123', 10)

    // Varsa güncelle, yoksa oluştur
    const admin = await prisma.user.upsert({
        where: { email: 'admin@nfc.com' },
        update: {
            passwordHash: passwordHash,
            role: 'admin',
            name: 'Admin User'
        },
        create: {
            email: 'admin@nfc.com',
            passwordHash: passwordHash,
            role: 'admin',
            name: 'Admin User',
            username: 'admin'
        }
    })

    console.log('✅ KULLANICI OLUŞTURULDU!')
    console.log('📧 Email: admin@nfc.com')
    console.log('🔑 Şifre: 123123')
    console.log('🎭 Role:  admin')
}

main()
    .catch((e) => {
        console.error('❌ Hata:', e)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
