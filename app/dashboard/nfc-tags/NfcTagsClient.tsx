'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/app/components/Toast'
import { useRouter } from 'next/navigation'
import styles from '../dashboard.module.css'

interface NfcTag {
    id: string
    publicCode: string
    status: string
    moduleType?: string
    linkedTo?: {
        type: 'card' | 'plant' | 'mug' | 'page'
        id: string
        title: string
        slug?: string
    }
    createdAt: string
    claimedAt?: string
}

export default function NfcTagsClient() {
    const { showToast } = useToast()
    const router = useRouter()
    const [tags, setTags] = useState<NfcTag[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'linked' | 'unlinked'>('all')
    const [unlinkingId, setUnlinkingId] = useState<string | null>(null)

    useEffect(() => {
        fetchTags()
    }, [])

    const fetchTags = async () => {
        try {
            const res = await fetch('/api/nfc/my-tags')
            if (res.ok) {
                const data = await res.json()
                setTags(data.tags)
            }
        } catch (error) {
            console.error('Failed to fetch tags:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUnlink = async (tagId: string) => {
        if (!confirm('Bu NFC bağlantısını kaldırmak istediğinizden emin misiniz?')) {
            return
        }

        setUnlinkingId(tagId)
        try {
            const res = await fetch('/api/nfc/unlink', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagId })
            })

            if (res.ok) {
                await fetchTags() // Refresh list
            } else {
                const data = await res.json()
                showToast(data.error || 'Bağlantı kaldırılamadı', 'error')
            }
        } catch (error) {
            console.error('Unlink error:', error)
            showToast('Bir hata oluştu', 'error')
        } finally {
            setUnlinkingId(null)
        }
    }

    const filteredTags = tags.filter(tag => {
        if (filter === 'linked') return tag.linkedTo
        if (filter === 'unlinked') return !tag.linkedTo
        return true
    })

    const getModuleIcon = (type?: string) => {
        switch (type) {
            case 'card': return '📇'
            case 'plant': return '🪴'
            case 'mug': return '☕'
            case 'page': return '🎁'
            default: return '🏷️'
        }
    }

    const getStatusBadge = (tag: NfcTag) => {
        if (tag.linkedTo) {
            return <span className="badge badge-success">Eşleşmiş</span>
        }
        return <span className="badge badge-warning">Eşleşmemiş</span>
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className="loading">Yükleniyor...</div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className="title">🏷️ NFC Etiketlerim</h1>
                <p className="subtitle">Sahip olduğunuz {tags.length} NFC etiketi</p>
            </div>

            {/* Filter */}
            <div className={styles.filters} style={{ marginBottom: '2rem' }}>
                <button
                    className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('all')}
                >
                    Tümü ({tags.length})
                </button>
                <button
                    className={`btn ${filter === 'linked' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('linked')}
                >
                    Eşleşmiş ({tags.filter(t => t.linkedTo).length})
                </button>
                <button
                    className={`btn ${filter === 'unlinked' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('unlinked')}
                >
                    Eşleşmemiş ({tags.filter(t => !t.linkedTo).length})
                </button>
            </div>

            {/* Tags Grid */}
            {filteredTags.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏷️</div>
                    <h3>NFC etiketi bulunamadı</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        {filter === 'all'
                            ? 'Henüz NFC etiketiniz yok'
                            : `${filter === 'linked' ? 'Eşleşmiş' : 'Eşleşmemiş'} etiket bulunamadı`
                        }
                    </p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {filteredTags.map(tag => (
                        <div key={tag.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '2rem' }}>
                                    {getModuleIcon(tag.moduleType)}
                                </div>
                                {getStatusBadge(tag)}
                            </div>

                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                                {tag.publicCode}
                            </h3>

                            {tag.linkedTo && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                        Bağlı Olduğu:
                                    </p>
                                    <p style={{ fontWeight: '500' }}>
                                        {tag.linkedTo.title}
                                    </p>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                {tag.linkedTo ? (
                                    <>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ flex: 1 }}
                                            onClick={() => {
                                                const path = tag.linkedTo?.type === 'card'
                                                    ? `/c/${tag.linkedTo.slug || tag.linkedTo.id}`
                                                    : `/${tag.linkedTo?.type?.charAt(0)}/${tag.linkedTo?.id}`
                                                router.push(path)
                                            }}
                                        >
                                            Görüntüle
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            style={{ flex: 1 }}
                                            onClick={() => handleUnlink(tag.id)}
                                            disabled={unlinkingId === tag.id}
                                        >
                                            {unlinkingId === tag.id ? 'Kaldırılıyor...' : 'Bağlantıyı Kaldır'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                        onClick={() => router.push(`/claim?code=${tag.publicCode}`)}
                                    >
                                        Eşleştir
                                    </button>
                                )}
                            </div>

                            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                URL: localhost:3000/t/{tag.publicCode}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
