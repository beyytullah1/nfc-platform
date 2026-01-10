"use client"

import { useState } from "react"
import Link from "next/link"
import { updatePlant } from "@/lib/plant-actions"
import styles from "../../plants.module.css"

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

interface EditPlantClientProps {
    plant: {
        id: string
        name: string
        species: string | null
        birthDate: Date | null
    }
}

export default function EditPlantClient({ plant }: EditPlantClientProps) {
    const [name, setName] = useState(plant.name)
    const [species, setSpecies] = useState(plant.species || "")
    const [birthDate, setBirthDate] = useState(
        plant.birthDate ? new Date(plant.birthDate).toISOString().split('T')[0] : ""
    )
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        formData.append("name", name)
        formData.append("species", species)
        formData.append("birthDate", birthDate)

        await updatePlant(plant.id, formData)
    }

    return (
        <>
            <Link href={`/dashboard/plants/${plant.id}`} className={styles.backLink}>
                ← Bitkiye Dön
            </Link>

            <h1 style={{ color: "#fff", marginBottom: "1.5rem", fontSize: "1.75rem" }}>
                Bitkiyi Düzenle 🌱
            </h1>

            <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
                <div className={styles.formCard}>
                    <h2>🌿 Bitki Bilgileri</h2>

                    <div className={styles.formGroup}>
                        <label htmlFor="name">Bitki Adı *</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="örn: Minnoş"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="species">Tür</label>
                        <select
                            id="species"
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
                        <label htmlFor="birthDate">Doğum Tarihi</label>
                        <input
                            type="date"
                            id="birthDate"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
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
