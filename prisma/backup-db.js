const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
    console.log('📦 Veritabanı yedeği alınıyor...')

    const backup = {
        timestamp: new Date().toISOString(),
        users: await prisma.user.findMany(),
        nfcTags: await prisma.nfcTag.findMany(),
        cards: await prisma.card.findMany({ include: { fields: true } }), // Fieldları da al
        plants: await prisma.plant.findMany({ include: { logs: true } }),
        mugs: await prisma.mug.findMany({ include: { logs: true } }),
        gifts: await prisma.gift.findMany(),
        pages: await prisma.page.findMany({ include: { blocks: true } }),
        connections: await prisma.connection.findMany(),
        notifications: await prisma.notification.findMany(),
    }

    const fileName = `database_backup_${Date.now()}.json`
    const filePath = path.join(__dirname, '..', fileName)

    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2))

    console.log(`✅ Yedeklendi: ${fileName}`)
    console.log(`📂 Konum: ${filePath}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
