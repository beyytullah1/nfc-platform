import { prisma } from "@/lib/db"
import Link from "next/link"
import styles from "../admin.module.css"

export default async function AdminPlantsPage({
    searchParams,
}: {
    searchParams: { page?: string; search?: string }
}) {
    const page = parseInt(searchParams.page || '1')
    const search = searchParams.search || ''
    const perPage = 20

    const where = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { species: { contains: search, mode: 'insensitive' as const } },
            { owner: { email: { contains: search, mode: 'insensitive' as const } } }
        ]
    } : {}

    const [plants, total] = await Promise.all([
        prisma.plant.findMany({
            where,
            include: {
                owner: { select: { name: true, email: true } },
                tag: { select: { publicCode: true, isPublic: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * perPage,
            take: perPage
        }),
        prisma.plant.count({ where })
    ])

    const totalPages = Math.ceil(total / perPage)

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1>Bitki Yönetimi</h1>
                    <p>Tüm bitkileri görüntüle ve yönet</p>
                </div>
            </div>

            {/* Search */}
            <div className={styles.filters}>
                <form className={styles.searchForm} action="/admin/plants" method="get">
                    <input
                        type="text"
                        name="search"
                        placeholder="İsim, tür, kullanıcı ara..."
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
                    <div className={styles.statIcon}>🌱</div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{total}</div>
                        <div className={styles.statTitle}>Toplam Bitki</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className={styles.section}>
                <div className={styles.table}>
                    <table>
                        <thead>
                            <tr>
                                <th>İsim</th>
                                <th>Tür</th>
                                <th>Sahip</th>
                                <th>NFC Tag</th>
                                <th>Durum</th>
                                <th>Tarih</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plants.map(plant => (
                                <tr key={plant.id}>
                                    <td>{plant.name}</td>
                                    <td>{plant.species || '-'}</td>
                                    <td>{plant.owner?.name || plant.owner?.email || '-'}</td>
                                    <td><code>{plant.tag?.publicCode || '-'}</code></td>
                                    <td>
                                        <span className={plant.tag?.isPublic ? styles.statusClaimed : styles.statusUnclaimed}>
                                            {plant.tag?.isPublic ? 'Görünür' : 'Gizli'}
                                        </span>
                                    </td>
                                    <td>{new Date(plant.createdAt).toLocaleDateString('tr-TR')}</td>
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
                                href={`/admin/plants?page=${p}${search ? `&search=${search}` : ''}`}
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
