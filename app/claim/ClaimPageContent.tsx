'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MODULE_OPTIONS } from '@/lib/types'

interface Card {
    id: string
    title: string | null
    slug: string | null
    avatarUrl: string | null
}

export default function ClaimPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const code = searchParams.get('code')

    const [step, setStep] = useState<'module' | 'card-choice' | 'card-link' | 'name' | 'loading'>('module')
    const [selectedModule, setSelectedModule] = useState<string | null>(null)
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [userCards, setUserCards] = useState<Card[]>([])
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
    const [loadingCards, setLoadingCards] = useState(false)

    // Kullanıcının kartvizitlerini yükle
    const loadUserCards = async () => {
        setLoadingCards(true)
        try {
            const res = await fetch('/api/cards/my')
            if (res.ok) {
                const data = await res.json()
                setUserCards(data.cards || [])
            }
        } catch (err) {
            console.error('Failed to load cards:', err)
        }
        setLoadingCards(false)
    }

    if (!code) {
        return (
            <div className="container" style={{
                display: 'flex',
                height: '100vh',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h1>Geçersiz Bağlantı</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Lütfen NFC etiketini tekrar okutun.
                    </p>
                </div>
            </div>
        )
    }

    const handleModuleSelect = async (moduleId: string) => {
        setSelectedModule(moduleId)

        if (moduleId === 'card') {
            // Kartvizit için özel akış: önce mevcut kartları kontrol et
            await loadUserCards()
            setStep('card-choice')
        } else {
            // Diğer modüller için direkt isim girişi
            setStep('name')
        }
    }

    const handleCardLink = async () => {
        if (!selectedCardId) {
            setError('Lütfen bir kartvizit seçin.')
            return
        }

        setStep('loading')

        try {
            const res = await fetch('/api/claim/link-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    cardId: selectedCardId,
                }),
            })

            const data = await res.json()

            if (data.error) {
                setError(data.error)
                setStep('card-link')
                return
            }

            if (data.redirect) {
                router.push(data.redirect)
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.')
            setStep('card-link')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            setError('Lütfen bir isim girin.')
            return
        }

        setStep('loading')

        try {
            const res = await fetch('/api/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    moduleType: selectedModule,
                    name: name.trim(),
                }),
            })

            const data = await res.json()

            if (data.error) {
                setError(data.error)
                setStep('name')
                return
            }

            if (data.redirect) {
                router.push(data.redirect)
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.')
            setStep('name')
        }
    }

    const selectedModuleInfo = MODULE_OPTIONS.find(m => m.id === selectedModule)

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏷️</div>
                <h1 className="title-gradient" style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#fff' }}>
                    Etiketi Sahiplen
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    Kod: <strong style={{ color: '#fff' }}>{code}</strong>
                </p>
            </div>

            {/* Step 1: Modül Seçimi */}
            {step === 'module' && (
                <div>
                    <h2 style={{
                        textAlign: 'center',
                        fontSize: '1.1rem',
                        marginBottom: '1.5rem',
                        color: 'rgba(255,255,255,0.8)'
                    }}>
                        Bu etiketi neye yapıştırdın?
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {MODULE_OPTIONS.map((module) => (
                            <button
                                key={module.id}
                                onClick={() => handleModuleSelect(module.id)}
                                className="card"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '20px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    width: '100%',
                                }}
                            >
                                <span style={{ fontSize: '2.5rem' }}>{module.emoji}</span>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>
                                        {module.name}
                                    </div>
                                    <div style={{
                                        color: 'rgba(255,255,255,0.6)',
                                        fontSize: '0.85rem'
                                    }}>
                                        {module.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Sadece Kaydet Butonu */}
                    <div style={{
                        marginTop: '2rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <button
                            onClick={async () => {
                                setStep('loading')
                                try {
                                    const res = await fetch('/api/claim/claim-only', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ code }),
                                    })
                                    const data = await res.json()
                                    if (data.error) {
                                        setError(data.error)
                                        setStep('module')
                                        return
                                    }
                                    router.push('/dashboard/nfc-tags')
                                } catch (err) {
                                    setError('Bir hata oluştu')
                                    setStep('module')
                                }
                            }}
                            className="card"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '20px',
                                border: '2px solid rgba(59, 130, 246, 0.3)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%',
                                background: 'rgba(59, 130, 246, 0.05)'
                            }}
                        >
                            <span style={{ fontSize: '2.5rem' }}>💾</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>
                                    NFC Profilime Kaydet
                                </div>
                                <div style={{
                                    color: 'rgba(255,255,255,0.6)',
                                    fontSize: '0.85rem',
                                    marginTop: '4px'
                                }}>
                                    Önce kaydet, sonra eşleştir
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2a: Kartvizit Seçimi (Yeni veya Mevcut) */}
            {step === 'card-choice' && (
                <div>
                    <button
                        onClick={() => setStep('module')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        ← Geri
                    </button>

                    <h2 style={{
                        textAlign: 'center',
                        fontSize: '1.1rem',
                        marginBottom: '1.5rem',
                        color: 'var(--color-text-muted)'
                    }}>
                        Kartvizit Eşleştirme
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Mevcut kartviziti eşleştir */}
                        {userCards.length > 0 && (
                            <button
                                onClick={() => setStep('card-link')}
                                className="card"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '20px',
                                    border: '2px solid var(--color-primary)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    width: '100%',
                                    background: 'rgba(59, 130, 246, 0.1)'
                                }}
                            >
                                <span style={{ fontSize: '2.5rem' }}>🔗</span>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>
                                        Mevcut Kartvizitimi Eşleştir
                                    </div>
                                    <div style={{
                                        color: 'var(--color-text-muted)',
                                        fontSize: '0.85rem'
                                    }}>
                                        {userCards.length} kartvizitiniz var
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Yeni kartvizit oluştur */}
                        <button
                            onClick={() => setStep('name')}
                            className="card"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '20px',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%',
                            }}
                        >
                            <span style={{ fontSize: '2.5rem' }}>✨</span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>
                                    Yeni Kartvizit Oluştur
                                </div>
                                <div style={{
                                    color: 'var(--color-text-muted)',
                                    fontSize: '0.85rem'
                                }}>
                                    Sıfırdan bir kartvizit oluştur
                                </div>
                            </div>
                        </button>
                    </div>

                    {loadingCards && (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
                            Kartvizitler yükleniyor...
                        </p>
                    )}
                </div>
            )}

            {/* Step 2b: Kartvizit Seçimi (Dropdown) */}
            {step === 'card-link' && (
                <div>
                    <button
                        onClick={() => setStep('card-choice')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        ← Geri
                    </button>

                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '2rem' }}>🔗</span>
                            <div>
                                <div style={{ fontWeight: 600, color: '#fff' }}>Kartvizit Eşleştir</div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                    Bu NFC etiketini mevcut kartvizitinize bağlayın
                                </div>
                            </div>
                        </div>
                    </div>

                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '0.9rem',
                        color: '#fff'
                    }}>
                        Kartvizit Seçin
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
                        {userCards.map(card => (
                            <button
                                key={card.id}
                                onClick={() => setSelectedCardId(card.id)}
                                className="card"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    border: selectedCardId === card.id ? '2px solid var(--color-primary)' : '1px solid transparent',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    background: selectedCardId === card.id ? 'rgba(59, 130, 246, 0.1)' : undefined,
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'var(--color-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '1.2rem'
                                }}>
                                    {card.title?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{card.title || 'İsimsiz Kartvizit'}</div>
                                    {card.slug && (
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                            /{card.slug}
                                        </div>
                                    )}
                                </div>
                                {selectedCardId === card.id && (
                                    <span style={{ marginLeft: 'auto', color: 'var(--color-primary)' }}>✓</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <p style={{
                            color: '#e74c3c',
                            fontSize: '0.9rem',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleCardLink}
                        className="btn btn-primary"
                        disabled={!selectedCardId}
                        style={{ opacity: selectedCardId ? 1 : 0.5 }}
                    >
                        NFC'yi Bu Kartvizite Bağla 🔗
                    </button>
                </div>
            )}

            {/* Step 3: İsim Girişi (Yeni oluşturma) */}
            {step === 'name' && selectedModuleInfo && (
                <div>
                    <button
                        onClick={() => setStep(selectedModule === 'card' ? 'card-choice' : 'module')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        ← Geri
                    </button>

                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '2rem' }}>{selectedModuleInfo.emoji}</span>
                            <div>
                                <div style={{ fontWeight: 600 }}>{selectedModuleInfo.name}</div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                    {selectedModuleInfo.description}
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: 'var(--color-text-muted)',
                            fontSize: '0.9rem'
                        }}>
                            {selectedModule === 'card' && 'Kartvizit Başlığı'}
                            {selectedModule === 'plant' && 'Bitkinin Adı'}
                            {selectedModule === 'mug' && 'Kupanın Adı'}
                            {selectedModule === 'gift' && 'Hediye Başlığı'}
                            {selectedModule === 'canvas' && 'Sayfa Başlığı'}
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={
                                selectedModule === 'card' ? 'Örn: CEO @ Şirket' :
                                    selectedModule === 'plant' ? 'Örn: Minnoş' :
                                        selectedModule === 'mug' ? 'Örn: Kahve Kupam' :
                                            'Örn: Özel Sayfam'
                            }
                            autoFocus
                            style={{ marginBottom: '1rem' }}
                        />

                        {error && (
                            <p style={{
                                color: '#e74c3c',
                                fontSize: '0.9rem',
                                marginBottom: '1rem'
                            }}>
                                {error}
                            </p>
                        )}

                        <button type="submit" className="btn btn-primary">
                            Sahiplen ve Başla 🚀
                        </button>
                    </form>
                </div>
            )}

            {/* Loading */}
            {step === 'loading' && (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1rem',
                        animation: 'pulse 1s infinite'
                    }}>
                        ⏳
                    </div>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Etiket hazırlanıyor...
                    </p>
                </div>
            )}

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    )
}
