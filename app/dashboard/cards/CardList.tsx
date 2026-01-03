"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import cardStyles from "./cards.module.css"
import { getCardUrl as buildCardUrl } from "@/lib/env"
import { QRCodeModal } from "../components/QRCodeModal"

interface Card {
    id: string
    title: string | null
    slug: string | null
    avatarUrl: string | null
    viewCount: number
    createdAt: Date
    fields: { id: string }[]
}

interface CardListProps {
    cards: Card[]
    userName: string | null
}

export default function CardList({ cards, userName }: CardListProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [qrCard, setQrCard] = useState<Card | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const filteredCards = useMemo(() => {
        if (!searchQuery.trim()) return cards
        const query = searchQuery.toLowerCase()
        return cards.filter(card =>
            card.title?.toLowerCase().includes(query) ||
            card.slug?.toLowerCase().includes(query) ||
            userName?.toLowerCase().includes(query)
        )
    }, [cards, searchQuery, userName])

    const copyLink = async (card: Card) => {
        const slug = card.slug || card.id
        const url = buildCardUrl(slug)
        await navigator.clipboard.writeText(url)
        setCopiedId(card.id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const getCardUrl = (card: Card) => {
        const slug = card.slug || card.id
        return buildCardUrl(slug)
    }

    if (cards.length === 0) {
        return (
            <div className={cardStyles.emptyState}>
                <div className={cardStyles.emptyIcon}>💳</div>
                <h2>Henüz kartvizitiniz yok</h2>
                <p>Dijital kartvizitinizi oluşturarak iletişim bilgilerinizi paylaşmaya başlayın.</p>
                <Link href="/dashboard/cards/new" className={cardStyles.createBtn}>
                    İlk Kartvizitimi Oluştur
                </Link>
            </div>
        )
    }

    return (
        <>
            {/* Search Bar */}
            {cards.length > 1 && (
                <div className={cardStyles.searchContainer}>
                    <span className={cardStyles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        className={cardStyles.searchInput}
                        placeholder="Kartvizit ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className={cardStyles.searchClear}
                            onClick={() => setSearchQuery("")}
                        >
                            ✕
                        </button>
                    )}
                </div>
            )}

            {filteredCards.length === 0 ? (
                <div className={cardStyles.noResults}>
                    <span>🔍</span>
                    <p>"{searchQuery}" için sonuç bulunamadı</p>
                </div>
            ) : (
                <div className={cardStyles.cardGrid}>
                    {filteredCards.map((card) => (
                        <div key={card.id} className={cardStyles.cardItem}>
                            <Link href={`/dashboard/cards/${card.id}`} className={cardStyles.cardPreviewLink}>
                                <div className={cardStyles.cardPreview}>
                                    {card.avatarUrl ? (
                                        <img
                                            src={card.avatarUrl}
                                            alt=""
                                            className={cardStyles.cardAvatarImg}
                                        />
                                    ) : (
                                        <div className={cardStyles.cardAvatar}>
                                            {userName?.charAt(0) || "U"}
                                        </div>
                                    )}
                                    <div className={cardStyles.cardInfo}>
                                        <h3>{userName}</h3>
                                        <p>{card.title || "Kartvizit"}</p>
                                    </div>
                                </div>
                                <div className={cardStyles.cardMeta}>
                                    <span>👁️ {card.viewCount || 0} görüntülenme</span>
                                    <span>•</span>
                                    <span>📋 {card.fields.length} alan</span>
                                </div>
                            </Link>
                            <div className={cardStyles.cardActions}>
                                <a
                                    href={getCardUrl(card)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cardStyles.actionBtn}
                                    title="Görüntüle"
                                >
                                    👁️
                                </a>
                                <button
                                    className={cardStyles.actionBtn}
                                    title="QR Kod"
                                    onClick={() => setQrCard(card)}
                                >
                                    📱
                                </button>
                                <button
                                    className={`${cardStyles.actionBtn} ${copiedId === card.id ? cardStyles.actionBtnActive : ''}`}
                                    title={copiedId === card.id ? "Kopyalandı!" : "Linki Kopyala"}
                                    onClick={() => copyLink(card)}
                                >
                                    {copiedId === card.id ? "✓" : "🔗"}
                                </button>
                                <Link
                                    href={`/dashboard/cards/${card.id}/edit`}
                                    className={cardStyles.actionBtn}
                                    title="Düzenle"
                                >
                                    ✏️
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* QR Code Modal */}
            {qrCard && (
                <QRCodeModal
                    url={getCardUrl(qrCard)}
                    title={qrCard.title || userName || "Kartvizit"}
                    isOpen={!!qrCard}
                    onClose={() => setQrCard(null)}
                />
            )}
        </>
    )
}
