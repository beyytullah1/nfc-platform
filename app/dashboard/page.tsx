import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import styles from "./dashboard.module.css"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // İstatistikleri al
    const [cardCount, plantCount, mugCount, pageCount, connectionCount, nfcTagCount] = await Promise.all([
        prisma.card.count({ where: { userId: session.user.id } }),
        prisma.plant.count({ where: { ownerId: session.user.id } }),
        prisma.mug.count({ where: { ownerId: session.user.id } }),
        prisma.page.count({ where: { ownerId: session.user.id } }),
        prisma.connection.count({ where: { userId: session.user.id } }),
        prisma.nfcTag.count({ where: { ownerId: session.user.id } }),
    ])

    // Son kartvizitleri al
    const recentCards = await prisma.card.findMany({
        where: { userId: session.user.id },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { fields: true }
    })

    // Son aktiviteleri al (bitki sulamaları, kupa içecekleri)
    const [recentPlantLogs, recentMugLogs] = await Promise.all([
        prisma.plantLog.findMany({
            where: { plant: { ownerId: session.user.id } },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { plant: true }
        }),
        prisma.mugLog.findMany({
            where: { mug: { ownerId: session.user.id } },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { mug: true }
        })
    ])

    // Tüm aktiviteleri birleştir ve sırala
    const allActivities = [
        ...recentPlantLogs.map(log => ({
            id: log.id,
            type: 'plant' as const,
            icon: log.logType === 'water' ? '💧' : log.logType === 'photo' ? '📸' : '🌱',
            title: log.logType === 'water' ? 'Sulama' : log.logType === 'photo' ? 'Fotoğraf' : 'Bakım',
            subtitle: log.plant.name,
            createdAt: log.createdAt
        })),
        ...recentMugLogs.map(log => ({
            id: log.id,
            type: 'mug' as const,
            icon: log.logType === 'coffee' ? '☕' : log.logType === 'tea' ? '🍵' : '💧',
            title: log.logType === 'coffee' ? 'Kahve' : log.logType === 'tea' ? 'Çay' : 'Su',
            subtitle: log.mug.name,
            createdAt: log.createdAt
        }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6)

    const formatTimeAgo = (date: Date) => {
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

    return (
        <>
            <header className={styles.header}>
                <div>
                    <h1>Hoş Geldin, {session.user.name || "Kullanıcı"}! 👋</h1>
                    <p>NFC platformuna hoş geldiniz</p>
                </div>
                <div className={styles.userInfo}>
                    <span>{session.user.email}</span>
                </div>
            </header>

            <div className={styles.stats}>
                <Link href="/dashboard/cards" className={styles.statCard}>
                    <div className={styles.statIcon}>💳</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{cardCount}</span>
                        <span className={styles.statLabel}>Kartvizit</span>
                    </div>
                </Link>
                <Link href="/dashboard/connections" className={styles.statCard}>
                    <div className={styles.statIcon}>👥</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{connectionCount}</span>
                        <span className={styles.statLabel}>İletişim</span>
                    </div>
                </Link>
                <Link href="/dashboard/nfc-tags" className={styles.statCard}>
                    <div className={styles.statIcon}>🏷️</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{nfcTagCount}</span>
                        <span className={styles.statLabel}>NFC Tag</span>
                    </div>
                </Link>
                <Link href="/dashboard/plants" className={styles.statCard}>
                    <div className={styles.statIcon}>🌱</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{plantCount}</span>
                        <span className={styles.statLabel}>Bitki</span>
                    </div>
                </Link>
                <Link href="/dashboard/mugs" className={styles.statCard}>
                    <div className={styles.statIcon}>☕</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{mugCount}</span>
                        <span className={styles.statLabel}>Kupa</span>
                    </div>
                </Link>
                <Link href="/dashboard/pages" className={styles.statCard}>
                    <div className={styles.statIcon}>📄</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{pageCount}</span>
                        <span className={styles.statLabel}>Sayfa</span>
                    </div>
                </Link>
            </div>

            {/* Son Aktiviteler */}
            {allActivities.length > 0 && (
                <section className={styles.recentSection}>
                    <div className={styles.sectionHeader}>
                        <h2>📊 Son Aktiviteler</h2>
                    </div>
                    <div className={styles.activityList}>
                        {allActivities.map((activity) => (
                            <div key={activity.id} className={styles.activityItem}>
                                <span className={styles.activityIcon}>{activity.icon}</span>
                                <div className={styles.activityContent}>
                                    <span className={styles.activityTitle}>{activity.title}</span>
                                    <span className={styles.activitySubtitle}>{activity.subtitle}</span>
                                </div>
                                <span className={styles.activityTime}>{formatTimeAgo(activity.createdAt)}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Son Kartvizitler */}
            {recentCards.length > 0 && (
                <section className={styles.recentSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Son Kartvizitler</h2>
                        <Link href="/dashboard/cards" className={styles.viewAllLink}>
                            Tümünü Gör →
                        </Link>
                    </div>
                    <div className={styles.recentGrid}>
                        {recentCards.map((card) => (
                            <Link href={`/dashboard/cards/${card.id}`} key={card.id} className={styles.recentCard}>
                                <div className={styles.recentCardHeader}>
                                    <div className={styles.recentAvatar}>
                                        {session.user?.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <h3>{session.user?.name}</h3>
                                        <p>{card.title || "Kartvizit"}</p>
                                    </div>
                                </div>
                                <div className={styles.recentCardMeta}>
                                    {card.fields.length} alan • {new Date(card.createdAt).toLocaleDateString('tr-TR')}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <div className={styles.quickActions}>
                <h2>Hızlı İşlemler</h2>
                <div className={styles.actionGrid}>
                    <Link href="/dashboard/cards/new" className={styles.actionCard}>
                        <span className={styles.actionIcon}>➕</span>
                        <span>Yeni Kartvizit</span>
                    </Link>
                    <Link href="/dashboard/plants/new" className={styles.actionCard}>
                        <span className={styles.actionIcon}>🌿</span>
                        <span>Yeni Bitki</span>
                    </Link>
                    <Link href="/dashboard/mugs/new" className={styles.actionCard}>
                        <span className={styles.actionIcon}>☕</span>
                        <span>Yeni Kupa</span>
                    </Link>
                    <Link href="/claim?code=DEMO001" className={styles.actionCard}>
                        <span className={styles.actionIcon}>🔗</span>
                        <span>NFC Eşleştir</span>
                    </Link>
                </div>
            </div>
        </>
    )
}
