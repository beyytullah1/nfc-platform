const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Admin role ekleniyor...')

    // Admin kullanıcıya admin rolü ver
    const adminUser = await prisma.user.update({
        where: { email: 'admin@nfc.com' },
        data: { role: 'admin' }
    })

    console.log(`✅ Admin rolü verildi: ${adminUser.email}`)

    // Demo kullanıcıya da admin rolü ver (isteğe bağlı)
    try {
        const demoUser = await prisma.user.update({
            where: { email: 'demo@nfc.com' },
            data: { role: 'admin' }
        })
        console.log(`✅ Demo kullanıcıya da admin rolü verildi: ${demoUser.email}`)
    } catch (e) {
        console.log('⚠️ Demo kullanıcı bulunamadı, atlandı.')
    }

    console.log('🚀 Tamamlandı!')
}

main()
    .catch((e) => {
        console.error('❌ Hata:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
