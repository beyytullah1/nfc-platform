const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const cards = await prisma.card.findMany({
        where: { user: { email: 'demo@nfc.com' } },
        select: { title: true, slug: true, id: true }
    })

    console.log('DOGRU URL LISTESI:\n')
    cards.forEach(card => {
        const url = card.slug || card.id
        console.log(`${card.title}`)
        console.log(`http://localhost:3000/${url}`)
        console.log('')
    })
}

main().finally(() => prisma.$disconnect())
