import { prisma } from "@/lib/db"
import Link from "next/link"
import styles from "../admin.module.css"

export default async function AdminCardsPage({
    searchParams,
}: {
    searchParams: { page?: string; search?: string }
}) {
    const page = parseInt(searchParams.page || '1')
    const search = searchParams.search || ''
    const perPage = 20

    const where = search ? {
        OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } },
            { user: { name: { contains: search, mode: 'insensitive' as const } } }
        ]
    } : {}

    const [cards, total] = await Promise.all([
        prisma.card.findMany({
            where,
            include: {
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * perPage,
            take: perPage
        }),
        prisma.card.count({ where })
    ])

    const totalPages = Math.ceil(total / perPage)

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1>Kartvizit Yönetimi</h1>
                    <p>Tüm kartvizitleri görüntüle ve yönet</p>
                </div>
            </div>

            {/* Search */}
            <div className={styles.filters}>
                <form className={styles.searchForm} action="/admin/cards" method="get">
                    <input
                        type="text"
                        name="search"
                        placeholder="Başlık, kullanıcı ara..."
                        defaultValue={search}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>
                        🔍 Ara
                    </button>
                </form>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💳</div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{total}</div>
                        <div className={styles.statTitle}>Toplam Kartvizit</div>
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
                                <th>Sahip</th>
                                <th>Slug</th>
                                <th>Görüntülenme</th>
                                <th>Durum</th>
                                <th>Tarih</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cards.map(card => (
                                <tr key={card.id}>
                                    <td>{card.title || 'Başlıksız'}</td>
                                    <td>{card.user?.name || card.user?.email || '-'}</td>
                                    <td><code>{card.slug || card.id}</code></td>
                                    <td>{card.viewCount || 0}</td>
                                    <td>
                                        <span className={card.isPublic ? styles.statusClaimed : styles.statusUnclaimed}>
                                            {card.isPublic ? 'Görünür' : 'Gizli'}
                                        </span>
                                    </td>
                                    <td>{new Date(card.createdAt).toLocaleDateString('tr-TR')}</td>
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
                                href={`/admin/cards?page=${p}${search ? `&search=${search}` : ''}`}
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
