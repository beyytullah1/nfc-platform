import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Veritabanı tohumlanıyor...')

  // 1. Temizle
  console.log('🧹 Eski veriler temizleniyor...')
  try {
    const demo = await prisma.user.findUnique({ where: { email: 'demo@nfcplatform.com' } })
    if (demo) {
      await prisma.cardField.deleteMany({ where: { card: { userId: demo.id } } })
      await prisma.card.deleteMany({ where: { userId: demo.id } })
      await prisma.plantLog.deleteMany({ where: { plant: { ownerId: demo.id } } })
      await prisma.plant.deleteMany({ where: { ownerId: demo.id } })
      await prisma.mugLog.deleteMany({ where: { mug: { ownerId: demo.id } } })
      await prisma.mug.deleteMany({ where: { ownerId: demo.id } })
      // Sayfalar ve Bloklar
      await prisma.pageBlock.deleteMany({ where: { page: { ownerId: demo.id } } })
      await prisma.page.deleteMany({ where: { ownerId: demo.id } })

      try {
        // @ts-ignore
        await prisma.gift.deleteMany({ where: { senderId: demo.id } })
      } catch (e) { }
    }
  } catch (e) { console.log('Cleaning skipped/error', e) }

  // 2. Demo Kullanıcısı Oluştur
  const passwordHash = await bcrypt.hash('123456', 10)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@nfcplatform.com' },
    update: {},
    create: {
      email: 'demo@nfcplatform.com',
      name: 'Demo Kullanıcısı',
      passwordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    },
  })
  console.log(`👤 Kullanıcı hazır: ${demoUser.name}`)

  // 3. NFC Etiketleri ve Modüller

  // --- A. Kişisel Profesyonel Kartvizit ---
  const tagPersonal = await prisma.nfcTag.upsert({
    where: { publicCode: 'DEMO_PERSONAL' },
    update: {},
    create: {
      publicCode: 'DEMO_PERSONAL',
      tagId: 'TAG_DEMO_01',
      moduleType: 'card',
      ownerId: demoUser.id,
      claimedAt: new Date(),
    },
  })

  const cardPersonal = await prisma.card.create({
    data: {
      userId: demoUser.id,
      tagId: tagPersonal.id,
      title: 'Kişisel Profilim',
      cardType: 'personal',
      theme: JSON.stringify({ color: '#3b82f6', style: 'modern' }),
      fields: {
        create: [
          { fieldType: 'email', label: 'E-posta', value: 'demo@nfcplatform.com', displayOrder: 1 },
          { fieldType: 'phone', label: 'Telefon', value: '+90 555 123 4567', displayOrder: 2 },
          { fieldType: 'link', label: 'LinkedIn', value: 'https://linkedin.com/in/demo', displayOrder: 3 },
          { fieldType: 'social', label: 'Instagram', value: 'https://instagram.com/demo', displayOrder: 4 },
          { fieldType: 'location', label: 'Ofis Adresi', value: 'Teknopark İstanbul, Pendik', displayOrder: 5 },
          { fieldType: 'text', label: 'Hakkımda', value: 'Yazılım geliştirici ve teknoloji meraklısı.', displayOrder: 6 },
        ]
      }
    }
  })
  console.log(`💳 Kişisel Kartvizit oluşturuldu: ${cardPersonal.title}`)


  // --- B. Sağlık Kartviziti ---
  const tagHealth = await prisma.nfcTag.upsert({
    where: { publicCode: 'DEMO_HEALTH' },
    update: {},
    create: {
      publicCode: 'DEMO_HEALTH',
      tagId: 'TAG_DEMO_02',
      moduleType: 'card',
      ownerId: demoUser.id,
      claimedAt: new Date(),
    },
  })

  const cardHealth = await prisma.card.create({
    data: {
      userId: demoUser.id,
      tagId: tagHealth.id,
      title: 'Acil Durum & Sağlık',
      cardType: 'health',
      theme: JSON.stringify({ color: '#ef4444', style: 'minimal' }),
      fields: {
        create: [
          { fieldType: 'text', label: 'Kan Grubu', value: 'A Rh+', displayOrder: 1, privacyLevel: 0 },
          { fieldType: 'phone', label: 'Acil Durum (Annem)', value: '+90 555 999 8877', displayOrder: 2, privacyLevel: 0 },
          { fieldType: 'text', label: 'Alerjiler', value: 'Penisilin, Yer Fıstığı', displayOrder: 3, privacyLevel: 0 },
          { fieldType: 'text', label: 'Kronik Hastalıklar', value: 'Yok', displayOrder: 4, privacyLevel: 0 },
          { fieldType: 'text', label: 'İlaçlar', value: 'Günlük Vitamin', displayOrder: 5, privacyLevel: 1 },
        ]
      }
    }
  })
  console.log(`🏥 Sağlık Kartviziti oluşturuldu: ${cardHealth.title}`)


  // --- C. Çocuk Kartviziti ---
  const tagChild = await prisma.nfcTag.upsert({
    where: { publicCode: 'DEMO_CHILD' },
    update: {},
    create: {
      publicCode: 'DEMO_CHILD',
      tagId: 'TAG_DEMO_03',
      moduleType: 'card',
      ownerId: demoUser.id,
      claimedAt: new Date(),
    },
  })

  const cardChild = await prisma.card.create({
    data: {
      userId: demoUser.id,
      tagId: tagChild.id,
      title: 'Okul Kartı (Ali)',
      cardType: 'child',
      theme: JSON.stringify({ color: '#f59e0b', style: 'playful' }),
      fields: {
        create: [
          { fieldType: 'phone', label: 'Baba Telefon', value: '+90 532 111 2233', displayOrder: 1 },
          { fieldType: 'phone', label: 'Anne Telefon', value: '+90 533 444 5566', displayOrder: 2 },
          { fieldType: 'text', label: 'Okul', value: 'Gökkuşağı Anaokulu', displayOrder: 3 },
          { fieldType: 'location', label: 'Ev Adresi', value: 'Çiçek Mah. Böcek Sok. No:5 (Sadece Polis Görsün)', displayOrder: 4, privacyLevel: 3 },
        ]
      }
    }
  })
  console.log(`🧸 Çocuk Kartviziti oluşturuldu: ${cardChild.title}`)


  // --- D. Yaşlı Kartviziti (Elderly) ---
  const tagElderly = await prisma.nfcTag.upsert({
    where: { publicCode: 'DEMO_ELDERLY' },
    update: {},
    create: {
      publicCode: 'DEMO_ELDERLY',
      tagId: 'TAG_DEMO_07',
      moduleType: 'card',
      ownerId: demoUser.id,
      claimedAt: new Date(),
    },
  })

  const cardElderly = await prisma.card.create({
    data: {
      userId: demoUser.id,
      tagId: tagElderly.id,
      title: 'Huzurevi Kimliği (Ahmet Amca)',
      cardType: 'elderly',
      theme: JSON.stringify({ color: '#64748b', style: 'simple' }),
      fields: {
        create: [
          { fieldType: 'text', label: 'Ad Soyad', value: 'Ahmet Yılmaz', displayOrder: 1 },
          { fieldType: 'phone', label: 'Oğlu (Mehmet)', value: '+90 555 111 2233', displayOrder: 2 },
          { fieldType: 'text', label: 'Doktoru', value: 'Dr. Ayşe (0212 123 4567)', displayOrder: 3 },
          { fieldType: 'text', label: 'İlaç Saatleri', value: 'Sabah: Tansiyon, Akşam: Şeker', displayOrder: 4 },
        ]
      }
    }
  })
  console.log(`👴 Yaşlı Kartviziti oluşturuldu: ${cardElderly.title}`)


  // --- E. Evcil Hayvan Kartviziti (Pet) ---
  const tagPet = await prisma.nfcTag.upsert({
    where: { publicCode: 'DEMO_PET' },
    update: {},
    create: {
      publicCode: 'DEMO_PET',
      tagId: 'TAG_DEMO_08',
      moduleType: 'card',
      ownerId: demoUser.id,
      claimedAt: new Date(),
    },
  })

  const cardPet = await prisma.card.create({
    data: {
      userId: demoUser.id,
      tagId: tagPet.id,
      title: 'Pati Kartı (Boncuk)',
      cardType: 'pet',
      theme: JSON.stringify({ color: '#ec4899', style: 'cute' }),
      fields: {
        create: [
          { fieldType: 'text', label: 'İsim', value: 'Boncuk (Tekir Kedi)', displayOrder: 1 },
          { fieldType: 'phone', label: 'Sahibi', value: '+90 555 777 8899', displayOrder: 2 },
          { fieldType: 'text', label: 'Veteriner', value: 'Pati Vet (0216 333 4455)', displayOrder: 3 },
          { fieldType: 'text', label: 'Çip No', value: '9840234234', displayOrder: 4, privacyLevel: 2 },
          { fieldType: 'text', label: 'Aşılar', value: 'Kuduz, Karma (Tamamlandı)', displayOrder: 5 },
        ]
      }
    }
  })
  console.log(`🐾 Pati Kartviziti oluşturuldu: ${cardPet.title}`)


  // --- F. Bitki Örneği ---
  const tagPlant = await prisma.nfcTag.upsert({
    where: { publicCode: 'DEMO_PLANT' },
    update: {},
    create: { publicCode: 'DEMO_PLANT', tagId: 'TAG_DEMO_04', moduleType: 'plant', ownerId: demoUser.id, claimedAt: new Date() }
  })
  const plant = await prisma.plant.create({
    data: {
      name: 'Ofis Paşa Kılıcı',
      ownerId: demoUser.id,
      tagId: tagPlant.id,
      logs: {
        create: [
          { logType: 'water', amountMl: 200, createdAt: new Date(Date.now() - 86400000 * 2) },
          { logType: 'fertilizer', content: 'Sıvı gübre verildi', createdAt: new Date(Date.now() - 86400000 * 10) }
        ]
      }
    }
  })
  console.log(`🌱 Bitki oluşturuldu: ${plant.name}`)


  // --- G. Kupa Örneği ---
  const tagMug = await prisma.nfcTag.upsert({
    where: { publicCode: 'DEMO_MUG' },
    update: {},
    create: { publicCode: 'DEMO_MUG', tagId: 'TAG_DEMO_05', moduleType: 'mug', ownerId: demoUser.id, claimedAt: new Date() }
  })
  const mug = await prisma.mug.create({
    data: {
      name: 'Sihirli Kupa ☕',
      ownerId: demoUser.id,
      tagId: tagMug.id,
      logs: {
        create: [
          { logType: 'coffee', note: 'Latte', createdAt: new Date() },
          { logType: 'water', note: 'Su hedefi tuttu', createdAt: new Date(Date.now() - 3600000) }
        ]
      }
    }
  })
  console.log(`☕ Kupa oluşturuldu: ${mug.name}`)


  // --- H. Hediye Örneği ---
  const tagGift = await prisma.nfcTag.upsert({
    where: { publicCode: 'DEMO_GIFT' },
    update: {},
    create: { publicCode: 'DEMO_GIFT', tagId: 'TAG_DEMO_06', moduleType: 'gift', ownerId: demoUser.id, claimedAt: new Date() }
  })
  // @ts-ignore
  const gift = await prisma.gift.create({
    data: {
      tagId: tagGift.id,
      senderId: demoUser.id,
      title: 'Doğum Günün Kutlu Olsun! 🎂',
      message: 'Yeni yaşın sana sağlık ve mutluluk getirsin! Seni çok seviyoruz.',
      giftType: 'birthday',
      mediaUrl: 'https://images.unsplash.com/photo-1513151227397-3f9679ec1697?q=80&w=1000&auto=format&fit=crop',
      senderName: 'En Yakın Arkadaşın',
      spotifyUrl: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT'
    }
  })
  console.log(`🎁 Hediye oluşturuldu: ${gift.title}`)


  // --- I. Sayfa (Canvas) Örneği ---
  const tagCanvas = await prisma.nfcTag.upsert({
    where: { publicCode: 'DEMO_CANVAS' },
    update: {},
    create: { publicCode: 'DEMO_CANVAS', tagId: 'TAG_DEMO_09', moduleType: 'canvas', ownerId: demoUser.id, claimedAt: new Date() }
  })

  const page = await prisma.page.create({
    data: {
      title: 'Bizim Hikayemiz ❤️',
      ownerId: demoUser.id,
      tagId: tagCanvas.id,
      moduleType: 'canvas',
      theme: 'romance',
      blocks: {
        create: [
          { blockType: 'image', content: JSON.stringify({ url: 'https://images.unsplash.com/photo-1522673607200-1645062cd955?w=800' }), displayOrder: 1 },
          { blockType: 'text', content: JSON.stringify({ text: 'Bu bizim hikayemizin başladığı gün...' }), displayOrder: 2 },
          { blockType: 'video', content: JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }), displayOrder: 3 }, // Örnek video
          { blockType: 'gallery', content: JSON.stringify(['https://picsum.photos/200', 'https://picsum.photos/201']), displayOrder: 4 },
        ]
      }
    }
  })
  console.log(`📄 Sayfa (Canvas) oluşturuldu: ${page.title}`)


  console.log('✅ Tohumlama tamamlandı! Demo kullanıcısı: demo@nfcplatform.com / 123456')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
