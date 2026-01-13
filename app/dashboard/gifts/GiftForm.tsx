'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './gifts.module.css'
import { createGift, updateGift } from '@/lib/gift-actions'
import { useToast } from '@/app/components/Toast'

interface AvailableTag {
    id: string
    publicCode: string
}

interface GiftFormProps {
    gift?: {
        id: string
        title: string | null
        message: string | null
        giftType: string
        mediaUrl: string | null
        youtubeUrls: string | null
        musicUrl: string | null
        spotifyUrl: string | null
        isBirthday: boolean
        senderName: string | null
        password?: string | null
        passwordHint?: string | null
        tag?: { id: string; publicCode: string } | null
    }
    availableTags?: AvailableTag[]
}

export function GiftForm({ gift, availableTags = [] }: GiftFormProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)

    // NFC Linking state
    const [showManualInput, setShowManualInput] = useState(false)
    const [manualCode, setManualCode] = useState('')
    const [selectedTagId, setSelectedTagId] = useState<string>(gift?.tag?.id || '')

    // Photo upload state
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(gift?.mediaUrl || null)
    const [uploading, setUploading] = useState(false)

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setPhotoFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const uploadPhoto = async (): Promise<string | null> => {
        if (!photoFile) return gift?.mediaUrl || null

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', photoFile)
            formData.append('type', 'gift')

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                const data = await res.json()
                return data.url
            }
        } catch (error) {
            console.error('Photo upload error:', error)
        }
        setUploading(false)
        return null
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        // Create FormData immediately before any async operations
        const formData = new FormData(e.currentTarget)

        try {
            // Upload photo first if selected
            let mediaUrl = gift?.mediaUrl || ''
            if (photoFile) {
                const uploadedUrl = await uploadPhoto()
                if (uploadedUrl) mediaUrl = uploadedUrl
            }

            // Add media URL (either uploaded or from form)
            if (mediaUrl) {
                formData.set('mediaUrl', mediaUrl)
            }

            // Add NFC tag code if selected
            if (showManualInput && manualCode.trim()) {
                formData.append('tagCode', manualCode.trim().toUpperCase())
            } else if (selectedTagId) {
                const selectedTag = availableTags.find(t => t.id === selectedTagId)
                if (selectedTag) {
                    formData.append('tagCode', selectedTag.publicCode)
                }
            }

            if (gift) {
                await updateGift(gift.id, formData)
                showToast('Hediye güncellendi', 'success')
            } else {
                await createGift(formData)
                showToast('Hediye oluşturuldu', 'success')
            }
            router.push('/dashboard/gifts')
            router.refresh()
        } catch (error: any) {
            console.error('Gift save error:', error)
            showToast(error.message || 'Bir hata oluştu', 'error')
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

            {/* NFC Eşleştirme Bölümü */}
            <div className={styles.formCard}>
                <h2>🏷️ NFC Etiket Eşleştir (İsteğe Bağlı)</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Fiziksel bir NFC etiketi bağlayarak hediyenizi taratılabilir hale getirin.
                </p>

                {gift?.tag && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        marginBottom: '1rem'
                    }}>
                        <p style={{ color: '#10b981', margin: 0 }}>
                            ✅ Bağlı Etiket: <strong>{gift.tag.publicCode}</strong>
                        </p>
                    </div>
                )}

                {!gift?.tag && (
                    <>
                        {/* Tab Switcher */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => setShowManualInput(false)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: !showManualInput ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                📋 Listeden Seç
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowManualInput(true)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: showManualInput ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                ✏️ Manuel Kod Gir
                            </button>
                        </div>

                        {!showManualInput ? (
                            <div className={styles.formGroup}>
                                <label>Mevcut Etiketler</label>
                                {availableTags.length > 0 ? (
                                    <select
                                        value={selectedTagId}
                                        onChange={(e) => setSelectedTagId(e.target.value)}
                                        style={{ background: '#000', color: '#fff' }}
                                    >
                                        <option value="">Etiket Seçin (Opsiyonel)</option>
                                        {availableTags.map(tag => (
                                            <option key={tag.id} value={tag.id} style={{ background: '#000', color: '#fff' }}>
                                                {tag.publicCode}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                                        Uygun etiket yok. Manuel kod girebilir veya admin panelinden yeni etiket oluşturabilirsiniz.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className={styles.formGroup}>
                                <label>NFC Etiket Kodu</label>
                                <input
                                    type="text"
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                    placeholder="Örn: ABC123XY"
                                    style={{ textTransform: 'uppercase' }}
                                />
                                <small style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', display: 'block' }}>
                                    Etiketin üzerindeki kodu girin. Kod admin panelinden oluşturulmuş olmalıdır.
                                </small>
                            </div>
                        )}
                    </>
                )}
            </div>

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
                    <label>Başlık *</label>
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
                    <label>Şifre *</label>
                    <input
                        type="text"
                        name="password"
                        placeholder="Hediyeyi açmak için şifre belirleyin"
                        defaultValue={gift?.password || ''}
                        required
                    />
                    <small style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', display: 'block' }}>
                        ⚠️ Şifre zorunludur. Alıcı hediyeyi açmadan önce bu şifreyi girmek zorundadır.
                    </small>
                </div>

                <div className={styles.formGroup}>
                    <label>Şifre İpucu (İsteğe Bağlı)</label>
                    <input
                        type="text"
                        name="passwordHint"
                        placeholder="Örn: Doğum tarihin, En sevdiğin renk..."
                        defaultValue={gift?.passwordHint || ''}
                    />
                    <small style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', display: 'block' }}>
                        Alıcı doğru şifreyi bulamazsa bu ipucu gösterilir.
                    </small>
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
                <h2>📸 Fotoğraf & Medya</h2>

                {/* Photo Upload */}
                <div className={styles.formGroup}>
                    <label>Fotoğraf Yükle</label>
                    <div style={{
                        border: '2px dashed rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                        position: 'relative'
                    }}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                opacity: 0,
                                cursor: 'pointer'
                            }}
                        />
                        {photoPreview ? (
                            <div>
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '200px',
                                        maxHeight: '200px',
                                        borderRadius: '8px',
                                        marginBottom: '0.5rem'
                                    }}
                                />
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                                    Değiştirmek için tıklayın
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📷</div>
                                <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                                    Fotoğraf yüklemek için tıklayın
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>veya Görsel URL</label>
                    <input
                        type="text"
                        name="mediaUrl"
                        placeholder="https://... veya yüklenen dosya yolu"
                        defaultValue={gift?.mediaUrl || ''}
                    />
                    <small style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', display: 'block' }}>
                        Direkt resim linki girebilirsiniz veya yukarıdan fotoğraf yükleyin.
                    </small>
                </div>

                <div className={styles.formGroup}>
                    <label>YouTube Video URL 1 (İsteğe Bağlı)</label>
                    <input
                        type="url"
                        name="youtubeUrl1"
                        placeholder="https://youtube.com/watch?v=..."
                        defaultValue={gift?.youtubeUrls ? (JSON.parse(gift.youtubeUrls)[0] || '') : ''}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>YouTube Video URL 2 (İsteğe Bağlı)</label>
                    <input
                        type="url"
                        name="youtubeUrl2"
                        placeholder="https://youtube.com/watch?v=..."
                        defaultValue={gift?.youtubeUrls ? (JSON.parse(gift.youtubeUrls)[1] || '') : ''}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Müzik URL (Pixabay, Mixkit, Bensound)</label>
                    <input
                        type="url"
                        name="musicUrl"
                        placeholder="https://..."
                        defaultValue={gift?.musicUrl || ''}
                    />
                    <small style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', display: 'block' }}>
                        Ücretsiz müzik siteleri: <a href="https://pixabay.com/music/" target="_blank" style={{ color: '#60a5fa' }}>Pixabay</a>, <a href="https://mixkit.co/free-stock-music/" target="_blank" style={{ color: '#60a5fa' }}>Mixkit</a>, <a href="https://www.bensound.com/" target="_blank" style={{ color: '#60a5fa' }}>Bensound</a>
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

                <div className={styles.formGroup}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            name="isBirthday"
                            defaultChecked={gift?.isBirthday || false}
                            style={{ width: 'auto', cursor: 'pointer' }}
                        />
                        <span>🎂 Doğum Günü Hediyesi (Müzik yoksa otomatik doğum günü şarkısı çalar)</span>
                    </label>
                </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading || uploading}>
                {loading || uploading ? 'Kaydediliyor...' : (gift ? 'Güncelle' : 'Oluştur')}
            </button>
        </form>
    )
}
