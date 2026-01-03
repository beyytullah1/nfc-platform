import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import styles from "./dashboard.module.css"
import LogoutButton from "@/app/components/LogoutButton"
import { MobileMenuWrapper } from "./MobileMenu"
import { Breadcrumb } from "../components/Breadcrumb"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const sidebarContent = (
        <>
            <div className={styles.logo}>
                <span>NFC</span>Platform
            </div>
            <nav className={styles.nav}>
                <Link href="/dashboard" className={styles.navItem}>
                    🏠 Profil
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
                <Link href="/dashboard/profile" className={styles.navItem}>
                    <span className={styles.icon}>👤</span>
                    Profil
                </Link>
                <Link href="/dashboard/connections" className={styles.navItem}>
                    <span className={styles.icon}>👥</span>
                    İletişim Ağı
                </Link>

                {/* Logout Button */}
                <LogoutButton />
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
                <Breadcrumb />
                {children}
            </main>
        </div>
    )
}
