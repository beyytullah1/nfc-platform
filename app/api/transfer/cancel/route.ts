import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// Cancel transfer request
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
                toUser: { select: { id: true, name: true } }
            }
        })

        if (!transferRequest) {
            return NextResponse.json({ error: 'Transfer isteği bulunamadı' }, { status: 404 })
        }

        // Check if user is the sender
        if (transferRequest.fromUserId !== session.user.id) {
            return NextResponse.json({ error: 'Bu isteği iptal etme yetkiniz yok' }, { status: 403 })
        }

        // Check if already processed
        if (transferRequest.status !== 'pending') {
            return NextResponse.json({ error: 'Bu istek zaten işlenmiş' }, { status: 400 })
        }

        // Cancel transfer
        await prisma.$transaction(async (tx) => {
            // 1. Update request status
            await tx.transferRequest.update({
                where: { id: requestId },
                data: { status: 'cancelled' }
            })

            // 2. Notify receiver
            await tx.notification.create({
                data: {
                    userId: transferRequest.toUserId,
                    senderId: session.user!.id,
                    type: 'transfer_cancelled',
                    title: 'Hediye İptal Edildi 🚫',
                    body: `${session.user!.name} hediye gönderimini iptal etti.`,
                    data: JSON.stringify({ tagId: transferRequest.tagId })
                }
            })
        })

        return NextResponse.json({ success: true, message: 'Hediye isteği iptal edildi' })
    } catch (error) {
        console.error('Cancel transfer error:', error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
    }
}
