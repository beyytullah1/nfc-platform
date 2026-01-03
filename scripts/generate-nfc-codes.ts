import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Base62 karakterleri (a-z, A-Z, 0-9)
const CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/**
 * Güvenli rastgele kod üretir
 */
function generateSecureCode(length: number = 10): string {
    let code = ''
    const charsetLength = CHARSET.length

    // Crypto-quality randomness için
    const randomValues = new Uint32Array(length)
    crypto.getRandomValues(randomValues)

    for (let i = 0; i < length; i++) {
        code += CHARSET[randomValues[i] % charsetLength]
    }

    return code
}

/**
 * Benzersiz kod seti oluşturur
 */
function generateUniqueCodes(count: number): string[] {
    const codes = new Set<string>()

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

    // 3. Veritabanına ekle
    console.log('💾 Kodlar veritabanına ekleniyor...')
    const insertData = newCodes.map((code, index) => ({
        tagId: `BATCH_${Date.now()}_${index}`,
        publicCode: code,
        status: 'unclaimed',
        isActive: true,
        allowFollow: false,
        isPublic: true,
    }))

    const result = await prisma.nfcTag.createMany({
        data: insertData,
        skipDuplicates: true,
    })
    console.log(`✅ ${result.count} kod veritabanına eklendi.\n`)

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
