const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

prisma.$connect()
    .then(() => {
        console.log('✅ BAĞLANTI BAŞARILI!')
        process.exit(0)
    })
    .catch((e) => {
        console.error('❌ BAĞLANTI HATASI:', e.message)
        process.exit(1)
    })
