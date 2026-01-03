const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * Public Code Üretici
 * Format: 10 karakter, alfanumerik (A-Z, 0-9)
 * Örnek: KWNKCiL338, DEMO2026, ABC1234XYZ
 */
function generatePublicCode(length = 10) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Karışık harfler (I, O, 0, 1 hariç - okunabilirlik için)
    let code = ''
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

/**
 * Unique Public Code Üret (veritabanında kontrol ederek)
 */
async function generateUniquePublicCode(length = 10, maxRetries = 10) {
    for (let i = 0; i < maxRetries; i++) {
        const code = generatePublicCode(length)

        // Veritabanında var mı kontrol et
        const existing = await prisma.nfcTag.findUnique({
            where: { publicCode: code }
        })

        if (!existing) {
            return code // Benzersiz kod bulundu
        }
    }

    throw new Error(`${maxRetries} denemede benzersiz kod üretilemedi. Kod uzunluğunu artırın.`)
}

/**
 * TOPLU KOD ÜRETİCİ
 * Kullanım: node generate-public-codes.js [adet] [uzunluk]
 */
async function main() {
    const count = parseInt(process.argv[2]) || 10 // Varsayılan: 10 kod
    const length = parseInt(process.argv[3]) || 10 // Varsayılan: 10 karakter

    console.log(`\n🔧 ${count} adet ${length} karakterli public code üretiliyor...\n`)

    const codes = []

    for (let i = 0; i < count; i++) {
        const code = await generateUniquePublicCode(length)
        codes.push(code)

        // Progress
        if ((i + 1) % 10 === 0 || i === count - 1) {
            console.log(`✓ İlerleme: ${i + 1}/${count}`)
        }
    }

    console.log(`\n✅ ${codes.length} kod başarıyla üretildi!\n`)
    console.log('📋 KODLAR:')
    console.log('='.repeat(50))

    codes.forEach((code, index) => {
        console.log(`${(index + 1).toString().padStart(3)}. ${code}`)
    })

    console.log('='.repeat(50))
    console.log('\n💡 Kullanım Örnekleri:')
    console.log(`   URL: http://localhost:3000/t/${codes[0]}`)
    console.log(`   NFC: Kodu tag'e yaz ve kullan`)

    // CSV olarak kaydet?
    console.log('\n💾 CSV dosyası olarak kaydetmek ister misiniz? (Y/N)')
    console.log('   Şimdilik ekrana yazdırıldı.')

    await prisma.$disconnect()
}

main().catch(console.error)
