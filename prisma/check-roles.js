const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Kullanıcı rolleri kontrol ediliyor...\n')

    const users = await prisma.user.findMany({
        where: {
            email: {
                in: ['admin@nfc.com', 'demo@nfc.com']
            }
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true
        }
    })

    users.forEach(user => {
        console.log(`📧 Email: ${user.email}`)
        console.log(`👤 İsim: ${user.name}`)
        console.log(`🎭 Role: ${user.role}`)
        console.log('---')
    })

    if (users.length === 0) {
        console.log('⚠️ Kullanıcı bulunamadı!')
    }
}

main()
    .catch((e) => {
        console.error('❌ Hata:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
