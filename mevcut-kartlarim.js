const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('=== HANGI HESAPTASIN? ===\n')

    // Admin hesabını kontrol et
    const admin = await prisma.user.findUnique({
        where: { email: 'admin@nfc.com' },
        include: { cards: { select: { title: true, slug: true, id: true } } }
    })

    if (admin) {
        console.log(`ADMIN HESABI (admin@nfc.com):`)
        console.log(`Kartlar: ${admin.cards.length} adet\n`)
        admin.cards.forEach(card => {
            console.log(`- ${card.title || 'Isimsiz'}`)
            console.log(`  URL: http://localhost:3000/${card.slug || card.id}`)
        })
        console.log('\n' + '='.repeat(50) + '\n')
    }

    // Demo hesabını kontrol et
    const demo = await prisma.user.findUnique({
        where: { email: 'demo@nfc.com' },
        include: { cards: { select: { title: true, slug: true, id: true } } }
    })

    if (demo) {
        console.log(`DEMO HESABI (demo@nfc.com):`)
        console.log(`Kartlar: ${demo.cards.length} adet\n`)
        demo.cards.forEach(card => {
            console.log(`- ${card.title || 'Isimsiz'}`)
            console.log(`  URL: http://localhost:3000/${card.slug || card.id}`)
        })
    }
}

main()
    .catch(e => console.error('HATA:', e.message))
    .finally(() => prisma.$disconnect())
