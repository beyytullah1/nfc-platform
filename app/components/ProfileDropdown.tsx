'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/app/components/Toast'

export default function ProfileDropdown({ userName }: { userName: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        if (loading) return

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
            showToast('Çıkış yapılırken bir hata oluştu', 'error')
            setLoading(false)
        }
    }

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'var(--color-bg-card, #1a1a1a)',
                    border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
                    borderRadius: '8px',
                    color: 'var(--color-text, #fff)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border, rgba(255,255,255,0.1))'
                }}
            >
                <span>👤</span>
                <span>{userName}</span>
                <span style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                    fontSize: '0.7rem'
                }}>▼</span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    background: 'var(--color-bg-card, #1a1a1a)',
                    border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
                    borderRadius: '8px',
                    minWidth: '180px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    overflow: 'hidden'
                }}>
                    <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            color: 'var(--color-text, #fff)',
                            textDecoration: 'none',
                            borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                        }}
                    >
                        🏠 Dashboard
                    </Link>
                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textAlign: 'left',
                            padding: '0.75rem 1rem',
                            background: 'transparent',
                            border: 'none',
                            color: loading ? '#94a3b8' : '#ef4444',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                        }}
                    >
                        {loading ? '⏳ Çıkış yapılıyor...' : '🚪 Çıkış Yap'}
                    </button>
                </div>
            )}
        </div>
    )
}
