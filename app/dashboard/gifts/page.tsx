import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import styles from "./gifts.module.css"
import { GiftList } from "./GiftList"

export default async function GiftsPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    // TODO: Remove 'as any' after prisma generate
    const gifts = await (prisma as any).gift.findMany({
        where: {
            senderId: session.user.id
        },
        include: {
            tag: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const stats = {
        total: gifts.length,
        claimed: gifts.filter((g: any) => g.isClaimed).length,
        pending: gifts.filter((g: any) => !g.isClaimed).length
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Hediye Kutusu</h1>
                    <p>Sevdikleriniz için özel dijital hediyeler hazırlayın</p>
                </div>
                <Link href="/dashboard/gifts/new" className={styles.createBtn}>
                    <span>✨</span> Yeni Hediye
                </Link>
            </div>

            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.statPink}`}>
                    <div className={styles.statIcon}>🎁</div>
                    <div className={styles.statInfo}>
                        <h3>Toplam</h3>
                        <p>{stats.total}</p>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.statGreen}`}>
                    <div className={styles.statIcon}>✅</div>
                    <div className={styles.statInfo}>
                        <h3>Açılan</h3>
                        <p>{stats.claimed}</p>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.statYellow}`}>
                    <div className={styles.statIcon}>⏳</div>
                    <div className={styles.statInfo}>
                        <h3>Bekleyen</h3>
                        <p>{stats.pending}</p>
                    </div>
                </div>
            </div>

            <GiftList gifts={gifts} />
        </div>
    )
}
