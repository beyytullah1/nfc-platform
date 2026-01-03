import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import cardStyles from "./cards.module.css"
import CardList from "./CardList"

export default async function CardsPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const cards = await prisma.card.findMany({
        where: { userId: session.user.id },
        include: { fields: true },
        orderBy: { createdAt: 'desc' }
    })

    // Calculate statistics
    const totalCards = cards.length
    const totalViews = cards.reduce((sum, c) => sum + ((c as unknown as { viewCount?: number }).viewCount || 0), 0)
    const totalFields = cards.reduce((sum, c) => sum + c.fields.length, 0)
    const cardsWithSlug = cards.filter(c => c.slug).length

    return (
        <>
            <header className={cardStyles.header}>
                <div>
                    <h1>Kartvizitler</h1>
                    <p>Dijital kartvizitlerinizi yönetin</p>
                </div>
                <Link href="/dashboard/cards/new" className={cardStyles.createBtn}>
                    <span>➕</span> Yeni Kartvizit
                </Link>
            </header>

            {/* Statistics Grid */}
            {cards.length > 0 && (
                <div className={cardStyles.statsGrid}>
                    <div className={cardStyles.statCard}>
                        <div className={`${cardStyles.statIcon} ${cardStyles.blue}`}>💳</div>
                        <div className={cardStyles.statInfo}>
                            <h3>Toplam Kart</h3>
                            <p>{totalCards}</p>
                        </div>
                    </div>
                    <div className={cardStyles.statCard}>
                        <div className={`${cardStyles.statIcon} ${cardStyles.green}`}>👁️</div>
                        <div className={cardStyles.statInfo}>
                            <h3>Toplam Görüntülenme</h3>
                            <p>{totalViews}</p>
                        </div>
                    </div>
                    <div className={cardStyles.statCard}>
                        <div className={`${cardStyles.statIcon} ${cardStyles.purple}`}>📋</div>
                        <div className={cardStyles.statInfo}>
                            <h3>Toplam Alan</h3>
                            <p>{totalFields}</p>
                        </div>
                    </div>
                    <div className={cardStyles.statCard}>
                        <div className={`${cardStyles.statIcon} ${cardStyles.orange}`}>🔗</div>
                        <div className={cardStyles.statInfo}>
                            <h3>Özel URL</h3>
                            <p>{cardsWithSlug}/{totalCards}</p>
                        </div>
                    </div>
                </div>
            )}

            <CardList
                cards={cards.map(c => ({
                    id: c.id,
                    title: c.title,
                    slug: c.slug,
                    avatarUrl: c.avatarUrl,
                    viewCount: (c as unknown as { viewCount?: number }).viewCount || 0,
                    createdAt: c.createdAt,
                    fields: c.fields.map(f => ({ id: f.id }))
                }))}
                userName={session.user?.name || null}
            />
        </>
    )
}
