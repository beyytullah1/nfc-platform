import { prisma } from "@/lib/db"
import Link from "next/link"
import styles from "../admin.module.css"

export default async function AdminGiftsPage({
    searchParams,
}: {
    searchParams: { page?: string; search?: string; status?: string }
}) {
    const page = parseInt(searchParams.page || '1')
    const search = searchParams.search || ''
    const statusFilter = searchParams.status
    const perPage = 20

    const where: any = {}

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' as const } },
            { sender: { email: { contains: search, mode: 'insensitive' as const } } }
        ]
    }

    if (statusFilter === 'claimed') {
        where.isClaimed = true
    } else if (statusFilter === 'unclaimed') {
        where.isClaimed = false
    }

    const [gifts, total, claimedCount, unclaimedCount] = await Promise.all([
        prisma.gift.findMany({
            where,
            include: {
                sender: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * perPage,
            take: perPage
        }),
        prisma.gift.count({ where }),
        prisma.gift.count({ where: { isClaimed: true } }),
        prisma.gift.count({ where: { isClaimed: false } })
    ])

    const totalPages = Math.ceil(total / perPage)

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1>Hediye Yönetimi</h1>
                    <p>Tüm hediyeleri görüntüle ve yönet</p>
                </div>
            </div>

            {/* Search */}
            <div className={styles.filters}>
                <form className={styles.searchForm} action="/admin/gifts" method="get">
                    <input
                        type="text"
                        name="search"
                        placeholder="Başlık, gönderen ara..."
                        defaultValue={search}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>
                        🔍 Ara
                    </button>
                </form>

                <div className={styles.roleFilters}>
                    <Link
                        href="/admin/gifts"
                        className={!statusFilter ? styles.filterActive : styles.filterButton}
                    >
                        Tümü
                    </Link>
                    <Link
                        href="/admin/gifts?status=claimed"
                        className={statusFilter === 'claimed' ? styles.filterActive : styles.filterButton}
                    >
                        Açıldı
                    </Link>
                    <Link
                        href="/admin/gifts?status=unclaimed"
                        className={statusFilter === 'unclaimed' ? styles.filterActive : styles.filterButton}
                    >
                        Bekliyor
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🎁</div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{total}</div>
                        <div className={styles.statTitle}>Toplam Hediye</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>✅</div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{claimedCount}</div>
                        <div className={styles.statTitle}>Açıldı</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>⏳</div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{unclaimedCount}</div>
                        <div className={styles.statTitle}>Bekliyor</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className={styles.section}>
                <div className={styles.table}>
                    <table>
                        <thead>
                            <tr>
                                <th>Başlık</th>
                                <th>Gönderen</th>
                                <th>Durum</th>
                                <th>Oluşturma</th>
                                <th>Açılma</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gifts.map(gift => (
                                <tr key={gift.id}>
                                    <td>{gift.title || 'Başlıksız'}</td>
                                    <td>{gift.sender?.name || gift.sender?.email || '-'}</td>
                                    <td>
                                        <span className={gift.isClaimed ? styles.statusClaimed : styles.statusUnclaimed}>
                                            {gift.isClaimed ? 'Açıldı' : 'Bekliyor'}
                                        </span>
                                    </td>
                                    <td>{new Date(gift.createdAt).toLocaleDateString('tr-TR')}</td>
                                    <td>{gift.claimedAt ? new Date(gift.claimedAt).toLocaleDateString('tr-TR') : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <Link
                                key={p}
                                href={`/admin/gifts?page=${p}${search ? `&search=${search}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
                                className={p === page ? styles.filterActive : styles.filterButton}
                            >
                                {p}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
