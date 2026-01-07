'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addPlantCoOwner, removePlantCoOwner } from '@/lib/plant-actions'
import { useToast } from '@/app/components/Toast'
import styles from '../plants.module.css'

interface CoOwner {
    id: string
    name: string | null
    username: string | null
    avatarUrl: string | null
}

interface PlantCoOwnersProps {
    plantId: string
    coOwners: CoOwner[]
    isOwner: boolean
}

export function PlantCoOwners({ plantId, coOwners, isOwner }: PlantCoOwnersProps) {
    const [showAddModal, setShowAddModal] = useState(false)
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [removingId, setRemovingId] = useState<string | null>(null)
    const { showToast } = useToast()
    const router = useRouter()

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!username.trim()) return

        setLoading(true)
        try {
            const result = await addPlantCoOwner(plantId, username.trim())
            if (result.success) {
                showToast('Ortak kullanıcı eklendi!', 'success')
                setUsername('')
                setShowAddModal(false)
                router.refresh()
            } else {
                showToast(result.error || 'Bir hata oluştu', 'error')
            }
        } catch (error) {
            showToast('Bir hata oluştu', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = async (userId: string) => {
        if (!confirm('Bu ortak kullanıcıyı kaldırmak istediğinizden emin misiniz?')) return

        setRemovingId(userId)
        try {
            const result = await removePlantCoOwner(plantId, userId)
            if (result.success) {
                showToast('Ortak kullanıcı kaldırıldı', 'success')
                router.refresh()
            } else {
                showToast(result.error || 'Bir hata oluştu', 'error')
            }
        } catch (error) {
            showToast('Bir hata oluştu', 'error')
        } finally {
            setRemovingId(null)
        }
    }

    return (
        <div className={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    👥 Ortak Kullanıcılar
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'normal' }}>
                        ({coOwners.length})
                    </span>
                </h3>
                {isOwner && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            borderRadius: '0.5rem',
                            color: '#fff',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        ➕ Ortak Ekle
                    </button>
                )}
            </div>

            {coOwners.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#94a3b8',
                    background: '#1e293b',
                    borderRadius: '0.75rem',
                    border: '1px solid #334155'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                    <p style={{ margin: 0 }}>
                        {isOwner ? 'Henüz ortak kullanıcı eklenmedi' : 'Bu bitkinin ortak kullanıcısı yok'}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '1rem'
                }}>
                    {coOwners.map((coOwner) => (
                        <div
                            key={coOwner.id}
                            style={{
                                background: '#1e293b',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid #334155',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                flexShrink: 0
                            }}>
                                {coOwner.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    color: '#fff',
                                    fontWeight: '600',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {coOwner.name || 'İsimsiz'}
                                </div>
                                {coOwner.username && (
                                    <div style={{
                                        color: '#94a3b8',
                                        fontSize: '0.85rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        @{coOwner.username}
                                    </div>
                                )}
                            </div>
                            {isOwner && (
                                <button
                                    onClick={() => handleRemove(coOwner.id)}
                                    disabled={removingId === coOwner.id}
                                    style={{
                                        padding: '0.5rem',
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '0.5rem',
                                        color: '#fca5a5',
                                        cursor: removingId === coOwner.id ? 'not-allowed' : 'pointer',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {removingId === coOwner.id ? '⏳' : '🗑️'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setShowAddModal(false)}>
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '1rem',
                        border: '1px solid #334155',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '90%'
                    }} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ color: '#fff', marginBottom: '1.5rem', textAlign: 'center' }}>
                            ➕ Ortak Kullanıcı Ekle
                        </h2>
                        <form onSubmit={handleAdd}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    color: '#94a3b8',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem'
                                }}>
                                    Kullanıcı Adı
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="ornek_kullanici"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '0.5rem',
                                        color: '#fff',
                                        fontSize: '1rem'
                                    }}
                                    autoFocus
                                />
                            </div>
                            <p style={{
                                fontSize: '0.85rem',
                                color: '#94a3b8',
                                marginBottom: '1.5rem'
                            }}>
                                💡 Ortak kullanıcılar bu bitkiye log ekleyebilir ve geçmişi görüntüleyebilir.
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'transparent',
                                        border: '1px solid #334155',
                                        borderRadius: '0.5rem',
                                        color: '#94a3b8',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !username.trim()}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: loading || !username.trim() ? '#334155' : 'linear-gradient(135deg, #10b981, #059669)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: '#fff',
                                        fontWeight: '600',
                                        cursor: loading || !username.trim() ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? '⏳ Ekleniyor...' : 'Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
