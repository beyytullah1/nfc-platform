'use client'

import { useState } from 'react'
import { useToast } from '../../components/Toast'

export default function SettingsPage() {
    const { showToast } = useToast()
    const [emailNotifs, setEmailNotifs] = useState(true)
    const [pushNotifs, setPushNotifs] = useState(false)
    const [theme, setTheme] = useState('dark')

    const handleSave = () => {
        // Mock save logic for now
        showToast('Ayarlar kaydedildi', 'success')
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '2rem' }}>
                Sistem Ayarları
            </h1>

            <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#e2e8f0', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
                    🔔 Bildirimler
                </h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <div style={{ color: 'white' }}>E-posta Bildirimleri</div>
                        <small style={{ color: '#94a3b8' }}>Önemli güncellemeler ve aktiviteler hakkında email al.</small>
                    </div>
                    <button
                        onClick={() => setEmailNotifs(!emailNotifs)}
                        style={{
                            width: '48px',
                            height: '24px',
                            borderRadius: '12px',
                            background: emailNotifs ? '#3b82f6' : '#475569',
                            position: 'relative',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                        }}
                    >
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'white',
                            position: 'absolute',
                            top: '2px',
                            left: emailNotifs ? '26px' : '2px',
                            transition: 'left 0.3s'
                        }} />
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: 'white' }}>Push Bildirimleri</div>
                        <small style={{ color: '#94a3b8' }}>Anlık tarayıcı bildirimleri al.</small>
                    </div>
                    <button
                        onClick={() => setPushNotifs(!pushNotifs)}
                        style={{
                            width: '48px',
                            height: '24px',
                            borderRadius: '12px',
                            background: pushNotifs ? '#3b82f6' : '#475569',
                            position: 'relative',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                        }}
                    >
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'white',
                            position: 'absolute',
                            top: '2px',
                            left: pushNotifs ? '26px' : '2px',
                            transition: 'left 0.3s'
                        }} />
                    </button>
                </div>
            </div>

            <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#e2e8f0', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
                    🎨 Görünüm
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {['dark', 'light', 'system'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTheme(t)}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid',
                                borderColor: theme === t ? '#3b82f6' : '#334155',
                                background: theme === t ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                color: theme === t ? '#3b82f6' : '#94a3b8',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {t === 'dark' ? 'Koyu 🌙' : t === 'light' ? 'Açık ☀️' : 'Sistem 💻'}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleSave}
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                }}
            >
                Ayarları Kaydet
            </button>
        </div>
    )
}
