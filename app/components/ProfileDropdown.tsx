'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { logout } from '@/lib/auth-actions'
import styles from './ProfileDropdown.module.css'

export function ProfileDropdown() {
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (!session?.user) return null

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    // İlk ismi al (Mobil dostu)
    const firstName = session.user.name?.split(' ')[0] || 'Hesabım'
    const username = (session.user as any)?.username

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${styles.userPill} ${isOpen ? styles.active : ''}`}
                aria-label="Kullanıcı Menüsü"
                aria-expanded={isOpen}
            >
                <div className={styles.avatarWrapper}>
                    {session.user.image ? (
                        <Image
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            className={styles.avatar}
                            width={40}
                            height={40}
                            priority={false}
                        />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {(session.user.name || session.user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <span className={styles.pillName}>{firstName}</span>
                <span className={styles.chevron}>▾</span>
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <div className={styles.name}>{session.user.name || 'Misafir'}</div>
                        <div className={styles.email}>{session.user.email}</div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.menu}>
                        <Link href="/dashboard" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                            <span className={styles.icon}>🏠</span>
                            Dashboard
                        </Link>

                        {username && (
                            <Link href={`/u/${username}`} className={styles.menuItem} onClick={() => setIsOpen(false)}>
                                <span className={styles.icon}>👤</span>
                                Profilim
                            </Link>
                        )}

                        <Link href="/dashboard/connections" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                            <span className={styles.icon}>👥</span>
                            İletişim Ağı
                        </Link>

                        <div className={styles.divider}></div>

                        <Link href="/dashboard/settings" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                            <span className={styles.icon}>⚙️</span>
                            Ayarlar
                        </Link>

                        <button onClick={handleLogout} className={`${styles.menuItem} ${styles.logoutBtn}`}>
                            <span className={styles.icon}>🚪</span>
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
