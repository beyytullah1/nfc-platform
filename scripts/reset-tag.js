const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetTag() {
    await prisma.$executeRaw`
        UPDATE nfc_tags 
        SET 
            owner_id = NULL,
            module_type = NULL,
            status = 'unclaimed',
            claimed_at = NULL
        WHERE public_code = 'DEMO2026'
    `

    console.log('✅ Tag temizlendi')
    console.log('\n📱 Test URL:')
    console.log('http://localhost:3000/t/DEMO2026')
    console.log('\n✨ Artık claim sayfasına yönlendirecek!')

    await prisma.$disconnect()
}

resetTag()
