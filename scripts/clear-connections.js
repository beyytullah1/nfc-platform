const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function clearConnections() {
    // Tüm connection'ları sil
    const result = await prisma.connection.deleteMany({})
    console.log('✅ Deleted:', result.count, 'connections')

    await prisma.$disconnect()
}

clearConnections()
