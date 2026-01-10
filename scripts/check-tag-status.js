const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkTagStatus() {
    const tag = await prisma.nfcTag.findUnique({
        where: { publicCode: 'DEMO2026' },
        include: {
            card: true,
            plant: true,
            mug: true,
            page: true
        }
    })

    console.log('Tag Durumu:')
    console.log('===========')
    console.log('ID:', tag?.id)
    console.log('Code:', tag?.publicCode)
    console.log('Owner ID:', tag?.ownerId || 'YOK (unclaimed)')
    console.log('Module Type:', tag?.moduleType || 'YOK')
    console.log('Status:', tag?.status)
    console.log('\nİlişkiler:')
    console.log('Card:', tag?.card ? 'VAR' : 'YOK')
    console.log('Plant:', tag?.plant ? 'VAR' : 'YOK')
    console.log('Mug:', tag?.mug ? 'VAR' : 'YOK')
    console.log('Page:', tag?.page ? 'VAR' : 'YOK')

    await prisma.$disconnect()
}

checkTagStatus()
