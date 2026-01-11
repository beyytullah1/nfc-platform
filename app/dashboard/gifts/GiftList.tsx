'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './gifts.module.css'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { QRCodeModal } from '../components/QRCodeModal'
import { useCopyToClipboard } from '../../hooks/useCopy'
import { deleteGift } from '@/lib/gift-actions'
import { useToast } from '@/app/components/Toast'

interface Gift {
    id: string
    title: string | null
    message: string | null
    giftType: string
    isClaimed: boolean
    claimedAt: Date | null
    createdAt: Date
    tag?: { publicCode: string } | null
    slug?: string | null
}

export function GiftList({ gifts }: { gifts: Gift[] }) {
    const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
    const [showQR, setShowQR] = useState(false)
    const [showDelete, setShowDelete] = useState(false)
    const { copy } = useCopyToClipboard()
    const { showToast } = useToast()

    // Delete handler
    const handleDelete = async () => {
        if (!selectedGift) return

        try {
            await deleteGift(selectedGift.id)
            showToast('Hediye başarıyla silindi', 'success')
            setShowDelete(false)
        } catch (error) {
            showToast('Silme işlemi başarısız', 'error')
        }
    }

    const getGiftTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            'birthday': 'Doğum Günü',
            'anniversary': 'Yıldönümü',
            'new_year': 'Yılbaşı',
            'generic': 'Genel'
        }
        return types[type] || type
    }

    if (gifts.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🎁</div>
                <h2>Henüz Hediye Göndermediniz</h2>
                <p>Sevdiklerinize dijital bir hediye kartı oluşturarak onları mutlu edin. Müzik, video ve özel mesajınızı ekleyin.</p>
                <Link href="/dashboard/gifts/new" className={styles.createBtn}>
                    ✨ İlk Hediyeni Oluştur
                </Link>
            </div>
        )
    }

    return (
        <>
            <div className={styles.giftGrid}>
                {gifts.map(gift => (
                    <div key={gift.id} className={styles.giftCard}>
                        <div className={styles.giftHeader}>
                            <span className={`${styles.giftTypeBadge} ${styles[`giftType-${gift.giftType}`]}`}>
                                {getGiftTypeLabel(gift.giftType)}
                            </span>
                            <span className={styles.statusBadge} title={gift.isClaimed ? 'Açıldı' : 'Bekliyor'}>
                                {gift.isClaimed ? '✅' : '⏳'}
                            </span>
                        </div>

                        <div className={styles.giftContent}>
                            <h3 className={styles.giftTitle}>{gift.title || 'İsimsiz Hediye'}</h3>
                            <p className={styles.giftMessage}>{gift.message || 'Mesaj yok...'}</p>
                        </div>

                        <div className={styles.giftFooter}>
                            <div className={styles.giftDate}>
                                📅 {new Date(gift.createdAt).toLocaleDateString('tr-TR')}
                            </div>

                            <div className={styles.actions}>
                                <>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => {
                                            const code = gift.tag?.publicCode || gift.slug || gift.id
                                            // If tag exists use /gift/code (legacy/nfc), else use /h/id (generic)
                                            // Actually let's standardize on /h/ for generic and /gift/ for nfc if exists, 
                                            // BUT /h/ works for everything if I updated checking.
                                            // Let's use the logic: if tag -> /gift/code, else -> /h/id
                                            const path = gift.tag?.publicCode ? `/gift/${gift.tag.publicCode}` : `/h/${gift.slug || gift.id}`
                                            const url = `${window.location.origin}${path}`
                                            copy(url)
                                        }}
                                        title="Linki Kopyala"
                                    >
                                        🔗
                                    </button>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => {
                                            setSelectedGift(gift)
                                            setShowQR(true)
                                        }}
                                        title="QR Kod"
                                    >
                                        📱
                                    </button>
                                    <Link
                                        href={`/dashboard/gifts/${gift.id}`}
                                        className={styles.actionBtn}
                                        title="Detay Görüntüle"
                                        style={{ color: '#ec4899' }}
                                    >
                                        👁️
                                    </Link>
                                    <Link
                                        href={gift.tag?.publicCode ? `/gift/${gift.tag.publicCode}` : `/h/${gift.slug || gift.id}`}
                                        target="_blank"
                                        className={styles.actionBtn}
                                        title="Public Sayfayı Aç"
                                        style={{ color: '#3b82f6' }}
                                    >
                                        🌐
                                    </Link>
                                </>
                                <Link href={`/dashboard/gifts/${gift.id}/edit`} className={styles.actionBtn} title="Düzenle">
                                    ✏️
                                </Link>
                                <button
                                    className={`${styles.actionBtn} ${styles.delete}`}
                                    onClick={() => {
                                        setSelectedGift(gift)
                                        setShowDelete(true)
                                    }}
                                    title="Sil"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* QR Modal */}
            {selectedGift && (
                <QRCodeModal
                    isOpen={showQR}
                    onClose={() => setShowQR(false)}
                    url={`${typeof window !== 'undefined' ? window.location.origin : ''}${selectedGift.tag?.publicCode ? `/gift/${selectedGift.tag.publicCode}` : `/h/${selectedGift.slug || selectedGift.id}`}`}
                    title={selectedGift.title || 'Hediye Kartı'}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDelete}
                title="Hediyeyi Sil"
                message="Bu hediyeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setShowDelete(false)}
            />
        </>
    )
}
