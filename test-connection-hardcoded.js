const { PrismaClient } = require('@prisma/client')

// Hardcoded connection URL (for testing only)
const databaseUrl = "postgresql://postgres:mysecretpassword@localhost:5432/nfc_platform?schema=public"

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl
        }
    }
})

async function main() {
    console.log('🔍 Testing connection with HARDCODED URL...');
    try {
        await prisma.$connect()
        console.log('✅ SUCCESS! Connected to database.')

        // Check if tables exist
        const userCount = await prisma.user.count().catch(() => 'Error checking users')
        console.log('📊 User count:', userCount)

    } catch (error) {
        console.error('❌ CONNECTION FAILED:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

main()
