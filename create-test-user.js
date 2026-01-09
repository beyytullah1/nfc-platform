const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    console.log('🧪 Test kullanıcısı oluşturuluyor...\n')

    const email = 'test@nfc.com'
    const password = '123'
    const passwordHash = await bcrypt.hash(password, 10)

    // Eski test kullanıcıyı sil
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        await prisma.cardField.deleteMany({ where: { card: { userId: existing.id } } })
        await prisma.card.deleteMany({ where: { userId: existing.id } })
        await prisma.user.delete({ where: { email } })
        console.log('✅ Eski test kullanıcı silindi')
    }

    // Yeni kullanıcı oluştur
    const user = await prisma.user.create({
        data: {
            email,
            name: 'Test Kullanıcı',
            username: 'testuser',
            passwordHash,
            bio: 'Test hesabı'
        }
    })

    console.log(`✅ Kullanıcı: ${user.email}`)
    console.log(`   Şifre: ${password}\n`)

    // Örnek kart oluştur
    const card = await prisma.card.create({
        data: {
            userId: user.id,
            title: 'Test Kartvizit',
            slug: 'test-profil',
            theme: 'professional',
            bio: 'Bu bir test kartviziti',
            fields: {
                create: [
                    { fieldType: 'phone', label: 'Telefon', value: '+90 555 123 45 67', displayOrder: 1 },
                    { fieldType: 'email', label: 'E-posta', value: 'test@nfc.com', displayOrder: 2 },
                    { fieldType: 'website', label: 'Website', value: 'nfcplatform.com', displayOrder: 3 }
                ]
            }
        }
    })

    console.log(`✅ Kart oluşturuldu: ${card.title}`)
    console.log(`   Slug: ${card.slug}`)
    console.log(`   URL: http://localhost:3000/${card.slug}\n`)

    console.log('=' + '='.repeat(60))
    console.log('TEST ETMEK ICIN:')
    console.log('1. Logout yap (sağ üst)')
    console.log('2. test@nfc.com / 123 ile giriş yap')
    console.log('3. http://localhost:3000/test-profil adresini aç')
    console.log('=' + '='.repeat(60))
}

main()
    .catch(e => console.error('HATA:', e))
    .finally(() => prisma.$disconnect())
