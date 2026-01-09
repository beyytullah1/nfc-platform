import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import styles from "./admin.module.css"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    console.log('[AdminLayout] Starting auth check...')
    const session = await auth()
    console.log('[AdminLayout] Session:', session?.user?.email, 'Role:', (session?.user as any)?.role)

    // Double-check auth (Middleware zaten kontrol etti ama guarantee için)
    if (!session?.user || (session.user as any).role !== 'admin') {
        console.log('[AdminLayout] Redirecting to dashboard - Not admin')
        redirect("/dashboard")
    }
    console.log('[AdminLayout] Auth OK, rendering children')

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
