const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const card = await prisma.card.findFirst({
        where: { slug: 'ceo-profile' },
        select: { id: true, slug: true, title: true }
    })

    if (card) {
        console.log('ID:', card.id)
        console.log('Slug:', card.slug)
        console.log('Title:', card.title)
        console.log('\nDirekt link:', `http://localhost:3000/${card.slug}`)
        console.log('Alternatif:', `http://localhost:3000/c/${card.id}`)
    } else {
        console.log('Bulunamadi')
    }
}

main().finally(() => prisma.$disconnect())
