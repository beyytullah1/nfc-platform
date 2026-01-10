"use client"

import { useState } from "react"
import styles from "../plants/plants.module.css"

interface NfcLinkingSectionProps {
    moduleId: string
    moduleType: "plant" | "mug"
    currentTag: { id: string; publicCode: string } | null
    availableTags: { id: string; publicCode: string }[]
}

export function NfcLinkingSection({ moduleId, moduleType, currentTag, availableTags }: NfcLinkingSectionProps) {
    const [loading, setLoading] = useState(false)
    const [selectedTagId, setSelectedTagId] = useState("")
    const [error, setError] = useState("")

    const handleLink = async () => {
        if (!selectedTagId) return
        setLoading(true)
        setError("")

        try {
            const response = await fetch("/api/nfc/link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tagId: selectedTagId,
                    moduleId,
                    moduleType
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Eşleştirme başarısız")
            }

            window.location.reload()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleUnlink = async () => {
        if (!confirm("NFC etiketi bağlantısını kaldırmak istediğinize emin misiniz?")) return
        setLoading(true)
        setError("")

        try {
            const response = await fetch("/api/nfc/unlink", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tagId: currentTag!.id,
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Bağlantı kaldırma başarısız")
            }

            window.location.reload()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.formCard} style={{ marginTop: "1.5rem", borderColor: "rgba(59, 130, 246, 0.3)" }}>
            <h2 style={{ color: "#60a5fa" }}>📡 NFC Bağlantısı</h2>

            {error && (
                <div style={{
                    padding: "0.75rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "8px",
                    color: "#fca5a5",
                    marginBottom: "1rem",
                    fontSize: "0.9rem"
                }}>
                    {error}
                </div>
            )}

            {currentTag ? (
                <div>
                    <div style={{
                        padding: "1rem",
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "12px",
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                        <div>
                            <span style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                                Eşleşmiş Etiket
                            </span>
                            <code style={{ background: "rgba(0,0,0,0.3)", padding: "0.2rem 0.4rem", borderRadius: "4px", color: "#fff" }}>
                                {currentTag.publicCode}
                            </code>
                        </div>
                        <div style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "#10b981",
                            boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)"
                        }} />
                    </div>

                    <button
                        onClick={handleUnlink}
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "12px",
                            color: "#fca5a5",
                            cursor: loading ? "wait" : "pointer",
                            fontSize: "0.9rem"
                        }}
                    >
                        {loading ? "İşleniyor..." : "🔗 Bağlantıyı Kaldır"}
                    </button>
                    <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
                        Bu işlem etiketi profilinizden silmez, sadece bu bitkiyle eşleşmesini kaldırır.
                    </p>
                </div>
            ) : (
                <div>
                    <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                        Bu bitkiyi bir NFC etiketiyle eşleştirerek fiziksel dünyayla bağlantı kurun.
                    </p>

                    {availableTags.length > 0 ? (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <select
                                value={selectedTagId}
                                onChange={(e) => setSelectedTagId(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    borderRadius: "12px",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    color: "#fff",
                                    outline: "none"
                                }}
                            >
                                <option value="">Etiket Seçin...</option>
                                {availableTags.map(tag => (
                                    <option key={tag.id} value={tag.id}>
                                        {tag.publicCode}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleLink}
                                disabled={!selectedTagId || loading}
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    background: !selectedTagId ? "rgba(255,255,255,0.1)" : "rgba(59, 130, 246, 0.2)",
                                    border: `1px solid ${!selectedTagId ? "rgba(255,255,255,0.1)" : "rgba(59, 130, 246, 0.4)"}`,
                                    borderRadius: "12px",
                                    color: !selectedTagId ? "rgba(255,255,255,0.3)" : "#60a5fa",
                                    cursor: !selectedTagId || loading ? "not-allowed" : "pointer",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {loading ? "..." : "🔗 Eşleştir"}
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            padding: "1rem",
                            background: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "12px",
                            textAlign: "center",
                            color: "rgba(255,255,255,0.5)",
                            fontSize: "0.9rem"
                        }}>
                            Eşleştirilebilir boş etiketiniz yok. Yeni etiket eklemek için NFC Etiketleri sayfasına gidin.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
