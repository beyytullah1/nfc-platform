import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Beytullah kullanıcısını oluştur
    const beytullahUser = await prisma.user.upsert({
        where: { email: 'beyytullah@gmail.com' },
        update: {},
        create: {
            email: 'beyytullah@gmail.com',
            name: 'Beytullah Çiçek',
            passwordHash: await bcrypt.hash('test123', 10),
            avatarUrl: null
        }
    })

    console.log('✅ Beytullah kullanıcısı oluşturuldu:', beytullahUser.id)

    // Kartvizit oluştur
    const card = await prisma.card.upsert({
        where: { slug: 'beytullah' },
        update: {},
        create: {
            slug: 'beytullah',
            ownerId: beytullahUser.id,
            name: 'Beytullah Çiçek',
            title: 'Bilişim Teknolojileri Öğretmeni',
            company: 'Milli Eğitim Bakanlığı',
            bio: `Eğitim Teknolojileri | Dijital İçerik Geliştirme | Yapay Zekâ ve Üretken Yapay Zekâ | NFC tabanlı sistemler | 3D üretim ve prototipleme`,
            phone: '+905434675587',
            email: 'beytullah.cicek@meb.gov.tr',
            website: 'https://www.linkedin.com/in/beyytullah/',
            address: null,

            socialLinks: JSON.stringify({
                linkedin: 'https://www.linkedin.com/in/beyytullah/',
                github: 'https://github.com/beyytullah1',
                instagram: 'https://instagram.com/beyytullah',
                twitter: 'https://x.com/beyytullah',
                facebook: 'https://facebook.com/beyytullah',
                whatsapp: 'https://wa.me/905434675587'
            }),

            customFields: JSON.stringify({
                emails: [
                    'beytullah.cicek@meb.gov.tr',
                    'beyytullah@gmail.com',
                    'beytullah41@gmail.com'
                ],
                youtube: [
                    {
                        title: 'Akıllı Çiftlik',
                        url: 'https://www.youtube.com/watch?v=_75Q0Y3wIAw'
                    },
                    {
                        title: 'Akıllı Çiftlik Konuğu (5T5)',
                        url: 'https://www.youtube.com/watch?v=TOVbMtTtdVc'
                    },
                    {
                        title: 'Ortaokullarda Akıllı Çiftlik Projesi',
                        url: 'https://www.youtube.com/watch?v=F302yvbg-MI'
                    }
                ],
                expertise: [
                    'Eğitim Teknolojileri',
                    'Dijital İçerik Geliştirme',
                    'Yapay Zekâ ve Üretken Yapay Zekâ',
                    'NFC tabanlı sistemler',
                    '3D üretim ve prototipleme'
                ]
            }),

            aiContext: 'Bilişim teknolojileri öğretmeni, eğitim teknolojileri uzmanı, NFC sistemleri ve 3D teknolojileri konusunda deneyimli.',

            bgColor: '#1e40af',
            textColor: '#ffffff',
            buttonColor: '#3b82f6',

            isPublic: true
        }
    })

    console.log('✅ Kartvizit oluşturuldu:', card.slug)
    console.log('')
    console.log('📌 URL: /beytullah veya /c/beytullah')
}

main()
    .catch((e) => {
        console.error('❌ Hata:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
