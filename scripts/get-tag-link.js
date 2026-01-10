const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getTagLink() {
    const tag = await prisma.nfcTag.findUnique({
        where: { id: 'cmjuqn5l900dvm9ko6p3h9ifm' }
    })

    if (!tag) {
        console.log('❌ Tag bulunamadı')
        return
    }

    console.log('📊 Tag Bilgileri:')
    console.log('================')
    console.log('ID:', tag.id)
    console.log('Public Code:', tag.publicCode || '(BOŞ)')
    console.log('Owner:', tag.ownerId || 'Sahipsiz')
    console.log('Status:', tag.status)

    if (tag.publicCode) {
        console.log('\n✅ DOĞRU LINK:')
        console.log(`http://localhost:3000/t/${tag.publicCode}`)
    } else {
        console.log('\n⚠️ Bu tag\'in publicCode\'u YOK!')
        console.log('Kod atamak ister misiniz?')
    }

    await prisma.$disconnect()
}

getTagLink()
