import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import NotificationsClient from './NotificationsClient'

export default async function NotificationsPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    // Bildirimleri getir
    const notifications = await prisma.notification.findMany({
        where: {
            userId: session.user.id
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatarUrl: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    })

    // Okunmamış sayısı
    const unreadCount = notifications.filter(n => !n.readAt).length

    return (
        <NotificationsClient
            notifications={notifications.map(n => ({
                id: n.id,
                type: n.type,
                title: n.title,
                body: n.body,
                data: n.data,
                readAt: n.readAt?.toISOString() ?? null,
                createdAt: n.createdAt.toISOString(),
                sender: n.sender ? {
                    id: n.sender.id,
                    name: n.sender.name,
                    username: (n.sender as any).username,
                    avatarUrl: n.sender.avatarUrl
                } : null
            }))}
            unreadCount={unreadCount}
        />
    )
}
