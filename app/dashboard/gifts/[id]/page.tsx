import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import styles from "../gifts.module.css"
import { deleteGift } from "@/lib/gift-actions"
import { GiftActions } from "./GiftActions"

export default async function GiftDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const gift = await prisma.page.findUnique({
        where: { id },
        include: {
            blocks: { orderBy: { displayOrder: 'asc' } },
            tag: { select: { id: true } }
        }
    })

    if (!gift || gift.ownerId !== session.user.id || gift.moduleType !== 'gift') {
        redirect("/dashboard/gifts")
    }

    const textBlock = gift.blocks.find(b => b.blockType === "text")
    const musicBlock = gift.blocks.find(b => b.blockType === "music")
    const videoBlock = gift.blocks.find(b => b.blockType === "video")

    const message = textBlock ? JSON.parse(textBlock.content).text : ""
    const musicUrl = musicBlock ? JSON.parse(musicBlock.content).url : ""
    const videoUrl = videoBlock ? JSON.parse(videoBlock.content).url : ""

    return (
        <>
            <Link href="/dashboard/gifts" className={styles.backLink}>
                ← Hediyelere Dön
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
                <div style={{
                    width: "100px",
                    height: "100px",
                    background: "linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(190, 24, 93, 0.2))",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3rem"
                }}>
                    🎁
                </div>
                <div>
                    <h1 style={{ color: "#fff", fontSize: "1.75rem", marginBottom: "0.25rem" }}>{gift.title}</h1>
                    <p style={{ color: "rgba(255,255,255,0.6)" }}>
                        {gift.isSurprise ? "🔒 Kilitli" : "🔓 Açık"} • {new Date(gift.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", maxWidth: "900px" }}>
                {/* Sol - İçerik */}
                <div>
                    <div className={styles.formCard}>
                        <h2>💌 İçerik</h2>

                        {message && (
                            <div className={styles.mediaBlock}>
                                <span className={styles.mediaIcon}>💬</span>
                                <div className={styles.mediaInfo}>
                                    <span>Mesaj</span>
                                    <small>{message.substring(0, 50)}...</small>
                                </div>
                            </div>
                        )}

                        {musicUrl && (
                            <div className={styles.mediaBlock} style={{ marginTop: "0.75rem" }}>
                                <span className={styles.mediaIcon}>🎵</span>
                                <div className={styles.mediaInfo}>
                                    <span>Müzik</span>
                                    <small>{musicUrl.substring(0, 40)}...</small>
                                </div>
                            </div>
                        )}

                        {videoUrl && (
                            <div className={styles.mediaBlock} style={{ marginTop: "0.75rem" }}>
                                <span className={styles.mediaIcon}>🎬</span>
                                <div className={styles.mediaInfo}>
                                    <span>Video</span>
                                    <small>{videoUrl.substring(0, 40)}...</small>
                                </div>
                            </div>
                        )}

                        {!message && !musicUrl && !videoUrl && (
                            <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "1rem" }}>
                                Henüz içerik eklenmedi
                            </p>
                        )}
                    </div>
                </div>

                {/* Sağ - Paylaşım */}
                <div className={styles.formCard}>
                    <h2>🔗 Paylaşım</h2>

                    <div style={{ marginBottom: "1rem" }}>
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Public Link</span>
                        <p style={{ color: "#ec4899", fontWeight: "500" }}>/gift/{gift.id}</p>
                    </div>

                    {gift.isSurprise && (
                        <div style={{ marginBottom: "1rem" }}>
                            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Kilit Kodu</span>
                            <p style={{ color: "#fff", fontWeight: "500" }}>••••</p>
                        </div>
                    )}

                    <Link
                        href={`/gift/${gift.id}`}
                        target="_blank"
                        className={styles.createBtn}
                        style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}
                    >
                        🔗 Hediyeyi Görüntüle
                    </Link>

                    {/* Transfer Actions */}
                    <GiftActions
                        giftId={gift.id}
                        giftTitle={gift.title || "Hediye"}
                        tagId={gift.tag?.id}
                    />

                    <form action={async () => {
                        "use server"
                        await deleteGift(id)
                    }}>
                        <button
                            type="submit"
                            className={styles.deleteBtn}
                            style={{
                                width: "100%",
                                marginTop: "1rem",
                                padding: "0.875rem",
                                background: "rgba(239, 68, 68, 0.15)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: "12px",
                                color: "#fca5a5",
                                cursor: "pointer"
                            }}
                        >
                            🗑️ Hediyeyi Sil
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}
