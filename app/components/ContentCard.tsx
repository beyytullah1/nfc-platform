'use client'

import Link from 'next/link'
import { useState } from 'react'
import styles from './ContentCard.module.css'

interface ContentCardProps {
    type: 'card' | 'plant' | 'mug' | 'gift' | 'page'
    item: any
    isOwner: boolean
    onVisibilityToggle?: (itemId: string, type: string, currentVisibility: boolean) => Promise<void>
}

export function ContentCard({ type, item, isOwner, onVisibilityToggle }: ContentCardProps) {
    const [isTogglingVisibility, setIsTogglingVisibility] = useState(false)

    interface GenericItem {
        id: string
        slug?: string
        title?: string
        name?: string
        species?: string
        viewCount?: number
        isPublic?: boolean
        isVisibleInProfile?: boolean
        isClaimed?: boolean
        moduleType?: string
        tag?: {
            isPublic: boolean
        }
        createdAt: string | Date
    }

    // Type-specific configuration
    const config = {
        card: {
            icon: '💳',
            label: 'Kartvizit',
            color: '#3b82f6',
            getLink: (item: GenericItem) => item.slug ? `/${item.slug}` : `/c/${item.id}`,
            getTitle: (item: GenericItem) => item.title || 'Kartvizit',
            getSubtitle: (item: GenericItem) => `👁️ ${item.viewCount || 0} görüntülenme`,
            isPublic: (item: GenericItem) => item.isPublic
        },
        plant: {
            icon: '🌱',
            label: 'Bitki',
            color: '#10b981',
            getLink: (item: GenericItem) => `/plant/${item.slug || item.id}`,
            getTitle: (item: GenericItem) => item.name || 'Bitki',
            getSubtitle: (item: GenericItem) => item.species || 'Bitki',
            isPublic: (item: GenericItem) => item.isVisibleInProfile ?? true
        },
        mug: {
            icon: '☕',
            label: 'Kupa',
            color: '#f59e0b',
            getLink: (item: GenericItem) => `/mug/${item.slug || item.id}`,
            getTitle: (item: GenericItem) => item.name || 'Kupa',
            getSubtitle: (item: GenericItem) => 'Kahve Kupası',
            isPublic: (item: GenericItem) => item.isVisibleInProfile ?? true
        },
        gift: {
            icon: '🎁',
            label: 'Hediye',
            color: '#ec4899',
            getLink: (item: GenericItem) => `/gift/${item.id}`,
            getTitle: (item: GenericItem) => item.title || 'Hediye',
            getSubtitle: (item: GenericItem) => item.isClaimed ? 'Açıldı' : 'Henüz açılmadı',
            isPublic: (item: GenericItem) => true
        },
        page: {
            icon: '📄',
            label: 'Sayfa',
            color: '#8b5cf6',
            getLink: (item: GenericItem) => `/page/${item.id}`,
            getTitle: (item: GenericItem) => item.title || 'Sayfa',
            getSubtitle: (item: GenericItem) => item.moduleType === 'gift' ? 'Hediye Sayfası' : 'Canvas',
            isPublic: (item: GenericItem) => true
        }
    }

    const cfg = config[type]

    const handleVisibilityToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!onVisibilityToggle || isTogglingVisibility) return

        setIsTogglingVisibility(true)
        try {
            await onVisibilityToggle(item.id, type, cfg.isPublic(item) ?? false)
        } catch (error) {
            console.error('Visibility toggle error:', error)
        } finally {
            setIsTogglingVisibility(false)
        }
    }

    return (
        <Link href={cfg.getLink(item)} className={styles.card} style={{ borderColor: cfg.color }}>
            <div className={styles.header}>
                <div className={styles.typeLabel} style={{ background: cfg.color }}>
                    <span className={styles.icon}>{cfg.icon}</span>
                    <span>{cfg.label}</span>
                </div>

                {isOwner && (type === 'card' || type === 'plant' || type === 'mug') && (
                    <button
                        onClick={handleVisibilityToggle}
                        disabled={isTogglingVisibility}
                        className={styles.visibilityToggle}
                        title={cfg.isPublic(item) ? 'Profilden Gizle' : 'Profilde Göster'}
                        style={{
                            background: cfg.isPublic(item) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            border: `1px solid ${cfg.isPublic(item) ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`
                        }}
                    >
                        {isTogglingVisibility ? '⏳' : cfg.isPublic(item) ? '✅' : '🚫'}
                    </button>
                )}
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{cfg.getTitle(item)}</h3>
                <p className={styles.subtitle}>{cfg.getSubtitle(item)}</p>
            </div>

            <div className={styles.footer}>
                <span className={styles.date}>
                    {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                </span>
            </div>
        </Link>
    )
}
