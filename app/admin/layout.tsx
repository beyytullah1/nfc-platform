'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import styles from "./admin.module.css"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'loading') return

        if (!session?.user) {
            router.push('/login')
            return
        }

        // @ts-ignore - role field
        if (session.user.role !== 'admin') {
            router.push('/dashboard')
        }
    }, [session, status, router])

    // Show loading while checking auth
    if (status === 'loading') {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#fff'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <div>Yetki kontrol ediliyor...</div>
                </div>
            </div>
        )
    }

    // Don't render if not authenticated or not admin
    if (!session?.user || (session.user as any).role !== 'admin') {
        return null
    }

    return (
        <div className={styles.adminContainer}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>⚙️</span>
                    <h2>Temasal Admin</h2>
                </div>

                <nav className={styles.nav}>
                    <Link href="/admin/dashboard" className={styles.navLink}>
                        <span className={styles.navIcon}>📊</span>
                        Dashboard
                    </Link>
                    <Link href="/admin/users" className={styles.navLink}>
                        <span className={styles.navIcon}>👥</span>
                        Kullanıcılar
                    </Link>
                    <Link href="/admin/nfc-tags" className={styles.navLink}>
                        <span className={styles.navIcon}>🏷️</span>
                        NFC Etiketleri
                    </Link>
                    <Link href="/admin/cards" className={styles.navLink}>
                        <span className={styles.navIcon}>💳</span>
                        Kartvizitler
                    </Link>
                    <Link href="/admin/plants" className={styles.navLink}>
                        <span className={styles.navIcon}>🌱</span>
                        Bitkiler
                    </Link>
                    <Link href="/admin/mugs" className={styles.navLink}>
                        <span className={styles.navIcon}>☕</span>
                        Kupalar
                    </Link>
                    <Link href="/admin/gifts" className={styles.navLink}>
                        <span className={styles.navIcon}>🎁</span>
                        Hediyeler
                    </Link>
                    <Link href="/admin/logs" className={styles.navLink}>
                        <span className={styles.navIcon}>📋</span>
                        Admin Logları
                    </Link>

                    <div className={styles.divider}></div>

                    <Link href="/dashboard" className={styles.navLink}>
                        <span className={styles.navIcon}>🏠</span>
                        Kullanıcı Paneline Dön
                    </Link>
                </nav>

                <div className={styles.adminInfo}>
                    <div className={styles.adminAvatar}>
                        {session.user.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                        <div className={styles.adminName}>{session.user.name}</div>
                        <div className={styles.adminRole}>Admin</div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    )
}
