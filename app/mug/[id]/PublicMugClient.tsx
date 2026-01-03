'use client'

import { FollowButton } from '@/app/components/FollowButton'
import styles from './public-mug.module.css'

interface MugLog {
    id: string
    logType: string
    createdAt: Date
}

interface PublicMugClientProps {
    mug: {
        id: string
        name: string
        owner: { name: string | null }
        logs: MugLog[]
    }
    tagId: string | null
    stats: {
        coffeeCount: number
        teaCount: number
        waterCount: number
    }
}

const DRINK_ICONS: Record<string, string> = {
    coffee: "☕",
    tea: "🍵",
    water: "💧",
}

const DRINK_NAMES: Record<string, string> = {
    coffee: "Kahve",
    tea: "Çay",
    water: "Su",
}

export default function PublicMugClient({ mug, tagId, stats }: PublicMugClientProps) {
    const lastDrink = mug.logs[0]

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                {/* Mug Image */}
                <div className={styles.mugImage}>
                    <span className={styles.mugEmoji}>☕</span>
                </div>

                {/* Name */}
                <h1 className={styles.name}>{mug.name}</h1>
                <p className={styles.owner}>👤 {mug.owner.name || "Anonim"}</p>

                {/* Follow Button */}
                {tagId && (
                    <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'center' }}>
                        <FollowButton tagId={tagId} />
                    </div>
                )}

                {/* Current Drink */}
                {lastDrink && (
                    <div className={styles.currentDrink}>
                        <p className={styles.currentLabel}>Son İçecek</p>
                        <p className={styles.currentValue}>
                            {DRINK_ICONS[lastDrink.logType] || "🥤"} {DRINK_NAMES[lastDrink.logType] || lastDrink.logType}
                        </p>
                    </div>
                )}

                {/* Stats */}
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>☕</span>
                        <span className={styles.statValue}>{stats.coffeeCount}</span>
                        <span className={styles.statLabel}>Kahve</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>🍵</span>
                        <span className={styles.statValue}>{stats.teaCount}</span>
                        <span className={styles.statLabel}>Çay</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>💧</span>
                        <span className={styles.statValue}>{stats.waterCount}</span>
                        <span className={styles.statLabel}>Su</span>
                    </div>
                </div>

                {/* Recent Drinks */}
                {mug.logs.length > 0 && (
                    <div className={styles.recentSection}>
                        <h3 className={styles.recentTitle}>Son İçecekler</h3>
                        {mug.logs.map((log) => (
                            <div key={log.id} className={styles.drinkLog}>
                                <span className={styles.drinkIcon}>
                                    {DRINK_ICONS[log.logType] || "🥤"}
                                </span>
                                <div className={styles.drinkInfo}>
                                    <span className={styles.drinkType}>
                                        {DRINK_NAMES[log.logType] || log.logType}
                                    </span>
                                    <span className={styles.drinkTime}>
                                        {new Date(log.createdAt).toLocaleString("tr-TR", {
                                            day: "numeric",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {mug.logs.length === 0 && (
                    <p className={styles.emptyLogs}>Henüz içecek kaydı yok</p>
                )}

                {/* Footer */}
                <div className={styles.footer}>
                    <span>☕ NFC Platform</span>
                </div>
            </div>
        </div>
    )
}
