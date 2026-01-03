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
        const { tagId } = body

        if (!tagId) {
            return NextResponse.json(
                { error: 'Tag ID gerekli' },
                { status: 400 }
            )
        }

        // Tag'i bul
        const tag = await prisma.nfcTag.findUnique({
            where: { id: tagId },
            include: {
                card: true,
                plant: true,
                mug: true,
                page: true
            }
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

        // Bağlantı çözme işlemi
        const updates: any[] = []

        // Tag'i güncelle
        updates.push(
            prisma.nfcTag.update({
                where: { id: tagId },
                data: {
                    moduleType: null,
                    status: 'claimed' // Sahipli ama bağlantısız
                }
            })
        )

        // İlgili modülün tagId'sini temizle
        if (tag.card) {
            updates.push(
                prisma.card.update({
                    where: { id: tag.card.id },
                    data: { tagId: null }
                })
            )
        } else if (tag.plant) {
            updates.push(
                prisma.plant.update({
                    where: { id: tag.plant.id },
                    data: { tagId: null }
                })
            )
        } else if (tag.mug) {
            updates.push(
                prisma.mug.update({
                    where: { id: tag.mug.id },
                    data: { tagId: null }
                })
            )
        } else if (tag.page) {
            updates.push(
                prisma.page.update({
                    where: { id: tag.page.id },
                    data: { tagId: null }
                })
            )
        }

        await prisma.$transaction(updates)

        return NextResponse.json({
            success: true,
            message: 'NFC bağlantısı başarıyla kaldırıldı'
        })

    } catch (error) {
        console.error('Unlink NFC error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}
