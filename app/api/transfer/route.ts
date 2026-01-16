export const runtime = "nodejs"

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

        // Transaction ile transfer request oluştur
        const transferRequest = await prisma.$transaction(async (tx) => {
            // 1. Transfer request oluştur (pending)
            const request = await tx.transferRequest.create({
                data: {
                    tagId: tagId,
                    fromUserId: session.user!.id,
                    toUserId: toUser.id,
                    status: 'pending',
                    message: message || null
                }
            })

            // 2. Alıcıya bildirim gönder
            await tx.notification.create({
                data: {
                    userId: toUser.id,
                    senderId: session.user!.id,
                    type: 'gift_received',
                    title: 'Size Bir Hediye Var! 🎁',
                    body: `${session.user!.name || 'Birisi'} size bir NFC etiketi hediye etmek istiyor.`,
                    data: JSON.stringify({
                        tagId,
                        transferRequestId: request.id
                    })
                }
            })

            return request
        })

        return NextResponse.json({
            success: true,
            message: 'Hediye isteği gönderildi!',
            transferRequestId: transferRequest.id
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
