import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ cards: [] })
        }

        const cards = await prisma.card.findMany({
            where: { userId: session.user.id },
            select: {
                id: true,
                title: true,
                slug: true,
                avatarUrl: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ cards })
    } catch (error) {
        console.error('Error fetching user cards:', error)
        return NextResponse.json({ cards: [] })
    }
}
