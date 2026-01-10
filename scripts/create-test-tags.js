const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const codes = ['test-tag-01', 'test-tag-02', 'test-tag-03', 'test-tag-04', 'test-tag-05']

    console.log('Creating test tags...')

    for (const code of codes) {
        try {
            const tag = await prisma.nfcTag.upsert({
                where: { publicCode: code },
                update: {
                    status: 'unclaimed',
                    ownerId: null,
                    isActive: true
                },
                create: {
                    tagId: 'physical-' + Math.random().toString(36).substring(7),
                    publicCode: code,
                    status: 'unclaimed',
                    isActive: true
                }
            })
            console.log(`✅ Created: ${tag.publicCode}`)
        } catch (e) {
            console.error(`❌ Failed: ${code}`, e)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
