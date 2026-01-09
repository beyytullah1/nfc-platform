import { prisma } from "@/lib/db"
import styles from "../admin.module.css"

export default async function AdminDashboard() {
    // Sistem geneli istatistikler
    const [
        userCount,
        cardCount,
        plantCount,
        mugCount,
        giftCount,
        pageCount,
        nfcTagCount,
        activeNfcCount,
        connectionCount,
        thisMonthUsers,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.card.count(),
        prisma.plant.count(),
        prisma.mug.count(),
        prisma.gift.count(),
        prisma.page.count(),
        prisma.nfcTag.count(),
        prisma.nfcTag.count({ where: { status: 'claimed' } }),
        prisma.connection.count(),
        prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }
        }),
    ])

    // Son kayıtlar
    const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true }
    })

    return (
        <div>
            <div className={styles.header}>
                <h1>Admin Dashboard</h1>
                <p>Sistem geneli istatistikler ve yönetim</p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <StatCard
                    icon="👥"
                    title="Toplam Kullanıcı"
                    value={userCount}
                    subtitle={`Bu ay: ${thisMonthUsers} yeni`}
                />
                <StatCard
                    icon="💳"
                    title="Kartvizitler"
                    value={cardCount}
                />
                <StatCard
                    icon="🏷️"
                    title="NFC Etiket"
                    value={nfcTagCount}
                    subtitle={`Aktif: ${activeNfcCount}`}
                />
                <StatCard
                    icon="🌱"
                    title="Bitkiler"
                    value={plantCount}
                />
                <StatCard
                    icon="☕"
                    title="Kupalar"
                    value={mugCount}
                />
                <StatCard
                    icon="🎁"
                    title="Hediyeler"
                    value={giftCount}
                />
                <StatCard
                    icon="📄"
                    title="Sayfalar"
                    value={pageCount}
                />
                <StatCard
                    icon="🔗"
                    title="Bağlantılar"
                    value={connectionCount}
                />
            </div>

            {/* Recent Users */}
            <div className={styles.section}>
                <h2>Son Kayıt Olan Kullanıcılar</h2>
                <div className={styles.table}>
                    <table>
                        <thead>
                            <tr>
                                <th>İsim</th>
                                <th>Email</th>
                                <th>Kayıt Tarihi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name || 'İsimsiz'}</td>
                                    <td>{user.email}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, title, value, subtitle }: {
    icon: string
    title: string
    value: number
    subtitle?: string
}) {
    return (
        <div className={styles.statCard}>
            <div className={styles.statIcon}>{icon}</div>
            <div className={styles.statContent}>
                <div className={styles.statValue}>{value.toLocaleString()}</div>
                <div className={styles.statTitle}>{title}</div>
                {subtitle && <div className={styles.statSubtitle}>{subtitle}</div>}
            </div>
        </div>
    )
}
