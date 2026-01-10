'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/app/components/Toast'
import { useRouter } from 'next/navigation'
import { TransferModal } from '@/app/components/TransferModal'
import styles from './nfc-tags.module.css'

interface NfcTag {
    id: string
    publicCode: string
    status: string
    moduleType: string | null
    createdAt: string
    claimedAt?: string
    card?: { id: string; title: string | null } | null
    plant?: { id: string; name: string } | null
    mug?: { id: string; name: string } | null
    gift?: { id: string; title: string | null } | null
    page?: { id: string; title: string | null } | null
}

interface UserModules {
    plants: { id: string; name: string }[]
    mugs: { id: string; name: string }[]
    cards: { id: string; title: string | null }[]
    gifts: { id: string; title: string | null }[]
    pages: { id: string; title: string | null }[]
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
    userTags: NfcTag[]
    userModules: UserModules
    sentRequests: TransferRequest[]
    receivedRequests: TransferRequest[]
}

export default function NfcTagsClient({ userTags: initialTags, userModules, sentRequests, receivedRequests }: NfcTagsClientProps) {
    const { showToast } = useToast()
    const router = useRouter()
    const [tags, setTags] = useState<NfcTag[]>(initialTags)
    const [loading, setLoading] = useState(false)

    // Modals
    const [showLinkModal, setShowLinkModal] = useState(false)
    const [showTransferModal, setShowTransferModal] = useState(false)
    const [selectedTag, setSelectedTag] = useState<NfcTag | null>(null)
    const [selectedModuleType, setSelectedModuleType] = useState<string>('')
    const [selectedModuleId, setSelectedModuleId] = useState<string>('')

    const getLinkedModule = (tag: NfcTag) => {
        if (tag.card) return { type: '💳 Kartvizit', name: tag.card.title || 'İsimsiz', id: tag.card.id }
        if (tag.plant) return { type: '🪴 Bitki', name: tag.plant.name, id: tag.plant.id }
        if (tag.mug) return { type: '☕ Kupa', name: tag.mug.name, id: tag.mug.id }
        if (tag.gift) return { type: '🎁 Hediye', name: tag.gift.title || 'İsimsiz', id: tag.gift.id }
        if (tag.page) return { type: '📄 Sayfa', name: tag.page.title || 'İsimsiz', id: tag.page.id }
        return null
    }

    const handleLink = async () => {
        if (!selectedTag || !selectedModuleType || !selectedModuleId) {
            showToast('Lütfen modül seçin', 'error')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/nfc/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tagId: selectedTag.id,
                    moduleType: selectedModuleType,
                    moduleId: selectedModuleId
                })
            })

            if (res.ok) {
                showToast('Etiket başarıyla eşleştirildi', 'success')
                setShowLinkModal(false)
                setSelectedTag(null)
                setSelectedModuleType('')
                setSelectedModuleId('')
                router.refresh()
            } else {
                showToast('Eşleştirme başarısız', 'error')
            }
        } catch (error) {
            showToast('Bir hata oluştu', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleUnlink = async (tag: NfcTag) => {
        if (!confirm('Bu etiketi modülden ayırmak istediğinizden emin misiniz?')) return

        setLoading(true)
        try {
            const res = await fetch('/api/nfc/unlink', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagId: tag.id })
            })

            if (res.ok) {
                showToast('Etiket modülden ayrıldı', 'success')
                router.refresh()
            } else {
                showToast('İşlem başarısız', 'error')
            }
        } catch (error) {
            showToast('Bir hata oluştu', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (tag: NfcTag) => {
        if (!confirm('Bu etiketi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return

        setLoading(true)
        try {
            const res = await fetch('/api/nfc/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagId: tag.id })
            })

            if (res.ok) {
                showToast('Etiket silindi', 'success')
                router.refresh()
            } else {
                showToast('Silme başarısız', 'error')
            }
        } catch (error) {
            showToast('Bir hata oluştu', 'error')
        } finally {
            setLoading(false)
        }
    }

    const openLinkModal = (tag: NfcTag) => {
        setSelectedTag(tag)
        setSelectedModuleType('')
        setSelectedModuleId('')
        setShowLinkModal(true)
    }

    const openTransferModal = (tag: NfcTag) => {
        setSelectedTag(tag)
        setShowTransferModal(true)
    }

    const getAvailableModules = () => {
        if (!selectedModuleType) return []

        switch (selectedModuleType) {
            case 'plant': return userModules.plants
            case 'mug': return userModules.mugs
            case 'card': return userModules.cards
            case 'gift': return userModules.gifts
            case 'page': return userModules.pages
            default: return []
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>NFC Etiketlerim</h1>
                    <p>Sahip olduğunuz NFC etiketlerini yönetin</p>
                </div>
            </div>

            {/* Tags List */}
            <div className={styles.tagsGrid}>
                {tags.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>Henüz NFC etiketiniz yok</p>
                    </div>
                ) : (
                    tags.map(tag => {
                        const linkedModule = getLinkedModule(tag)

                        return (
                            <div key={tag.id} className={styles.tagCard}>
                                <div className={styles.tagHeader}>
                                    <div>
                                        <h3>{tag.publicCode}</h3>
                                        <small>
                                            {tag.claimedAt
                                                ? new Date(tag.claimedAt).toLocaleDateString('tr-TR')
                                                : 'Tarih yok'
                                            }
                                        </small>
                                    </div>
                                </div>

                                {linkedModule && (
                                    <div className={styles.linkedInfo}>
                                        <span className={styles.moduleType}>{linkedModule.type}</span>
                                        <span className={styles.moduleName}>{linkedModule.name}</span>
                                    </div>
                                )}

                                <div className={styles.actions}>
                                    {linkedModule ? (
                                        <button
                                            className={`${styles.actionBtn} ${styles.warningBtn}`}
                                            onClick={() => handleUnlink(tag)}
                                            disabled={loading}
                                        >
                                            🔗 Eşleştirmeyi Kaldır
                                        </button>
                                    ) : (
                                        <button
                                            className={`${styles.actionBtn} ${styles.primaryBtn}`}
                                            onClick={() => openLinkModal(tag)}
                                            disabled={loading}
                                        >
                                            🔗 Eşleştir
                                        </button>
                                    )}

                                    <button
                                        className={`${styles.actionBtn} ${styles.secondaryBtn}`}
                                        onClick={() => openTransferModal(tag)}
                                        disabled={loading}
                                    >
                                        🎁 Transfer Et
                                    </button>

                                    <button
                                        className={`${styles.actionBtn} ${styles.dangerBtn}`}
                                        onClick={() => handleDelete(tag)}
                                        disabled={loading}
                                    >
                                        🗑️ Kaldır
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Link Modal */}
            {showLinkModal && selectedTag && (
                <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>🔗 Etiket Eşleştir</h2>
                            <button className="close-btn" onClick={() => setShowLinkModal(false)}>×</button>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                                <strong>{selectedTag.publicCode}</strong> etiketini hangi modüle bağlamak istersiniz?
                            </p>

                            <div className={styles.inputGroup}>
                                <label>Modül Türü</label>
                                <select
                                    className={styles.input}
                                    value={selectedModuleType}
                                    onChange={e => {
                                        setSelectedModuleType(e.target.value)
                                        setSelectedModuleId('')
                                    }}
                                >
                                    <option value="">Seçin...</option>
                                    {userModules.plants.length > 0 && <option value="plant">🪴 Bitki</option>}
                                    {userModules.mugs.length > 0 && <option value="mug">☕ Kupa</option>}
                                    {userModules.cards.length > 0 && <option value="card">💳 Kartvizit</option>}
                                    {userModules.gifts.length > 0 && <option value="gift">🎁 Hediye</option>}
                                    {userModules.pages.length > 0 && <option value="page">📄 Sayfa</option>}
                                </select>
                            </div>

                            {selectedModuleType && (
                                <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
                                    <label>Modül Seçin</label>
                                    <select
                                        className={styles.input}
                                        value={selectedModuleId}
                                        onChange={e => setSelectedModuleId(e.target.value)}
                                    >
                                        <option value="">Seçin...</option>
                                        {getAvailableModules().map((module: any) => (
                                            <option key={module.id} value={module.id}>
                                                {module.name || module.title || 'İsimsiz'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowLinkModal(false)}
                            >
                                İptal
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleLink}
                                disabled={loading || !selectedModuleId}
                            >
                                {loading ? 'Eşleştiriliyor...' : 'Eşleştir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {selectedTag && (
                <TransferModal
                    isOpen={showTransferModal}
                    onClose={() => {
                        setShowTransferModal(false)
                        setSelectedTag(null)
                    }}
                    tagId={selectedTag.id}
                    itemName={`NFC Etiketi (${selectedTag.publicCode})`}
                />
            )}
        </div>
    )
}
