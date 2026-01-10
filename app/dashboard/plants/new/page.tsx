"use client"

import { useState } from "react"
import Link from "next/link"
import { createPlant } from "@/lib/plant-actions"
import styles from "../plants.module.css"

const PLANT_SPECIES = [
    "Sukulent",
    "Kaktüs",
    "Orkide",
    "Bonsai",
    "Fikus",
    "Monstera",
    "Pothos",
    "Zamia",
    "Aloe Vera",
    "Diğer"
]

export default function NewPlantPage() {
    const [name, setName] = useState("")
    const [species, setSpecies] = useState("")
    const [birthDate, setBirthDate] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        formData.append("name", name)
        formData.append("species", species)
        formData.append("birthDate", birthDate)

        await createPlant(formData)
    }

    return (
        <div>
            <Link href="/dashboard/plants" className={styles.backLink}>
                ← Bitkilere Dön
            </Link>

            <div className={styles.formContainer}>
                <h1 style={{ color: "#fff", marginBottom: "1.5rem", fontSize: "1.75rem" }}>
                    Yeni Bitki Ekle 🌱
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formCard}>
                        <h2>🌿 Bitki Bilgileri</h2>

                        <div className={styles.formGroup}>
                            <label htmlFor="name">Bitki Adı *</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="örn: Minnoş, Yeşilim"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="slug">Özel URL (İsteğe Bağlı)</label>
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                placeholder="ornek: minnosun-hikayesi"
                                pattern="[a-z0-9-]*"
                            />
                            <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                                Boş bırakılırsa otomatik oluşturulur. Sadece küçük harf ve tire kullanın.
                            </small>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="species">Tür</label>
                            <select
                                id="species"
                                name="species" // Added name attribute for FormData
                                value={species}
                                onChange={(e) => setSpecies(e.target.value)}
                            >
                                <option value="">Tür seçin...</option>
                                {PLANT_SPECIES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="birthDate">Doğum Tarihi (İsteğe Bağlı)</label>
                            <input
                                type="date"
                                id="birthDate"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading || !name}
                    >
                        {loading ? "Ekleniyor..." : "🌱 Bitkiyi Ekle"}
                    </button>
                </form>
            </div>
        </div>
    )
}
