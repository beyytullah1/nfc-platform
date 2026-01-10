const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function directUpdate() {
    try {
        // publicCode alanını güncelle (schema'da public_code)
        await prisma.$executeRaw`UPDATE nfc_tags SET public_code = 'DEMO2026' WHERE id = 'cmjvxx7og0001m9o8z8cjj1hm'`

        // Kontrol et
        const result = await prisma.$queryRaw`SELECT id, public_code, status FROM nfc_tags WHERE public_code = 'DEMO2026' LIMIT 1`

        console.log('✅ NFC Tag Hazır!')
        if (result[0]) {
            console.log('Tag ID:', result[0].id)
            console.log('Code:', result[0].public_code)
            console.log('Status:', result[0].status)
        }
        console.log('\n📱 Test URL:')
        console.log('http://localhost:3000/t/DEMO2026')

    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

directUpdate()
