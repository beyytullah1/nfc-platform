"use client"

import { useState } from "react"
import Link from "next/link"
import { addPlantLog, deletePlant } from "@/lib/plant-actions"
import { TransferModal } from "@/app/components/TransferModal"
import { PlantPrivacySettings } from "../components/PlantPrivacySettings"
import { PlantCoOwners } from "../components/PlantCoOwners"
import { NfcLinkingSection } from "../../components/NfcLinkingSection"
import { useToast } from "@/app/components/Toast"
import styles from "../plants.module.css"

interface PlantDetailClientProps {
    plant: {
        id: string
        name: string
        slug: string | null
        species: string | null
        birthDate: Date | null
        coverImageUrl: string | null
        isGift: boolean
        giftMessage: string | null
        createdAt: Date
        privacyLevel: string // Added privacyLevel
        logs: {
            id: string
            logType: string
            content: string | null
            amountMl: number | null
            createdAt: Date
        }[]
        giftedBy: { name: string | null } | null
        tag: { id: string; publicCode: string } | null
        coOwners: {
            id: string
            name: string | null
            username: string | null
            avatarUrl: string | null
        }[]
    }
    userName: string
    isOwner: boolean
    availableTags: { id: string; publicCode: string }[]
}

export default function PlantDetailClient({ plant, userName, isOwner, availableTags }: PlantDetailClientProps) {
    const [loading, setLoading] = useState(false)
    const [logType, setLogType] = useState("water")
    const [showLogForm, setShowLogForm] = useState(false)
    const [amountMl, setAmountMl] = useState("")
    const [content, setContent] = useState("")
    const [showTransfer, setShowTransfer] = useState(false)
    const [deleting, setDeleting] = useState(false) // Added back

    const { showToast } = useToast()

    const handleAddLog = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        formData.append("logType", logType)
        formData.append("content", content)
        formData.append("amountMl", amountMl)

        await addPlantLog(plant.id, formData)
        setShowLogForm(false)
        setContent("")
        setAmountMl("")
        setLoading(false)
    }

    const handleDelete = async () => {
        if (confirm("Bu bitkiyi silmek istediğinizden emin misiniz? Tüm sulama ve bakım kayıtları da silinecek.")) {
            setDeleting(true)
            await deletePlant(plant.id)
        }
    }

    const daysSinceBirth = plant.birthDate
        ? Math.floor((Date.now() - new Date(plant.birthDate).getTime()) / (1000 * 60 * 60 * 24))
        : null

    const lastWatered = plant.logs.find(l => l.logType === 'water')
    const daysSinceWater = lastWatered
        ? Math.floor((Date.now() - new Date(lastWatered.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : null

    return (
        <>
            <Link href="/dashboard/plants" className={styles.backLink}>
                ← Bitkilere Dön
            </Link>

            {/* Header */}
            <div className={styles.plantHeader}>
                <div className={styles.plantAvatar}>
                    {plant.coverImageUrl ? (
                        <img src={plant.coverImageUrl} alt={plant.name} />
                    ) : (
                        "🌱"
                    )}
                </div>
                <div className={styles.plantMeta}>
                    <h1>{plant.name}</h1>
                    <p>
                        {plant.species || "Bitki"}
                        {daysSinceBirth !== null && ` • ${daysSinceBirth} günlük`}
                    </p>
                    {plant.isGift && plant.giftedBy && (
                        <div className={styles.giftBadge} style={{ position: "static", marginTop: "0.5rem" }}>
                            🎁 {plant.giftedBy.name} tarafından hediye edildi
                        </div>
                    )}
                    {plant.giftMessage && (
                        <p style={{ marginTop: "0.5rem", fontStyle: "italic", color: "rgba(255,255,255,0.7)" }}>
                            "{plant.giftMessage}"
                        </p>
                    )}
                </div>
                <Link
                    href={`/plant/${plant.slug || plant.id}`}
                    target="_blank"
                    style={{
                        padding: "0.75rem 1.25rem",
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "12px",
                        color: "#34d399",
                        textDecoration: "none",
                        fontSize: "0.9rem"
                    }}
                >
                    🔗 Public Sayfa
                </Link>
                <Link
                    href={`/dashboard/plants/${plant.id}/edit`}
                    style={{
                        padding: "0.75rem 1.25rem",
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                        color: "#fff",
                        textDecoration: "none",
                        fontSize: "0.9rem"
                    }}
                >
                    ✏️ Düzenle
                </Link>
                <Link
                    href={`/p/${plant.id}/ai`}
                    style={{
                        padding: "0.75rem 1.25rem",
                        background: "linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(46, 204, 113, 0.2))",
                        border: "1px solid rgba(52, 152, 219, 0.3)",
                        borderRadius: "12px",
                        color: "#60a5fa",
                        textDecoration: "none",
                        fontSize: "0.9rem"
                    }}
                >
                    🤖 AI Asistan
                </Link>
            </div>

            <div className={styles.detailGrid}>
                {/* Left Column - Actions & Stats */}
                <div>
                    <div className={styles.formCard}>
                        <h2>⚡ Hızlı İşlemler</h2>
                        <div className={styles.quickActions}>
                            <button
                                onClick={() => { setLogType("water"); setShowLogForm(true) }}
                                className={`${styles.actionBtn} ${styles.primary}`}
                            >
                                💧 Suladım
                            </button>
                            <button
                                onClick={() => { setLogType("fertilize"); setShowLogForm(true) }}
                                className={styles.actionBtn}
                            >
                                🌿 Gübreledim
                            </button>
                            <button
                                onClick={() => { setLogType("note"); setShowLogForm(true) }}
                                className={styles.actionBtn}
                            >
                                📝 Not Ekle
                            </button>
                        </div>

                        {showLogForm && (
                            <form onSubmit={handleAddLog} style={{ marginTop: "1.5rem" }}>
                                <div className={styles.formGroup}>
                                    <label>
                                        {logType === "water" && "💧 Sulama Detayı"}
                                        {logType === "fertilize" && "🌿 Gübreleme Detayı"}
                                        {logType === "note" && "📝 Not"}
                                    </label>
                                    {logType === "water" && (
                                        <input
                                            type="number"
                                            placeholder="Su miktarı (ml)"
                                            value={amountMl}
                                            onChange={(e) => setAmountMl(e.target.value)}
                                        />
                                    )}
                                    <textarea
                                        placeholder="Açıklama ekle..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        style={{ marginTop: "0.5rem", minHeight: "80px" }}
                                    />
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                                        {loading ? "Kaydediliyor..." : "Kaydet"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowLogForm(false)}
                                        className={styles.actionBtn}
                                    >
                                        İptal
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Stats */}
                    <div className={styles.formCard}>
                        <h2>📊 Bilgiler</h2>
                        <div style={{ display: "grid", gap: "1rem" }}>
                            <div>
                                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Son Sulama</span>
                                <p style={{ color: "#fff" }}>
                                    {daysSinceWater !== null
                                        ? (daysSinceWater === 0 ? "Bugün" : `${daysSinceWater} gün önce`)
                                        : "Henüz sulanmadı"
                                    }
                                </p>
                            </div>
                            <div>
                                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Toplam Log</span>
                                <p style={{ color: "#fff" }}>{plant.logs.length} kayıt</p>
                            </div>
                            <div>
                                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Public Link</span>
                                <p style={{ color: "#10b981" }}>
                                    <Link href={`/plant/${plant.slug || plant.id}`} target="_blank">
                                        /plant/{plant.slug || plant.id}
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    <PlantPrivacySettings
                        plantId={plant.id}
                        currentPrivacy={plant.privacyLevel || 'public'}
                    />

                    {/* NFC Linking - Only for Owner */}
                    {isOwner && (
                        <NfcLinkingSection
                            moduleId={plant.id}
                            moduleType="plant"
                            currentTag={plant.tag}
                            availableTags={availableTags}
                        />
                    )}

                    {/* Co-owners */}
                    <PlantCoOwners
                        plantId={plant.id}
                        coOwners={plant.coOwners}
                        isOwner={true}
                    />

                    {/* Danger Zone */}
                    <div className={styles.formCard} style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}>
                        <h2 style={{ color: "#fca5a5" }}>⚠️ Tehlikeli Bölge</h2>
                        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                            Bu bitkiyi sildiğinizde tüm bakım kayıtları da silinecektir.
                        </p>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
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
                            {deleting ? "Siliniyor..." : "🗑️ Bitkiyi Sil"}
                        </button>

                        {plant.tag && (
                            <button
                                onClick={() => setShowTransfer(true)}
                                style={{
                                    marginTop: "0.75rem",
                                    padding: "0.875rem 1.5rem",
                                    background: "rgba(168, 85, 247, 0.15)",
                                    border: "1px solid rgba(168, 85, 247, 0.3)",
                                    borderRadius: "12px",
                                    color: "#c4b5fd",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    width: "100%"
                                }}
                            >
                                🎁 Sahipliği Devret
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Column - Logs */}
                <div className={styles.formCard}>
                    <h2>📋 Geçmiş</h2>
                    {plant.logs.length === 0 ? (
                        <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "2rem" }}>
                            Henüz kayıt yok. Yukarıdaki butonlarla kayıt ekleyin.
                        </p>
                    ) : (
                        <div className={styles.logsList}>
                            {plant.logs.map((log) => (
                                <div key={log.id} className={styles.logItem}>
                                    <div className={`${styles.logIcon} ${styles[log.logType] || ""}`}>
                                        {log.logType === "water" && "💧"}
                                        {log.logType === "fertilize" && "🌿"}
                                        {log.logType === "note" && "📝"}
                                        {log.logType === "photo" && "📷"}
                                        {log.logType === "repot" && "🪴"}
                                    </div>
                                    <div className={styles.logContent}>
                                        <span>
                                            {log.logType === "water" && `Sulandı${log.amountMl ? ` (${log.amountMl}ml)` : ""}`}
                                            {log.logType === "fertilize" && "Gübre verildi"}
                                            {log.logType === "note" && (log.content || "Not eklendi")}
                                            {log.logType === "photo" && "Fotoğraf eklendi"}
                                            {log.logType === "repot" && "Saksı değiştirildi"}
                                        </span>
                                        <small>
                                            {new Date(log.createdAt).toLocaleDateString('tr-TR', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Transfer Modal */}
            {plant.tag && (
                <TransferModal
                    isOpen={showTransfer}
                    onClose={() => setShowTransfer(false)}
                    tagId={plant.tag.id}
                    itemName={plant.name}
                    moduleType="plant"
                />
            )}
        </>
    )
}
