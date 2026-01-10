'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import styles from '../login/login.module.css'

export default function CompleteProfilePage() {
    const router = useRouter()
    const { data: session, update } = useSession()
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/user/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            })

            const data = await res.json()

            if (res.ok) {
                // Update session
                await update()
                router.push('/dashboard')
            } else {
                setError(data.error || 'Bir hata oluştu')
            }
        } catch (error) {
            setError('Bağlantı hatası')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>Hoş Geldin! 👋</h1>
                    <p>Profilini tamamlamak için bir kullanıcı adı seç</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.inputGroup}>
                        <label htmlFor="username">Kullanıcı Adı</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="kullaniciadi"
                            required
                            minLength={3}
                            maxLength={20}
                            pattern="[a-zA-Z0-9_]+"
                            title="Sadece harf, rakam ve alt çizgi kullanabilirsiniz"
                            disabled={loading}
                        />
                        <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                            Sadece harf, rakam ve alt çizgi (_) kullanabilirsiniz
                        </small>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitBtn}
                    >
                        {loading ? 'Kaydediliyor...' : 'Devam Et'}
                    </button>
                </form>
            </div>
        </div>
    )
}
