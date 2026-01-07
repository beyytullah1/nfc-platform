import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { ConnectionsClient } from "./ConnectionsClient"
import { logger } from "@/lib/logger"

export default async function ConnectionsPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Sadece kendi kaydettiğim kişiler (private!)
    let connections = []
    let categories = []
    let follows = []
    
    try {
        [connections, categories, follows] = await Promise.all([
            // Bağlantılar
            prisma.connection.findMany({
                where: {
                    userId: session.user.id,
                    status: 'saved'
                },
                include: {
                    friend: {
                        select: { id: true, name: true, email: true, avatarUrl: true }
                    },
                    card: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            fields: {
                                where: { fieldType: 'phone' },
                                take: 1,
                                select: { value: true }
                            }
                        }
                    },
                    category: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            // Kullanıcının grupları
            prisma.connectionCategory.findMany({
                where: { userId: session.user.id },
                orderBy: { name: 'asc' }
            }),
            // Kullanıcının takip ettikleri (Bitkiler, Kupalar vb.)
            prisma.follow.findMany({
                where: { userId: session.user.id },
                include: {
                    tag: {
                        include: {
                            plant: true,
                            mug: true,
                            page: true,
                            card: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
        ])
    } catch (error) {
        console.error('Database error loading connections:', error)
        // Continue with empty arrays - page will still work
    }

    // Debug logging (only in development)
    logger.debug('Connections loaded', {
        context: 'Connections',
        data: {
            userId: session.user.id,
            email: session.user.email,
            connectionsCount: connections.length,
            categoriesCount: categories.length,
            followsCount: follows.length
        }
    })

    return (
        <ConnectionsClient
            connections={JSON.parse(JSON.stringify(connections))}
            categories={JSON.parse(JSON.stringify(categories))}
            follows={JSON.parse(JSON.stringify(follows))}
        />
    )
}
