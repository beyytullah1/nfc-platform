import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// Accept transfer request
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { requestId } = await request.json()

        if (!requestId) {
            return NextResponse.json({ error: 'Request ID gerekli' }, { status: 400 })
        }

        // Find transfer request
        const transferRequest = await prisma.transferRequest.findUnique({
            where: { id: requestId },
            include: {
                tag: {
                    include: {
                        card: true,
                        plant: true,
                        mug: true,
                        gift: true,
                        page: true
                    }
                },
                fromUser: { select: { id: true, name: true } }
            }
        })

        if (!transferRequest) {
            return NextResponse.json({ error: 'Transfer isteği bulunamadı' }, { status: 404 })
        }

        // Check if user is the receiver
        if (transferRequest.toUserId !== session.user.id) {
            return NextResponse.json({ error: 'Bu isteği kabul etme yetkiniz yok' }, { status: 403 })
        }

        // Check if already processed
        if (transferRequest.status !== 'pending') {
            return NextResponse.json({ error: 'Bu istek zaten işlenmiş' }, { status: 400 })
        }

        // Accept transfer
        await prisma.$transaction(async (tx) => {
            // 1. Update request status
            await tx.transferRequest.update({
                where: { id: requestId },
                data: { status: 'accepted' }
            })

            // 2. Transfer tag ownership
            await tx.nfcTag.update({
                where: { id: transferRequest.tagId },
                data: {
                    ownerId: session.user!.id,
                    status: 'claimed'
                }
            })

            // 3. Update module ownership
            const tag = transferRequest.tag
            if (tag.card) {
                await tx.card.update({
                    where: { id: tag.card.id },
                    data: { userId: session.user!.id }
                })
            }
            if (tag.plant) {
                await tx.plant.update({
                    where: { id: tag.plant.id },
                    data: {
                        ownerId: session.user!.id,
                        isGift: true,
                        giftedById: transferRequest.fromUserId,
                        giftMessage: transferRequest.message
                    }
                })
            }
            if (tag.mug) {
                await tx.mug.update({
                    where: { id: tag.mug.id },
                    data: { ownerId: session.user!.id }
                })
            }
            if (tag.page) {
                await tx.page.update({
                    where: { id: tag.page.id },
                    data: { ownerId: session.user!.id }
                })
            }
            if (tag.gift) {
                await (tx as any).gift.update({
                    where: { id: tag.gift.id },
                    data: { receiverId: session.user!.id }
                })
            }

            // 4. Create ownership transfer record
            await tx.ownershipTransfer.create({
                data: {
                    tagId: transferRequest.tagId,
                    fromUserId: transferRequest.fromUserId,
                    toUserId: session.user!.id,
                    transferType: 'gift',
                    message: transferRequest.message
                }
            })

            // 5. Notify sender
            await tx.notification.create({
                data: {
                    userId: transferRequest.fromUserId!,
                    senderId: session.user!.id,
                    type: 'transfer_accepted',
                    title: 'Hediye Kabul Edildi! ✅',
                    body: `${session.user!.name} hediyenizi kabul etti.`,
                    data: JSON.stringify({ tagId: transferRequest.tagId })
                }
            })
        })

        return NextResponse.json({ success: true, message: 'Hediye kabul edildi!' })
    } catch (error) {
        console.error('Accept transfer error:', error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
    }
}
