const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const admins = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { email: true, name: true, role: true }
    })

    console.log('=== ADMIN LISTESI ===')
    if (admins.length > 0) {
        admins.forEach(a => console.log(`- ${a.name} (${a.email})`))
    } else {
        // Eğer role ile bulamazsa email ile bulmayı dene (fallback)
        console.log('Role ile bulunamadı, email kontrol ediliyor...')
        const adminByEmail = await prisma.user.findUnique({
            where: { email: 'admin@nfc.com' }
        })
        if (adminByEmail) {
            console.log(`- ${adminByEmail.name} (${adminByEmail.email}) [Role: ${adminByEmail.role}]`)
        } else {
            console.log('Admin bulunamadı.')
        }
    }
}

main().finally(() => prisma.$disconnect())
