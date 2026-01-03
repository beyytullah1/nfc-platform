import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// Sahiplik devri başlat
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.' },
                { status: 401 }
            )
        }

        const { tagId, toEmail, message, keepAccess } = await request.json()

        if (!tagId || !toEmail) {
            return NextResponse.json(
                { error: 'Tag ID ve alıcı email gerekli.' },
                { status: 400 }
            )
        }

        // Tag'i kontrol et
        const tag = await prisma.nfcTag.findUnique({
            where: { id: tagId },
            include: {
                card: true,
                plant: true,
                mug: true,
                gift: true,
                page: true
            }
        })

        if (!tag) {
            return NextResponse.json(
                { error: 'Etiket bulunamadı.' },
                { status: 404 }
            )
        }

        // Sahip kontrolü
        if (tag.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Bu etiket size ait değil.' },
                { status: 403 }
            )
        }

        // Alıcıyı bul
        const toUser = await prisma.user.findUnique({
            where: { email: toEmail }
        })

        if (!toUser) {
            return NextResponse.json(
                { error: 'Bu email ile kayıtlı kullanıcı bulunamadı.' },
                { status: 404 }
            )
        }

        if (toUser.id === session.user.id) {
            return NextResponse.json(
                { error: 'Kendinize transfer yapamazsınız.' },
                { status: 400 }
            )
        }

        // Transaction ile transfer yap
        await prisma.$transaction(async (tx) => {
            // 1. Tag sahipliğini değiştir
            await tx.nfcTag.update({
                where: { id: tagId },
                data: {
                    ownerId: toUser.id,
                    status: 'claimed'
                }
            })

            // 2. Modüle göre sahipliği güncelle
            if (tag.card) {
                await tx.card.update({
                    where: { id: tag.card.id },
                    data: { userId: toUser.id }
                })
            }
            if (tag.plant) {
                await tx.plant.update({
                    where: { id: tag.plant.id },
                    data: {
                        ownerId: toUser.id,
                        isGift: true,
                        giftedById: session.user!.id,
                        giftMessage: message || null
                    }
                })
            }
            if (tag.mug) {
                await tx.mug.update({
                    where: { id: tag.mug.id },
                    data: { ownerId: toUser.id }
                })
            }
            if (tag.page) {
                await tx.page.update({
                    where: { id: tag.page.id },
                    data: { ownerId: toUser.id }
                })
            }
            if (tag.gift) {
                await (tx as any).gift.update({
                    where: { id: tag.gift.id },
                    data: { receiverId: toUser.id }
                })
            }

            // 3. Transfer kaydı oluştur
            await tx.ownershipTransfer.create({
                data: {
                    tagId: tagId,
                    fromUserId: session.user!.id,
                    toUserId: toUser.id,
                    transferType: 'gift',
                    message: message || null
                }
            })

            // 4. Alıcıya bildirim gönder
            await tx.notification.create({
                data: {
                    userId: toUser.id,
                    senderId: session.user!.id,
                    type: 'gift_received',
                    title: 'Size Bir Hediye Var! 🎁',
                    body: `${session.user!.name || 'Birisi'} size bir NFC etiketi hediye etti.`,
                    data: JSON.stringify({ tagId })
                }
            })
        })

        return NextResponse.json({
            success: true,
            message: 'Transfer başarılı!'
        })
    } catch (error) {
        console.error('Transfer error:', error)
        return NextResponse.json(
            { error: 'Transfer sırasında bir hata oluştu.' },
            { status: 500 }
        )
    }
}

// Transfer geçmişini getir
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const tagId = searchParams.get('tagId')

        const where = tagId
            ? { tagId }
            : {
                OR: [
                    { fromUserId: session.user.id },
                    { toUserId: session.user.id }
                ]
            }

        const transfers = await prisma.ownershipTransfer.findMany({
            where,
            include: {
                fromUser: { select: { id: true, name: true, email: true } },
                toUser: { select: { id: true, name: true, email: true } },
                tag: { select: { id: true, publicCode: true, moduleType: true } }
            },
            orderBy: { transferredAt: 'desc' },
            take: 50
        })

        return NextResponse.json({ transfers })
    } catch (error) {
        console.error('Get transfers error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}
