const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Creating beyytullah user and card...');

    // Hash password
    const passwordHash = await bcrypt.hash('beyytullah123', 10);

    // Create or update user
    const user = await prisma.user.upsert({
        where: { username: 'beyytullah' },
        update: {},
        create: {
            email: 'beyytullah@gmail.com',
            username: 'beyytullah',
            name: 'Beytullah Çiçek',
            passwordHash: passwordHash,
            bio: 'Bilişim Teknolojileri Öğretmeni | Eğitim Teknolojileri | Yapay Zekâ',
        },
    });

    console.log('✅ User created:', user.username);

    // Check if card exists
    const existingCard = await prisma.card.findFirst({
        where: { userId: user.id },
    });

    if (existingCard) {
        // Delete existing card and related data
        await prisma.cardField.deleteMany({ where: { cardId: existingCard.id } });
        await prisma.cardLinkGroup.deleteMany({ where: { cardId: existingCard.id } });
        await prisma.card.delete({ where: { id: existingCard.id } });
        console.log('🗑️ Deleted existing card');
    }

    // Create card
    const card = await prisma.card.create({
        data: {
            userId: user.id,
            slug: 'beyytullah',
            cardType: 'personal',
            title: 'Bilişim Teknolojileri Öğretmeni',
            bio: `Eğitim Teknolojileri | Dijital İçerik Geliştirme | Yapay Zekâ ve Üretken Yapay Zekâ | NFC tabanlı sistemler | 3D üretim ve prototipleme`,
            isPublic: true,
            theme: JSON.stringify({ color: '#2ecc71', style: 'modern' }),
        },
    });

    console.log('✅ Card created:', card.slug);

    // Create groups
    const groups = await Promise.all([
        prisma.cardLinkGroup.create({
            data: {
                cardId: card.id,
                name: 'Sosyal Medya',
                icon: '🌐',
                displayOrder: 0,
            },
        }),
        prisma.cardLinkGroup.create({
            data: {
                cardId: card.id,
                name: 'YouTube Videoları',
                icon: '🎬',
                displayOrder: 1,
            },
        }),
        prisma.cardLinkGroup.create({
            data: {
                cardId: card.id,
                name: 'İletişim',
                icon: '📧',
                displayOrder: 2,
            },
        }),
    ]);

    const [socialGroup, youtubeGroup, contactGroup] = groups;
    console.log('✅ Groups created');

    // Create fields
    const fields = [
        // Sosyal Medya
        { cardId: card.id, groupId: socialGroup.id, fieldType: 'linkedin', label: 'LinkedIn', value: 'https://www.linkedin.com/in/beyytullah/', displayOrder: 0 },
        { cardId: card.id, groupId: socialGroup.id, fieldType: 'github', label: 'GitHub', value: 'https://github.com/beyytullah1', displayOrder: 1 },
        { cardId: card.id, groupId: socialGroup.id, fieldType: 'instagram', label: 'Instagram', value: 'https://instagram.com/beyytullah', displayOrder: 2 },
        { cardId: card.id, groupId: socialGroup.id, fieldType: 'twitter', label: 'X (Twitter)', value: 'https://x.com/beyytullah', displayOrder: 3 },
        { cardId: card.id, groupId: socialGroup.id, fieldType: 'facebook', label: 'Facebook', value: 'https://facebook.com/beyytullah', displayOrder: 4 },

        // YouTube Videoları
        { cardId: card.id, groupId: youtubeGroup.id, fieldType: 'youtube', label: 'Akıllı Çiftlik', value: 'https://www.youtube.com/watch?v=_75Q0Y3wIAw', displayOrder: 0 },
        { cardId: card.id, groupId: youtubeGroup.id, fieldType: 'youtube', label: 'Akıllı Çiftlik Konuğu (5T5)', value: 'https://www.youtube.com/watch?v=TOVbMtTtdVc', displayOrder: 1 },
        { cardId: card.id, groupId: youtubeGroup.id, fieldType: 'youtube', label: 'Ortaokullarda Akıllı Çiftlik Projesi', value: 'https://www.youtube.com/watch?v=F302yvbg-MI', displayOrder: 2 },

        // İletişim
        { cardId: card.id, groupId: contactGroup.id, fieldType: 'email', label: 'MEB E-posta', value: 'beytullah.cicek@meb.gov.tr', displayOrder: 0 },
        { cardId: card.id, groupId: contactGroup.id, fieldType: 'email', label: 'Gmail', value: 'beyytullah@gmail.com', displayOrder: 1 },
        { cardId: card.id, groupId: contactGroup.id, fieldType: 'email', label: 'Gmail (Alternatif)', value: 'beytullah41@gmail.com', displayOrder: 2 },
        { cardId: card.id, groupId: contactGroup.id, fieldType: 'whatsapp', label: 'WhatsApp', value: 'https://wa.me/905434675587', displayOrder: 3 },
    ];

    await prisma.cardField.createMany({ data: fields });
    console.log('✅ Fields created:', fields.length);

    console.log('\n🎉 Done! Login credentials:');
    console.log('   Username: beyytullah');
    console.log('   Password: beyytullah123');
    console.log('   Card URL: http://localhost:3000/c/beyytullah');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
