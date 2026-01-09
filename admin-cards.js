const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

prisma.card.findMany({
    where: { user: { email: 'admin@nfc.com' } },
    select: { title: true, slug: true, id: true }
}).then(cards => {
    console.log('\n=== ADMIN HESABINDAKI KARTLAR ===\n')
    cards.forEach((card, i) => {
        console.log(`${i + 1}. ${card.title || 'Isimsiz'}`)
        console.log(`   Slug: ${card.slug || 'YOK'}`)
        console.log(`   URL:  http://localhost:3000/${card.slug || card.id}\n`)
    })

    if (cards.length === 0) {
        console.log('Hic kart yok!\n')
    }
}).finally(() => prisma.$disconnect())
