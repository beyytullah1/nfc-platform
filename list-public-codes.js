const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function listAllPublicCodes() {
    try {
        // Tüm tag'leri public code ile getir
        const tags = await prisma.nfcTag.findMany({
            select: {
                id: true,
                publicCode: true,
                status: true,
                ownerId: true,
                moduleType: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        console.log('\n📊 MEVCUT PUBLIC CODE LİSTESİ')
        console.log('='.repeat(80))
        console.log(`Toplam Tag: ${tags.length}\n`)

        // Boş olanlar
        const empty = tags.filter(t => !t.publicCode || t.publicCode === '')
        // Dolu olanlar
        const filled = tags.filter(t => t.publicCode && t.publicCode !== '')

        console.log(`✅ Kod Atanmış: ${filled.length}`)
        console.log(`⚠️  Kod Atanmamış: ${empty.length}\n`)

        if (filled.length > 0) {
            console.log('🏷️  ATANMIŞ KODLAR (Son 50):')
            console.log('-'.repeat(80))
            console.log(`${'#'.padEnd(5)} ${'Public Code'.padEnd(20)} ${'Status'.padEnd(12)} ${'Module'.padEnd(10)} ${'Owner'}`)
            console.log('-'.repeat(80))

            filled.slice(0, 50).forEach((tag, index) => {
                const ownerStatus = tag.ownerId ? '✓' : '✗'
                console.log(
                    `${(index + 1).toString().padEnd(5)} ` +
                    `${(tag.publicCode || '').padEnd(20)} ` +
                    `${tag.status.padEnd(12)} ` +
                    `${(tag.moduleType || '-').padEnd(10)} ` +
                    `${ownerStatus}`
                )
            })

            if (filled.length > 50) {
                console.log(`\n... ve ${filled.length - 50} kod daha`)
            }
        }

        console.log('\n' + '='.repeat(80))
        console.log('\n💡 Kullanım:')
        if (filled.length > 0) {
            const example = filled[0].publicCode
            console.log(`   URL: http://localhost:3000/t/${example}`)
        }
        console.log(`   CSV Export: Önceden oluşturuldu (nfc_tags_export.csv)`)

    } catch (error) {
        console.error('❌ Hata:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

listAllPublicCodes()
