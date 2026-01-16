export const runtime = "nodejs"

import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { code, moduleType } = body

        if (!code) {
            return NextResponse.json(
                { error: 'NFC kodu gerekli.' },
                { status: 400 }
            )
        }

        // Tag'i bul
        const tag = await prisma.nfcTag.findUnique({
            where: { publicCode: code }
        })

        if (!tag) {
            return NextResponse.json(
                { error: 'Geçersiz NFC kodu. Lütfen kodu kontrol edin.' },
                { status: 404 }
            )
        }

        // Zaten sahipli mi?
        if (tag.ownerId) {
            if (tag.ownerId === session.user.id) {
                return NextResponse.json(
                    { error: 'Bu etikete zaten sahipsiniz.' },
                    { status: 400 }
                )
            }
            return NextResponse.json(
                { error: 'Bu etiket başka bir kullanıcıya ait.' },
                { status: 400 }
            )
        }

        // Claim işlemi
        await prisma.nfcTag.update({
            where: { id: tag.id },
            data: {
                ownerId: session.user.id,
                claimedAt: new Date(),
                status: 'claimed',
                moduleType: moduleType || tag.moduleType // Use provided type or keep existing
            }
        })

        return NextResponse.json({ success: true, message: 'Etiket başarıyla eklendi.' })

    } catch (error) {
        console.error('Manual claim error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}
