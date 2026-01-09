"use client"

import { useState } from "react"
import { TransferModal } from "@/app/components/TransferModal"

interface GiftActionsProps {
    giftId: string
    giftTitle: string
    tagId?: string
}

export function GiftActions({ giftId, giftTitle, tagId }: GiftActionsProps) {
    const [showTransfer, setShowTransfer] = useState(false)

    return (
        <>
            {tagId ? (
                <>
                    <button
                        onClick={() => setShowTransfer(true)}
                        style={{
                            padding: "0.875rem 1.5rem",
                            background: "rgba(168, 85, 247, 0.15)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            borderRadius: "12px",
                            color: "#c4b5fd",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            width: "100%",
                            marginTop: "1rem"
                        }}
                    >
                        🎁 Sahipliği Devret
                    </button>

                    <TransferModal
                        isOpen={showTransfer}
                        onClose={() => setShowTransfer(false)}
                        tagId={tagId}
                        itemName={giftTitle}
                        moduleType="gift"
                    />
                </>
            ) : (
                <a
                    href="/dashboard/nfc-tags"
                    style={{
                        padding: "0.875rem 1.5rem",
                        background: "rgba(59, 130, 246, 0.15)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        borderRadius: "12px",
                        color: "#60a5fa",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        width: "100%",
                        marginTop: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        fontWeight: 500
                    }}
                >
                    🔗 NFC Etiketi Eşleştir
                </a>
            )}
        </>
    )
}
