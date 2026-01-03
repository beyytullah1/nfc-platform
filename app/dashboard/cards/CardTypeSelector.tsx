"use client"

import { useState } from "react"
import Link from "next/link"
import styles from "./cards.module.css"

const CARD_TYPES = [
    {
        id: "personal",
        name: "Kişisel Kartvizit",
        icon: "🧑‍💼",
        description: "Profesyonel iş ve kişisel kullanım",
        color: "#3b82f6",
        suggestedGroups: ["Kişisel Bilgiler", "Sosyal Medya", "İş Örnekleri"]
    },
    {
        id: "health",
        name: "Sağlık Kartviziti",
        icon: "🏥",
        description: "Acil sağlık bilgileri ve teşhisler",
        color: "#ef4444",
        suggestedGroups: ["Acil Durum", "Sağlık Bilgileri", "İletişim"]
    },
    {
        id: "child",
        name: "Çocuk Kartviziti",
        icon: "👶",
        description: "Çocuk güvenliği ve ebeveyn bilgileri",
        color: "#f59e0b",
        suggestedGroups: ["Anne-Baba", "Okul", "Acil Durum"]
    },
    {
        id: "elderly",
        name: "Yaşlı/Hasta Kartviziti",
        icon: "👵",
        description: "Bakıma muhtaç kişiler için",
        color: "#8b5cf6",
        suggestedGroups: ["Bakıcı", "Sağlık Bilgileri", "Adres"]
    },
    {
        id: "pet",
        name: "Evcil Hayvan Kartviziti",
        icon: "🐾",
        description: "Kayıp hayvan ve sahip bilgileri",
        color: "#10b981",
        suggestedGroups: ["Sahip Bilgileri", "Veteriner", "Sağlık"]
    },
]

interface CardTypeSelectorProps {
    onSelect: (typeId: string) => void
}

export default function CardTypeSelector({ onSelect }: CardTypeSelectorProps) {
    return (
        <div className={styles.typeSelector}>
            <h2 style={{ color: "#fff", marginBottom: "0.5rem" }}>Kartvizit Türü Seçin</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2rem" }}>
                Kullanım amacınıza uygun şablonu seçin
            </p>

            <div className={styles.typeGrid}>
                {CARD_TYPES.map((type) => (
                    <button
                        key={type.id}
                        className={styles.typeCard}
                        onClick={() => onSelect(type.id)}
                        style={{ borderColor: type.color + "40" }}
                    >
                        <div className={styles.typeIcon} style={{ background: type.color + "20" }}>
                            {type.icon}
                        </div>
                        <h3>{type.name}</h3>
                        <p>{type.description}</p>
                        <div className={styles.typeTags}>
                            {type.suggestedGroups.slice(0, 2).map((group) => (
                                <span key={group} style={{ background: type.color + "20", color: type.color }}>
                                    {group}
                                </span>
                            ))}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

export { CARD_TYPES }
