import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.' },
                { status: 401 }
            )
        }

        const { requestId, action } = await request.json()

        if (!requestId || !action || !['accept', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Geçersiz istek.' },
                { status: 400 }
            )
        }

        // İstek kontrolü
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
                }
            }
        })

        if (!transferRequest) {
            return NextResponse.json(
                { error: 'Transfer isteği bulunamadı.' },
                { status: 404 }
            )
        }

        // Sadece alıcı cevaplayabilir
        if (transferRequest.toUserId !== session.user.id) {
            return NextResponse.json(
                { error: 'Bu isteğe cevap verme yetkiniz yok.' },
                { status: 403 }
            )
        }

        // Zaten işlem yapılmış mı?
        if (transferRequest.status !== 'pending') {
            return NextResponse.json(
                { error: 'Bu istek zaten sonuçlanmış.' },
                { status: 400 }
            )
        }

        await prisma.$transaction(async (tx) => {
            if (action === 'reject') {
                // REDDETME
                await tx.transferRequest.update({
                    where: { id: requestId },
                    data: { status: 'rejected' }
                })

                // Gönderene bildirim
                await tx.notification.create({
                    data: {
                        userId: transferRequest.fromUserId,
                        type: 'transfer_rejected',
                        title: 'Transfer Reddedildi ❌',
                        body: `${session.user!.name} transfer isteğini reddetti.`
                    }
                })

            } else if (action === 'accept') {
                // KABUL ETME
                const tagId = transferRequest.tagId
                const toUserId = session.user!.id
                const tag = transferRequest.tag

                // Sahiplik güncelleme (NfcTag)
                await tx.nfcTag.update({
                    where: { id: tagId },
                    data: {
                        ownerId: toUserId,
                        status: 'claimed'
                    }
                })

                // Modül bazlı güncellemeler
                if (tag.card) {
                    await tx.card.update({
                        where: { id: tag.card.id },
                        data: { userId: toUserId }
                    })
                }
                if (tag.plant) {
                    await tx.plant.update({
                        where: { id: tag.plant.id },
                        data: {
                            ownerId: toUserId,
                            isGift: true,
                            giftedById: transferRequest.fromUserId,
                            giftMessage: transferRequest.message || null
                        }
                    })
                }
                if (tag.mug) {
                    await tx.mug.update({
                        where: { id: tag.mug.id },
                        data: { ownerId: toUserId }
                    })
                }
                if (tag.page) {
                    await tx.page.update({
                        where: { id: tag.page.id },
                        data: { ownerId: toUserId }
                    })
                }
                if (tag.gift) {
                    await (tx as any).gift.update({
                        where: { id: tag.gift.id },
                        data: { receiverId: toUserId }
                    })
                }

                // TransferRequest güncelle
                await tx.transferRequest.update({
                    where: { id: requestId },
                    data: { status: 'accepted' }
                })

                // OwnershipTransfer kaydı (Geçmiş için)
                await tx.ownershipTransfer.create({
                    data: {
                        tagId: tagId,
                        fromUserId: transferRequest.fromUserId,
                        toUserId: toUserId,
                        transferType: 'gift',
                        message: transferRequest.message
                    }
                })

                // Gönderene başarı bildirimi
                await tx.notification.create({
                    data: {
                        userId: transferRequest.fromUserId,
                        type: 'transfer_accepted',
                        title: 'Transfer Tamamlandı! ✅',
                        body: `${session.user!.name} transferi kabul etti.`
                    }
                })
            }
        })

        return NextResponse.json({
            success: true,
            message: action === 'accept' ? 'Transfer kabul edildi.' : 'Transfer reddedildi.'
        })

    } catch (error) {
        console.error('Transfer respond error:', error)
        return NextResponse.json(
            { error: 'İşlem sırasında bir hata oluştu.' },
            { status: 500 }
        )
    }
}
