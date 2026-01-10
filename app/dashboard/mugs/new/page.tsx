"use client"

import { useState } from "react"
import Link from "next/link"
import { createMug } from "@/lib/mug-actions"
import styles from "../mugs.module.css"

export default function NewMugPage() {
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        formData.append("name", name)

        await createMug(formData)
    }

    return (
        <div>
            <Link href="/dashboard/mugs" className={styles.backLink}>
                ← Kupalara Dön
            </Link>

            <h1 style={{ color: "#fff", marginBottom: "1.5rem", fontSize: "1.75rem" }}>
                Yeni Kupa Ekle ☕
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
                            placeholder="örn: Sabah Kahvem, Ofis Kupam"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="slug">Özel URL (İsteğe Bağlı)</label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            placeholder="ornek: sabah-kahvem"
                            pattern="[a-z0-9-]*"
                        />
                        <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                            Boş bırakılırsa otomatik oluşturulur. Sadece küçük harf ve tire kullanın.
                        </small>
                    </div>
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading || !name}
                >
                    {loading ? "Ekleniyor..." : "☕ Kupayı Ekle"}
                </button>
            </form>
        </div>
    )
}
