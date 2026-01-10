const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugConnections() {
    // Beyytullah kullanıcısını bul
    const beytullah = await prisma.user.findUnique({
        where: { email: 'beyytullah@gmail.com' }
    })

    if (!beytullah) {
        console.log('❌ beyytullah kullanıcısı bulunamadı!')
        return
    }

    console.log('✅ Beyytullah User:', beytullah.id, beytullah.email)

    // Tüm connections
    const allConnections = await prisma.connection.findMany({
        where: {
            OR: [
                { userId: beytullah.id },
                { friendId: beytullah.id }
            ]
        },
        include: {
            user: { select: { email: true } },
            friend: { select: { email: true } }
        }
    })

    console.log('')
    console.log('📊 Tüm Connections:', allConnections.length)
    allConnections.forEach(c => {
        console.log({
            id: c.id,
            user: c.user.email,
            friend: c.friend.email,
            status: c.status,
            visibility: c.visibility
        })
    })

    // Beyytullah'ın kaydettiği kişiler
    const savedByBey = await prisma.connection.findMany({
        where: {
            userId: beytullah.id,
            status: 'saved'
        }
    })

    console.log('')
    console.log('✅ Beyytullah kaydetmiş (status=saved):', savedByBey.length)

    await prisma.$disconnect()
}

debugConnections()
