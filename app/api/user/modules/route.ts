export const runtime = "nodejs"


import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id

        // Fetch all unlinked modules for the user
        const plants = await prisma.plant.findMany({
            where: { ownerId: userId, tagId: null },
            select: { id: true, name: true, slug: true }
        })

        const mugs = await prisma.mug.findMany({
            where: { ownerId: userId, tagId: null },
            select: { id: true, name: true, slug: true }
        })

        const gifts = await prisma.gift.findMany({
            where: { senderId: userId, tagId: null },
            select: { id: true, title: true, slug: true }
        })

        const pages = await prisma.page.findMany({
            where: { ownerId: userId, tagId: null },
            select: { id: true, title: true, slug: true }
        })

        const cards = await prisma.card.findMany({
            where: { userId: userId, tagId: null },
            select: { id: true, title: true, slug: true }
        })

        return NextResponse.json({
            plants,
            mugs,
            gifts,
            pages,
            cards
        })

    } catch (error) {
        console.error('Fetch user modules error:', error)
        return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
    }
}
