import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// Reject transfer request
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
                fromUser: { select: { id: true, name: true } }
            }
        })

        if (!transferRequest) {
            return NextResponse.json({ error: 'Transfer isteği bulunamadı' }, { status: 404 })
        }

        // Check if user is the receiver
        if (transferRequest.toUserId !== session.user.id) {
            return NextResponse.json({ error: 'Bu isteği reddetme yetkiniz yok' }, { status: 403 })
        }

        // Check if already processed
        if (transferRequest.status !== 'pending') {
            return NextResponse.json({ error: 'Bu istek zaten işlenmiş' }, { status: 400 })
        }

        // Reject transfer
        await prisma.$transaction(async (tx) => {
            // 1. Update request status
            await tx.transferRequest.update({
                where: { id: requestId },
                data: { status: 'rejected' }
            })

            // 2. Notify sender
            await tx.notification.create({
                data: {
                    userId: transferRequest.fromUserId!,
                    senderId: session.user!.id,
                    type: 'transfer_rejected',
                    title: 'Hediye Reddedildi ❌',
                    body: `${session.user!.name} hediyenizi reddetti.`,
                    data: JSON.stringify({ tagId: transferRequest.tagId })
                }
            })
        })

        return NextResponse.json({ success: true, message: 'Hediye reddedildi' })
    } catch (error) {
        console.error('Reject transfer error:', error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
    }
}
