import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { ConnectionsClient } from "./ConnectionsClient"

export default async function ConnectionsPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Sadece kendi kaydettiğim kişiler (private!)
    const connections = await prisma.connection.findMany({
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
                    slug: true,  // Profile Git için slug
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
    })

    // Kullanıcının grupları
    const categories = await prisma.connectionCategory.findMany({
        where: { userId: session.user.id },
        orderBy: { name: 'asc' }
    })

    console.log('=== DEBUG CONNECTIONS ===')
    console.log('User ID:', session.user.id)
    console.log('User Email:', session.user.email)
    console.log('Connections found:', connections.length)
    console.log('Connections:', connections.map(c => ({ userId: c.userId, friendId: c.friendId, status: c.status })))

    return (
        <ConnectionsClient
            connections={JSON.parse(JSON.stringify(connections))}
            categories={JSON.parse(JSON.stringify(categories))}
        />
    )
}
