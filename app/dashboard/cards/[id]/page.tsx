import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import styles from "../cards.module.css"
import { deleteCard } from "@/lib/card-actions"
import { CardActions } from "../CardActions"

const FIELD_ICONS: Record<string, string> = {
    phone: "📱",
    email: "✉️",
    instagram: "📷",
    linkedin: "💼",
    twitter: "🐦",
    website: "🌐",
    github: "💻",
    custom: "✨",
}

export default async function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const card = await prisma.card.findUnique({
        where: { id },
        include: {
            fields: { orderBy: { displayOrder: 'asc' } },
            user: true
        }
    })

    if (!card || card.userId !== session.user.id) {
        redirect("/dashboard/cards")
    }

    return (
        <>
            <Link href="/dashboard/cards" className={styles.backLink}>
                ← Kartvizitlere Dön
            </Link>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", maxWidth: "1000px" }}>
                {/* Preview Card */}
                <div className={styles.formCard}>
                    <h2>👁️ Önizleme</h2>
                    <div style={{
                        background: "linear-gradient(135deg, #1e293b, #0f172a)",
                        borderRadius: "16px",
                        padding: "2rem",
                        textAlign: "center"
                    }}>
                        <div style={{
                            width: "80px",
                            height: "80px",
                            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2rem",
                            fontWeight: "700",
                            color: "#fff",
                            margin: "0 auto 1rem"
                        }}>
                            {card.user.name?.charAt(0) || "U"}
                        </div>
                        <h3 style={{ color: "#fff", fontSize: "1.25rem", marginBottom: "0.25rem" }}>
                            {card.user.name}
                        </h3>
                        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                            {card.title || "Kartvizit"}
                        </p>
                        {card.bio && (
                            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                                {card.bio}
                            </p>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {card.fields.map((field) => (
                                <div key={field.id} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    padding: "0.75rem",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: "10px",
                                    color: "#fff",
                                    fontSize: "0.9rem"
                                }}>
                                    <span>{FIELD_ICONS[field.fieldType] || "📌"}</span>
                                    <span>{field.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div>
                    <div className={styles.formCard}>
                        <h2>📊 Detaylar</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Oluşturulma</span>
                                <p style={{ color: "#fff" }}>{new Date(card.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div>
                                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Alan Sayısı</span>
                                <p style={{ color: "#fff" }}>{card.fields.length} alan</p>
                            </div>
                            <div>
                                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Gizlilik</span>
                                <p style={{ color: "#fff" }}>{card.isPublic ? "🌍 Herkese Açık" : "🔐 Şifre Korumalı"}</p>
                            </div>
                            <div>
                                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Public Link</span>
                                <p style={{ color: "#3b82f6" }}>/card/{card.id}</p>
                            </div>
                        </div>
                    </div>

                    <CardActions cardId={card.id} cardTitle={card.title || "Kartvizit"} />

                    {/* Danger Zone */}
                    <div className={styles.formCard} style={{ marginTop: "1rem", borderColor: "rgba(239, 68, 68, 0.3)" }}>
                        <h2 style={{ color: "#fca5a5" }}>⚠️ Tehlikeli Bölge</h2>
                        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                            Bu kartviziti sildiğinizde tüm veriler kaybolacaktır.
                        </p>
                        <form action={async () => {
                            "use server"
                            await deleteCard(id)
                        }}>
                            <button
                                type="submit"
                                style={{
                                    padding: "0.875rem 1.5rem",
                                    background: "rgba(239, 68, 68, 0.15)",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    borderRadius: "12px",
                                    color: "#fca5a5",
                                    cursor: "pointer",
                                    fontSize: "0.9rem"
                                }}
                            >
                                🗑️ Kartviziti Sil
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
