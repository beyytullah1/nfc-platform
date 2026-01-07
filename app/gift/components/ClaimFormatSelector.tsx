'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './claim-format.module.css'

interface ClaimFormatSelectorProps {
    giftId: string
    giftTitle: string | null
}

export default function ClaimFormatSelector({ giftId, giftTitle }: ClaimFormatSelectorProps) {
    const [selectedFormat, setSelectedFormat] = useState<'plant' | 'mug' | 'generic' | null>(null)
    const [itemName, setItemName] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleClaim = async () => {
        if (!selectedFormat) return

        if ((selectedFormat === 'plant' || selectedFormat === 'mug') && !itemName.trim()) {
            alert('Lütfen bir isim girin')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/gift/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    giftId,
                    format: selectedFormat,
                    itemName: itemName || null
                })
            })

            const data = await res.json()

            if (data.success) {
                // Yönlendirme
                if (selectedFormat === 'plant') {
                    router.push(`/dashboard/plants/${data.plantId}`)
                } else if (selectedFormat === 'mug') {
                    router.push(`/dashboard/mugs/${data.mugId}`)
                } else {
                    router.push('/dashboard')
                }
            } else {
                alert(data.error || 'Bir hata oluştu')
                setLoading(false)
            }
        } catch (error) {
            alert('Bir hata oluştu')
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>🎁 Hediyenizi Sahiplenir</h1>
            <p className={styles.subtitle}>
                {giftTitle || 'Hediye'} hediyesini nasıl kullanmak istersiniz?
            </p>

            <div className={styles.formatGrid}>
                {/* Plant Option */}
                <div
                    className={`${styles.formatCard} ${selectedFormat === 'plant' ? styles.selected : ''}`}
                    onClick={() => setSelectedFormat('plant')}
                >
                    <div className={styles.icon}>🪴</div>
                    <h3>Bitki Olarak Sahiplen</h3>
                    <p>Bu hediyeyi bir bitki olarak ekle ve bakımını takip et</p>
                </div>

                {/* Mug Option */}
                <div
                    className={`${styles.formatCard} ${selectedFormat === 'mug' ? styles.selected : ''}`}
                    onClick={() => setSelectedFormat('mug')}
                >
                    <div className={styles.icon}>☕</div>
                    <h3>Kupa Olarak Sahiplen</h3>
                    <p>Bu hediyeyi bir kupa olarak ekle ve kullanımını takip et</p>
                </div>

                {/* Generic Option */}
                <div
                    className={`${styles.formatCard} ${selectedFormat === 'generic' ? styles.selected : ''}`}
                    onClick={() => setSelectedFormat('generic')}
                >
                    <div className={styles.icon}>🎁</div>
                    <h3>Hediye Olarak Sakla</h3>
                    <p>Herhangi bir modüle dönüştürmeden sadece hediye olarak sakla</p>
                </div>
            </div>

            {/* Name Input (for plant/mug) */}
            {(selectedFormat === 'plant' || selectedFormat === 'mug') && (
                <div className={styles.nameInput}>
                    <label>
                        {selectedFormat === 'plant' ? '🌱 Bitki İsmi' : '☕ Kupa İsmi'}
                    </label>
                    <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder={selectedFormat === 'plant' ? 'örn: Güzel Çiçeğim' : 'örn: Kahve Kupam'}
                        autoFocus
                    />
                </div>
            )}

            {/* Confirm Button */}
            {selectedFormat && (
                <button
                    onClick={handleClaim}
                    disabled={loading}
                    className={styles.confirmBtn}
                >
                    {loading ? '⏳ Sahipleniliyor...' : '✓ Sahiplen'}
                </button>
            )}
        </div>
    )
}
