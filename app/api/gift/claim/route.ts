import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { giftId, format, itemName } = await req.json()

        // Validate format
        if (!['plant', 'mug', 'generic'].includes(format)) {
            return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
        }

        // Get gift
        const gift = await prisma.gift.findUnique({
            where: { id: giftId },
            include: { tag: true }
        })

        if (!gift) {
            return NextResponse.json({ error: 'Gift not found' }, { status: 404 })
        }

        if (gift.isClaimed) {
            return NextResponse.json({ error: 'Gift already claimed' }, { status: 400 })
        }

        let claimedAsId = null

        // Create plant or mug based on format
        if (format === 'plant') {
            if (!itemName) {
                return NextResponse.json({ error: 'Plant name required' }, { status: 400 })
            }

            const plant = await prisma.plant.create({
                data: {
                    name: itemName,
                    ownerId: session.user.id,
                    tagId: gift.tagId,
                    isGift: true,
                    giftedById: gift.senderId,
                    giftMessage: gift.message
                }
            })

            claimedAsId = plant.id

            // Update tag
            if (gift.tag) {
                await prisma.nfcTag.update({
                    where: { id: gift.tag.id },
                    data: {
                        claimedBy: session.user.id,
                        claimedAt: new Date()
                    }
                })
            }
        } else if (format === 'mug') {
            if (!itemName) {
                return NextResponse.json({ error: 'Mug name required' }, { status: 400 })
            }

            const mug = await prisma.mug.create({
                data: {
                    name: itemName,
                    ownerId: session.user.id,
                    tagId: gift.tagId,
                    isGift: true,
                    giftedById: gift.senderId,
                    giftMessage: gift.message
                }
            })

            claimedAsId = mug.id

            // Update tag
            if (gift.tag) {
                await prisma.nfcTag.update({
                    where: { id: gift.tag.id },
                    data: {
                        claimedBy: session.user.id,
                        claimedAt: new Date()
                    }
                })
            }
        }

        // Update gift
        await prisma.gift.update({
            where: { id: giftId },
            data: {
                isClaimed: true,
                claimedAt: new Date(),
                receiverId: session.user.id,
                claimFormat: format,
                claimedAsId: claimedAsId
            }
        })

        return NextResponse.json({
            success: true,
            plantId: format === 'plant' ? claimedAsId : undefined,
            mugId: format === 'mug' ? claimedAsId : undefined
        })
    } catch (error) {
        console.error('Gift claim error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
