'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './notifications.module.css'

interface Notification {
    id: string
    type: string
    title: string | null
    body: string | null
    data: string | null
    readAt: string | null
    createdAt: string
    sender: {
        id: string
        name: string | null
        username?: string | null // Optional until Prisma client updates
        avatarUrl: string | null
    } | null
}

interface NotificationsClientProps {
    notifications: Notification[]
    unreadCount: number
}

export default function NotificationsClient({ notifications, unreadCount }: NotificationsClientProps) {
    const [markingRead, setMarkingRead] = useState(false)
    const router = useRouter()

    const formatTimeAgo = (date: string) => {
        const now = new Date()
        const diff = now.getTime() - new Date(date).getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Az önce'
        if (minutes < 60) return `${minutes} dk önce`
        if (hours < 24) return `${hours} saat önce`
        return `${days} gün önce`
    }

    const handleMarkAllRead = async () => {
        setMarkingRead(true)
        try {
            const res = await fetch('/api/notifications', {
                method: 'PATCH'
            })
            if (res.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error('Mark all read error:', error)
        } finally {
            setMarkingRead(false)
        }
    }

    const handleNotificationClick = async (notification: Notification) => {
        // Okunmamışsa okundu işaretle
        if (!notification.readAt) {
            try {
                await fetch('/api/notifications', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notificationIds: [notification.id] })
                })
            } catch (error) {
                console.error('Mark as read error:', error)
            }
        }

        // Link'e yönlendir
        let linkHref = '/dashboard'
        let data: any = {}

        try {
            data = notification.data ? JSON.parse(notification.data) : {}
        } catch (e) {
            console.error('Parse error:', e)
        }

        // Bildirim tipine göre link belirle
        if (notification.type === 'connection_added') {
            // data.senderUsername kullan (Prisma client güncellenmeden çalışır)
            if (data.senderUsername) {
                linkHref = `/u/${data.senderUsername}`
            } else if (notification.sender?.username) {
                // Fallback: sender.username varsa onu kullan
                linkHref = `/u/${notification.sender.username}`
            } else {
                // Son fallback: connections sayfası
                linkHref = `/dashboard/connections`
            }
        } else if (notification.type === 'new_follower') {
            // Takipçi bildirimi - data'dan username al
            if (data.senderUsername) {
                linkHref = `/u/${data.senderUsername}`
            } else if (notification.sender?.username) {
                linkHref = `/u/${notification.sender.username}`
            } else {
                linkHref = `/dashboard/nfc-tags`
            }
        } else if (notification.type === 'gift_received') {
            // Hediye bildirimi - NFC etiketler sayfasına git
            linkHref = `/dashboard/nfc-tags`
        } else if ((notification.type === 'transfer_received' || notification.type === 'transfer_request') && data.tagId) {
            linkHref = `/dashboard/nfc-tags`
        }

        router.push(linkHref)
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>🔔 Bildirimler</h1>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        disabled={markingRead}
                        className={styles.markAllReadBtn}
                    >
                        {markingRead ? 'İşleniyor...' : 'Tümünü Okundu İşaretle'}
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🔕</div>
                    <h2>Henüz bildirim yok</h2>
                    <p>Yeni bildirimler buradan görüntülenecek</p>
                </div>
            ) : (
                <div className={styles.notificationList}>
                    {notifications.map((notification) => {
                        const isUnread = !notification.readAt

                        return (
                            <button
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`${styles.notificationItem} ${isUnread ? styles.unread : ''}`}
                            >
                                <div className={styles.notificationContent}>
                                    {notification.sender?.avatarUrl ? (
                                        <img
                                            src={notification.sender.avatarUrl}
                                            alt={notification.sender.name || 'User'}
                                            className={styles.avatar}
                                        />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            {notification.sender?.name?.charAt(0) || '👤'}
                                        </div>
                                    )}

                                    <div className={styles.notificationText}>
                                        <h3>{notification.title}</h3>
                                        <p>{notification.body}</p>
                                        <span className={styles.time}>
                                            {formatTimeAgo(notification.createdAt)}
                                        </span>
                                    </div>

                                    {isUnread && (
                                        <div className={styles.unreadBadge}></div>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
