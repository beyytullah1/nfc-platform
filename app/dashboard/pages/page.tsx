import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import styles from "./pages.module.css"

export default async function PagesPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const pages = await prisma.page.findMany({
        where: {
            ownerId: session.user.id,
            moduleType: 'canvas'
        },
        include: {
            blocks: true
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <>
            <header className={styles.header}>
                <div>
                    <h1>Sayfalarım ✨</h1>
                    <p>Serbest canvas sayfalarınızı yönetin</p>
                </div>
                <Link href="/dashboard/pages/new" className={styles.createBtn}>
                    <span>✨</span> Yeni Sayfa
                </Link>
            </header>

            {pages.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>✨</div>
                    <h2>Henüz sayfanız yok</h2>
                    <p>Blok tabanlı özel sayfalar oluşturun - metin, resim, link ve daha fazlası.</p>
                    <Link href="/dashboard/pages/new" className={styles.createBtn}>
                        İlk Sayfamı Oluştur
                    </Link>
                </div>
            ) : (
                <div className={styles.pageGrid}>
                    {pages.map((page) => (
                        <Link href={`/dashboard/pages/${page.id}`} key={page.id} className={styles.pageCard}>
                            <div className={styles.pagePreview}>
                                <span>📄</span>
                            </div>
                            <div className={styles.pageInfo}>
                                <h3>{page.title}</h3>
                                <p>{page.blocks.length} blok</p>
                            </div>
                            <span className={styles.dateBadge}>
                                {new Date(page.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </>
    )
}
