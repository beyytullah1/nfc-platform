"use client"

import { useState } from "react"
import Link from "next/link"
import { QRCodeModal } from "../components/QRCodeModal"
import styles from "./cards.module.css"

interface CardActionsProps {
    cardId: string
    cardTitle: string
}

export function CardActions({ cardId, cardTitle }: CardActionsProps) {
    const [showQR, setShowQR] = useState(false)
    const publicUrl = typeof window !== "undefined"
        ? `${window.location.origin}/card/${cardId}`
        : `/card/${cardId}`

    return (
        <>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <Link
                    href={`/card/${cardId}`}
                    target="_blank"
                    className={styles.createBtn}
                    style={{ flex: 1, justifyContent: "center" }}
                >
                    🔗 Görüntüle
                </Link>
                <button
                    onClick={() => setShowQR(true)}
                    className={styles.createBtn}
                    style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg, #10b981, #059669)" }}
                >
                    📱 QR Kod
                </button>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem" }}>
                <Link
                    href={`/dashboard/cards/${cardId}/edit`}
                    className={styles.createBtn}
                    style={{ flex: 1, justifyContent: "center", background: "rgba(255,255,255,0.1)" }}
                >
                    ✏️ Düzenle
                </Link>
            </div>

            <QRCodeModal
                url={publicUrl}
                title={cardTitle}
                isOpen={showQR}
                onClose={() => setShowQR(false)}
            />
        </>
    )
}
