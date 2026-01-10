'use client'

import { useState } from 'react'
import styles from './TransferModal.module.css'

interface TransferModalProps {
    isOpen: boolean
    onClose: () => void
    tagId: string
    itemName: string
    moduleType?: string
}

export function TransferModal({ isOpen, onClose, tagId, itemName, moduleType }: TransferModalProps) {
    const [username, setUsername] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    if (!isOpen) return null

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!username.trim()) {
            setError('Lütfen alıcının kullanıcı adını girin.')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/transfer/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tagId,
                    targetUsername: username.trim(),
                    message: message.trim() || null
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Transfer isteği gönderilemedi.')
                setLoading(false)
                return
            }

            setSuccess(true)
            setTimeout(() => {
                onClose()
                // window.location.reload() // Gerek yok, sadece modal kapansın
            }, 2000)
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.')
            setLoading(false)
        }
    }

    const getModuleEmoji = (type: string) => {
        const emojis: Record<string, string> = {
            card: '💳',
            plant: '🪴',
            mug: '☕',
            gift: '🎁',
            canvas: '✏️'
        }
        return emojis[type] || '📦'
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {success ? (
                    <div className={styles.success}>
                        <div className={styles.successIcon}>✅</div>
                        <h2>İstek Gönderildi!</h2>
                        <p>{itemName} için transfer isteği iletildi. Kullanıcı kabul edince işlem tamamlanacak.</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.header}>
                            <span className={styles.emoji}>{getModuleEmoji(moduleType || 'tag')}</span>
                            <div>
                                <h2>Sahipliği Devret</h2>
                                <p className={styles.itemName}>{itemName}</p>
                            </div>
                            <button className={styles.closeBtn} onClick={onClose}>×</button>
                        </div>

                        <form onSubmit={handleTransfer}>
                            <div className={styles.field}>
                                <label>Alıcının Kullanıcı Adı *</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="@kullaniciadi"
                                    className={styles.input}
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Hediye Mesajı (İsteğe bağlı)</label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Sevgiyle..."
                                    className={styles.textarea}
                                    rows={3}
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <div className={styles.error}>
                                    {error}
                                </div>
                            )}

                            <div className={styles.warning} style={{ background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>
                                ℹ️ Bu bir transfer <strong>isteğidir</strong>. Alıcı kabul edene kadar etiket sizde kalmaya devam eder.
                            </div>

                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={loading}
                                >
                                    {loading ? 'Gönderiliyor...' : 'İstek Gönder 🎁'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
