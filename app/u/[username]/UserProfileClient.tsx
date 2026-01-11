'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ContentCard } from '@/app/components/ContentCard'
import styles from './profile.module.css'

interface User {
    id: string
    name: string | null
    username: string | null
    email: string | null
    avatarUrl: string | null
    createdAt: Date
}

interface Card {
    id: string
    slug: string | null
    title: string | null
    bio: string | null
    avatarUrl: string | null
    isPublic: boolean
    createdAt: Date
}

interface Plant {
    id: string
    name: string
    slug: string | null
    ownerId: string // Added for co-owner checks
    species: string | null
    coverImageUrl: string | null
    isVisibleInProfile: boolean
    createdAt: Date
    tag: { id: string; isPublic: boolean } | null
}

interface Mug {
    id: string
    name: string
    slug: string | null
    type: string | null
    coverImageUrl: string | null
    isVisibleInProfile: boolean
    createdAt: Date
    tag: { id: string; isPublic: boolean } | null
}

interface UserProfileClientProps {
    user: User
    isOwner: boolean
    cards: Card[]
    plants: Plant[]
    mugs: Mug[]
}

export default function UserProfileClient({ user, isOwner, cards, plants, mugs }: UserProfileClientProps) {
    const [activeTab, setActiveTab] = useState<'cards' | 'plants' | 'mugs'>('cards')

    const handleVisibilityToggle = async (itemId: string, itemType: string) => {
        try {
            const res = await fetch(`/api/items/${itemId}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemType })
            })

            if (res.ok) {
                window.location.reload()
            }
        } catch (error) {
            console.error('Toggle visibility error:', error)
        }
    }

    const visibleCards = isOwner ? cards : cards.filter(c => c.isPublic)
    // Filter plants: owner sees all, others see only isVisibleInProfile=true
    const visiblePlants = isOwner ? plants : plants.filter(p => p.isVisibleInProfile)
    const visibleMugs = isOwner ? mugs : mugs.filter(m => m.isVisibleInProfile)

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.avatar}>
                    {user.avatarUrl ? (
                        <Image
                            src={user.avatarUrl}
                            alt={user.name || 'User'}
                            width={120}
                            height={120}
                            priority
                        />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                    )}
                </div>
                <h1>{user.name || 'İsimsiz Kullanıcı'}</h1>
                {user.username && <p className={styles.username}>@{user.username}</p>}
                {isOwner && (
                    <Link href="/dashboard" className={styles.dashboardBtn}>
                        📊 Dashboard
                    </Link>
                )}
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={activeTab === 'cards' ? styles.activeTab : ''}
                    onClick={() => setActiveTab('cards')}
                >
                    💳 Kartvizitler ({visibleCards.length})
                </button>
                <button
                    className={activeTab === 'plants' ? styles.activeTab : ''}
                    onClick={() => setActiveTab('plants')}
                >
                    🪴 Bitkiler ({visiblePlants.length})
                </button>
                <button
                    className={activeTab === 'mugs' ? styles.activeTab : ''}
                    onClick={() => setActiveTab('mugs')}
                >
                    ☕ Kupalar ({visibleMugs.length})
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {activeTab === 'cards' && (
                    <div className={styles.grid}>
                        {visibleCards.map(card => (
                            <ContentCard
                                key={card.id}
                                type="card"
                                item={card}
                                isOwner={isOwner}
                                onVisibilityToggle={isOwner ? handleVisibilityToggle : undefined}
                            />
                        ))}
                        {visibleCards.length === 0 && (
                            <p className={styles.empty}>Henüz kartvizit yok</p>
                        )}
                    </div>
                )}

                {activeTab === 'plants' && (
                    <div className={styles.grid}>
                        {visiblePlants.map(plant => (
                            <ContentCard
                                key={plant.id}
                                type="plant"
                                item={plant}
                                isOwner={isOwner} // Profile is mine
                                onVisibilityToggle={(isOwner && plant.ownerId === user.id) ? handleVisibilityToggle : undefined}
                            />
                        ))}
                        {visiblePlants.length === 0 && (
                            <p className={styles.empty}>Henüz bitki yok</p>
                        )}
                    </div>
                )}

                {activeTab === 'mugs' && (
                    <div className={styles.grid}>
                        {visibleMugs.map(mug => (
                            <ContentCard
                                key={mug.id}
                                type="mug"
                                item={mug}
                                isOwner={isOwner}
                                onVisibilityToggle={isOwner ? handleVisibilityToggle : undefined}
                            />
                        ))}
                        {visibleMugs.length === 0 && (
                            <p className={styles.empty}>Henüz kupa yok</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
