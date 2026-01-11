import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST - Delete an NFC tag (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check admin role
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        if (user?.role !== 'admin') {
            return NextResponse.json({ error: 'Bu işlem için admin yetkisi gerekli' }, { status: 403 })
        }

        const { tagId } = await request.json()

        if (!tagId) {
            return NextResponse.json({ error: 'Tag ID gerekli' }, { status: 400 })
        }

        // Get tag with related items
        const tag = await prisma.nfcTag.findUnique({
            where: { id: tagId },
            include: {
                card: { select: { id: true } },
                plant: { select: { id: true } },
                mug: { select: { id: true } },
                gift: { select: { id: true } },
                page: { select: { id: true } }
            }
        })

        if (!tag) {
            return NextResponse.json({ error: 'Etiket bulunamadı' }, { status: 404 })
        }

        // Check if tag has linked content - warn but allow delete
        const hasLinkedContent = tag.card || tag.plant || tag.mug || tag.gift || tag.page

        // Transaction: Unlink and delete
        await prisma.$transaction(async (tx) => {
            // Unlink from modules first
            if (tag.card) {
                await tx.card.update({
                    where: { id: tag.card.id },
                    data: { tagId: null }
                })
            }
            if (tag.plant) {
                await tx.plant.update({
                    where: { id: tag.plant.id },
                    data: { tagId: null }
                })
            }
            if (tag.mug) {
                await tx.mug.update({
                    where: { id: tag.mug.id },
                    data: { tagId: null }
                })
            }
            if (tag.gift) {
                await tx.gift.update({
                    where: { id: tag.gift.id },
                    data: { tagId: null }
                })
            }
            if (tag.page) {
                await tx.page.update({
                    where: { id: tag.page.id },
                    data: { tagId: null }
                })
            }

            // Delete follows
            await tx.follow.deleteMany({
                where: { tagId }
            })

            // Delete ownership transfers
            await tx.ownershipTransfer.deleteMany({
                where: { tagId }
            })

            // Delete transfer requests
            await tx.transferRequest.deleteMany({
                where: { tagId }
            })

            // Finally delete the tag
            await tx.nfcTag.delete({
                where: { id: tagId }
            })
        })

        return NextResponse.json({
            success: true,
            message: hasLinkedContent
                ? 'Etiket ve bağlantıları silindi'
                : 'Etiket silindi'
        })
    } catch (error) {
        console.error('Delete tag error:', error)
        return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 })
    }
}
