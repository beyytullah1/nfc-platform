export const runtime = "nodejs"

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { ModuleType } from '@/lib/types'
import { createRateLimiter, RATE_LIMITS } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { validateRequest, claimNFCSchema } from '@/lib/validations'

/**
 * SECURITY: This endpoint ONLY claims EXISTING NFC tags
 * NFC tags can ONLY be created via admin panel
 */
export async function POST(request: NextRequest) {
    // Rate limiting
    const rateLimiter = createRateLimiter(RATE_LIMITS.nfc)
    const rateLimitResponse = await rateLimiter(request)
    if (rateLimitResponse) {
        return rateLimitResponse
    }

    try {
        // Input validation
        const validation = await validateRequest(claimNFCSchema, request)
        if (validation.error) {
            return validation.error
        }

        const { code, moduleType, name } = validation.data!

        // Auth kontrolü
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Giriş yapmanız gerekiyor.', redirect: '/login' },
                { status: 401 }
            )
        }

        // SECURITY: Only find existing tags - NEVER create new ones
        const tag = await prisma.nfcTag.findUnique({
            where: { publicCode: code }
        })

        if (!tag) {
            // Tag doesn't exist - user must use admin-created tags
            return NextResponse.json(
                { error: 'Bu NFC etiket kodu sistemde bulunamadı. Lütfen admin panelinden oluşturulmuş bir etiket kullanın.' },
                { status: 404 }
            )
        }

        if (tag.ownerId && tag.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Bu etiket başka bir kullanıcıya ait.' },
                { status: 400 }
            )
        }

        // If tag is unclaimed, claim it
        if (!tag.ownerId) {
            await prisma.nfcTag.update({
                where: { id: tag.id },
                data: {
                    ownerId: session.user.id,
                    moduleType: moduleType,
                    claimedAt: new Date()
                }
            })
        }

        // Modüle göre içerik oluştur
        let redirect = '/dashboard'

        switch (moduleType as ModuleType) {
            case 'card':
                const card = await prisma.card.create({
                    data: {
                        userId: session.user.id,
                        tagId: tag.id,
                        title: name,
                        theme: JSON.stringify({ color: '#3b82f6', style: 'modern' })
                    }
                })
                redirect = `/dashboard/cards/${card.id}`
                break

            case 'plant':
                const plant = await prisma.plant.create({
                    data: {
                        ownerId: session.user.id,
                        tagId: tag.id,
                        name: name,
                        theme: JSON.stringify({ style: 'nature' })
                    }
                })
                redirect = `/dashboard/plants/${plant.id}`
                break

            case 'mug':
                const mug = await prisma.mug.create({
                    data: {
                        ownerId: session.user.id,
                        tagId: tag.id,
                        name: name,
                        theme: JSON.stringify({ style: 'modern' })
                    }
                })
                redirect = `/dashboard/mugs/${mug.id}`
                break

            case 'gift':
            case 'canvas':
                const page = await prisma.page.create({
                    data: {
                        ownerId: session.user.id,
                        tagId: tag.id,
                        moduleType: moduleType,
                        title: name,
                        theme: JSON.stringify({ style: 'default' })
                    }
                })
                redirect = `/dashboard/pages/${page.id}`
                break
        }

        logger.info("NFC tag claimed successfully", { context: "Claim", data: { code, moduleType, userId: session.user.id } })
        return NextResponse.json({ redirect })
    } catch (error) {
        logger.error('Claim error', { context: "Claim", error })
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}
