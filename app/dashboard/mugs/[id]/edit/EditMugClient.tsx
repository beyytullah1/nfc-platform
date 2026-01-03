"use client"

import { useState } from "react"
import Link from "next/link"
import { updateMug } from "@/lib/mug-actions"
import styles from "../../mugs.module.css"

interface EditMugClientProps {
    mug: {
        id: string
        name: string
    }
}

export default function EditMugClient({ mug }: EditMugClientProps) {
    const [name, setName] = useState(mug.name)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        formData.append("name", name)

        await updateMug(mug.id, formData)
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
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading || !name}>
                    {loading ? "Kaydediliyor..." : "💾 Değişiklikleri Kaydet"}
                </button>
            </form>
        </>
    )
}
