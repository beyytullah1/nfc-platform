import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Creating test user: Ali...')

    // Ali kullanıcısı
    const ali = await prisma.user.upsert({
        where: { email: 'ali@test.com' },
        update: {},
        create: {
            email: 'ali@test.com',
            name: 'Ali Yılmaz',
            passwordHash: await bcrypt.hash('123456', 10),
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali'
        }
    })

    console.log('✅ Ali created:', ali.id)

    // Ali'nin İş Kartı
    const workCard = await prisma.card.create({
        data: {
            userId: ali.id,
            slug: 'ali-is',
            title: 'Yazılım Geliştirici @ TechCorp',
            bio: 'Full-stack developer. React, Node.js, PostgreSQL.',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AliWork',
            isPublic: true,
            fields: {
                create: [
                    { fieldType: 'phone', value: '+90 532 111 2233', displayOrder: 1 },
                    { fieldType: 'email', value: 'ali.work@techcorp.com', displayOrder: 2 },
                    { fieldType: 'linkedin', value: 'ali-yilmaz-dev', displayOrder: 3 }
                ]
            }
        }
    })

    console.log('✅ Work Card created:', workCard.id)

    // Ali'nin Kişisel Kartı
    const personalCard = await prisma.card.create({
        data: {
            userId: ali.id,
            slug: 'ali-kisisel',
            title: 'Fotoğrafçılık Hobisi',
            bio: 'Doğa fotoğrafçılığı ve seyahat.',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AliPersonal',
            isPublic: true,
            fields: {
                create: [
                    { fieldType: 'phone', value: '+90 533 444 5566', displayOrder: 1 },
                    { fieldType: 'email', value: 'ali.personal@gmail.com', displayOrder: 2 },
                    { fieldType: 'instagram', value: 'ali_photos', displayOrder: 3 }
                ]
            }
        }
    })

    console.log('✅ Personal Card created:', personalCard.id)

    console.log('\n🎉 Test data ready!')
    console.log('\n📝 Test Instructions:')
    console.log('1. Go to: http://localhost:3000/ali-is')
    console.log('2. Click "İletişim Ağına Ekle"')
    console.log('3. Check /dashboard/connections')
    console.log('4. Go to: http://localhost:3000/ali-kisisel')
    console.log('5. Button should say "İletişim Ağına Ekle" (NOT saved)')
    console.log('\n✨ This proves card-level connection works!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
