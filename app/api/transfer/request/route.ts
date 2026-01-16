export const runtime = "nodejs"

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

        const { tagId, targetUsername, message } = await request.json()

        if (!tagId || !targetUsername) {
            return NextResponse.json(
                { error: 'Etiket ve kullanıcı adı gerekli.' },
                { status: 400 }
            )
        }

        // 1. Etiketi ve sahibini kontrol et
        const tag = await prisma.nfcTag.findUnique({
            where: { id: tagId }
        })

        if (!tag) {
            return NextResponse.json(
                { error: 'Etiket bulunamadı.' },
                { status: 404 }
            )
        }

        if (tag.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Bu etiket size ait değil.' },
                { status: 403 }
            )
        }

        // 2. Alıcı kullanıcıyı bul (Username ile)
        // targetUsername başında @ varsa kaldır
        const cleanUsername = targetUsername.replace('@', '')

        const targetUser = await prisma.user.findUnique({
            where: { username: cleanUsername }
        })

        if (!targetUser) {
            return NextResponse.json(
                { error: 'Kullanıcı bulunamadı.' },
                { status: 404 }
            )
        }

        if (targetUser.id === session.user.id) {
            return NextResponse.json(
                { error: 'Kendinize transfer yapamazsınız.' },
                { status: 400 }
            )
        }

        // 3. Mevcut bekleyen istek var mı?
        const existingRequest = await prisma.transferRequest.findFirst({
            where: {
                tagId,
                toUserId: targetUser.id,
                status: 'pending'
            }
        })

        if (existingRequest) {
            return NextResponse.json(
                { error: 'Bu kullanıcıya zaten bekleyen bir isteğiniz var.' },
                { status: 400 }
            )
        }

        // 4. Transfer isteği oluştur
        const transferRequest = await prisma.transferRequest.create({
            data: {
                tagId,
                fromUserId: session.user.id,
                toUserId: targetUser.id,
                message,
                status: 'pending'
            }
        })

        // 5. Alıcıya bildirim gönder
        await prisma.notification.create({
            data: {
                userId: targetUser.id,
                senderId: session.user.id,
                type: 'transfer_request',
                title: '🎁 Transfer İsteği',
                body: `${session.user.name || session.user.username} size bir NFC etiketi göndermek istiyor.`,
                data: JSON.stringify({
                    requestId: transferRequest.id,
                    senderUsername: (session.user as any).username
                })
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Transfer isteği gönderildi!',
            requestId: transferRequest.id
        })

    } catch (error) {
        console.error('Transfer request error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}
