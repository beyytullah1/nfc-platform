const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fix() {
    // Tüm pending'leri saved yap
    const result = await prisma.connection.updateMany({
        where: { status: 'pending' },
        data: { status: 'saved' }
    })

    console.log('✅ Fixed:', result.count, 'connections updated to saved')
    await prisma.$disconnect()
}

fix()
