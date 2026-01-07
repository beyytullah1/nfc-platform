'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePlantPrivacy } from '@/lib/plant-actions'
import { useToast } from '@/app/components/Toast'

interface PlantPrivacySettingsProps {
    plantId: string
    currentPrivacy: string
}

export function PlantPrivacySettings({ plantId, currentPrivacy }: PlantPrivacySettingsProps) {
    const [privacy, setPrivacy] = useState(currentPrivacy)
    const [loading, setLoading] = useState(false)
    const { showToast } = useToast()
    const router = useRouter()

    const handlePrivacyChange = async (newPrivacy: string) => {
        setLoading(true)
        try {
            const result = await updatePlantPrivacy(plantId, newPrivacy)
            if (result.success) {
                setPrivacy(newPrivacy)
                showToast('Gizlilik ayarı güncellendi.', 'success')
                router.refresh()
            } else {
                showToast('Güncelleme başarısız oldu.', 'error')
            }
        } catch (error) {
            showToast('Bir sorun oluştu.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            background: '#1e293b',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid #334155',
            marginTop: '2rem'
        }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🔒 Gizlilik Ayarları
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: privacy === 'public' ? 'rgba(59, 130, 246, 0.1)' : '#0f172a',
                    border: `1px solid ${privacy === 'public' ? '#3b82f6' : '#334155'}`,
                    borderRadius: '0.5rem',
                    cursor: loading ? 'wait' : 'pointer',
                    transition: 'all 0.2s'
                }}>
                    <input
                        type="radio"
                        name="privacy"
                        value="public"
                        checked={privacy === 'public'}
                        onChange={() => handlePrivacyChange('public')}
                        disabled={loading}
                        style={{ accentColor: '#3b82f6' }}
                    />
                    <div>
                        <div style={{ color: '#fff', fontWeight: '500' }}>🌍 Herkese Açık</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Herkes bitkinizi ve günlüğünü görebilir.</div>
                    </div>
                </label>

                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: privacy === 'followers' ? 'rgba(34, 197, 94, 0.1)' : '#0f172a',
                    border: `1px solid ${privacy === 'followers' ? '#22c55e' : '#334155'}`,
                    borderRadius: '0.5rem',
                    cursor: loading ? 'wait' : 'pointer',
                    transition: 'all 0.2s'
                }}>
                    <input
                        type="radio"
                        name="privacy"
                        value="followers"
                        checked={privacy === 'followers'}
                        onChange={() => handlePrivacyChange('followers')}
                        disabled={loading}
                        style={{ accentColor: '#22c55e' }}
                    />
                    <div>
                        <div style={{ color: '#fff', fontWeight: '500' }}>👥 Sadece Takipçiler</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sadece sizi takip edenler görebilir.</div>
                    </div>
                </label>

                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: privacy === 'private' ? 'rgba(239, 68, 68, 0.1)' : '#0f172a',
                    border: `1px solid ${privacy === 'private' ? '#ef4444' : '#334155'}`,
                    borderRadius: '0.5rem',
                    cursor: loading ? 'wait' : 'pointer',
                    transition: 'all 0.2s'
                }}>
                    <input
                        type="radio"
                        name="privacy"
                        value="private"
                        checked={privacy === 'private'}
                        onChange={() => handlePrivacyChange('private')}
                        disabled={loading}
                        style={{ accentColor: '#ef4444' }}
                    />
                    <div>
                        <div style={{ color: '#fff', fontWeight: '500' }}>🔒 Gizli</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sadece siz görebilirsiniz.</div>
                    </div>
                </label>
            </div>
        </div>
    )
}
