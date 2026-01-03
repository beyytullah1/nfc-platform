import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { code, cardId } = body

        if (!code || !cardId) {
            return NextResponse.json(
                { error: 'Eksik bilgi.' },
                { status: 400 }
            )
        }

        // Auth kontrolü
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.', redirect: '/login' },
                { status: 401 }
            )
        }

        // Kartviziti kontrol et
        const card = await prisma.card.findUnique({
            where: {
                id: cardId,
                userId: session.user.id // Sadece kendi kartvizitini bağlayabilir
            },
            include: { tag: true }
        })

        if (!card) {
            return NextResponse.json(
                { error: 'Kartvizit bulunamadı veya size ait değil.' },
                { status: 404 }
            )
        }

        // Kartvizit zaten bir NFC'ye bağlı mı?
        if (card.tagId) {
            return NextResponse.json(
                { error: 'Bu kartvizit zaten bir NFC etiketine bağlı.' },
                { status: 400 }
            )
        }

        // NFC tag'i bul veya oluştur
        let tag = await prisma.nfcTag.findUnique({
            where: { publicCode: code }
        })

        if (!tag) {
            return NextResponse.json(
                { error: 'NFC etiketi bulunamadı.' },
                { status: 404 }
            )
        }

        if (tag.ownerId && tag.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Bu etiket başka bir kullanıcıya ait.' },
                { status: 400 }
            )
        }

        // Etiket zaten bir modüle bağlı mı?
        if (tag.moduleType && tag.status !== 'unclaimed') {
            return NextResponse.json(
                { error: 'Bu etiket zaten kullanımda.' },
                { status: 400 }
            )
        }

        // Transaction ile NFC'yi kartvizite bağla
        await prisma.$transaction([
            // Tag'i güncelle
            prisma.nfcTag.update({
                where: { id: tag.id },
                data: {
                    ownerId: session.user.id,
                    moduleType: 'card',
                    status: 'linked',
                    claimedAt: new Date()
                }
            }),
            // Kartviziti güncelle
            prisma.card.update({
                where: { id: cardId },
                data: {
                    tagId: tag.id
                }
            }),
            // Transfer kaydı oluştur
            prisma.ownershipTransfer.create({
                data: {
                    tagId: tag.id,
                    toUserId: session.user.id,
                    transferType: 'claim',
                    message: 'NFC etiketi mevcut kartvizite bağlandı'
                }
            })
        ])

        return NextResponse.json({
            success: true,
            redirect: `/dashboard/cards/${cardId}`
        })
    } catch (error) {
        console.error('Link card error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}
