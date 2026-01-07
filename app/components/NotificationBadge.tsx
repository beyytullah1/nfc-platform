'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './NotificationBadge.module.css'

export function NotificationBadge() {
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchUnreadCount() {
            try {
                const res = await fetch('/api/notifications?unreadOnly=true')
                if (res.ok) {
                    const data = await res.json()
                    setUnreadCount(data.unreadCount || 0)
                }
            } catch (error) {
                console.error('Failed to fetch unread count:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUnreadCount()

        // Her 30 saniyede bir güncelle
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return null
    }

    return (
        <>
            <span className={styles.icon}>🔔</span>
            {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
        </>
    )
}
