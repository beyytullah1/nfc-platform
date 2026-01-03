const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function findLinkedTag() {
    // Tüm tag'leri getir, filtrelemeyi JS'de yap
    const allTags = await prisma.nfcTag.findMany({
        include: {
            owner: { select: { name: true, email: true } },
            card: { select: { id: true, title: true, slug: true } },
            plant: { select: { id: true, name: true } },
            mug: { select: { id: true, name: true } },
            page: { select: { id: true, title: true } }
        }
    })

    // Owner'ı olan ve link'i olan tag'leri bul
    const linkedTags = allTags.filter(tag =>
        tag.publicCode &&
        tag.publicCode !== '' &&
        tag.ownerId &&
        (tag.card || tag.plant || tag.mug || tag.page)
    )

    if (linkedTags.length === 0) {
        console.log('❌ Eşleşmiş tag bulunamadı')
        await prisma.$disconnect()
        return
    }

    const linkedTag = linkedTags[0]

    console.log('\n✅ EŞLEŞMİŞ TAG BULUNDU!')
    console.log('='.repeat(60))
    console.log('Public Code:', linkedTag.publicCode)
    console.log('Owner:', linkedTag.owner?.name || linkedTag.owner?.email)
    console.log('Module Type:', linkedTag.moduleType || 'YOK')
    console.log('Status:', linkedTag.status)

    console.log('\n📋 Eşleşme Detayları:')
    if (linkedTag.card) {
        console.log('  ✓ Card:', linkedTag.card.title || 'Başlıksız')
        console.log('  ✓ Slug:', linkedTag.card.slug || linkedTag.card.id)
    }
    if (linkedTag.plant) {
        console.log('  ✓ Plant:', linkedTag.plant.name)
    }
    if (linkedTag.mug) {
        console.log('  ✓ Mug:', linkedTag.mug.name)
    }
    if (linkedTag.page) {
        console.log('  ✓ Page:', linkedTag.page.title)
    }

    console.log('\n🔗 TEST URL:')
    console.log(`http://localhost:3000/t/${linkedTag.publicCode}`)

    console.log(`\nToplam ${linkedTags.length} eşleşmiş tag var.`)

    await prisma.$disconnect()
    return linkedTag.publicCode
}

findLinkedTag()
