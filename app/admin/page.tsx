import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import styles from "./admin.module.css"

export default async function AdminPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Admin kontrolü (şimdilik basit email kontrolü)
    const adminEmails = ["admin@example.com", "test@example.com"]
    const isAdmin = session.user.email && adminEmails.includes(session.user.email)

    if (!isAdmin) {
        redirect("/dashboard")
    }

    // İstatistikler
    const [userCount, cardCount, tagCount, plantCount] = await Promise.all([
        prisma.user.count(),
        prisma.card.count(),
        prisma.nfcTag.count(),
        prisma.plant.count(),
    ])

    // Son kullanıcılar
    const recentUsers = await prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            _count: {
                select: { cards: true }
            }
        }
    })

    // Son NFC taglar
    const recentTags = await prisma.nfcTag.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
            owner: { select: { name: true, email: true } }
        }
    })

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <span>🔐</span> Admin
                </div>
                <nav className={styles.nav}>
                    <Link href="/admin" className={styles.navItem + " " + styles.active}>
                        📊 Dashboard
                    </Link>
                    <Link href="/admin/users" className={styles.navItem}>
                        👥 Kullanıcılar
                    </Link>
                    <Link href="/admin/tags" className={styles.navItem}>
                        🏷️ NFC Taglar
                    </Link>
                    <Link href="/dashboard" className={styles.navItem}>
                        ← Ana Panel
                    </Link>
                </nav>
            </aside>

            <main className={styles.main}>
                <h1 className={styles.title}>Temasal Admin</h1>

                {/* Stats */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>👥</span>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{userCount}</span>
                            <span className={styles.statLabel}>Kullanıcı</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>💳</span>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{cardCount}</span>
                            <span className={styles.statLabel}>Kartvizit</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>🏷️</span>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{tagCount}</span>
                            <span className={styles.statLabel}>NFC Tag</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statIcon}>🌱</span>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{plantCount}</span>
                            <span className={styles.statLabel}>Bitki</span>
                        </div>
                    </div>
                </div>

                {/* Tables */}
                <div className={styles.tables}>
                    {/* Recent Users */}
                    <div className={styles.tableCard}>
                        <h2>Son Kullanıcılar</h2>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>İsim</th>
                                    <th>Email</th>
                                    <th>Kartvizit</th>
                                    <th>Kayıt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.name || "-"}</td>
                                        <td>{user.email}</td>
                                        <td>{user._count.cards}</td>
                                        <td>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Recent Tags */}
                    <div className={styles.tableCard}>
                        <h2>Son NFC Taglar</h2>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Kod</th>
                                    <th>Modül</th>
                                    <th>Sahip</th>
                                    <th>Durum</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTags.map((tag) => (
                                    <tr key={tag.id}>
                                        <td><code>{tag.publicCode}</code></td>
                                        <td>{tag.moduleType || "-"}</td>
                                        <td>{tag.owner?.name || tag.owner?.email || "-"}</td>
                                        <td>
                                            <span className={tag.ownerId ? styles.badgeActive : styles.badgePending}>
                                                {tag.ownerId ? "Aktif" : "Bekliyor"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
