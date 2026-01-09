'use client'

import { FollowButton } from '@/app/components/FollowButton'
import styles from './public-plant.module.css'

interface PlantLog {
    id: string
    logType: string
    createdAt: Date
}

interface PublicPlantClientProps {
    plant: {
        id: string
        name: string
        species: string | null
        birthDate: Date | null
        coverImageUrl: string | null
        isGift: boolean
        giftMessage: string | null
        giftedBy: { name: string | null } | null
        owner: { name: string | null }
        logs: PlantLog[]
    }
    tagId: string | null
}

export default function PublicPlantClient({ plant, tagId }: PublicPlantClientProps) {
    const daysSinceBirth = plant.birthDate
        ? Math.floor((Date.now() - new Date(plant.birthDate).getTime()) / (1000 * 60 * 60 * 24))
        : null

    const lastWatered = plant.logs.find(l => l.logType === 'water')
    const daysSinceWater = lastWatered
        ? Math.floor((Date.now() - new Date(lastWatered.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : null

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                {/* Plant Image */}
                <div className={styles.plantImage}>
                    {plant.coverImageUrl ? (
                        <img src={plant.coverImageUrl} alt={plant.name} />
                    ) : (
                        <span className={styles.emoji}>🌱</span>
                    )}
                </div>

                {/* Name & Info */}
                <h1 className={styles.name}>{plant.name}</h1>
                {plant.species && <p className={styles.species}>{plant.species}</p>}

                {daysSinceBirth !== null && (
                    <p className={styles.age}>🎂 {daysSinceBirth} günlük</p>
                )}

                {plant.isGift && (
                    <div className={styles.giftSection}>
                        <span className={styles.giftBadge}>🎁 Hediye</span>
                        {plant.giftedBy && (
                            <p className={styles.giftFrom}>{plant.giftedBy.name} tarafından</p>
                        )}
                        {plant.giftMessage && (
                            <p className={styles.giftMessage}>"{plant.giftMessage}"</p>
                        )}
                    </div>
                )}

                {/* Follow Button */}
                {tagId && (
                    <div style={{ margin: '1rem 0' }}>
                        <FollowButton tagId={tagId} />
                    </div>
                )}

                {/* Stats */}
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>💧</span>
                        <div>
                            <span className={styles.statLabel}>Son Sulama</span>
                            <span className={styles.statValue}>
                                {daysSinceWater !== null
                                    ? (daysSinceWater === 0 ? "Bugün" : `${daysSinceWater} gün önce`)
                                    : "—"
                                }
                            </span>
                        </div>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>📊</span>
                        <div>
                            <span className={styles.statLabel}>Toplam Sulama</span>
                            <span className={styles.statValue}>
                                {plant.logs.filter(l => l.logType === 'water').length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Owner */}
                <div className={styles.owner}>
                    <span>👤</span> {plant.owner.name || "Bir kullanıcı"} tarafından bakılıyor
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <span>🌿 Temasal</span>
                </div>
            </div>
        </div>
    )
}
