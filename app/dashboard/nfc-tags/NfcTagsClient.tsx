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
    const [showTransferModal, setShowTransferModal] = useState(false)
    const [selectedTag, setSelectedTag] = useState<NfcTag | null>(null)

    const getLinkedModule = (tag: NfcTag) => {
        if (tag.card) return { type: '💳 Kartvizit', name: tag.card.title || 'İsimsiz', id: tag.card.id }
        if (tag.plant) return { type: '🪴 Bitki', name: tag.plant.name, id: tag.plant.id }
        if (tag.mug) return { type: '☕ Kupa', name: tag.mug.name, id: tag.mug.id }
        if (tag.gift) return { type: '🎁 Hediye', name: tag.gift.title || 'İsimsiz', id: tag.gift.id }
        if (tag.page) return { type: '📄 Sayfa', name: tag.page.title || 'İsimsiz', id: tag.page.id }
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

    const openTransferModal = (tag: NfcTag) => {
        setSelectedTag(tag)
        setShowTransferModal(true)
    }

    const renderTag = (tag: NfcTag, linkedModule: any = null) => (
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
                    <a
                        href={`/claim?code=${tag.publicCode}`}
                        className={`${styles.actionBtn} ${styles.primaryBtn}`}
                        style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}
                    >
                        🔗 Eşleştir
                    </a>
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

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>NFC Etiketlerim</h1>
                    <p>Sahip olduğunuz NFC etiketlerini yönetin</p>
                </div>
            </div>

            {tags.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Henüz NFC etiketiniz yok</p>
                    <a
                        href="/claim"
                        className={styles.addCard}
                        style={{ marginTop: '1rem', padding: '2rem', display: 'block', textDecoration: 'none' }}
                    >
                        <div className={styles.addContent}>
                            <span className={styles.addIcon}>➕</span>
                            <span>NFC Etiket Ekle</span>
                        </div>
                    </a>
                </div>
            ) : (
                <>
                    {/* Linked Tags Section */}
                    {linkedTags.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#fff' }}>
                                🔗 Eşleşmiş Etiketler ({linkedTags.length})
                            </h2>
                            <div className={styles.tagsGrid}>
                                {linkedTags.map(tag => renderTag(tag, getLinkedModule(tag)))}
                            </div>
                        </div>
                    )}

                    {/* Unlinked Tags Section */}
                    {unlinkedTags.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#fff' }}>
                                📦 Eşleşmemiş Etiketler ({unlinkedTags.length})
                            </h2>
                            <div className={styles.tagsGrid}>
                                {unlinkedTags.map(tag => renderTag(tag))}
                            </div>
                        </div>
                    )}
                </>
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
