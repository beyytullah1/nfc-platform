const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const prisma = new PrismaClient()

// Base62 karakterleri (a-z, A-Z, 0-9)
const CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/**
 * Güvenli rastgele kod üretir
 */
function generateSecureCode(length = 10) {
    let code = ''
    const charsetLength = CHARSET.length

    // Crypto-quality randomness
    const randomBytes = crypto.randomBytes(length * 4)

    for (let i = 0; i < length; i++) {
        const randomValue = randomBytes.readUInt32LE(i * 4)
        code += CHARSET[randomValue % charsetLength]
    }

    return code
}

/**
 * Benzersiz kod seti oluşturur
 */
function generateUniqueCodes(count) {
    const codes = new Set()

    while (codes.size < count) {
        codes.add(generateSecureCode(10))
    }

    return Array.from(codes)
}

async function main() {
    console.log('🚀 NFC Kod Üretimi Başlıyor...\n')

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const CODE_COUNT = 500
    const TIMESTAMP = new Date().toISOString()

    // 1. Benzersiz kodlar üret
    console.log(`📝 ${CODE_COUNT} adet benzersiz kod üretiliyor...`)
    const codes = generateUniqueCodes(CODE_COUNT)
    console.log(`✅ ${codes.length} kod üretildi.\n`)

    // 2. Mevcut kodları kontrol et (çakışma önleme)
    console.log('🔍 Veritabanında mevcut kodlar kontrol ediliyor...')
    const existingTags = await prisma.nfcTag.findMany({
        select: { publicCode: true }
    })
    const existingCodes = new Set(existingTags.map(t => t.publicCode))

    const newCodes = codes.filter(code => !existingCodes.has(code))
    console.log(`✅ ${newCodes.length} yeni kod hazır (${codes.length - newCodes.length} çakışma filtrelendi).\n`)

    // 3. Veritabanına tek tek ekle (SQLite uyumlu)
    console.log('💾 Kodlar veritabanına ekleniyor...')
    let insertedCount = 0

    for (let i = 0; i < newCodes.length; i++) {
        const code = newCodes[i]
        try {
            await prisma.nfcTag.create({
                data: {
                    tagId: `BATCH_${Date.now()}_${i}`,
                    publicCode: code,
                    status: 'unclaimed',
                    isActive: true,
                    allowFollow: false,
                    isPublic: true,
                }
            })
            insertedCount++
            if ((i + 1) % 50 === 0 || i === newCodes.length - 1) {
                process.stdout.write(`\r   İlerleme: ${i + 1}/${newCodes.length}`)
            }
        } catch (err) {
            // Duplikat hatası - devam et
        }
    }
    console.log(`\n✅ ${insertedCount} kod veritabanına eklendi.\n`)

    // 4. CSV dosyası oluştur
    console.log('📄 CSV dosyası oluşturuluyor...')
    const csvHeader = 'Kod,URL,OlusturmaTarihi,Durum'
    const csvRows = newCodes.map(code =>
        `${code},${BASE_URL}/${code},${TIMESTAMP},unclaimed`
    )
    const csvContent = [csvHeader, ...csvRows].join('\n')

    const outputPath = path.join(process.cwd(), 'public', 'nfc-codes.csv')
    fs.writeFileSync(outputPath, csvContent, 'utf-8')
    console.log(`✅ CSV dosyası oluşturuldu: ${outputPath}\n`)

    // 5. Özet
    console.log('═══════════════════════════════════════════')
    console.log('📊 ÖZET')
    console.log('═══════════════════════════════════════════')
    console.log(`   Üretilen Kod Sayısı: ${newCodes.length}`)
    console.log(`   Veritabanına Eklenen: ${insertedCount}`)
    console.log(`   Base URL: ${BASE_URL}`)
    console.log(`   CSV Dosyası: public/nfc-codes.csv`)
    console.log(`   Örnek URL: ${BASE_URL}/${newCodes[0]}`)
    console.log('═══════════════════════════════════════════\n')

    console.log('🎉 İşlem tamamlandı!')
}

main()
    .catch((e) => {
        console.error('❌ Hata:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
