import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Check if NFC code exists in database
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get('code')

        if (!code) {
            return NextResponse.json({ exists: false, error: 'Code is required' })
        }

        const tag = await prisma.nfcTag.findUnique({
            where: { publicCode: code },
            include: {
                plant: { select: { id: true, slug: true } },
                mug: { select: { id: true, slug: true } },
                card: { select: { id: true, slug: true } },
                gift: { select: { id: true, slug: true } },
                page: { select: { id: true, slug: true } }
            }
        })

        if (!tag) {
            return NextResponse.json({ exists: false })
        }

        // If tag is linked to a module, prepare redirect URL
        let redirectUrl: string | null = null

        if (tag.plant) {
            redirectUrl = `/plant/${tag.plant.slug || tag.plant.id}`
        } else if (tag.mug) {
            redirectUrl = `/mug/${tag.mug.slug || tag.mug.id}`
        } else if (tag.card) {
            redirectUrl = `/${tag.card.slug || tag.card.id}`
        } else if (tag.gift) {
            redirectUrl = `/gift/${tag.gift.slug || tag.gift.id}`
        } else if (tag.page) {
            redirectUrl = `/page/${tag.page.slug || tag.page.id}`
        }

        return NextResponse.json({
            exists: true,
            hasOwner: !!tag.ownerId,
            moduleType: tag.moduleType,
            status: tag.status,
            redirectUrl
        })
    } catch (error) {
        console.error('NFC check error:', error)
        return NextResponse.json({ exists: false, error: 'Internal error' })
    }
}
