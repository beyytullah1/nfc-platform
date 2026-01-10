'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../admin.module.css'

interface UnlinkButtonProps {
    tagId: string
    hasModule: boolean
    hasOwner: boolean
}

export function UnlinkButton({ tagId, hasModule, hasOwner }: UnlinkButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleUnlink = async () => {
        if (!confirm('Bu etiketi modülden ayırmak istediğinize emin misiniz?')) {
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/admin/nfc-tags/unlink', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagId }),
            })

            if (res.ok) {
                router.refresh()
            } else {
                alert('Bir hata oluştu')
            }
        } catch (error) {
            console.error('Unlink error:', error)
            alert('Bir hata oluştu')
        }
        setLoading(false)
    }

    const handleUnclaim = async () => {
        if (!confirm('Bu etiketi kullanıcıdan ayırmak istediğinize emin misiniz? Etiket boşa çıkacak.')) {
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/admin/nfc-tags/unclaim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagId }),
            })

            if (res.ok) {
                router.refresh()
            } else {
                alert('Bir hata oluştu')
            }
        } catch (error) {
            console.error('Unclaim error:', error)
            alert('Bir hata oluştu')
        }
        setLoading(false)
    }

    return (
        <>
            {hasModule && (
                <button
                    onClick={handleUnlink}
                    disabled={loading}
                    className={styles.deleteButton}
                    style={{
                        fontSize: '0.85rem',
                        padding: '0.375rem 0.75rem',
                        marginLeft: '0.5rem'
                    }}
                >
                    {loading ? '⏳' : '🔓'} Modülden Ayır
                </button>
            )}
            {hasOwner && (
                <button
                    onClick={handleUnclaim}
                    disabled={loading}
                    className={styles.deleteButton}
                    style={{
                        fontSize: '0.85rem',
                        padding: '0.375rem 0.75rem',
                        marginLeft: '0.5rem',
                        background: 'rgba(239, 68, 68, 0.2)'
                    }}
                >
                    {loading ? '⏳' : '❌'} Kullanıcıdan Ayır
                </button>
            )}
        </>
    )
}
