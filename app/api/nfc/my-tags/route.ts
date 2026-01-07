import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Kullanıcının sahip olduğu tüm NFC tag'leri
        const tags = await prisma.nfcTag.findMany({
            where: {
                ownerId: session.user.id
            },
            include: {
                card: {
                    select: {
                        id: true,
                        title: true,
                        slug: true
                    }
                },
                plant: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                mug: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                page: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Format response
        const formattedTags = tags.map(tag => {
            let linkedTo = null

            if (tag.card) {
                linkedTo = {
                    type: 'card' as const,
                    id: tag.card.id,
                    title: tag.card.title || 'Başlıksız Kart',
                    slug: tag.card.slug
                }
            } else if (tag.plant) {
                linkedTo = {
                    type: 'plant' as const,
                    id: tag.plant.id,
                    title: tag.plant.name
                }
            } else if (tag.mug) {
                linkedTo = {
                    type: 'mug' as const,
                    id: tag.mug.id,
                    title: tag.mug.name
                }
            } else if (tag.page) {
                linkedTo = {
                    type: 'page' as const,
                    id: tag.page.id,
                    title: tag.page.title || 'Başlıksız Sayfa'
                }
            } else if (tag.gift) {
                linkedTo = {
                    type: 'gift' as const,
                    id: tag.gift.id,
                    title: tag.gift.title || 'Hediye'
                }
            }

            return {
                id: tag.id,
                publicCode: tag.publicCode,
                status: tag.status,
                moduleType: tag.moduleType,
                linkedTo,
                createdAt: tag.createdAt,
                claimedAt: tag.claimedAt
            }
        })

        // Bekleyen Transfer İstekleri
        const requests = await prisma.transferRequest.findMany({
            where: {
                toUserId: session.user.id,
                status: 'pending'
            },
            include: {
                fromUser: {
                    select: {
                        username: true,
                        name: true
                    }
                },
                tag: {
                    select: {
                        publicCode: true,
                        moduleType: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({
            tags: formattedTags,
            requests,
            total: formattedTags.length
        })

    } catch (error) {
        console.error('My tags error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu' },
            { status: 500 }
        )
    }
}
