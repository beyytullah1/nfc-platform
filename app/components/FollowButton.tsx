'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/app/components/Toast'

interface FollowButtonProps {
    tagId: string
    initialFollowing?: boolean
    initialCount?: number
}

export function FollowButton({ tagId, initialFollowing = false, initialCount = 0 }: FollowButtonProps) {
    const { showToast } = useToast()
    const [isFollowing, setIsFollowing] = useState(initialFollowing)
    const [followerCount, setFollowerCount] = useState(initialCount)
    const [loading, setLoading] = useState(false)
    const [allowFollow, setAllowFollow] = useState(true)
    const [isOwner, setIsOwner] = useState(false)

    // İlk yüklemede durumu kontrol et
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/follow?tagId=${tagId}`)
                if (res.ok) {
                    const data = await res.json()
                    setIsFollowing(data.isFollowing)
                    setFollowerCount(data.followerCount)
                    setAllowFollow(data.allowFollow)
                    setIsOwner(data.isOwner)
                }
            } catch (err) {
                console.error('Failed to check follow status:', err)
            }
        }
        checkStatus()
    }, [tagId])

    const handleFollow = async () => {
        setLoading(true)
        try {
            if (isFollowing) {
                // Takibi bırak
                const res = await fetch(`/api/follow?tagId=${tagId}`, {
                    method: 'DELETE'
                })
                if (res.ok) {
                    setIsFollowing(false)
                    setFollowerCount(prev => Math.max(0, prev - 1))
                }
            } else {
                // Takip et
                const res = await fetch('/api/follow', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tagId })
                })
                if (res.ok) {
                    setIsFollowing(true)
                    setFollowerCount(prev => prev + 1)
                } else {
                    const data = await res.json()
                    showToast(data.error || 'Takip edilemedi', 'error')
                }
            }
        } catch (err) {
            console.error('Follow action failed:', err)
        }
        setLoading(false)
    }

    // Sahip veya takip kapalıysa gösterme
    if (isOwner || !allowFollow) {
        return null
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
                onClick={handleFollow}
                disabled={loading}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: isFollowing ? '1px solid var(--color-border)' : 'none',
                    background: isFollowing ? 'transparent' : 'var(--color-primary)',
                    color: isFollowing ? 'var(--color-text)' : 'white',
                    cursor: loading ? 'wait' : 'pointer',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.7 : 1
                }}
            >
                <span>{isFollowing ? '✓' : '+'}</span>
                {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
            </button>
            {followerCount > 0 && (
                <span style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '0.85rem'
                }}>
                    {followerCount} takipçi
                </span>
            )}
        </div>
    )
}
