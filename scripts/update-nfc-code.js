const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createTestTag() {
    try {
        const testCode = 'DEMO2026'

        // İlk boş tag'i bul ve güncelle
        const tag = await prisma.nfcTag.findFirst({
            where: {
                OR: [
                    { code: null },
                    { code: '' }
                ]
            }
        })

        if (!tag) {
            console.log('❌ No empty tag found')
            return
        }

        const updated = await prisma.nfcTag.update({
            where: { id: tag.id },
            data: { code: testCode }
        })

        console.log('✅ NFC Tag Hazır!')
        console.log(`\nTag ID: ${updated.id}`)
        console.log(`Code: ${updated.code}`)
        console.log('\n📱 Test URL:')
        console.log(`http://localhost:3000/t/${testCode}`)

    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

createTestTag()
