import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const cards = await prisma.card.findMany({
            where: {
                userId: session.user.id
            },
            select: {
                id: true,
                title: true,
                slug: true,
                avatarUrl: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ cards })

    } catch (error) {
        console.error('My cards error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}
