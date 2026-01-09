'use client'

import { useState } from 'react'
import { createNfcTag } from '@/lib/nfc-admin-actions'
import styles from '../../admin.module.css'

export function CreateTagForm() {
    const [loading, setLoading] = useState(false)
    const [autoGenerate, setAutoGenerate] = useState(true)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            await createNfcTag(formData)
            alert('Etiket oluşturuldu!')
        } catch (error: any) {
            alert('Hata: ' + error.message)
            setLoading(false)
        }
    }

    function generateRandomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let code = ''
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return code
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
            <div className={styles.infoList}>
                <div className={styles.infoItem}>
                    <label style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem' }}>
                        <input
                            type="checkbox"
                            checked={autoGenerate}
                            onChange={(e) => setAutoGenerate(e.target.checked)}
                            style={{ marginRight: '0.5rem' }}
                        />
                        Otomatik Oluştur (Önerilen)
                    </label>
                </div>

                {!autoGenerate && (
                    <>
                        <div className={styles.infoItem}>
                            <label style={{ color: 'rgba(255,255,255,0.7)' }}>Public Code</label>
                            <input
                                type="text"
                                name="publicCode"
                                placeholder="Örn: ABCD1234"
                                required
                                className={styles.searchInput}
                                style={{ width: '100%' }}
                            />
                            <small style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                                8 karakter, büyük harf ve rakam
                            </small>
                        </div>

                        <div className={styles.infoItem}>
                            <label style={{ color: 'rgba(255,255,255,0.7)' }}>Tag ID (İsteğe Bağlı)</label>
                            <input
                                type="text"
                                name="tagId"
                                placeholder="Otomatik oluşturulsun"
                                className={styles.searchInput}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </>
                )}

                <div className={styles.infoItem}>
                    <label style={{ color: 'rgba(255,255,255,0.7)' }}>Modül Tipi (İsteğe Bağlı)</label>
                    <select
                        name="moduleType"
                        className={styles.searchInput}
                        style={{ width: '100%' }}
                    >
                        <option value="">Genel Amaçlı</option>
                        <option value="card">💳 Kartvizit</option>
                        <option value="plant">🌱 Bitki</option>
                        <option value="mug">☕ Kupa</option>
                        <option value="gift">🎁 Hediye</option>
                        <option value="canvas">🎨 Canvas</option>
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className={styles.actionBtnPrimary}
                style={{ width: '100%', marginTop: '1.5rem' }}
            >
                {loading ? 'Oluşturuluyor...' : '✨ Etiket Oluştur'}
            </button>
        </form>
    )
}
