'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from '../login/login.module.css'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ type: 'success', text: data.message })
                setEmail('')
            } else {
                setMessage({ type: 'error', text: data.error || 'Bir hata oluştu' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bağlantı hatası' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>Şifremi Unuttum</h1>
                    <p>Email adresinize şifre sıfırlama linki göndereceğiz</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                            required
                            disabled={loading}

                        />
                    </div>

                    {message && (
                        <div className={message.type === 'success' ? styles.success : styles.error}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitBtn}
                    >
                        {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <Link href="/login">
                        ← Giriş sayfasına dön
                    </Link>
                </div>
            </div>
        </div>
    )
}
