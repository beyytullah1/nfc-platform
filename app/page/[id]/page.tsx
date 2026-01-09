import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import styles from "./public-page.module.css"

export default async function PublicPagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const page = await prisma.page.findUnique({
        where: { id, moduleType: "canvas" },
        include: {
            owner: { select: { name: true } },
            blocks: { orderBy: { displayOrder: "asc" } }
        }
    })

    if (!page) {
        notFound()
    }

    const renderBlock = (block: { blockType: string; content: string }) => {
        const data = JSON.parse(block.content)

        switch (block.blockType) {
            case "text":
                return (
                    <div className={styles.textBlock}>
                        <p>{data.text}</p>
                    </div>
                )
            case "image":
                return (
                    <div className={styles.imageBlock}>
                        <img src={data.url} alt="" />
                    </div>
                )
            case "link":
                return (
                    <a href={data.url} target="_blank" rel="noopener noreferrer" className={styles.linkBlock}>
                        <span className={styles.linkIcon}>🔗</span>
                        <span>{data.text || data.url}</span>
                        <span className={styles.linkArrow}>→</span>
                    </a>
                )
            case "video":
                const videoId = data.url.includes("youtube.com")
                    ? data.url.split("v=")[1]?.split("&")[0]
                    : data.url.includes("youtu.be")
                        ? data.url.split("/").pop()
                        : null

                if (videoId) {
                    return (
                        <div className={styles.videoBlock}>
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    )
                }
                return (
                    <a href={data.url} target="_blank" className={styles.linkBlock}>
                        <span>🎬</span>
                        <span>Video İzle</span>
                    </a>
                )
            default:
                return null
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>{page.title}</h1>
                    <p>Gönderen: {page.owner.name}</p>
                </header>

                <div className={styles.blocks}>
                    {page.blocks.map((block) => (
                        <div key={block.id} className={styles.block}>
                            {renderBlock(block)}
                        </div>
                    ))}

                    {page.blocks.length === 0 && (
                        <p className={styles.emptyText}>Bu sayfa henüz boş.</p>
                    )}
                </div>

                <footer className={styles.footer}>
                    ✨ Temasal ile oluşturuldu
                </footer>
            </div>
        </div>
    )
}
