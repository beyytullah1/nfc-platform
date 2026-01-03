'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LinkNfcSectionProps {
    cardId: string
    currentTagCode?: string | null
}

export function LinkNfcSection({ cardId, currentTagCode }: LinkNfcSectionProps) {
    const router = useRouter()
    const [nfcCode, setNfcCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleLink = async () => {
        if (!nfcCode.trim()) {
            setError('Lütfen NFC kodunu girin')
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const res = await fetch('/api/nfc/link-to-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    publicCode: nfcCode.trim(),
                    cardId
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Eşleştirme başarısız')
                return
            }

            setSuccess('NFC başarıyla eşleştirildi!')
            setNfcCode('')
            setTimeout(() => {
                router.refresh()
            }, 1000)

        } catch (err) {
            setError('Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleUnlink = async () => {
        if (!confirm('Bu NFC bağlantısını kaldırmak istediğinizden emin misiniz?')) {
            return
        }

        setLoading(true)
        setError('')

        try {
            // Tag ID'yi bulmak için önce tag'i getir
            const tagRes = await fetch(`/api/nfc/my-tags`)
            const tagData = await tagRes.json()
            const tag = tagData.tags.find((t: any) => t.publicCode === currentTagCode)

            if (!tag) {
                setError('NFC etiketi bulunamadı')
                return
            }

            const res = await fetch('/api/nfc/unlink', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagId: tag.id })
            })

            if (!res.ok) {
                const data = await res.json()
                setError(data.error || 'Bağlantı kaldırılamadı')
                return
            }

            setSuccess('NFC bağlantısı kaldırıldı')
            setTimeout(() => {
                router.refresh()
            }, 1000)

        } catch (err) {
            setError('Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card" style={{ marginTop: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🏷️ NFC Eşleştirme
            </h2>

            {currentTagCode ? (
                <div>
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '8px',
                        marginBottom: '1rem'
                    }}>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                            Eşleşmiş NFC Kodu:
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                            {currentTagCode}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
                            URL: localhost:3000/t/{currentTagCode}
                        </div>
                    </div>

                    <button
                        onClick={handleUnlink}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            color: '#fca5a5',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        {loading ? 'Kaldırılıyor...' : '🔗 Bağlantıyı Kaldır'}
                    </button>
                </div>
            ) : (
                <div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Bu kartvizite bir NFC etiketi eşleştirerek fiziksel etiketinizle bu kartı bağlayabilirsiniz.
                    </p>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '0.85rem'
                        }}>
                            NFC Public Code
                        </label>
                        <input
                            type="text"
                            value={nfcCode}
                            onChange={(e) => setNfcCode(e.target.value)}
                            placeholder="Örn: DEMO2026 veya ABC123XYZ"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '0.9rem',
                                fontFamily: 'monospace'
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleLink()
                                }
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            color: '#fca5a5',
                            fontSize: '0.85rem',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            padding: '0.75rem',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '8px',
                            color: '#86efac',
                            fontSize: '0.85rem',
                            marginBottom: '1rem'
                        }}>
                            {success}
                        </div>
                    )}

                    <button
                        onClick={handleLink}
                        disabled={loading || !nfcCode.trim()}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            background: loading || !nfcCode.trim() ? 'rgba(59, 130, 246, 0.3)' : 'var(--color-primary)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: loading || !nfcCode.trim() ? 'not-allowed' : 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '500'
                        }}
                    >
                        {loading ? 'Eşleştiriliyor...' : '🔗 NFC Eşleştir'}
                    </button>
                </div>
            )}
        </div>
    )
}
