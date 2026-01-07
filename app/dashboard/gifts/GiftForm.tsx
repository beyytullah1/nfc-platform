'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './gifts.module.css'
import { createGift, updateGift } from '@/lib/gift-actions'
import { useToast } from '@/app/components/Toast'

interface GiftFormProps {
    gift?: {
        id: string
        title: string | null
        message: string | null
        giftType: string
        mediaUrl: string | null
        spotifyUrl: string | null
        senderName: string | null
        password?: string | null
    }
}

export function GiftForm({ gift }: GiftFormProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            if (gift) {
                await updateGift(gift.id, formData)
                showToast('Hediye güncellendi', 'success')
            } else {
                await createGift(formData)
                showToast('Hediye oluşturuldu', 'success')
            }
            router.push('/dashboard/gifts')
            router.refresh()
        } catch (error) {
            showToast('Bir hata oluştu', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>{gift ? 'Hediyeyi Düzenle' : 'Yeni Hediye'}</h1>
                    <p>Hediye içeriğini ve mesajınızı hazırlayın</p>
                </div>
            </div>

            <Link href="/dashboard/gifts" className={styles.backLink}>
                ← Listeye Dön
            </Link>

            <div className={styles.formCard}>
                <div className={styles.formGroup}>
                    <label>Hediye Tipi</label>
                    <select name="giftType" defaultValue={gift?.giftType || 'generic'}>
                        <option value="generic">Genel Hediye</option>
                        <option value="birthday">Doğum Günü 🎂</option>
                        <option value="anniversary">Yıldönümü 💍</option>
                        <option value="new_year">Yılbaşı 🎄</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Başlık</label>
                    <input
                        type="text"
                        name="title"
                        placeholder="Örn: İyi ki doğdun!"
                        defaultValue={gift?.title || ''}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Gönderen Adı (İsteğe Bağlı)</label>
                    <input
                        type="text"
                        name="senderName"
                        placeholder="Örn: Seni Seven Biri (Boş bırakılırsa profil isminiz görünür)"
                        defaultValue={gift?.senderName || ''}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Özel Mesajın</label>
                    <textarea
                        name="message"
                        placeholder="Sevdiklerinize iletmek istediğiniz mesaj..."
                        defaultValue={gift?.message || ''}
                    ></textarea>
                </div>
            </div>

            <div className={styles.formCard}>
                <h2>📸 Medya & Müzik</h2>

                <div className={styles.formGroup}>
                    <label>Görsel veya Video URL</label>
                    <input
                        type="url"
                        name="mediaUrl"
                        placeholder="https://..."
                        defaultValue={gift?.mediaUrl || ''}
                    />
                    <small style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', display: 'block' }}>
                        Direkt resim linki veya YouTube video linki kullanabilirsiniz.
                    </small>
                </div>

                <div className={styles.formGroup}>
                    <label>Müzik Linki (Spotify, YouTube)</label>
                    <input
                        type="url"
                        name="spotifyUrl"
                        placeholder="Spotify veya YouTube şarkı linki yapıştırın"
                        defaultValue={gift?.spotifyUrl || ''}
                    />
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                        <details>
                            <summary style={{ cursor: 'pointer', color: '#60a5fa' }}>Link nasıl alınır?</summary>
                            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <li><strong>Spotify:</strong> Şarkı yanındaki üç nokta (...) &rarr; Paylaş &rarr; Şarkı Bağlantısını Kopyala</li>
                                <li><strong>YouTube:</strong> Video altındaki Paylaş butonu &rarr; Kopyala</li>
                            </ul>
                        </details>
                    </div>
                </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Kaydediliyor...' : (gift ? 'Güncelle' : 'Oluştur')}
            </button>
        </form>
    )
}
