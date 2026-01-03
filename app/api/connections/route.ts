import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendConnectionRequest, getOrCreateAnonymousUser } from '@/app/actions'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { friendId, categoryId, meetingNote } = body

        if (!friendId) {
            return NextResponse.json(
                { error: 'Bağlantı ID gerekli.' },
                { status: 400 }
            )
        }

        // TODO: Gerçek auth ile değiştir
        const user = await getOrCreateAnonymousUser()

        const result = await sendConnectionRequest(
            user.id,
            friendId,
            categoryId,
            meetingNote
        )

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Connection error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        // TODO: Gerçek auth ile değiştir
        const userId = request.nextUrl.searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID gerekli.' },
                { status: 400 }
            )
        }

        const connections = await prisma.connection.findMany({
            where: {
                OR: [
                    { userId, status: 'accepted' },
                    { friendId: userId, status: 'accepted' },
                ],
            },
            include: {
                user: {
                    select: { id: true, name: true, avatarUrl: true },
                },
                friend: {
                    select: { id: true, name: true, avatarUrl: true },
                },
                category: true,
            },
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
