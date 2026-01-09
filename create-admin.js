const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Admin kullanıcısı oluşturuluyor...')

    const passwordHash = await bcrypt.hash('123123', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@nfc.com' },
        update: {
            role: 'admin',
            passwordHash
        },
        create: {
            email: 'admin@nfc.com',
            name: 'Admin User',
            passwordHash,
            role: 'admin',
        }
    })

    console.log(`✅ Admin kullanıcısı hazır: ${admin.email}`)
}

main()
    .catch((e) => {
        console.error('❌ Hata:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
