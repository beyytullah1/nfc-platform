'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/app/components/Toast'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const { showToast } = useToast()
    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email || !newPassword || !confirmPassword) {
            setError('Tüm alanları doldurun')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Şifreler eşleşmiyor')
            return
        }

        if (newPassword.length < 6) {
            setError('Şifre en az 6 karakter olmalı')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword })
            })

            const data = await res.json()

            if (res.ok) {
                showToast('✅ Şifreniz başarıyla güncellendi!', 'success')
                router.push('/login')
            } else {
                setError(data.error || 'Bir hata oluştu')
            }
        } catch (err) {
            setError('Sunucu hatası')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg)',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'var(--color-surface)',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid var(--color-border)'
            }}>
                <h1 style={{
                    fontSize: '1.75rem',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    🔒 Şifremi Unuttum
                </h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    Email adresinizi ve yeni şifrenizi girin
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            color: 'var(--color-text)',
                            marginBottom: '0.5rem',
                            fontSize: '0.9rem'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '0.5rem',
                                color: 'var(--color-text)',
                                fontSize: '1rem'
                            }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            color: 'var(--color-text)',
                            marginBottom: '0.5rem',
                            fontSize: '0.9rem'
                        }}>
                            Yeni Şifre
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="En az 6 karakter"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '0.5rem',
                                color: 'var(--color-text)',
                                fontSize: '1rem'
                            }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            color: 'var(--color-text)',
                            marginBottom: '0.5rem',
                            fontSize: '0.9rem'
                        }}>
                            Şifre Tekrar
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Şifrenizi tekrar girin"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '0.5rem',
                                color: 'var(--color-text)',
                                fontSize: '1rem'
                            }}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            marginBottom: '1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.5rem',
                            color: '#fca5a5',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            background: loading ? '#475569' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: loading ? 'default' : 'pointer',
                            marginBottom: '1rem'
                        }}
                    >
                        {loading ? 'Güncelleniyor...' : '🔐 Şifremi Güncelle'}
                    </button>

                    <Link
                        href="/login"
                        style={{
                            display: 'block',
                            textAlign: 'center',
                            color: 'var(--color-text-muted)',
                            fontSize: '0.9rem'
                        }}
                    >
                        ← Giriş sayfasına dön
                    </Link>
                </form>
            </div>
        </div>
    )
}
