'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MODULE_OPTIONS } from '@/lib/types'

interface Card { id: string; title: string | null; slug: string | null }
interface Plant { id: string; name: string; slug: string | null }
interface Mug { id: string; name: string; slug: string | null }
interface Gift { id: string; title: string | null; slug: string | null }
interface Page { id: string; title: string | null; slug: string | null }

export default function ClaimPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const code = searchParams.get('code')

    const [step, setStep] = useState<'checking' | 'invalid-code' | 'module' | 'link-choice' | 'link-select' | 'name' | 'loading'>('checking')
    const [selectedModule, setSelectedModule] = useState<string | null>(null)
    const [name, setName] = useState('')
    const [error, setError] = useState('')

    // Modules State
    const [userModules, setUserModules] = useState<{
        cards: Card[],
        plants: Plant[],
        mugs: Mug[],
        gifts: Gift[],
        pages: Page[]
    }>({ cards: [], plants: [], mugs: [], gifts: [], pages: [] })

    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
    const [loadingModules, setLoadingModules] = useState(false)
    const [tagExists, setTagExists] = useState<boolean | null>(null)
    const [newCode, setNewCode] = useState('')

    // NFC kodunu veritabanında kontrol et
    useEffect(() => {
        if (!code) {
            setStep('invalid-code')
            return
        }

        const checkCode = async () => {
            try {
                const res = await fetch(`/api/nfc/check?code=${encodeURIComponent(code)}`)
                const data = await res.json()

                if (data.exists) {
                    setTagExists(true)
                    // If tag is already claimed/linked, maybe redirect? 
                    // check API might handle redirections or we handle it here if data.redirectUrl exists
                    if (data.redirectUrl) {
                        router.push(data.redirectUrl)
                    } else {
                        setStep('module')
                    }
                } else {
                    setTagExists(false)
                    setStep('invalid-code')
                }
            } catch (err) {
                console.error('Code check error:', err)
                setTagExists(false)
                setStep('invalid-code')
            }
        }

        checkCode()
    }, [code, router])

    // Kullanıcının modüllerini yükle
    const loadUserModules = async () => {
        setLoadingModules(true)
        try {
            const res = await fetch('/api/user/modules')
            if (res.ok) {
                const data = await res.json()
                setUserModules({
                    cards: data.cards || [],
                    plants: data.plants || [],
                    mugs: data.mugs || [],
                    gifts: data.gifts || [],
                    pages: data.pages || []
                })
            }
        } catch (err) {
            console.error('Failed to load modules:', err)
        }
        setLoadingModules(false)
    }

    // Load modules initially to check if "Match Existing" should be shown
    useEffect(() => {
        if (step === 'module') {
            loadUserModules()
        }
    }, [step])

    // Loading state
    if (step === 'checking') {
        return (
            <div className="container" style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <h1 style={{ color: '#fff' }}>Etiket Kontrol Ediliyor...</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Kod: <strong>{code}</strong></p>
                </div>
            </div>
        )
    }

    // Invalid code
    if (step === 'invalid-code') {
        return (
            <div className="container" style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div className="card" style={{ textAlign: 'center', maxWidth: '450px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏷️</div>
                    <h1 style={{ color: '#fff', marginBottom: '0.5rem' }}>Etiket Bulunamadı</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                        {code ? <><strong style={{ color: '#f59e0b' }}>{code}</strong> kodu sistemde kayıtlı değil.</> : 'NFC etiket kodu girilmedi.'}
                    </p>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            placeholder="NFC etiket kodunu girin..."
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                            className="input"
                            style={{ textAlign: 'center', textTransform: 'uppercase' }}
                        />
                        <button
                            onClick={() => { if (newCode.trim()) router.push(`/claim?code=${newCode.trim()}`) }}
                            disabled={!newCode.trim()}
                            className="btn btn-primary"
                            style={{ marginTop: '0.5rem', width: '100%' }}
                        >
                            🔍 Kodu Kontrol Et
                        </button>
                    </div>
                    <button onClick={() => router.push('/dashboard')} className="btn btn-ghost">← Dashboard'a Dön</button>
                </div>
            </div>
        )
    }

    const handleModuleSelect = (moduleId: string) => {
        setSelectedModule(moduleId)
        setStep('link-choice')
    }

    const handleLinkModule = async () => {
        if (!selectedModuleId || !selectedModule) {
            setError('Lütfen bir seçim yapın.')
            return
        }

        setStep('loading')

        try {
            const res = await fetch('/api/claim/link-module', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    moduleId: selectedModuleId,
                    moduleType: selectedModule
                }),
            })

            const data = await res.json()

            if (data.error) {
                setError(data.error)
                setStep('link-select')
                return
            }

            if (data.redirect) {
                router.push(data.redirect)
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.')
            setStep('link-select')
        }
    }

    const handleCreateNew = async (e: React.FormEvent) => {
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

    const getAvailableModules = () => {
        switch (selectedModule) {
            case 'card': return userModules.cards;
            case 'plant': return userModules.plants;
            case 'mug': return userModules.mugs;
            case 'gift': return userModules.gifts;
            case 'canvas': return userModules.pages; // mapped to pages
            default: return [];
        }
    }

    const availableModules = getAvailableModules()
    const selectedModuleInfo = MODULE_OPTIONS.find(m => m.id === selectedModule)

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
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
                    <h2 style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.8)' }}>
                        Bu etiketi neye yapıştırdın?
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {MODULE_OPTIONS.map((module) => (
                            <button
                                key={module.id}
                                onClick={() => handleModuleSelect(module.id)}
                                className="card"
                                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                            >
                                <span style={{ fontSize: '2.5rem' }}>{module.emoji}</span>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>{module.name}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>{module.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Seçim (Yeni oluştur veya Mevcut Bağla) */}
            {step === 'link-choice' && (
                <div>
                    <button onClick={() => setStep('module')} className="btn btn-ghost" style={{ marginBottom: '1rem' }}>← Geri</button>
                    <h2 style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
                        {selectedModuleInfo?.name} Eşleştirme
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {availableModules.length > 0 && (
                            <button
                                onClick={() => setStep('link-select')}
                                className="card"
                                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', border: '2px solid var(--color-primary)', cursor: 'pointer', textAlign: 'left', width: '100%', background: 'rgba(59, 130, 246, 0.1)' }}
                            >
                                <span style={{ fontSize: '2.5rem' }}>🔗</span>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>Mevcut İle Eşleştir</div>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{availableModules.length} adet {selectedModuleInfo?.name}</div>
                                </div>
                            </button>
                        )}

                        <button
                            onClick={() => setStep('name')}
                            className="card"
                            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                        >
                            <span style={{ fontSize: '2.5rem' }}>✨</span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>Yeni Oluştur</div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Sıfırdan oluştur ve eşleştir</div>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Mevcut Modül Seçimi */}
            {step === 'link-select' && (
                <div>
                    <button onClick={() => setStep('link-choice')} className="btn btn-ghost" style={{ marginBottom: '1rem' }}>← Geri</button>
                    <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#fff' }}>Hangi {selectedModuleInfo?.name}?</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
                        {availableModules.map((item: any) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedModuleId(item.id)}
                                className="card"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                                    border: selectedModuleId === item.id ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer', textAlign: 'left',
                                    background: selectedModuleId === item.id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.03)',
                                }}
                            >
                                <div style={{ fontWeight: 600 }}>{item.title || item.name || 'İsimsiz'}</div>
                                {selectedModuleId === item.id && <span style={{ marginLeft: 'auto', color: 'var(--color-primary)' }}>✓</span>}
                            </button>
                        ))}
                    </div>

                    {error && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>}

                    <button onClick={handleLinkModule} className="btn btn-primary" disabled={!selectedModuleId}>
                        Eşleşmeyi Tamamla 🚀
                    </button>
                </div>
            )}

            {/* Step 4: Yeni İsim Girişi */}
            {step === 'name' && (
                <div>
                    <button onClick={() => setStep('link-choice')} className="btn btn-ghost" style={{ marginBottom: '1rem' }}>← Geri</button>
                    <form onSubmit={handleCreateNew}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>İsimlendirin</label>
                        <input
                            type="text"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={`Örn: Benim ${selectedModuleInfo?.name || 'Şeyim'}`}
                            autoFocus
                            style={{ marginBottom: '1rem' }}
                        />
                        {error && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>}
                        <button type="submit" className="btn btn-primary">Kaydet ve Başla 🚀</button>
                    </form>
                </div>
            )}

            {/* Loading */}
            {step === 'loading' && (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 1s infinite' }}>⏳</div>
                    <p style={{ color: 'var(--color-text-muted)' }}>İşleniyor...</p>
                </div>
            )}

            <style jsx>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
    )
}
