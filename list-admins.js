const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('=== ADMIN KULLANICILARI ===\n')

    // Role'ü admin olanları bul
    // NOT: Şemada role alanı yoksa veya Enum değilse raw query gerekebilir
    // Ancak önceki konuşmalardan role alanının eklendiğini biliyoruz.
    // Yine de güvenli olması için raw query kullanalım çünkü prisma client güncel olmayabilir

    try {
        const admins = await prisma.$queryRaw`SELECT id, name, email, role, "createdAt" FROM "User" WHERE role = 'admin'`

        if (admins.length === 0) {
            console.log('⚠️ Hiç admin bulunamadı!')
        } else {
            admins.forEach((admin, index) => {
                console.log(`${index + 1}. ${admin.name || 'İsimsiz'}`)
                console.log(`   Email: ${admin.email}`)
                console.log(`   Kayıt: ${admin.createdAt}`)
                console.log('------------------------')
            })
        }
    } catch (error) {
        console.error('Hata:', error.message)
        // Fallback: belki role kolonu yoktur, email listesi ile kontrol edelim
        console.log('\nAlternatif kontrol (Email listesi):')
        const adminEmails = ['admin@nfc.com', 'admin@example.com']
        const users = await prisma.user.findMany({
            where: { email: { in: adminEmails } }
        })
        users.forEach(u => console.log(`- ${u.email} (Rol kontrolü yapılamadı)`))
    }
}

main().finally(() => prisma.$disconnect())
