import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import styles from "./mugs.module.css"

export default async function MugsPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    let mugs = []
    try {
        mugs = await prisma.mug.findMany({
            where: { ownerId: session.user.id },
            include: {
                logs: {
                    orderBy: { createdAt: 'desc' },
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        console.error('Database error loading mugs:', error)
        // Continue with empty array - page will still work
    }

    // Calculate statistics
    const totalMugs = mugs.length
    const allLogs = mugs.flatMap(m => m.logs)
    const totalDrinks = allLogs.length
    const coffeeCount = allLogs.filter(l => l.logType === 'coffee').length
    const teaCount = allLogs.filter(l => l.logType === 'tea').length
    const waterCount = allLogs.filter(l => l.logType === 'water').length

    return (
        <>
            <header className={styles.header}>
                <div>
                    <h1>Kupalarım ☕</h1>
                    <p>Akıllı kupalarınızı yönetin</p>
                </div>
                <Link href="/dashboard/mugs/new" className={styles.createBtn}>
                    <span>☕</span> Yeni Kupa
                </Link>
            </header>

            {/* Statistics Grid */}
            {mugs.length > 0 && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.orange}`}>☕</div>
                        <div className={styles.statInfo}>
                            <h3>Toplam Kupa</h3>
                            <p>{totalMugs}</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.brown}`}>📊</div>
                        <div className={styles.statInfo}>
                            <h3>Toplam İçecek</h3>
                            <p>{totalDrinks}</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.orange}`}>☕</div>
                        <div className={styles.statInfo}>
                            <h3>Kahve</h3>
                            <p>{coffeeCount}</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.green}`}>🍵</div>
                        <div className={styles.statInfo}>
                            <h3>Çay</h3>
                            <p>{teaCount}</p>
                        </div>
                    </div>
                </div>
            )}

            {mugs.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>☕</div>
                    <h2>Henüz kupanız yok</h2>
                    <p>Akıllı kupanızı ekleyerek içecek alışkanlıklarınızı takip edin.</p>
                    <Link href="/dashboard/mugs/new" className={styles.createBtn}>
                        İlk Kupamı Ekle
                    </Link>
                </div>
            ) : (
                <div className={styles.mugGrid}>
                    {mugs.map((mug) => {
                        const lastDrink = mug.logs[0]
                        return (
                            <Link href={`/dashboard/mugs/${mug.id}`} key={mug.id} className={styles.mugCard}>
                                <div className={styles.mugImage}>
                                    <span className={styles.mugEmoji}>☕</span>
                                </div>
                                <div className={styles.mugInfo}>
                                    <h3>{mug.name}</h3>
                                    {lastDrink && (
                                        <p>
                                            Son: {lastDrink.logType === 'coffee' ? '☕ Kahve' : lastDrink.logType === 'tea' ? '🍵 Çay' : '💧 Su'}
                                        </p>
                                    )}
                                </div>
                                <div className={styles.mugStats}>
                                    {mug.logs.length > 0 && (
                                        <span className={styles.statBadge}>
                                            📊 {mug.logs.length} içecek
                                        </span>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </>
    )
}
