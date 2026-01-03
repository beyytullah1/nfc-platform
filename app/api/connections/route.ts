import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST - Yeni connection kaydet (card-level)
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { cardId, categoryId, myNote, myTags, savedPassword } = body

        if (!cardId) {
            return NextResponse.json(
                { error: 'Kart ID gerekli.' },
                { status: 400 }
            )
        }

        // Kartı ve sahibini bul - include user
        const card = await prisma.card.findUnique({
            where: { id: cardId },
            include: { user: true }
        })

        if (!card) {
            return NextResponse.json(
                { error: 'Kart bulunamadı.' },
                { status: 404 }
            )
        }

        const friendId = card.userId

        // Kendine kayıt yapamaz
        if (friendId === session.user.id) {
            return NextResponse.json(
                { error: 'Kendi kartınızı kaydedemezsiniz.' },
                { status: 400 }
            )
        }

        // Zaten kaydedilmiş mi? (Card-Level Check)
        const existingConnection = await prisma.connection.findUnique({
            where: {
                userId_cardId: {
                    userId: session.user.id,
                    cardId: cardId
                }
            }
        })

        if (existingConnection) {
            return NextResponse.json(
                { error: 'Bu kart zaten kayıtlı.' },
                { status: 400 }
            )
        }

        // Yeni connection oluştur
        const connection = await prisma.connection.create({
            data: {
                userId: session.user.id,
                friendId: friendId,
                cardId: cardId, // CARD-LEVEL LINK
                categoryId,
                myNote,
                myTags: myTags ? JSON.stringify(myTags) : null,
                savedPassword,
                status: 'saved',
                visibility: 'private'
            }
        })

        // KARŞILIKLI EKLEME BİLDİRİMİ GÖNDER
        try {
            await prisma.notification.create({
                data: {
                    userId: friendId,
                    type: 'mutual_add_suggestion',
                    title: 'İletişim Ağı Önerisi',
                    body: `${session.user.name} sizin kartınızı kaydetti. Siz de ${session.user.name} kişisini eklemek ister misiniz?`,
                    data: JSON.stringify({ link: `/c/${session.user.id}` }),
                    // senderId: session.user.id // Schema'da senderId varsa ekleyebiliriz ama şimdilik data ile idare edelim
                }
            })
        } catch (notifError) {
            console.error('Notification error:', notifError)
            // Connection başarılı olsa bile bildirim hatası akışı bozmasın
        }

        return NextResponse.json({ success: true, connection })
    } catch (error) {
        console.error('Connection error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}

// GET - Kullanıcının KENDİ kaydettiği kişiler (private)
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.' },
                { status: 401 }
            )
        }

        // Sadece kendi kaydettiğin kişiler (private!)
        const connections = await prisma.connection.findMany({
            where: {
                userId: session.user.id, // Sadece ben kaydettiysem
            },
            include: {
                friend: {
                    select: { id: true, name: true, avatarUrl: true, email: true },
                },
                category: true,
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ connections })
    } catch (error) {
        console.error('Get connections error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}

// DELETE - Connection sil
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
        const connectionId = searchParams.get('connectionId')

        if (!connectionId) {
            return NextResponse.json(
                { error: 'Connection ID gerekli.' },
                { status: 400 }
            )
        }

        const connection = await prisma.connection.findUnique({
            where: { id: connectionId }
        })

        if (!connection) {
            return NextResponse.json(
                { error: 'Bağlantı bulunamadı.' },
                { status: 404 }
            )
        }

        // Sadece ilgili kişiler silebilir
        if (connection.userId !== session.user.id && connection.friendId !== session.user.id) {
            return NextResponse.json(
                { error: 'Bu bağlantıyı silme yetkiniz yok.' },
                { status: 403 }
            )
        }

        await prisma.connection.delete({
            where: { id: connectionId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete connection error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}
