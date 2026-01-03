"use client"

import { useState } from "react"
import styles from "./public-card.module.css"

interface PasswordFormProps {
    cardId: string
    onSuccess: () => void
}

export function PasswordForm({ cardId, onSuccess }: PasswordFormProps) {
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch(`/api/cards/${cardId}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            })

            if (res.ok) {
                onSuccess()
            } else {
                setError("Yanlış şifre")
            }
        } catch {
            setError("Bir hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.passwordCard}>
                <div className={styles.lockIcon}>🔐</div>
                <h1 className={styles.passwordTitle}>Şifre Korumalı Kartvizit</h1>
                <p className={styles.passwordDesc}>
                    Bu kartviziti görüntülemek için şifre gerekiyor
                </p>

                <form onSubmit={handleSubmit} className={styles.passwordForm}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Şifreyi girin"
                        className={styles.passwordInput}
                        autoFocus
                    />
                    {error && <p className={styles.passwordError}>{error}</p>}
                    <button
                        type="submit"
                        className={styles.passwordBtn}
                        disabled={loading || !password}
                    >
                        {loading ? "Kontrol ediliyor..." : "Görüntüle"}
                    </button>
                </form>
            </div>
        </div>
    )
}
