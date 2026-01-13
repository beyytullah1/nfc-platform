import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import UserProfileClient from './UserProfileClient'

type Props = {
    params: Promise<{ username: string }>
}

export default async function UserProfilePage({ params }: Props) {
    const { username } = await params
    const session = await auth()

    // Find user by username
    let user
    try {
        user = await prisma.user.findUnique({
            where: { username: username.toLowerCase() },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                avatarUrl: true,
                createdAt: true
            }
        })
    } catch (error) {
        console.error('Database error loading user:', error)
        notFound()
    }

    if (!user) {
        notFound()
    }

    const isOwner = session?.user?.id === user.id

    // Fetch user's content
    let cards: any[] = []
    let plants: any[] = []
    let mugs: any[] = []

    try {
        [cards, plants, mugs] = await Promise.all([
            prisma.card.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.plant.findMany({
                where: {
                    OR: [
                        { ownerId: user.id },
                        { coOwners: { some: { id: user.id } } }
                    ]
                },
                include: {
                    tag: true,
                    coOwners: { select: { id: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.mug.findMany({
                where: { ownerId: user.id },
                include: { tag: true },
                orderBy: { createdAt: 'desc' }
            })
        ])
    } catch (error) {
        console.error('Database error loading user content:', error)
        // Continue with empty arrays
    }

    // Transform plants to include ownerId explicitly
    const plantsWithOwnerId = plants.map(p => ({
        ...p,
        ownerId: p.ownerId
    }))

    return (
        <UserProfileClient
            user={user}
            isOwner={isOwner}
            currentUserId={session?.user?.id || null}
            cards={cards}
            plants={plantsWithOwnerId}
            mugs={mugs}
        />
    )
}
