const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Demo Verisi Ekleniyor...')

    const email = 'demo@nfc.com'
    const password = '123'
    const passwordHash = await bcrypt.hash(password, 10)

    // 1. Temizlik
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
        console.log('🗑️ Eski demo kullanıcı siliniyor...')
        // İlişkili kayıtları da temizlemek gerekebilir ama cascade genelde halleder. 
        // Garanti olsun diye önce card'ları silelim mi? Gerek yok, Prisma User silinince bağlı field'ları silmeyebilir ama user silinirse cascade tanımlı değilse hata verebilir.
        // Şemada onDelete: Cascade var mı? Card -> User ilişkisinde yok.
        // O yüzden manuel temizlik daha güvenli.

        // Önce kullanıcıya ait olan alt verileri silelim
        const userId = existingUser.id
        await prisma.cardField.deleteMany({ where: { card: { userId } } })
        await prisma.card.deleteMany({ where: { userId } })
        await prisma.plantLog.deleteMany({ where: { plant: { ownerId: userId } } })
        await prisma.plantAiChat.deleteMany({ where: { plant: { ownerId: userId } } })
        await prisma.plant.deleteMany({ where: { ownerId: userId } })
        await prisma.mugLog.deleteMany({ where: { mug: { ownerId: userId } } })
        await prisma.mug.deleteMany({ where: { ownerId: userId } })
        await prisma.gift.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } })

        await prisma.user.delete({ where: { email } })
    }

    // 2. Kullanıcı Oluştur
    const user = await prisma.user.create({
        data: {
            email,
            name: 'Demo Kullanıcı',
            username: 'demo_user',
            passwordHash,
            bio: 'NFC Platform özelliklerini test eden demo hesabı.',
            // settings alanı yok, kaldırıldı.
        }
    })

    console.log(`✅ Kullanıcı oluşturuldu: ${user.email} (Şifre: ${password})`)

    // 3. Kartvizitler (5 Farklı Senaryo)
    // fields ilişkisini { create: [...] } ile ekliyoruz.

    // A. Kurumsal CEO
    await prisma.card.create({
        data: {
            userId: user.id,
            title: 'Profesyonel Profil',
            slug: 'ceo-profile',
            theme: 'professional',
            fields: {
                create: [
                    { fieldType: 'phone', label: 'İş Telefonu', value: '+90 555 111 22 33', displayOrder: 1 },
                    { fieldType: 'email', label: 'E-posta', value: 'ceo@sirket.com', displayOrder: 2 },
                    { fieldType: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/demo', displayOrder: 3 },
                    { fieldType: 'website', label: 'Şirket Web', value: 'www.sirket.com', displayOrder: 4 },
                    { fieldType: 'custom', label: 'Ofis Adresi', value: 'Maslak Plaza, Kat: 42, İstanbul', displayOrder: 5 }
                ]
            }
        }
    })
    console.log('Card 1: Kurumsal eklendi.')

    // B. Sosyal / Influencer
    await prisma.card.create({
        data: {
            userId: user.id,
            title: 'Sosyal Medya',
            slug: 'social-vibes',
            theme: 'modern',
            fields: {
                create: [
                    { fieldType: 'instagram', label: 'Instagram', value: '@demo_style', displayOrder: 1 },
                    { fieldType: 'twitter', label: 'X / Twitter', value: '@demo_tweets', displayOrder: 2 },
                    { fieldType: 'custom', label: 'Spotify', value: 'spotify:playlist:123', displayOrder: 3 }, // spotify type yoksa custom
                    { fieldType: 'youtube', label: 'YouTube Kanalım', value: 'youtube.com/demo', displayOrder: 4 }
                ]
            }
        }
    })
    console.log('Card 2: Sosyal eklendi.')

    // C. Çocuk Güvenlik Kartı
    await prisma.card.create({
        data: {
            userId: user.id,
            title: 'Acil Durum (Çocuk)',
            slug: 'kaybolursam-tara',
            theme: 'playful',
            bio: 'Merhaba, benim adım Can. Eğer kaybolmuşsam lütfen ailemi arayın.',
            fields: {
                create: [
                    { fieldType: 'phone', label: 'ANNEMİ ARA', value: '+90 555 999 88 77', displayOrder: 1 },
                    { fieldType: 'phone', label: 'BABAMI ARA', value: '+90 555 999 88 66', displayOrder: 2 },
                    { fieldType: 'custom', label: 'Kan Grubu', value: 'A Rh+', displayOrder: 3 },
                    { fieldType: 'custom', label: 'Alerjiler', value: 'Fıstık alerjisi var!', displayOrder: 4 }
                ]
            }
        }
    })
    console.log('Card 3: Çocuk Güvenlik eklendi.')

    // D. Yaşlı Sağlık Kartı
    await prisma.card.create({
        data: {
            userId: user.id,
            title: 'Sağlık Bilgileri',
            slug: 'saglik-karti',
            theme: 'medical',
            bio: 'Bu kart acil durumlarda sağlık personeli içindir.',
            fields: {
                create: [
                    { fieldType: 'custom', label: 'Ad Soyad', value: 'Ahmet Yılmaz (72)', displayOrder: 1 },
                    { fieldType: 'custom', label: 'Hastalıklar', value: 'Diyabet, Hipertansiyon', displayOrder: 2 },
                    { fieldType: 'custom', label: 'Kullanılan İlaçlar', value: 'İnsülin, Aspirin', displayOrder: 3 },
                    { fieldType: 'phone', label: 'Oğlu (Acil)', value: '+90 555 123 45 67', displayOrder: 4 },
                    { fieldType: 'custom', label: 'Hastane Dosya No', value: '#12345678', displayOrder: 5 }
                ]
            }
        }
    })
    console.log('Card 4: Yaşlı Sağlık eklendi.')

    // E. Gamer / Oyun Profili
    await prisma.card.create({
        data: {
            userId: user.id,
            title: 'Oyun Profili',
            slug: 'gamer-tag',
            theme: 'cyberpunk',
            fields: {
                create: [
                    // discord/steam yoksa custom
                    { fieldType: 'custom', label: 'Discord', value: 'GamerKing#1234', displayOrder: 1 },
                    { fieldType: 'custom', label: 'Steam ID', value: 'steamcommunity.com/id/gamer', displayOrder: 2 },
                    { fieldType: 'custom', label: 'Twitch', value: 'twitch.tv/gamer', displayOrder: 3 }
                ]
            }
        }
    })
    console.log('Card 5: Gamer eklendi.')

    // 4. Bitkiler
    await prisma.plant.create({
        data: {
            ownerId: user.id,
            name: 'Ofis Paşa Kılıcı',
            species: 'Sansevieria', // type değil species
            coverImageUrl: 'https://images.unsplash.com/photo-1599598425947-738d046eb20a?w=400',
            // waterInterval yok şemada? Kontrol etmedim ama varsayalım yoksa hata verir.
            // Şemada waterInterval YOK! Kaldıralım.
            logs: {
                create: [
                    { logType: 'water', content: 'Bugün suladım, yaprakları sildim.' }, // note değil content
                    { logType: 'photo', content: 'Yeni yaprak veriyor!' }
                ]
            }
        }
    })
    console.log('Bitki: Paşa Kılıcı eklendi.')

    // 5. Kupalar
    await prisma.mug.create({
        data: {
            ownerId: user.id,
            name: 'Uğurlu Kupa',
            theme: 'dark',
            // totalDrank yok şemada.
            logs: {
                create: [
                    { logType: 'coffee', amountMl: 200 }, // amount değil amountMl
                    { logType: 'water', amountMl: 250 },
                    { logType: 'tea', amountMl: 150 }
                ]
            }
        }
    })
    console.log('Kupa: Uğurlu Kupa eklendi.')

    // 6. Hediyeler
    await prisma.gift.create({
        data: {
            senderId: user.id,
            title: 'Doğum Günün Kutlu Olsun!',
            message: 'Umarım yeni yaşın sana şans getirir. Seni seviyoruz!',
            password: 'sürpriz',
            spotifyUrl: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
            // theme yok, kaldırıldı.
        }
    })
    console.log('Hediye: Doğum günü mesajı eklendi.')

    console.log('🚀 TÜM DEMO VERİLERİ BAŞARIYLA YÜKLENDİ!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
