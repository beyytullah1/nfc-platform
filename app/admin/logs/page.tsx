import { prisma } from "@/lib/db"
import Link from "next/link"
import styles from "../admin.module.css"

export default async function AdminLogsPage({
    searchParams
}: {
    searchParams: Promise<{ action?: string; limit?: string }>
}) {
    const params = await searchParams
    const actionFilter = params.action
    const limit = parseInt(params.limit || '50')

    // Build where clause
    const where: any = {}

    if (actionFilter) {
        where.action = actionFilter
    }

    const logs = await prisma.adminLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
            admin: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    })

    // Get unique action types for filter
    const actionTypes = await prisma.adminLog.groupBy({
        by: ['action'],
        _count: { action: true }
    })

    // Action labels
    const actionLabels: Record<string, string> = {
        'user_edited': '👤 Kullanıcı Düzenlendi',
        'password_reset': '🔐 Şifre Sıfırlandı',
        'role_changed': '👑 Rol Değiştirildi',
        'user_deleted': '🗑️ Kullanıcı Silindi',
    }

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1>Admin Aktivite Logları</h1>
                    <p>Tüm admin işlemlerinin geçmişi</p>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.roleFilters}>
                    <Link
                        href="/admin/logs"
                        className={!actionFilter ? styles.filterActive : styles.filterButton}
                    >
                        Tüm İşlemler ({logs.length})
                    </Link>
                    {actionTypes.map(type => (
                        <Link
                            key={type.action}
                            href={`/admin/logs?action=${type.action}`}
                            className={actionFilter === type.action ? styles.filterActive : styles.filterButton}
                        >
                            {actionLabels[type.action] || type.action} ({type._count.action})
                        </Link>
                    ))}
                </div>

                <div className={styles.roleFilters}>
                    <Link
                        href="/admin/logs?limit=50"
                        className={limit === 50 ? styles.filterActive : styles.filterButton}
                    >
                        Son 50
                    </Link>
                    <Link
                        href="/admin/logs?limit=100"
                        className={limit === 100 ? styles.filterActive : styles.filterButton}
                    >
                        Son 100
                    </Link>
                    <Link
                        href="/admin/logs?limit=500"
                        className={limit === 500 ? styles.filterActive : styles.filterButton}
                    >
                        Son 500
                    </Link>
                </div>
            </div>

            {/* Logs Table */}
            <div className={styles.section}>
                <div className={styles.table}>
                    <table>
                        <thead>
                            <tr>
                                <th>Tarih/Saat</th>
                                <th>Admin</th>
                                <th>İşlem</th>
                                <th>Hedef</th>
                                <th>Detaylar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => {
                                let details = null
                                try {
                                    details = log.details ? JSON.parse(log.details) : null
                                } catch (e) {
                                    // Invalid JSON
                                }

                                return (
                                    <tr key={log.id}>
                                        <td>
                                            <div style={{ fontSize: '0.9rem' }}>
                                                {new Date(log.createdAt).toLocaleDateString('tr-TR')}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                                                {new Date(log.createdAt).toLocaleTimeString('tr-TR')}
                                            </div>
                                        </td>
                                        <td>
                                            <Link
                                                href={`/admin/users/${log.admin.id}`}
                                                style={{ color: '#60a5fa', textDecoration: 'none' }}
                                            >
                                                {log.admin.name || log.admin.email}
                                            </Link>
                                        </td>
                                        <td>
                                            <span className={styles.actionBadge}>
                                                {actionLabels[log.action] || log.action}
                                            </span>
                                        </td>
                                        <td>
                                            {log.targetType && (
                                                <div>
                                                    <span style={{
                                                        color: 'rgba(255,255,255,0.6)',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        {log.targetType}
                                                    </span>
                                                    {log.targetId && log.targetType === 'user' && (
                                                        <div>
                                                            <Link
                                                                href={`/admin/users/${log.targetId}`}
                                                                style={{
                                                                    color: '#60a5fa',
                                                                    fontSize: '0.8rem',
                                                                    textDecoration: 'none'
                                                                }}
                                                            >
                                                                Görüntüle →
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {details && (
                                                <details style={{ cursor: 'pointer' }}>
                                                    <summary style={{ color: '#60a5fa', fontSize: '0.85rem' }}>
                                                        Detayları Göster
                                                    </summary>
                                                    <pre style={{
                                                        fontSize: '0.75rem',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        padding: '0.5rem',
                                                        borderRadius: '4px',
                                                        marginTop: '0.5rem',
                                                        overflow: 'auto'
                                                    }}>
                                                        {JSON.stringify(details, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {logs.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>Henüz log kaydı yok</p>
                    </div>
                )}
            </div>
        </div>
    )
}
