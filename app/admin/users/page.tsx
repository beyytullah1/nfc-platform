import { prisma } from "@/lib/db"
import Link from "next/link"
import styles from "../admin.module.css"

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: Promise<{ role?: string; search?: string }>
}) {
    const params = await searchParams
    const roleFilter = params.role
    const searchQuery = params.search

    // Build where clause
    const where: any = {}

    if (roleFilter) {
        where.role = roleFilter
    }

    if (searchQuery) {
        where.OR = [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
            { username: { contains: searchQuery, mode: 'insensitive' } }
        ]
    }

    const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            username: true,
            createdAt: true,
            _count: {
                select: {
                    cards: true,
                    plants: true,
                    mugs: true,
                    sentGifts: true
                }
            }
        }
    })

    // Raw SQL to get role (since Prisma might not have it in types yet)
    const userRoles = await prisma.$queryRaw<Array<{ id: string; role: string }>>`
        SELECT id, role FROM users WHERE id = ANY(${users.map(u => u.id)})
    `
    const rolesMap = new Map(userRoles.map(r => [r.id, r.role]))

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1>Kullanıcı Yönetimi</h1>
                    <p>Tüm kullanıcıları görüntüle ve yönet</p>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <form method="GET" className={styles.searchForm}>
                    <input
                        type="text"
                        name="search"
                        placeholder="İsim, email veya kullanıcı adı ara..."
                        defaultValue={searchQuery}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>
                        🔍 Ara
                    </button>
                </form>

                <div className={styles.roleFilters}>
                    <Link
                        href="/admin/users"
                        className={!roleFilter ? styles.filterActive : styles.filterButton}
                    >
                        Tümü ({users.length})
                    </Link>
                    <Link
                        href="/admin/users?role=user"
                        className={roleFilter === 'user' ? styles.filterActive : styles.filterButton}
                    >
                        Kullanıcılar
                    </Link>
                    <Link
                        href="/admin/users?role=admin"
                        className={roleFilter === 'admin' ? styles.filterActive : styles.filterButton}
                    >
                        Adminler
                    </Link>
                </div>
            </div>

            {/* Users Table */}
            <div className={styles.section}>
                <div className={styles.table}>
                    <table>
                        <thead>
                            <tr>
                                <th>İsim</th>
                                <th>Email</th>
                                <th>Kullanıcı Adı</th>
                                <th>Role</th>
                                <th>Kayıt Tarihi</th>
                                <th>İçerik</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name || 'İsimsiz'}</td>
                                    <td>{user.email}</td>
                                    <td>{user.username || '-'}</td>
                                    <td>
                                        <span className={
                                            rolesMap.get(user.id) === 'admin'
                                                ? styles.roleAdmin
                                                : styles.roleUser
                                        }>
                                            {rolesMap.get(user.id) === 'admin' ? '👑 Admin' : '👤 User'}
                                        </span>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                                    <td>
                                        <div className={styles.contentCounts}>
                                            {user._count.cards > 0 && <span>💳 {user._count.cards}</span>}
                                            {user._count.plants > 0 && <span>🌱 {user._count.plants}</span>}
                                            {user._count.mugs > 0 && <span>☕ {user._count.mugs}</span>}
                                            {user._count.sentGifts > 0 && <span>🎁 {user._count.sentGifts}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <Link
                                            href={`/admin/users/${user.id}`}
                                            className={styles.viewButton}
                                        >
                                            Görüntüle
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>Kullanıcı bulunamadı</p>
                    </div>
                )}
            </div>
        </div>
    )
}
