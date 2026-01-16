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

        const { tagId } = await request.json()

        if (!tagId) {
            return NextResponse.json(
                { error: 'Etiket ID gerekli.' },
                { status: 400 }
            )
        }

        // Check if already following
        const existingFollow = await prisma.follow.findUnique({
            where: {
                userId_tagId: {
                    userId: session.user.id,
                    tagId
                }
            }
        })

        if (existingFollow) {
            // Unfollow
            await prisma.follow.delete({
                where: { id: existingFollow.id }
            })
            return NextResponse.json({
                success: true,
                isFollowing: false,
                message: 'Takipten çıkıldı.'
            })
        } else {
            // Follow
            await prisma.follow.create({
                data: {
                    userId: session.user.id,
                    tagId
                }
            })

            // Bildirim gönder (Opsiyonel: Tag sahibine)
            const tag = await prisma.nfcTag.findUnique({
                where: { id: tagId },
                include: { owner: true }
            })

            if (tag?.ownerId && tag.ownerId !== session.user.id) {
                await prisma.notification.create({
                    data: {
                        userId: tag.ownerId,
                        type: 'new_follower',
                        title: 'Yeni Takipçi! 🌟',
                        body: `${session.user.name || 'Bir kullanıcı'} etiketinizi takip etmeye başladı.`,
                        senderId: session.user.id,
                        data: JSON.stringify({ tagId, senderUsername: (session.user as any).username })
                    }
                })
            }

            return NextResponse.json({
                success: true,
                isFollowing: true,
                message: 'Takip ediliyor!'
            })
        }

    } catch (error) {
        console.error('Follow error:', error)
        return NextResponse.json(
            { error: 'İşlem başarısız.' },
            { status: 500 }
        )
    }
}
