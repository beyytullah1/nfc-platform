export const runtime = "nodejs"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Toggle item visibility (isPublic field)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const { type, isPublic } = await request.json()

        // Update based on type
        if (type === 'card') {
            const card = await prisma.card.findUnique({
                where: { id },
                select: { userId: true }
            })

            if (!card || card.userId !== session.user.id) {
                return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
            }

            await prisma.card.update({
                where: { id },
                data: { isPublic }
            })
        } else if (type === 'plant') {
            const plant = await prisma.plant.findUnique({
                where: { id },
                select: {
                    ownerId: true,
                    coOwners: {
                        select: { id: true }
                    }
                }
            })

            // Check if user is owner or co-owner
            const isOwner = plant?.ownerId === session.user.id
            const isCoOwner = plant?.coOwners.some(co => co.id === session.user.id)

            if (!plant || (!isOwner && !isCoOwner)) {
                return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
            }

            await prisma.plant.update({
                where: { id },
                data: { isVisibleInProfile: isPublic }
            })
        } else if (type === 'mug') {
            const mug = await prisma.mug.findUnique({
                where: { id },
                select: { ownerId: true }
            })

            if (!mug || mug.ownerId !== session.user.id) {
                return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
            }

            await prisma.mug.update({
                where: { id },
                data: { isVisibleInProfile: isPublic }
            })
        } else {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Visibility toggle error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
