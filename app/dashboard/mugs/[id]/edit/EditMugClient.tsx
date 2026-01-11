"use client"

import { useState } from "react"
import Link from "next/link"
import { updateMug } from "@/lib/mug-actions"
import styles from "../../mugs.module.css"

interface EditMugClientProps {
    mug: {
        id: string
        name: string
        slug: string | null
    }
}

export default function EditMugClient({ mug }: EditMugClientProps) {
    const [name, setName] = useState(mug.name)
    const [slug, setSlug] = useState(mug.slug || "")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSlugChange = (value: string) => {
        // Auto-format slug: lowercase, no special chars
        const formatted = value
            .toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '')
        setSlug(formatted)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData()
        formData.append("name", name)
        formData.append("slug", slug)

        const result = await updateMug(mug.id, formData)
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <>
            <Link href={`/dashboard/mugs/${mug.id}`} className={styles.backLink}>
                ← Kupaya Dön
            </Link>

            <h1 style={{ color: "#fff", marginBottom: "1.5rem", fontSize: "1.75rem" }}>
                Kupayı Düzenle ☕
            </h1>

            <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
                <div className={styles.formCard}>
                    <h2>☕ Kupa Bilgileri</h2>

                    <div className={styles.formGroup}>
                        <label htmlFor="name">Kupa Adı *</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="örn: Kahve Kupam"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="slug">URL Kullanıcı Adı</label>
                        <input
                            type="text"
                            id="slug"
                            value={slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            placeholder="örn: kahve-kupam"
                        />
                        <small style={{ color: "rgba(255,255,255,0.5)", marginTop: "4px", display: "block" }}>
                            Public link: /mug/{slug || mug.id}
                        </small>
                    </div>

                    {error && (
                        <p style={{ color: "#ef4444", marginTop: "1rem" }}>{error}</p>
                    )}
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading || !name}>
                    {loading ? "Kaydediliyor..." : "💾 Değişiklikleri Kaydet"}
                </button>
            </form>
        </>
    )
}
