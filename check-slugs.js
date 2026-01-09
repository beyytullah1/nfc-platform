const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Kartvizit slug kontrol ediliyor...\n')

    // Tüm slugları listele
    const cards = await prisma.card.findMany({
        select: {
            id: true,
            title: true,
            slug: true,
            userId: true,
            user: {
                select: {
                    email: true,
                    name: true
                }
            }
        }
    })

    if (cards.length === 0) {
        console.log('❌ Hiç kartvizit bulunamadı!')
        console.log('Lütfen dashboard\'dan bir kartvizit oluşturun.\n')
        return
    }

    console.log(`✅ ${cards.length} kartvizit bulundu:\n`)

    cards.forEach((card, index) => {
        console.log(`${index + 1}. Kartvizit:`)
        console.log(`   Başlık: ${card.title || 'Başlıksız'}`)
        console.log(`   Slug: ${card.slug || 'YOK'}`)
        console.log(`   Sahibi: ${card.user.name || card.user.email}`)
        console.log(`   URL: http://localhost:3000/${card.slug || card.id}`)
        console.log('')
    })

    // ceo-profile'ı özel olarak kontrol et
    const ceoProfile = await prisma.card.findFirst({
        where: { slug: 'ceo-profile' }
    })

    if (ceoProfile) {
        console.log('✅ "ceo-profile" slug\'ı BULUNDU!')
        console.log('   Bu slug çalışmalı. Middleware sorunu olabilir.')
    } else {
        console.log('❌ "ceo-profile" slug\'ı YOK!')
        console.log('   Lütfen dashboard\'dan slug olarak "ceo-profile" girin.')
    }
}

main()
    .catch((e) => {
        console.error('❌ Hata:', e)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
