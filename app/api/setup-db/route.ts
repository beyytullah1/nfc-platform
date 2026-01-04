import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        // Migration yoksa tablolar yok demektir
        // Prisma Client ile basit bir query çalıştırarak test edelim

        // Önce connection test
        await prisma.$connect()

        // Şimdi migration deploy - bu Vercel'de çalışmayabilir, o yüzden alternatif yol:
        // En basit yol: Basit bir query ile test et, migration'lar otomatik uygulanır

        const userCount = await prisma.user.count()

        return NextResponse.json({
            success: true,
            message: 'Database bağlantısı başarılı',
            userCount,
            info: 'Migration için Vercel CLI kullanın: vercel env pull && npx prisma migrate deploy'
        })
    } catch (error: any) {
        // Eğer tablo yoksa hata alacağız
        if (error.message?.includes('relation') || error.message?.includes('table')) {
            return NextResponse.json({
                error: 'Database tabloları yok',
                message: 'Migration gerekli. Vercel CLI ile: npx prisma migrate deploy',
                detail: error.message
            }, { status: 500 })
        }

        return NextResponse.json({
            error: 'Database bağlantı hatası',
            detail: error.message
        }, { status: 500 })
    }
}
