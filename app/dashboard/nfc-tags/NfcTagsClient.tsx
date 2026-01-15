'use client'

import { useState } from 'react'
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
    claimedAt: string | null
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
    createdAt: string
    updatedAt: string
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

export default function NfcTagsClient({ userTags: initialTags, userModules, sentRequests: initialSent, receivedRequests: initialReceived }: NfcTagsClientProps) {
    const { showToast } = useToast()
    const router = useRouter()
    const [tags, setTags] = useState<NfcTag[]>(initialTags)
    const [sentRequests, setSentRequests] = useState<TransferRequest[]>(initialSent)
    const [receivedRequests, setReceivedRequests] = useState<TransferRequest[]>(initialReceived)
    const [loading, setLoading] = useState(false)

    // Modals
    const [showTransferModal, setShowTransferModal] = useState(false)
    const [selectedTag, setSelectedTag] = useState<NfcTag | null>(null)

    const getLinkedModule = (tag: NfcTag) => {
        if (tag.card) return { type: 'card', emoji: '💳', label: 'Kartvizit', name: tag.card.title || 'İsimsiz', id: tag.card.id }
        if (tag.plant) return { type: 'plant', emoji: '🪴', label: 'Bitki', name: tag.plant.name, id: tag.plant.id }
        if (tag.mug) return { type: 'mug', emoji: '☕', label: 'Kupa', name: tag.mug.name, id: tag.mug.id }
        if (tag.gift) return { type: 'gift', emoji: '🎁', label: 'Hediye', name: tag.gift.title || 'İsimsiz', id: tag.gift.id }
        if (tag.page) return { type: 'page', emoji: '📄', label: 'Sayfa', name: tag.page.title || 'İsimsiz', id: tag.page.id }
        return null
    }

    // Separate linked and unlinked tags
    const linkedTags = tags.filter(tag => getLinkedModule(tag) !== null)
    const unlinkedTags = tags.filter(tag => getLinkedModule(tag) === null)

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

    const handleCancelTransfer = async (requestId: string) => {
        if (!confirm('Transfer isteğini iptal etmek istiyor musunuz?')) return
        setLoading(true)
        try {
            const res = await fetch('/api/transfer/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId })
            })

            if (res.ok) {
                showToast('Transfer isteği iptal edildi', 'success')
                setSentRequests(prev => prev.filter(r => r.id !== requestId))
                router.refresh()
            } else {
                showToast('İptal işlemi başarısız', 'error')
            }
        } catch (error) {
            showToast('Bir hata oluştu', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleRespondTransfer = async (requestId: string, action: 'accept' | 'reject') => {
        if (!confirm(action === 'accept' ? 'Transferi kabul etmek istiyor musunuz?' : 'Transferi reddetmek istiyor musunuz?')) return
        setLoading(true)
        try {
            const res = await fetch('/api/transfer/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, action })
            })

            const data = await res.json()
            if (res.ok) {
                showToast(data.message, 'success')
                setReceivedRequests(prev => prev.filter(r => r.id !== requestId))
                router.refresh()
            } else {
                showToast(data.error || 'İşlem başarısız', 'error')
            }
        } catch (error) {
            showToast('Bir hata oluştu', 'error')
        } finally {
            setLoading(false)
        }
    }

    const openTransferModal = (tag: NfcTag) => {
        setSelectedTag(tag)
        setShowTransferModal(true)
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>🏷️ NFC Etiketlerim</h1>
                    <p className={styles.pageSubtitle}>
                        {tags.length > 0 ? `${tags.length} adet etiket` : 'Henüz etiketiniz yok'}
                    </p>
                </div>
                <a href="/claim" className={styles.addButton}>
                    <span className={styles.addButtonIcon}>➕</span>
                    Yeni Etiket Ekle
                </a>
            </div>

            {/* RECEIVED REQUESTS - High Priority */}
            {receivedRequests.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionEmoji}>📥</span>
                            Gelen Transfer İstekleri
                            <span className={styles.badge}>{receivedRequests.length}</span>
                        </h2>
                    </div>
                    <div className={styles.requestGrid}>
                        {receivedRequests.map(req => (
                            <div key={req.id} className={styles.requestCard}>
                                <div className={styles.requestHeader}>
                                    <div className={styles.requestCode}>{req.tag.publicCode}</div>
                                    <div className={styles.requestBadge}>Yeni</div>
                                </div>
                                <div className={styles.requestBody}>
                                    <p className={styles.requestText}>
                                        <strong>{req.fromUser?.name || req.fromUser?.username || 'Biri'}</strong> size bu etiketi göndermek istiyor.
                                    </p>
                                    {req.message && (
                                        <p className={styles.requestMessage}>"{req.message}"</p>
                                    )}
                                </div>
                                <div className={styles.requestActions}>
                                    <button
                                        className={`${styles.btn} ${styles.btnSuccess}`}
                                        onClick={() => handleRespondTransfer(req.id, 'accept')}
                                        disabled={loading}
                                    >
                                        ✅ Kabul Et
                                    </button>
                                    <button
                                        className={`${styles.btn} ${styles.btnDanger}`}
                                        onClick={() => handleRespondTransfer(req.id, 'reject')}
                                        disabled={loading}
                                    >
                                        ❌ Reddet
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SENT REQUESTS */}
            {sentRequests.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionEmoji}>📤</span>
                            Gönderilen İstekler
                            <span className={styles.badge}>{sentRequests.length}</span>
                        </h2>
                    </div>
                    <div className={styles.requestGrid}>
                        {sentRequests.map(req => (
                            <div key={req.id} className={styles.requestCard}>
                                <div className={styles.requestHeader}>
                                    <div className={styles.requestCode}>{req.tag.publicCode}</div>
                                    <div className={styles.requestBadgePending}>⏳ Beklemede</div>
                                </div>
                                <div className={styles.requestBody}>
                                    <p className={styles.requestText}>
                                        Alıcı: <strong>{req.toUser?.name || req.toUser?.username}</strong>
                                    </p>
                                </div>
                                <div className={styles.requestActions}>
                                    <button
                                        className={`${styles.btn} ${styles.btnWarning}`}
                                        onClick={() => handleCancelTransfer(req.id)}
                                        disabled={loading}
                                    >
                                        🚫 İptal Et
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* LINKED TAGS */}
            {linkedTags.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionEmoji}>🔗</span>
                            Eşleşmiş Etiketler
                            <span className={styles.badge}>{linkedTags.length}</span>
                        </h2>
                    </div>
                    <div className={styles.tagsGrid}>
                        {linkedTags.map(tag => {
                            const module = getLinkedModule(tag)
                            return (
                                <div key={tag.id} className={styles.tagCard}>
                                    <div className={styles.tagCardHeader}>
                                        <div className={styles.tagIcon}>{module?.emoji}</div>
                                        <div className={styles.tagStatus}>
                                            <span className={styles.statusDot}></span>
                                            Aktif
                                        </div>
                                    </div>

                                    <div className={styles.tagCardBody}>
                                        <div className={styles.tagCode}>{tag.publicCode}</div>
                                        <div className={styles.tagModule}>
                                            <span className={styles.moduleLabel}>{module?.label}</span>
                                            <span className={styles.moduleName}>{module?.name}</span>
                                        </div>
                                        <div className={styles.tagDate}>
                                            {tag.claimedAt ? new Date(tag.claimedAt).toLocaleDateString('tr-TR') : '—'}
                                        </div>
                                    </div>

                                    <div className={styles.tagCardActions}>
                                        <button
                                            className={`${styles.btn} ${styles.btnSecondary}`}
                                            onClick={() => handleUnlink(tag)}
                                            disabled={loading}
                                            title="Eşleştirmeyi Kaldır"
                                        >
                                            🔗 Ayır
                                        </button>
                                        <button
                                            className={`${styles.btn} ${styles.btnSecondary}`}
                                            onClick={() => openTransferModal(tag)}
                                            disabled={loading}
                                            title="Transfer Et"
                                        >
                                            🎁 Transfer
                                        </button>
                                        <button
                                            className={`${styles.btn} ${styles.btnDanger}`}
                                            onClick={() => handleDelete(tag)}
                                            disabled={loading}
                                            title="Etiket Sil"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* UNLINKED TAGS */}
            {unlinkedTags.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionEmoji}>📦</span>
                            Eşleşmemiş Etiketler
                            <span className={styles.badge}>{unlinkedTags.length}</span>
                        </h2>
                    </div>
                    <div className={styles.tagsGrid}>
                        {unlinkedTags.map(tag => (
                            <div key={tag.id} className={`${styles.tagCard} ${styles.tagCardUnlinked}`}>
                                <div className={styles.tagCardHeader}>
                                    <div className={styles.tagIconUnlinked}>🏷️</div>
                                    <div className={styles.tagStatusInactive}>
                                        <span className={styles.statusDotInactive}></span>
                                        Beklemede
                                    </div>
                                </div>

                                <div className={styles.tagCardBody}>
                                    <div className={styles.tagCode}>{tag.publicCode}</div>
                                    <div className={styles.tagModuleEmpty}>Henüz eşleşmemiş</div>
                                    <div className={styles.tagDate}>
                                        {tag.claimedAt ? new Date(tag.claimedAt).toLocaleDateString('tr-TR') : '—'}
                                    </div>
                                </div>

                                <div className={styles.tagCardActions}>
                                    <a
                                        href={`/claim?code=${tag.publicCode}`}
                                        className={`${styles.btn} ${styles.btnPrimary}`}
                                    >
                                        🔗 Eşleştir
                                    </a>
                                    <button
                                        className={`${styles.btn} ${styles.btnSecondary}`}
                                        onClick={() => openTransferModal(tag)}
                                        disabled={loading}
                                        title="Transfer Et"
                                    >
                                        🎁
                                    </button>
                                    <button
                                        className={`${styles.btn} ${styles.btnDanger}`}
                                        onClick={() => handleDelete(tag)}
                                        disabled={loading}
                                        title="Etiket Sil"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {tags.length === 0 && receivedRequests.length === 0 && sentRequests.length === 0 && (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🏷️</div>
                    <h2 className={styles.emptyTitle}>Henüz NFC etiketiniz yok</h2>
                    <p className={styles.emptyText}>
                        Yeni bir NFC etiketi ekleyerek başlayın.
                    </p>
                    <a href="/claim" className={styles.emptyButton}>
                        ➕ İlk Etiketimi Ekle
                    </a>
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
