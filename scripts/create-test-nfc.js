const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function assignTestCode() {
    try {
        // İlk unclaimed tag'i bul
        const tag = await prisma.nfcTag.findFirst({
            where: {
                OR: [
                    { code: null },
                    { code: '' }
                ]
            }
        })

        if (!tag) {
            console.log('❌ No available tags found')
            return
        }

        // Test kodu ata
        const testCode = 'TEST-' + Math.random().toString(36).substring(2, 10).toUpperCase()

        const updated = await prisma.nfcTag.update({
            where: { id: tag.id },
            data: { code: testCode }
        })

        console.log('✅ NFC Tag Hazır!')
        console.log('\n📱 Test URL:')
        console.log(`http://localhost:3000/t/${testCode}`)
        console.log('\n🔗 Veya kısa URL:')
        console.log(`localhost:3000/t/${testCode}`)
        console.log('\n📊 Tag Detayları:')
        console.log(`Tag ID: ${updated.id}`)
        console.log(`Code: ${updated.code}`)
        console.log(`Status: ${updated.status}`)

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

assignTestCode()
