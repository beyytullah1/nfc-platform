import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getPaginationParams, createPaginatedResponse } from '@/lib/pagination'

// Kullanıcı profilini getir
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params
        const session = await auth()

        if (!username) {
            return NextResponse.json(
                { error: 'Username gerekli.' },
                { status: 400 }
            )
        }

        // Kullanıcıyı bul
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
                bio: true,
                createdAt: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Kullanıcı bulunamadı.' },
                { status: 404 }
            )
        }

        // Kendi profilini mi görüntülüyor kontrolü
        const isOwner = session?.user?.id === user.id

        // Pagination params
        const { searchParams } = new URL(request.url)
        const pagination = getPaginationParams(searchParams)

        // All queries in parallel to avoid N+1 problem
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let cardsData: any[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let plantsData: any[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let mugsData: any[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let giftsData: any[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let pagesData: any[] = []
        let cardsCount = 0
        let plantsCount = 0
        let mugsCount = 0
        let giftsCount = 0
        let pagesCount = 0

        try {
            [cardsData, cardsCount, plantsData, plantsCount, mugsData, mugsCount, giftsData, giftsCount, pagesData, pagesCount] = await Promise.all([
                // Kartlar: Kendi profilindeyse HEPSİ, değilse sadece public
                prisma.card.findMany({
                    where: {
                        userId: user.id,
                        ...(isOwner ? {} : { isPublic: true })
                    },
                    select: {
                        id: true,
                        slug: true,
                        cardType: true,
                        title: true,
                        avatarUrl: true,
                        viewCount: true,
                        isPublic: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' },
                    take: pagination.limit,
                    skip: (pagination.page - 1) * pagination.limit
                }),
                // Count cards
                prisma.card.count({
                    where: {
                        userId: user.id,
                        ...(isOwner ? {} : { isPublic: true })
                    }
                }),
                // Bitkiler: Kendi profilindeyse HEPSİ, değilse sadece public
                prisma.plant.findMany({
                    where: {
                        ownerId: user.id,
                        ...(isOwner ? {} : {
                            tag: {
                                isPublic: true,
                                allowFollow: true
                            }
                        })
                    },
                    include: {
                        tag: {
                            select: {
                                id: true,
                                publicCode: true,
                                isPublic: true,
                                allowFollow: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: pagination.limit,
                    skip: (pagination.page - 1) * pagination.limit
                }),
                // Count plants
                prisma.plant.count({
                    where: {
                        ownerId: user.id,
                        ...(isOwner ? {} : {
                            tag: {
                                isPublic: true,
                                allowFollow: true
                            }
                        })
                    }
                }),
                // Kupalar: Kendi profilindeyse HEPSİ, değilse sadece public
                prisma.mug.findMany({
                    where: {
                        ownerId: user.id,
                        ...(isOwner ? {} : {
                            tag: {
                                isPublic: true,
                                allowFollow: true
                            }
                        })
                    },
                    include: {
                        tag: {
                            select: {
                                id: true,
                                publicCode: true,
                                isPublic: true,
                                allowFollow: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: pagination.limit,
                    skip: (pagination.page - 1) * pagination.limit
                }),
                // Count mugs
                prisma.mug.count({
                    where: {
                        ownerId: user.id,
                        ...(isOwner ? {} : {
                            tag: {
                                isPublic: true,
                                allowFollow: true
                            }
                        })
                    }
                }),
                // Hediyeler: Kendi profilindeyse HEPSİ, değilse hepsi public (Gift'in isPublic yok)
                prisma.gift.findMany({
                    where: {
                        receiverId: user.id
                    },
                    select: {
                        id: true,
                        title: true,
                        message: true,
                        mediaUrl: true,
                        giftType: true,
                        isClaimed: true,
                        createdAt: true,
                        senderName: true
                    },
                    orderBy: { createdAt: 'desc' },
                    take: pagination.limit,
                    skip: (pagination.page - 1) * pagination.limit
                }),
                // Count gifts
                prisma.gift.count({
                    where: {
                        receiverId: user.id
                    }
                }),
                // Sayfalar: Kendi profilindeyse HEPSİ (Page'in isPublic yok, hepsi public)
                prisma.page.findMany({
                    where: {
                        ownerId: user.id
                    },
                    select: {
                        id: true,
                        title: true,
                        moduleType: true,
                        theme: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' },
                    take: pagination.limit,
                    skip: (pagination.page - 1) * pagination.limit
                }),
                // Count pages
                prisma.page.count({
                    where: {
                        ownerId: user.id
                    }
                })
            ])
        } catch (error) {
            console.error('Database error loading user profile data:', error)
            // Continue with empty arrays and 0 counts - API will still respond
        }

        // Use data directly (no need to destructure again)
        const cards = cardsData
        const plants = plantsData
        const mugs = mugsData
        const gifts = giftsData
        const pages = pagesData

        // İstatistikler
        const stats = {
            totalCards: cardsCount,
            totalPlants: plantsCount,
            totalMugs: mugsCount,
            totalGifts: giftsCount,
            totalPages: pagesCount
        }

        return NextResponse.json({
            user,
            cards: createPaginatedResponse(cards, pagination.page, pagination.limit, cardsCount),
            plants: createPaginatedResponse(plants, pagination.page, pagination.limit, plantsCount),
            mugs: createPaginatedResponse(mugs, pagination.page, pagination.limit, mugsCount),
            gifts: createPaginatedResponse(gifts, pagination.page, pagination.limit, giftsCount),
            pages: createPaginatedResponse(pages, pagination.page, pagination.limit, pagesCount),
            stats,
            isOwner // Frontend'de kullanılabilir
        })
    } catch (error) {
        console.error('Get user profile error:', error)
        return NextResponse.json(
            { error: 'Bir hata oluştu.' },
            { status: 500 }
        )
    }
}
