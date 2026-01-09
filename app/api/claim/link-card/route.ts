import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Lütfen giriş yapın' }, { status: 401 })
        }

        const body = await request.json()
        const { code, cardId } = body

        if (!code || !cardId) {
            return NextResponse.json(
                { error: 'Kod ve kart ID gerekli' },
                { status: 400 }
            )
        }

        // Tag'i bul
        const tag = await prisma.nfcTag.findUnique({
            where: { publicCode: code }
        })

        if (!tag) {
            return NextResponse.json(
                { error: 'NFC etiketi bulunamadı' },
                { status: 404 }
            )
        }

        // Tag zaten sahiplenilmiş mi kontrol et
        if (tag.ownerId && tag.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Bu etiket başkasına ait' },
                { status: 403 }
            )
        }

        // Kartın varlığını ve sahipliğini kontrol et
        const card = await prisma.card.findUnique({
            where: { id: cardId }
        })

        if (!card) {
            return NextResponse.json(
                { error: 'Kart bulunamadı' },
                { status: 404 }
            )
        }

        if (card.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Bu kart size ait değil' },
                { status: 403 }
            )
        }

        // Kart zaten başka bir tag'e bağlı mı?
        if (card.tagId && card.tagId !== tag.id) {
            return NextResponse.json(
                { error: 'Bu kart zaten başka bir NFC\'ye bağlı' },
                { status: 400 }
            )
        }

        // Eşleştirme işlemi
        await prisma.$transaction([
            // Tag'i claim et ve karta bağla
            prisma.nfcTag.update({
                where: { id: tag.id },
                data: {
                    ownerId: session.user.id,
                    moduleType: 'card',
                    status: 'linked',
                    claimedAt: tag.claimedAt || new Date()
                }
            }),
            // Kartı güncelle
            prisma.card.update({
                where: { id: cardId },
                data: {
                    tagId: tag.id
                }
            })
        ])

        // Karta yönlendir
        return NextResponse.json({
            success: true,
            redirect: `/${card.slug || card.id}`
        })

    } catch (error) {
        console.error('Link card error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}
