"use client"

import { useState } from "react"
import Link from "next/link"
import { createPage } from "@/lib/page-actions"
import styles from "../pages.module.css"

export default function NewPagePage() {
    const [title, setTitle] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        formData.append("title", title)

        await createPage(formData)
    }

    return (
        <>
            <Link href="/dashboard/pages" className={styles.backLink}>
                ← Sayfalara Dön
            </Link>

            <h1 style={{ color: "#fff", marginBottom: "1.5rem", fontSize: "1.75rem" }}>
                Yeni Sayfa Oluştur ✨
            </h1>

            <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
                <div className={styles.formCard}>
                    <h2>📄 Sayfa Bilgileri</h2>

                    <div className={styles.formGroup}>
                        <label htmlFor="title">Sayfa Başlığı *</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="örn: Portfolyom, Hakkımda"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading || !title}
                >
                    {loading ? "Oluşturuluyor..." : "✨ Sayfayı Oluştur"}
                </button>
            </form>
        </>
    )
}
