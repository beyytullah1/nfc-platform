'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'
import styles from './ProfileMenu.module.css'

export function ProfileMenu() {
    const { data: session } = useSession()
    const pathname = usePathname()
    const username = (session?.user as any)?.username

    if (!session?.user) return null

    return (
        <div className={styles.menuContainer}>
            {/* Profile Link - Goes to /u/username */}
            {username && (
                <Link
                    href={`/u/${username}`}
                    className={`${styles.menuItem} ${pathname === `/u/${username}` ? styles.active : ''}`}
                >
                    <span className={styles.icon}>👤</span>
                    Profilim
                </Link>
            )}

            {/* Settings Link  */}
            <Link
                href="/dashboard/settings"
                className={`${styles.menuItem} ${pathname === '/dashboard/settings' ? styles.active : ''}`}
            >
                <span className={styles.icon}>⚙️</span>
                Ayarlar
            </Link>

            <div className={styles.divider}></div>

            {/* Logout Button */}
            <LogoutButton />
        </div>
    )
}
