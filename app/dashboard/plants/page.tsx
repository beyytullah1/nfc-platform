import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import styles from "./plants.module.css"

export default async function PlantsPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let plants: any[] = []
    try {
        plants = await prisma.plant.findMany({
            where: {
                OR: [
                    { ownerId: session.user.id },
                    { coOwners: { some: { id: session.user.id } } }
                ]
            },
            include: {
                logs: {
                    orderBy: { createdAt: 'desc' },
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        console.error('Database error loading plants:', error)
        // Return empty array if database error - user can still see page
        plants = []
    }

    // Calculate statistics
    const totalPlants = plants.length
    const totalWaterings = plants.reduce((sum, p) => sum + p.logs.filter((l: { logType: string }) => l.logType === 'water').length, 0)
    const giftedPlants = plants.filter(p => p.isGift).length
    const oldestPlant = plants.length > 0 ?
        Math.max(...plants.map(p => Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)))) : 0

    return (
        <>
            <header className={styles.header}>
                <div>
                    <h1>Bitkilerim 🌿</h1>
                    <p>Akıllı saksılarınızı yönetin</p>
                </div>
                <Link href="/dashboard/plants/new" className={styles.createBtn}>
                    <span>🌱</span> Yeni Bitki
                </Link>
            </header>

            {/* Statistics Grid */}
            {plants.length > 0 && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.green}`}>🪴</div>
                        <div className={styles.statInfo}>
                            <h3>Toplam Bitki</h3>
                            <p>{totalPlants}</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.blue}`}>💧</div>
                        <div className={styles.statInfo}>
                            <h3>Sulama</h3>
                            <p>{totalWaterings}</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.purple}`}>📅</div>
                        <div className={styles.statInfo}>
                            <h3>En Eski Bitki</h3>
                            <p>{oldestPlant} gün</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.pink}`}>🎁</div>
                        <div className={styles.statInfo}>
                            <h3>Hediye</h3>
                            <p>{giftedPlants}</p>
                        </div>
                    </div>
                </div>
            )}

            {plants.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🪴</div>
                    <h2>Henüz bitkiniz yok</h2>
                    <p>Akıllı saksınızı ekleyerek bitki bakımını takip etmeye başlayın.</p>
                    <Link href="/dashboard/plants/new" className={styles.createBtn}>
                        İlk Bitkimi Ekle
                    </Link>
                </div>
            ) : (
                <div className={styles.plantGrid}>
                    {plants.map((plant) => {
                        const lastWatered = plant.logs.find((l: { logType: string }) => l.logType === 'water')
                        const daysSinceWater = lastWatered
                            ? Math.floor((Date.now() - new Date(lastWatered.createdAt).getTime()) / (1000 * 60 * 60 * 24))
                            : null

                        return (
                            <Link href={`/dashboard/plants/${plant.id}`} key={plant.id} className={styles.plantCard}>
                                <div className={styles.plantImage}>
                                    {plant.coverImageUrl ? (
                                        <img src={plant.coverImageUrl} alt={plant.name} />
                                    ) : (
                                        <span className={styles.plantEmoji}>🌱</span>
                                    )}
                                </div>
                                <div className={styles.plantInfo}>
                                    <h3>{plant.name}</h3>
                                    <p>{plant.species || "Bitki"}</p>
                                    {daysSinceWater !== null && (
                                        <div className={styles.waterStatus}>
                                            💧 {daysSinceWater === 0 ? "Bugün sulandı" : `${daysSinceWater} gün önce`}
                                        </div>
                                    )}
                                </div>
                                {plant.isGift && (
                                    <span className={styles.giftBadge}>🎁 Hediye</span>
                                )}
                            </Link>
                        )
                    })}
                </div>
            )}
        </>
    )
}
