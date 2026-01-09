import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import styles from "../../admin.module.css"
import { UserActions } from "./UserActions"

export default async function UserDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    const { id } = await params

    if (!session?.user || (session.user as any).role !== 'admin') {
        redirect('/dashboard')
    }

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    cards: true,
                    plants: true,
                    mugs: true,
                    sentGifts: true,
                    ownedTags: true,
                    connections: true
                }
            }
        }
    })

    if (!user) {
        redirect('/admin/users')
    }

    // Get role via raw SQL
    const roleResult = await prisma.$queryRaw<Array<{ role: string }>>`
        SELECT role FROM users WHERE id = ${id}
    `
    const userRole = roleResult[0]?.role || 'user'

    return (
        <div>
            <Link href="/admin/users" className={styles.backLink}>
                ← Kullanıcılara Dön
            </Link>

            <div className={styles.userDetailHeader}>
                <div className={styles.userAvatar}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                    <h1>{user.name || 'İsimsiz Kullanıcı'}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
                        {user.email}
                    </p>
                    <span className={userRole === 'admin' ? styles.roleAdmin : styles.roleUser}>
                        {userRole === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                </div>
            </div>

            <div className={styles.detailGrid}>
                {/* Kullanıcı Bilgileri */}
                <div className={styles.detailCard}>
                    <h2>📋 Kullanıcı Bilgileri</h2>
                    <div className={styles.infoList}>
                        <div className={styles.infoItem}>
                            <span>ID:</span>
                            <code>{user.id}</code>
                        </div>
                        <div className={styles.infoItem}>
                            <span>Email:</span>
                            <strong>{user.email}</strong>
                        </div>
                        <div className={styles.infoItem}>
                            <span>Kullanıcı Adı:</span>
                            <strong>{user.username || '-'}</strong>
                        </div>
                        <div className={styles.infoItem}>
                            <span>Bio:</span>
                            <p>{user.bio || '-'}</p>
                        </div>
                        <div className={styles.infoItem}>
                            <span>Kayıt Tarihi:</span>
                            <strong>{new Date(user.createdAt).toLocaleString('tr-TR')}</strong>
                        </div>
                        <div className={styles.infoItem}>
                            <span>Son Güncelleme:</span>
                            <strong>{new Date(user.updatedAt).toLocaleString('tr-TR')}</strong>
                        </div>
                    </div>
                </div>

                {/* İçerik İstatistikleri */}
                <div className={styles.detailCard}>
                    <h2>📊 İçerik İstatistikleri</h2>
                    <div className={styles.statsListAdmin}>
                        <div className={styles.statItemAdmin}>
                            <span>💳 Kartvizitler</span>
                            <strong>{user._count.cards}</strong>
                        </div>
                        <div className={styles.statItemAdmin}>
                            <span>🌱 Bitkiler</span>
                            <strong>{user._count.plants}</strong>
                        </div>
                        <div className={styles.statItemAdmin}>
                            <span>☕ Kupalar</span>
                            <strong>{user._count.mugs}</strong>
                        </div>
                        <div className={styles.statItemAdmin}>
                            <span>🎁 Hediyeler</span>
                            <strong>{user._count.sentGifts}</strong>
                        </div>
                        <div className={styles.statItemAdmin}>
                            <span>🏷️ NFC Etiketleri</span>
                            <strong>{user._count.ownedTags}</strong>
                        </div>
                        <div className={styles.statItemAdmin}>
                            <span>🔗 Bağlantılar</span>
                            <strong>{user._count.connections}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <UserActions
                userId={user.id}
                userEmail={user.email || ''}
                currentRole={userRole}
                isCurrentUser={session.user.id === user.id}
            />
        </div>
    )
}
