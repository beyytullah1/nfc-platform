"use client"

import { useState } from "react"
import Link from "next/link"
import { getCardUrl as buildCardUrl } from "@/lib/env"
import { QRCodeModal } from "../components/QRCodeModal"
import styles from "./cards.module.css"

interface CardActionsProps {
    cardId: string
    cardSlug?: string | null
    cardTitle: string
}

export function CardActions({ cardId, cardSlug, cardTitle }: CardActionsProps) {
    const [showQR, setShowQR] = useState(false)
    const slug = cardSlug || cardId
    const publicUrl = buildCardUrl(slug)

    return (
        <>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <Link
                    href={publicUrl}
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
