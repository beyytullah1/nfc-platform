"use client"

import { useState } from "react"
import Link from "next/link"
import { addMugLog, deleteMug } from "@/lib/mug-actions"
import { TransferModal } from "@/app/components/TransferModal"
import styles from "../mugs.module.css"
import { useToast } from "@/app/components/Toast"
import { NfcLinkingSection } from "../../components/NfcLinkingSection"

interface MugDetailClientProps {
    mug: {
        id: string
        name: string
        slug: string | null
        createdAt: Date
        logs: {
            id: string
            logType: string
            createdAt: Date
        }[]
        tag?: { id: string; publicCode: string } | null
    }
    isOwner: boolean
    availableTags: { id: string; publicCode: string }[]
}

export default function MugDetailClient({ mug, isOwner, availableTags }: MugDetailClientProps) {
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [note, setNote] = useState("")
    const [showTransfer, setShowTransfer] = useState(false)

    const { showToast } = useToast()

    const handleAddDrink = async (drinkType: string) => {
        setLoading(true)
        const formData = new FormData()
        formData.append("logType", drinkType)
        formData.append("note", note)
        try {
            await addMugLog(mug.id, formData)
            showToast("İçecek eklendi", "success")
            setNote("") // Clear note
        } catch (error) {
            showToast("İçecek eklenemedi", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (confirm("Bu kupayı silmek istediğinizden emin misiniz?")) {
            setDeleting(true)
            try {
                await deleteMug(mug.id)
            } catch (error) {
                showToast("Kupa silinemedi", "error")
                setDeleting(false)
            }
        }
    }

    const coffeeCount = mug.logs.filter(l => l.logType === 'coffee').length
    const teaCount = mug.logs.filter(l => l.logType === 'tea').length
    const waterCount = mug.logs.filter(l => l.logType === 'water').length

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem" }}>
            <Link href="/dashboard/mugs" className={styles.backLink}>
                ← Kupalara Dön
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
                <div style={{
                    width: "100px",
                    height: "100px",
                    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3rem"
                }}>
                    ☕
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ color: "#fff", fontSize: "1.75rem", marginBottom: "0.25rem" }}>{mug.name}</h1>
                    <p style={{ color: "rgba(255,255,255,0.6)" }}>
                        Toplam {mug.logs.length} içecek kaydı
                    </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <Link
                        href={`/mug/${mug.slug || mug.id}`}
                        target="_blank"
                        style={{
                            padding: "0.75rem 1.25rem",
                            background: "rgba(59, 130, 246, 0.15)",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            borderRadius: "12px",
                            color: "#60a5fa",
                            textDecoration: "none",
                            fontSize: "0.9rem"
                        }}
                    >
                        🔗 Public Sayfa
                    </Link>
                    <Link
                        href={`/dashboard/mugs/${mug.id}/edit`}
                        style={{
                            padding: "0.75rem",
                            background: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "12px",
                            color: "#fff",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        ⚙️
                    </Link>
                </div>
            </div>

            {/* NFC Linking Section */}
            {isOwner && (
                <NfcLinkingSection
                    moduleId={mug.id}
                    moduleType="mug"
                    currentTag={mug.tag || null}
                    availableTags={availableTags}
                />
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
                {/* İçecek Ekle */}
                <div className={styles.formCard}>
                    <h2>☕ İçecek Ekle</h2>
                    <div style={{ marginBottom: "1rem" }}>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Bir not ekleyin... (Opsiyonel)"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                border: "1px solid rgba(255,255,255,0.1)",
                                background: "rgba(255,255,255,0.05)",
                                color: "#fff",
                                fontSize: "0.9rem",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>
                    <div className={styles.drinkButtons} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                        <button
                            onClick={() => handleAddDrink("coffee")}
                            className={styles.drinkBtn}
                            disabled={loading}
                        >
                            <span>☕</span>
                            <span>Kahve</span>
                        </button>
                        <button
                            onClick={() => handleAddDrink("tea")}
                            className={styles.drinkBtn}
                            disabled={loading}
                        >
                            <span>🍵</span>
                            <span>Çay</span>
                        </button>
                        <button
                            onClick={() => handleAddDrink("water")}
                            className={styles.drinkBtn}
                            disabled={loading}
                        >
                            <span>💧</span>
                            <span>Su</span>
                        </button>
                    </div>
                </div>

                {/* İstatistikler */}
                <div className={styles.formCard}>
                    <h2>📊 İstatistikler</h2>
                    <div style={{ display: "grid", gap: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: "rgba(255,255,255,0.7)" }}>☕ Kahve</span>
                            <span style={{ color: "#fff", fontWeight: "600" }}>{coffeeCount}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: "rgba(255,255,255,0.7)" }}>🍵 Çay</span>
                            <span style={{ color: "#fff", fontWeight: "600" }}>{teaCount}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: "rgba(255,255,255,0.7)" }}>💧 Su</span>
                            <span style={{ color: "#fff", fontWeight: "600" }}>{waterCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Son Kayıtlar */}
            <div className={styles.formCard} style={{ marginTop: "1.5rem" }}>
                <h2>📋 Son Kayıtlar</h2>
                {mug.logs.length === 0 ? (
                    <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "2rem" }}>
                        Henüz kayıt yok. Yukarıdaki butonlarla içecek ekleyin.
                    </p>
                ) : (
                    <div className={styles.logsList}>
                        {mug.logs.slice(0, 10).map((log) => (
                            <div key={log.id} className={styles.logItem}>
                                <span className={styles.logIcon}>
                                    {log.logType === 'coffee' && '☕'}
                                    {log.logType === 'tea' && '🍵'}
                                    {log.logType === 'water' && '💧'}
                                </span>
                                <div className={styles.logContent}>
                                    <span>
                                        {log.logType === 'coffee' && 'Kahve içildi'}
                                        {log.logType === 'tea' && 'Çay içildi'}
                                        {log.logType === 'water' && 'Su içildi'}
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

            {/* Tehlikeli Bölge */}
            <div className={styles.formCard} style={{ marginTop: "1.5rem", borderColor: "rgba(239, 68, 68, 0.3)" }}>
                <h2 style={{ color: "#fca5a5" }}>⚠️ Tehlikeli Bölge</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
                        Bu kupayı sildiğinizde tüm içecek kayıtları da silinecektir.
                    </p>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{
                                flex: 1,
                                padding: "0.875rem 1.5rem",
                                background: "rgba(239, 68, 68, 0.15)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: "12px",
                                color: "#fca5a5",
                                cursor: "pointer",
                                fontSize: "0.9rem"
                            }}
                        >
                            {deleting ? "Siliniyor..." : "🗑️ Kupayı Sil"}
                        </button>

                        {mug.tag && (
                            <button
                                onClick={() => setShowTransfer(true)}
                                style={{
                                    flex: 1,
                                    padding: "0.875rem 1.5rem",
                                    background: "rgba(168, 85, 247, 0.15)",
                                    border: "1px solid rgba(168, 85, 247, 0.3)",
                                    borderRadius: "12px",
                                    color: "#c4b5fd",
                                    cursor: "pointer",
                                    fontSize: "0.9rem"
                                }}
                            >
                                🎁 Sahipliği Devret
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Transfer Modal */}
            {mug.tag && (
                <TransferModal
                    isOpen={showTransfer}
                    onClose={() => setShowTransfer(false)}
                    tagId={mug.tag.id}
                    itemName={mug.name}
                    moduleType="mug"
                />
            )}
        </div>
    )
}
