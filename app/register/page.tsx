"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser } from "@/lib/auth-actions"
import styles from "./register.module.css"

export default function RegisterPage() {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError("")

        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor")
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError("Şifre en az 6 karakter olmalı")
            setLoading(false)
            return
        }

        const result = await registerUser(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            router.push("/login?registered=true")
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>Kayıt Ol</h1>
                    <p>Yeni hesap oluşturun</p>
                </div>

                <form action={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.inputGroup}>
                        <label htmlFor="name">Ad Soyad</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Adınız Soyadınız"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="ornek@email.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Şifre</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword">Şifre Tekrar</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                    </button>
                </form>

                <p className={styles.footer}>
                    Zaten hesabınız var mı? <Link href="/login">Giriş Yap</Link>
                </p>
            </div>
        </div>
    )
}
