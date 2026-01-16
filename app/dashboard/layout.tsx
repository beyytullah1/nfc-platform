export const runtime = "nodejs"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import styles from "./dashboard.module.css"
import { MobileMenuWrapper } from "./MobileMenu"
import { Breadcrumb } from "../components/Breadcrumb"
import { NotificationBadge } from "@/app/components/NotificationBadge"
import { ProfileMenu } from "@/app/components/ProfileMenu"
import { ProfileDropdown } from "@/app/components/ProfileDropdown"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Check if user needs to complete profile (Google OAuth users without username)
    if (!session.user.username) {
        redirect("/complete-profile")
    }

    const sidebarContent = (
        <>
            <div className={styles.logo}>
                <Image
                    src="/temasal-logo.png"
                    alt="Temasal"
                    width={180}
                    height={60}
                    priority
                    style={{ objectFit: 'contain' }}
                />
            </div>
            <nav className={styles.nav}>
                <Link href="/dashboard" className={styles.navItem}>
                    🏠 Ana Sayfa
                </Link>
                <Link href="/dashboard/cards" className={styles.navItem}>
                    <span className={styles.icon}>💳</span>
                    Kartvizitler
                </Link>
                <Link href="/dashboard/plants" className={styles.navItem}>
                    <span className={styles.icon}>🌱</span>
                    Bitkiler
                </Link>
                <Link href="/dashboard/mugs" className={styles.navItem}>
                    <span className={styles.icon}>☕</span>
                    Kupalar
                </Link>
                <Link href="/dashboard/gifts" className={styles.navItem}>
                    <span className={styles.icon}>🎁</span>
                    Hediyeler
                </Link>
                <Link href="/dashboard/pages" className={styles.navItem}>
                    <span className={styles.icon}>📄</span>
                    Sayfalar
                </Link>
                <Link href="/dashboard/connections" className={styles.navItem}>
                    <span className={styles.icon}>👥</span>
                    İletişim Ağı
                </Link>
                <Link href="/dashboard/nfc-tags" className={styles.navItem}>
                    <span className={styles.icon}>🏷️</span>
                    NFC Etiketler
                </Link>
                <Link href="/dashboard/notifications" className={styles.navItem}>
                    <span className={styles.icon}><NotificationBadge /></span>
                    Bildirimler
                </Link>

                {/* Admin Panel - Only for admins */}
                {(session.user as any)?.role === 'admin' && (
                    <Link href="/admin/dashboard" className={`${styles.navItem} ${styles.adminNavItem}`}>
                        <span className={styles.icon}>🔐</span>
                        Admin Paneli
                    </Link>
                )}

                {/* Profile Menu */}
                <ProfileMenu />
            </nav>
        </>
    )

    return (
        <div className={styles.container}>
            {/* Desktop Sidebar */}
            <aside className={`${styles.sidebar} ${styles.desktopOnly} `}>
                {sidebarContent}
            </aside>

            {/* Mobile Menu */}
            <MobileMenuWrapper>
                {sidebarContent}
            </MobileMenuWrapper>

            <main className={styles.main}>
                <header className={styles.topBar}>
                    <Breadcrumb />
                    <div className={styles.topRightContainer}>
                        <Link href="/dashboard/notifications" className={styles.actionButton} aria-label="Bildirimler">
                            <NotificationBadge />
                        </Link>
                        <ProfileDropdown />
                    </div>
                </header>
                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    )
}
