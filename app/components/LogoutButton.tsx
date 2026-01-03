'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogout = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/auth/signout', {
                method: 'POST',
            })

            if (res.ok) {
                router.push('/login')
                router.refresh()
            } else {
                throw new Error('Logout failed')
            }
        } catch (error) {
            console.error('Logout error:', error)
            alert('Çıkış yapılırken bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            style={{
                padding: '0.75rem 1rem',
                background: loading ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#fca5a5',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                width: '100%',
                justifyContent: 'center'
            }}
        >
            {loading ? '⏳ Çıkış yapılıyor...' : '🚪 Çıkış Yap'}
        </button>
    )
}
