export const runtime = "nodejs"

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// Bildirimleri getir
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
        const unreadOnly = searchParams.get('unreadOnly') === 'true'

        const where: any = {
            userId: session.user.id
        }

        if (unreadOnly) {
            where.readAt = null
        }

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                }
            }
        })

        // Okunmamış sayısı
        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.user.id,
                readAt: null
            }
        })

        return NextResponse.json({ notifications, unreadCount })
    } catch (error) {
        console.error('Get notifications error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}

// Bildirimleri okundu işaretle
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.' },
                { status: 401 }
            )
        }

        const { notificationIds } = await request.json()

        // Tümünü okundu işaretle
        if (!notificationIds) {
            await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
                    readAt: null
                },
                data: {
                    readAt: new Date()
                }
            })

            return NextResponse.json({ success: true, message: 'Tüm bildirimler okundu işaretlendi.' })
        }

        // Belirli bildirimleri okundu işaretle
        await prisma.notification.updateMany({
            where: {
                id: { in: notificationIds },
                userId: session.user.id
            },
            data: {
                readAt: new Date()
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Mark as read error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}

// Bildirimleri sil
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
        const notificationId = searchParams.get('id')

        if (!notificationId) {
            return NextResponse.json(
                { error: 'Bildirim ID gerekli.' },
                { status: 400 }
            )
        }

        // Sadece kendi bildirimini silebilir
        await prisma.notification.deleteMany({
            where: {
                id: notificationId,
                userId: session.user.id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete notification error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}
