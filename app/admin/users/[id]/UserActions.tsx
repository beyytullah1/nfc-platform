'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteUser, resetUserPassword, toggleUserRole } from '@/lib/admin-actions'
import styles from '../../admin.module.css'

interface UserActionsProps {
    userId: string
    userEmail: string
    currentRole: string
    isCurrentUser: boolean
}

export function UserActions({ userId, userEmail, currentRole, isCurrentUser }: UserActionsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [newPassword, setNewPassword] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    async function handleResetPassword() {
        if (!confirm(`${userEmail} için yeni şifre oluşturulsun mu?`)) return

        setLoading(true)
        try {
            const result = await resetUserPassword(userId)
            setNewPassword(result.newPassword)
            alert('Şifre sıfırlandı! Yeni şifreyi kopyalayarak kullanıcıya iletin.')
        } catch (error: any) {
            alert('Hata: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleToggleRole() {
        const action = currentRole === 'admin' ? 'kaldırmak' : 'vermek'
        if (!confirm(`${userEmail} kullanıcısına admin yetkisi ${action} istediğinizden emin misiniz?`)) return

        setLoading(true)
        try {
            await toggleUserRole(userId)
            router.refresh()
            alert('Rol değiştirildi!')
        } catch (error: any) {
            alert('Hata: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        setLoading(true)
        try {
            await deleteUser(userId)
            alert('Kullanıcı silindi')
            router.push('/admin/users')
        } catch (error: any) {
            alert('Hata: ' + error.message)
            setLoading(false)
        }
    }

    return (
        <div className={styles.adminActions}>
            <h2>⚙️ İşlemler</h2>

            {newPassword && (
                <div className={styles.passwordDisplay}>
                    <p><strong>🔑 Yeni Şifre:</strong></p>
                    <code>{newPassword}</code>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(newPassword)
                            alert('Şifre kopyalandı!')
                        }}
                        className={styles.copyButton}
                    >
                        📋 Kopyala
                    </button>
                </div>
            )}

            <div className={styles.actionsGrid}>
                <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className={styles.actionBtnWarning}
                >
                    🔐 Şifre Sıfırla
                </button>

                {!isCurrentUser && (
                    <button
                        onClick={handleToggleRole}
                        disabled={loading}
                        className={styles.actionBtnPrimary}
                    >
                        {currentRole === 'admin' ? '👤 Admin Kaldır' : '👑 Admin Yap'}
                    </button>
                )}

                {!isCurrentUser && (
                    <>
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={loading}
                                className={styles.actionBtnDanger}
                            >
                                🗑️ Kullanıcıyı Sil
                            </button>
                        ) : (
                            <div className={styles.deleteConfirm}>
                                <p>⚠️ Tüm veriler silinecek. Emin misiniz?</p>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className={styles.actionBtnDanger}
                                    >
                                        ✅ Evet, Sil
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className={styles.actionBtnSecondary}
                                    >
                                        ❌ İptal
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {isCurrentUser && (
                    <div className={styles.infoBox}>
                        ℹ️ Kendi hesabınızı silemez veya rolünüzü değiştiremezsiniz.
                    </div>
                )}
            </div>
        </div>
    )
}
