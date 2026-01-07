'use client'

import { useState } from 'react'
import { useToast } from '@/app/components/Toast'

interface FollowButtonProps {
    tagId: string
    initialIsFollowing?: boolean
    followerCount?: number
}

export function FollowButton({ tagId, initialIsFollowing = false, followerCount = 0 }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [count, setCount] = useState(followerCount)
    const [loading, setLoading] = useState(false)
    const { showToast } = useToast()

    const handleToggle = async () => {
        setLoading(true)
        // Optimistic update
        const newState = !isFollowing
        setIsFollowing(newState)
        setCount(prev => newState ? prev + 1 : prev - 1)

        try {
            const res = await fetch('/api/nfc/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagId })
            })

            if (!res.ok) {
                throw new Error('İşlem başarısız')
            }

            const data = await res.json()
            // Server confirmation (optional sync)
            if (data.isFollowing !== newState) {
                setIsFollowing(data.isFollowing)
            }
            if (newState) {
                showToast('Takip ediliyor! 🌟', 'success')
            } else {
                showToast('Takipten çıkıldı.', 'info')
            }

        } catch (error) {
            console.error(error)
            // Revert on error
            setIsFollowing(!newState)
            setCount(prev => !newState ? prev + 1 : prev - 1)
            showToast('Bir hata oluştu', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                border: 'none',
                background: isFollowing ? 'var(--color-bg-secondary, #334155)' : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.2s'
            }}
        >
            <span>{isFollowing ? '✓ Takip Ediliyor' : '+ Takip Et'}</span>
            {count > 0 && (
                <span style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '0.1rem 0.5rem',
                    borderRadius: '1rem',
                    fontSize: '0.8rem'
                }}>
                    {count}
                </span>
            )}
        </button>
    )
}
