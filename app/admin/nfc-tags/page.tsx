import { prisma } from "@/lib/db"
import Link from "next/link"
import styles from "../admin.module.css"

export default async function AdminNfcTagsPage({
    searchParams
}: {
    searchParams: Promise<{ status?: string; module?: string; search?: string }>
}) {
    const params = await searchParams
    const statusFilter = params.status
    const moduleFilter = params.module
    const searchQuery = params.search

    // Build where clause
    const where: any = {}

    if (statusFilter) {
        where.status = statusFilter
    }

    if (moduleFilter) {
        where.moduleType = moduleFilter
    }

    if (searchQuery) {
        where.OR = [
            { tagId: { contains: searchQuery, mode: 'insensitive' } },
            { publicCode: { contains: searchQuery, mode: 'insensitive' } }
        ]
    }

    const tags = await prisma.nfcTag.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    })

    // Stats
    const totalTags = await prisma.nfcTag.count()
    const claimedTags = await prisma.nfcTag.count({ where: { status: 'claimed' } })
    const unclaimedTags = await prisma.nfcTag.count({ where: { status: 'unclaimed' } })

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1>NFC Etiket Yönetimi</h1>
                    <p>Tüm NFC etiketlerini görüntüle ve yönet</p>
                </div>
                <Link href="/admin/nfc-tags/create" className={styles.actionBtnPrimary}>
                    ✨ Yeni Etiket Oluştur
                </Link>
            </div>

            {/* Quick Stats */}
            <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🏷️</div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{totalTags}</div>
                        <div className={styles.statTitle}>Toplam Etiket</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>✅</div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{claimedTags}</div>
                        <div className={styles.statTitle}>Bağlı Etiket</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>⏳</div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{unclaimedTags}</div>
                        <div className={styles.statTitle}>Bekleyen Etiket</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <form method="GET" className={styles.searchForm}>
                    <input
                        type="text"
                        name="search"
                        placeholder="Tag ID veya Public Code ara..."
                        defaultValue={searchQuery}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>
                        🔍 Ara
                    </button>
                </form>

                <div className={styles.roleFilters}>
                    <Link
                        href="/admin/nfc-tags"
                        className={!statusFilter ? styles.filterActive : styles.filterButton}
                    >
                        Tümü
                    </Link>
                    <Link
                        href="/admin/nfc-tags?status=claimed"
                        className={statusFilter === 'claimed' ? styles.filterActive : styles.filterButton}
                    >
                        Bağlı
                    </Link>
                    <Link
                        href="/admin/nfc-tags?status=unclaimed"
                        className={statusFilter === 'unclaimed' ? styles.filterActive : styles.filterButton}
                    >
                        Bekleyen
                    </Link>
                </div>

                <div className={styles.roleFilters}>
                    <Link
                        href="/admin/nfc-tags"
                        className={!moduleFilter ? styles.filterActive : styles.filterButton}
                    >
                        Tüm Modüller
                    </Link>
                    <Link
                        href="/admin/nfc-tags?module=card"
                        className={moduleFilter === 'card' ? styles.filterActive : styles.filterButton}
                    >
                        💳 Kart
                    </Link>
                    <Link
                        href="/admin/nfc-tags?module=plant"
                        className={moduleFilter === 'plant' ? styles.filterActive : styles.filterButton}
                    >
                        🌱 Bitki
                    </Link>
                    <Link
                        href="/admin/nfc-tags?module=mug"
                        className={moduleFilter === 'mug' ? styles.filterActive : styles.filterButton}
                    >
                        ☕ Kupa
                    </Link>
                    <Link
                        href="/admin/nfc-tags?module=gift"
                        className={moduleFilter === 'gift' ? styles.filterActive : styles.filterButton}
                    >
                        🎁 Hediye
                    </Link>
                </div>
            </div>

            {/* Tags Table */}
            <div className={styles.section}>
                <div className={styles.table}>
                    <table>
                        <thead>
                            <tr>
                                <th>Public Code</th>
                                <th>Tag ID</th>
                                <th>Sahip</th>
                                <th>Modül</th>
                                <th>Durum</th>
                                <th>Oluşturulma</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tags.map(tag => (
                                <tr key={tag.id}>
                                    <td>
                                        <code style={{
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            color: '#60a5fa'
                                        }}>
                                            {tag.publicCode}
                                        </code>
                                    </td>
                                    <td>
                                        <code style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                                            {tag.tagId.substring(0, 16)}...
                                        </code>
                                    </td>
                                    <td>
                                        {tag.owner ? (
                                            <Link
                                                href={`/admin/users/${tag.owner.id}`}
                                                style={{ color: '#60a5fa', textDecoration: 'none' }}
                                            >
                                                {tag.owner.name || tag.owner.email}
                                            </Link>
                                        ) : (
                                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        {tag.moduleType ? (
                                            <span className={styles.moduleBadge}>
                                                {tag.moduleType === 'card' && '💳 Kart'}
                                                {tag.moduleType === 'plant' && '🌱 Bitki'}
                                                {tag.moduleType === 'mug' && '☕ Kupa'}
                                                {tag.moduleType === 'gift' && '🎁 Hediye'}
                                                {tag.moduleType === 'canvas' && '🎨 Canvas'}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={
                                            tag.status === 'claimed'
                                                ? styles.statusClaimed
                                                : styles.statusUnclaimed
                                        }>
                                            {tag.status === 'claimed' ? '✅ Bağlı' : '⏳ Bekleyen'}
                                        </span>
                                    </td>
                                    <td>{new Date(tag.createdAt).toLocaleDateString('tr-TR')}</td>
                                    <td>
                                        <Link
                                            href={`/t/${tag.publicCode}`}
                                            target="_blank"
                                            className={styles.viewButton}
                                            style={{ fontSize: '0.85rem', padding: '0.375rem 0.75rem' }}
                                        >
                                            👁️ Görüntüle
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {tags.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>Etiket bulunamadı</p>
                    </div>
                )}
            </div>
        </div>
    )
}
