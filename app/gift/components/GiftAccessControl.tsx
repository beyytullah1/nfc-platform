'use client'

import { useState } from 'react'
import { GiftReveal } from './GiftReveal'
import { getGiftContent } from '@/lib/gift-actions'
import styles from '../gift-public.module.css'

interface GiftAccessControlProps {
    giftId: string
    publicCode: string
    initialGift?: any // Full gift if not locked
    isLocked: boolean
    publicData: {
        title: string | null
        senderName: string | null
        giftType: string
        passwordHint?: string | null
    }
    tagId?: string
}

export function GiftAccessControl({ giftId, publicCode, initialGift, isLocked, publicData, tagId }: GiftAccessControlProps) {
    const [gift, setGift] = useState(initialGift)
    const [unlocked, setUnlocked] = useState(!isLocked)
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await getGiftContent(publicCode, password)
            if (res.success && res.gift) {
                setGift(res.gift)
                setUnlocked(true)
            } else {
                setError(res.error || 'Hatalı şifre')
            }
        } catch (err) {
            setError('Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    if (unlocked && gift) {
        return <GiftReveal gift={gift} tagId={tagId} giftId={giftId} publicCode={publicCode} />
    }

    return (
        <div className={`${styles.container} ${styles[`theme-${publicData.giftType}`]}`}>
            <div className={styles.background}></div>

            <div className={styles.content} style={{ maxWidth: '400px' }}>
                <div className={styles.giftEmoji} style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>

                <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Şifreli Hediye</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
                    {publicData.senderName ? <strong>{publicData.senderName}</strong> : 'Biri'} sana özel bir hediye gönderdi.
                    Görüntülemek için şifreyi gir.
                </p>

                <form onSubmit={handleUnlock} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="password"
                        placeholder="Şifreyi girin..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '2px solid rgba(255,255,255,0.2)',
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            fontSize: '1.1rem',
                            outline: 'none'
                        }}
                        autoFocus
                    />

                    {error && (
                        <div style={{ color: '#ef4444', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'white',
                            color: 'var(--color-primary)',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: loading ? 'wait' : 'pointer',
                            opacity: loading || !password ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Kontrol Ediliyor...' : 'Kilidi Aç 🔓'}
                    </button>

                    {publicData.passwordHint && (
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <details style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
                                <summary style={{ listStyle: 'none' }}>💡 İpucu Göster</summary>
                                <p style={{ marginTop: '0.5rem', color: 'white', fontStyle: 'italic', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                                    {publicData.passwordHint}
                                </p>
                            </details>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
