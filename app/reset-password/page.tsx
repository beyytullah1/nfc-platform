'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from '../login/login.module.css'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        if (!token) {
            setMessage({ type: 'error', text: 'Geçersiz link. Lütfen şifre sıfırlama talebini tekrar oluşturun.' })
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) return

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Şifreler eşleşmiyor' })
            return
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Şifre en az 6 karakter olmalıdır' })
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ type: 'success', text: data.message })
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
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
                    <h1>Yeni Şifre Belirle</h1>
                    <p>Hesabınız için yeni bir şifre oluşturun</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Yeni Şifre</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="En az 6 karakter"
                            required
                            disabled={loading || !token}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">Şifre Tekrar</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Şifrenizi tekrar girin"
                            required
                            disabled={loading || !token}
                            className={styles.input}
                        />
                    </div>

                    {message && (
                        <div className={message.type === 'success' ? styles.success : styles.error}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !token}
                        className={styles.button}
                    >
                        {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}
