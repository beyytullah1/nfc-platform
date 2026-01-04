'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { updateProfile, changePassword } from '@/lib/user-actions'
import { useToast } from '@/app/components/Toast'

export default function ProfilePage() {
    const { data: session, update } = useSession()
    const { showToast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'info' | 'security'>('info')

    const user = session?.user

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
        </div>
    )
}
