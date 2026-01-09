'use client'

import { useState } from 'react'
import { useToast } from '@/app/components/Toast'
import { logout } from '@/lib/auth-actions'

export default function LogoutButton() {
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)

    // router gerekmez çünkü server action redirect yapar

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
        } catch (error) {
            console.error('Logout error:', error)
            showToast('Çıkış yapılırken bir hata oluştu', 'error')
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
