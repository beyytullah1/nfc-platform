const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const card = await prisma.card.findFirst({
        where: { slug: 'ceo-profile' }
    })

    if (card) {
        console.log('BULUNDU - Slug var')
    } else {
        console.log('BULUNAMADI - Slug yok')
    }

    const allCards = await prisma.card.count()
    console.log('Toplam kartvizit sayisi:', allCards)
}

main()
    .catch(e => console.error('HATA:', e.message))
    .finally(() => prisma.$disconnect())
