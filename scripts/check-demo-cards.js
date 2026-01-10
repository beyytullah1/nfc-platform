const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('=== DEMO KARTLARI KONTROL ===\n')

    const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@nfc.com' },
        include: {
            cards: {
                include: {
                    fields: true
                }
            }
        }
    })

    if (!demoUser) {
        console.log('Demo kullanici bulunamadi!')
        return
    }

    console.log(`Kullanici: ${demoUser.name}`)
    console.log(`Kartlar: ${demoUser.cards.length} adet\n`)

    demoUser.cards.forEach((card, index) => {
        console.log(`${index + 1}. ${card.title || 'Isimsiz'}`)
        console.log(`   Slug: ${card.slug || 'YOK'}`)
        console.log(`   URL: http://localhost:3000/${card.slug || card.id}`)
        console.log(`   Fields: ${card.fields.length} adet`)

        if (card.fields.length === 0) {
            console.log('   ⚠️ UYARI: Hic field yok!')
        }

        console.log('')
    })
}

main().finally(() => prisma.$disconnect())
