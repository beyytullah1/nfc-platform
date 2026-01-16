export const runtime = "nodejs"

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// Takip et
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
                { error: 'Tag ID gerekli.' },
                { status: 400 }
            )
        }

        // Tag'i kontrol et
        const tag = await prisma.nfcTag.findUnique({
            where: { id: tagId }
        })

        if (!tag) {
            return NextResponse.json(
                { error: 'Etiket bulunamadı.' },
                { status: 404 }
            )
        }

        // Public olmayan veya takibe kapalı etiketler
        if (!tag.isPublic || !tag.allowFollow) {
            return NextResponse.json(
                { error: 'Bu etiket takip edilemez.' },
                { status: 403 }
            )
        }

        // Kendi etiketini takip edemez
        if (tag.ownerId === session.user.id) {
            return NextResponse.json(
                { error: 'Kendi etiketinizi takip edemezsiniz.' },
                { status: 400 }
            )
        }

        // Zaten takip ediyor mu?
        const existingFollow = await (prisma as any).follow.findUnique({
            where: {
                userId_tagId: {
                    userId: session.user.id,
                    tagId: tagId
                }
            }
        })

        if (existingFollow) {
            return NextResponse.json(
                { error: 'Zaten takip ediyorsunuz.' },
                { status: 400 }
            )
        }

        // Takip et
        await (prisma as any).follow.create({
            data: {
                userId: session.user.id,
                tagId: tagId
            }
        })

        // Etiket sahibine bildirim gönder
        if (tag.ownerId) {
            await prisma.notification.create({
                data: {
                    userId: tag.ownerId,
                    senderId: session.user.id,
                    type: 'new_follower',
                    title: 'Yeni Takipçi! 🎉',
                    body: `${session.user.name || 'Biri'} etiketinizi takip etmeye başladı.`
                }
            })
        }

        return NextResponse.json({ success: true, following: true })
    } catch (error) {
        console.error('Follow error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}

// Takibi bırak
export async function DELETE(request: NextRequest) {
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

        if (!tagId) {
            return NextResponse.json(
                { error: 'Tag ID gerekli.' },
                { status: 400 }
            )
        }

        // Takibi sil
        await (prisma as any).follow.deleteMany({
            where: {
                userId: session.user.id,
                tagId: tagId
            }
        })

        return NextResponse.json({ success: true, following: false })
    } catch (error) {
        console.error('Unfollow error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}

// Takip durumunu kontrol et
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        const { searchParams } = new URL(request.url)
        const tagId = searchParams.get('tagId')

        if (!tagId) {
            return NextResponse.json(
                { error: 'Tag ID gerekli.' },
                { status: 400 }
            )
        }

        // Tag bilgilerini al
        const tag = await prisma.nfcTag.findUnique({
            where: { id: tagId },
            include: {
                followers: true
            }
        })

        if (!tag) {
            return NextResponse.json(
                { error: 'Etiket bulunamadı.' },
                { status: 404 }
            )
        }

        // Kullanıcı giriş yapmışsa takip durumunu kontrol et
        let isFollowing = false
        if (session?.user?.id) {
            isFollowing = tag.followers.some((f: any) => f.userId === session.user?.id)
        }

        return NextResponse.json({
            allowFollow: tag.allowFollow,
            isPublic: tag.isPublic,
            followerCount: tag.followers.length,
            isFollowing,
            isOwner: session?.user?.id === tag.ownerId
        })
    } catch (error) {
        console.error('Get follow status error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}
