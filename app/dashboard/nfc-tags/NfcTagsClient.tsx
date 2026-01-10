'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/app/components/Toast'
import { useRouter } from 'next/navigation'
import { getBaseUrl } from '@/lib/env'
import { TransferModal } from '@/app/components/TransferModal'
import styles from './nfc-tags.module.css'

interface NfcTag {
    id: string
    publicCode: string
    status: string
    createdAt: string
    claimedAt?: string
}

interface TransferRequest {
    id: string
    tagId: string
    fromUserId: string
    toUserId: string
    status: string
    message: string | null
    createdAt: Date
    updatedAt: Date
    fromUser?: {
        name: string | null
        username: string | null
        email: string | null
    }
    toUser?: {
        name: string | null
        username: string | null
        email: string | null
    }
    tag: {
        publicCode: string
        moduleType: string | null
    }
}

interface NfcTagsClientProps {
    sentRequests: TransferRequest[]
    receivedRequests: TransferRequest[]
}

export default function NfcTagsClient({ sentRequests, receivedRequests }: NfcTagsClientProps) {
    const { showToast } = useToast()
    const router = useRouter()
    const [tags, setTags] = useState<NfcTag[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'linked' | 'unlinked'>('all')
    const [unlinkingId, setUnlinkingId] = useState<string | null>(null)

    // Modals
    const [showClaimModal, setShowClaimModal] = useState(false)
    const [showTransferModal, setShowTransferModal] = useState(false)
    const [selectedTagForTransfer, setSelectedTagForTransfer] = useState<NfcTag | null>(null)

    // Claim Form
    const [claimCode, setClaimCode] = useState('')
    const [claimModuleType, setClaimModuleType] = useState('generic')
    const [claimLoading, setClaimLoading] = useState(false)
    const [claimError, setClaimError] = useState('')

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

    const handleClaim = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!claimCode.trim()) return

        setClaimLoading(true)
        setClaimError('')

        try {
            const res = await fetch('/api/nfc/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: claimCode.trim(),
                    moduleType: claimModuleType !== 'generic' ? claimModuleType : undefined
                })
            })

            const data = await res.json()

            if (res.ok) {
                showToast('Etiket başarıyla eklendi!', 'success')
                setShowClaimModal(false)
                setClaimCode('')
                setClaimModuleType('generic')
                fetchTags() // Refresh
            } else {
                setClaimError(data.error || 'Etiket eklenemedi.')
            }
        } catch (error) {
            setClaimError('Bir hata oluştu.')
        } finally {
            setClaimLoading(false)
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
                showToast('Bağlantı kaldırıldı', 'success')
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

    const openTransferModal = (tag: NfcTag) => {
        setSelectedTagForTransfer(tag)
        setShowTransferModal(true)
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
                <h1 className={styles.title}>🏷️ NFC Etiketlerim</h1>
                <p className={styles.subtitle}>Sahip olduğunuz {tags.length} NFC etiketi</p>

                {/* Mobile Add Button if needed, or just rely on grid card */}
            </div>

            {/* Grid */}
            <div className={styles.grid}>

                {/* Add Tag Card - Always visible first */}
                <div
                    className={`${styles.card} ${styles.addCard}`}
                    onClick={() => setShowClaimModal(true)}
                >
                    <div className={styles.addContent}>
                        <span className={styles.addIcon}>➕</span>
                        <h3>Etiket Ekle</h3>
                        <p style={{ fontSize: '0.875rem' }}>Elinizdeki yeni bir etiketi sisteme tanımlayın</p>
                    </div>
                </div>

                {tags.map(tag => (
                    <div key={tag.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper}>
                                🏷️
                            </div>
                            <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                                {tag.status === 'claimed' ? 'Aktif' : 'Boşta'}
                            </span>
                        </div>

                        <div className={styles.code}>{tag.publicCode}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            {new Date(tag.claimedAt || tag.createdAt).toLocaleDateString('tr-TR')}
                        </div>

                        <div className={styles.actions}>
                            <button
                                className={`${styles.actionBtn} ${styles.primaryBtn} ${styles.fullWidth}`}
                                onClick={() => openTransferModal(tag)}
                            >
                                🎁 Transfer Et
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Claim Modal */}
            {showClaimModal && (
                <div className="modal-overlay" onClick={() => setShowClaimModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>🏷️ Etiket Ekle</h2>
                            <button className="close-btn" onClick={() => setShowClaimModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleClaim}>
                            <div className={styles.inputGroup}>
                                <label>Etiket Kodu (ID)</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Örn: nfc-12345"
                                    value={claimCode}
                                    onChange={e => setClaimCode(e.target.value)}
                                    autoFocus
                                />
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                    Etiketin üzerinde yazan benzersiz kodu giriniz.
                                </p>
                            </div>

                            <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
                                <label>Etiket Türü (İsteğe Bağlı)</label>
                                <select
                                    className={styles.input}
                                    value={claimModuleType}
                                    onChange={e => setClaimModuleType(e.target.value)}
                                >
                                    <option value="generic">🏷️ Genel / Belirsiz</option>
                                    <option value="plant">🪴 Akıllı Saksı / Bitki</option>
                                    <option value="mug">☕ Akıllı Kupa</option>
                                    <option value="card">💳 Dijital Kartvizit</option>
                                    <option value="page">📄 Özel Sayfa / Hediye</option>
                                </select>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                    Bu etiketi ne amaçla kullanacağınızı seçin.
                                </p>
                            </div>

                            {claimError && (
                                <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                                    {claimError}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowClaimModal(false)}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={claimLoading}>
                                    {claimLoading ? 'Ekleniyor...' : 'Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {selectedTagForTransfer && (
                <TransferModal
                    isOpen={showTransferModal}
                    onClose={() => {
                        setShowTransferModal(false)
                        setSelectedTagForTransfer(null)
                    }}
                    tagId={selectedTagForTransfer.id}
                    itemName={`NFC Etiketi (${selectedTagForTransfer.publicCode})`}
                />
            )}
        </div>
    )
}
