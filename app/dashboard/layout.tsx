import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { logout } from "@/lib/auth-actions"
import Link from "next/link"
import styles from "./dashboard.module.css"
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
                    <span className={styles.icon}>🏠</span>
                    Anasayfa
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
                <Link href="/dashboard/settings" className={styles.navItem}>
                    <span className={styles.icon}>⚙️</span>
                    Ayarlar
                </Link>
            </nav>
            <form action={logout} className={styles.logoutForm}>
                <button type="submit" className={styles.logoutBtn}>
                    Çıkış Yap
                </button>
            </form>
        </>
    )

    return (
        <div className={styles.container}>
            {/* Desktop Sidebar */}
            <aside className={`${styles.sidebar} ${styles.desktopOnly}`}>
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
