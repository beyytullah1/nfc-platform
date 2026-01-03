import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { publicCode, cardId } = body

        if (!publicCode || !cardId) {
            return NextResponse.json(
                { error: 'Public code ve card ID gerekli' },
                { status: 400 }
            )
        }

        // Tag'i bul
        const tag = await prisma.nfcTag.findUnique({
            where: { publicCode },
            include: { card: true }
        })

        if (!tag) {
            return NextResponse.json(
                { error: 'NFC tag bulunamadı' },
                { status: 404 }
            )
        }

        // Sahiplik kontrolü
        if (tag.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Bu tag size ait değil' },
                { status: 403 }
            )
        }

        // Kartın varlığını kontrol et
        const card = await prisma.card.findUnique({
            where: { id: cardId }
        })

        if (!card) {
            return NextResponse.json(
                { error: 'Kart bulunamadı' },
                { status: 404 }
            )
        }

        // Kartın kullanıcıya ait olduğunu kontrol et
        if (card.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Bu kart size ait değil' },
                { status: 403 }
            )
        }

        // Kartın zaten başka bir tag'e bağlı olup olmadığını kontrol et
        if (card.tagId && card.tagId !== tag.id) {
            return NextResponse.json(
                { error: 'Bu kart zaten başka bir NFC\'ye bağlı' },
                { status: 400 }
            )
        }

        // Eşleştirme işlemi
        await prisma.$transaction([
            // Tag'i güncelle
            prisma.nfcTag.update({
                where: { id: tag.id },
                data: {
                    moduleType: 'card',
                    status: 'linked'
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

        return NextResponse.json({
            success: true,
            message: 'NFC tag başarıyla karta bağlandı'
        })

    } catch (error) {
        console.error('Link to card error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}
