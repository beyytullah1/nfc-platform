'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { updateProfile, changePassword } from '@/lib/user-actions'
import { useToast } from '@/app/components/Toast'

export default function ProfilePage() {
    const { data: session, update } = useSession()
    const { showToast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'info' | 'security' | 'api'>('info')
    const [userData, setUserData] = useState<any>(null)

    // Fetch fresh user data from database
    useEffect(() => {
        async function fetchUserData() {
            try {
                const res = await fetch('/api/user/me')
                if (res.ok) {
                    const data = await res.json()
                    setUserData(data.user)
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error)
            }
        }
        fetchUserData()
    }, [])

    const user = userData || session?.user

    const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)

        const res = await updateProfile(formData)

        if (res.error) {
            showToast(res.error, 'error')
        } else {
            showToast(res.message || 'Profil güncellendi', 'success')
            await update() // Update session

            // Refresh user data to show in form
            const userRes = await fetch('/api/user/me')
            if (userRes.ok) {
                const data = await userRes.json()
                setUserData(data.user)
            }
        }
        setIsLoading(false)
    }

    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)

        const res = await changePassword(formData)

        if (res.error) {
            showToast(res.error, 'error')
        } else {
            showToast(res.message || 'Şifre değiştirildi', 'success');
            (e.target as HTMLFormElement).reset()
        }
        setIsLoading(false)
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '2rem' }}>
                Hesabım
            </h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                    onClick={() => setActiveTab('info')}
                    style={{
                        padding: '1rem',
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'info' ? '#3b82f6' : '#94a3b8',
                        borderBottom: activeTab === 'info' ? '2px solid #3b82f6' : '2px solid transparent',
                        cursor: 'pointer'
                    }}
                >
                    Profil Bilgileri
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    style={{
                        padding: '1rem',
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'security' ? '#3b82f6' : '#94a3b8',
                        borderBottom: activeTab === 'security' ? '2px solid #3b82f6' : '2px solid transparent',
                        cursor: 'pointer'
                    }}
                >
                    Güvenlik
                </button>
                <button
                    onClick={() => setActiveTab('api')}
                    style={{
                        padding: '1rem',
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'api' ? '#3b82f6' : '#94a3b8',
                        borderBottom: activeTab === 'api' ? '2px solid #3b82f6' : '2px solid transparent',
                        cursor: 'pointer'
                    }}
                >
                    API Ayarları
                </button>
            </div>

            {activeTab === 'info' && (
                <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '1rem' }}>
                    <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Ad Soyad</label>
                            <input
                                name="name"
                                defaultValue={user?.name || ''}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    color: 'white'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Kullanıcı Adı *</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#94a3b8' }}>@</span>
                                <input
                                    name="username"
                                    defaultValue={user?.username || ''}
                                    placeholder="kullaniciadi"
                                    pattern="[a-z0-9_]{3,20}"
                                    required
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        background: '#0f172a',
                                        border: '1px solid #334155',
                                        color: 'white'
                                    }}
                                />
                            </div>
                            <small style={{ color: '#64748b' }}>3-20 karakter, sadece küçük harf, rakam ve _</small>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Hakkımda</label>
                            <textarea
                                name="bio"
                                defaultValue={user?.bio || ''}
                                placeholder="Kısa bir tanıtım..."
                                maxLength={160}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    color: 'white',
                                    resize: 'vertical'
                                }}
                            />
                            <small style={{ color: '#64748b' }}>Maksimum 160 karakter</small>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Email</label>
                            <input
                                name="email"
                                defaultValue={user?.email || ''}
                                readOnly // Email değişimi usually requires verification, keeping it readonly slightly safer for now or editable if wanted
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    color: '#64748b',
                                    cursor: 'not-allowed'
                                }}
                            />
                            <small style={{ color: '#64748b' }}>Email adresi değiştirilemez.</small>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: '0.75rem',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'Kaydediliyor...' : 'Bilgileri Güncelle'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'security' && (
                <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '1rem' }}>
                    <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Mevcut Şifre</label>
                            <input
                                type="password"
                                name="currentPassword"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    color: 'white'
                                }}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Yeni Şifre</label>
                            <input
                                type="password"
                                name="newPassword"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    color: 'white'
                                }}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Yeni Şifre (Tekrar)</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    color: 'white'
                                }}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: '0.75rem',
                                background: '#ef4444', // Red for password
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'İşleniyor...' : 'Şifreyi Değiştir'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'api' && (
                <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#fff' }}>🤖 Gemini AI API</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                        Bitki AI asistanını kullanmak için kendi Gemini API key'inizi girebilirsiniz.
                    </p>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault()
                            setIsLoading(true)
                            const formData = new FormData(e.currentTarget)
                            const apiKey = formData.get('geminiApiKey') as string

                            try {
                                const res = await fetch('/api/settings/api-key', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ geminiApiKey: apiKey })
                                })

                                if (res.ok) {
                                    showToast('API key kaydedildi', 'success')
                                } else {
                                    const data = await res.json()
                                    showToast(data.error || 'Bir hata oluştu', 'error')
                                }
                            } catch (error) {
                                showToast('Bir hata oluştu', 'error')
                            }
                            setIsLoading(false)
                        }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                    >
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Gemini API Key</label>
                            <input
                                type="password"
                                name="geminiApiKey"
                                defaultValue={user?.geminiApiKey || ''}
                                placeholder="AIzaSy..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    color: 'white'
                                }}
                            />
                            <small style={{ color: '#64748b', display: 'block', marginTop: '0.5rem' }}>
                                API key'i buradan alabilirsiniz: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>https://aistudio.google.com/app/apikey</a>
                            </small>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: '0.75rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'Kaydediliyor...' : 'API Key Kaydet'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}
