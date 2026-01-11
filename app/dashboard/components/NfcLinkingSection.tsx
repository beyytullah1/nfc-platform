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
    const [showManualInput, setShowManualInput] = useState(false)
    const [manualCode, setManualCode] = useState("")

    const handleLink = async () => {
        if (!selectedTagId && !manualCode) return
        setLoading(true)
        setError("")

        try {
            const body: any = {
                moduleId,
                moduleType
            }

            if (showManualInput) {
                body.publicCode = manualCode
            } else {
                body.tagId = selectedTagId
            }

            const response = await fetch("/api/nfc/link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ color: "#60a5fa", margin: 0 }}>📡 NFC Bağlantısı</h2>
                {!currentTag && (
                    <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.05)", padding: "4px", borderRadius: "8px" }}>
                        <button
                            onClick={() => setShowManualInput(false)}
                            style={{
                                padding: "0.4rem 0.8rem",
                                borderRadius: "6px",
                                border: "none",
                                background: !showManualInput ? "rgba(96, 165, 250, 0.2)" : "transparent",
                                color: !showManualInput ? "#60a5fa" : "rgba(255,255,255,0.5)",
                                fontSize: "0.8rem",
                                cursor: "pointer"
                            }}
                        >
                            Listeden
                        </button>
                        <button
                            onClick={() => setShowManualInput(true)}
                            style={{
                                padding: "0.4rem 0.8rem",
                                borderRadius: "6px",
                                border: "none",
                                background: showManualInput ? "rgba(96, 165, 250, 0.2)" : "transparent",
                                color: showManualInput ? "#60a5fa" : "rgba(255,255,255,0.5)",
                                fontSize: "0.8rem",
                                cursor: "pointer"
                            }}
                        >
                            Manuel
                        </button>
                    </div>
                )}
            </div>

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

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        {showManualInput ? (
                            <input
                                type="text"
                                placeholder="NFC Kodu (örn: nfckart-123)"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    borderRadius: "12px",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    color: "#fff",
                                    outline: "none"
                                }}
                            />
                        ) : (
                            availableTags.length > 0 ? (
                                <select
                                    value={selectedTagId}
                                    onChange={(e) => setSelectedTagId(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: "0.75rem",
                                        borderRadius: "12px",
                                        background: "#000",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        color: "#fff",
                                        outline: "none"
                                    }}
                                >
                                    <option value="" style={{ background: "#000", color: "#fff" }}>Etiket Seçin...</option>
                                    {availableTags.map(tag => (
                                        <option key={tag.id} value={tag.id} style={{ background: "#000", color: "#fff" }}>
                                            {tag.publicCode}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    borderRadius: "12px",
                                    textAlign: "center",
                                    color: "rgba(255,255,255,0.5)",
                                    fontSize: "0.9rem"
                                }}>
                                    Listenizde boş etiket yok.
                                </div>
                            )
                        )}

                        <button
                            onClick={handleLink}
                            disabled={(!selectedTagId && !manualCode) || loading}
                            style={{
                                padding: "0.75rem 1.5rem",
                                background: (!selectedTagId && !manualCode) ? "rgba(255,255,255,0.1)" : "rgba(59, 130, 246, 0.2)",
                                border: `1px solid ${(!selectedTagId && !manualCode) ? "rgba(255,255,255,0.1)" : "rgba(59, 130, 246, 0.4)"}`,
                                borderRadius: "12px",
                                color: (!selectedTagId && !manualCode) ? "rgba(255,255,255,0.3)" : "#60a5fa",
                                cursor: (!selectedTagId && !manualCode) || loading ? "not-allowed" : "pointer",
                                whiteSpace: "nowrap"
                            }}
                        >
                            {loading ? "..." : "🔗 Eşleştir"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
