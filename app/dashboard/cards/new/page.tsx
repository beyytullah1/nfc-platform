"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { createCard } from "@/lib/card-actions"
import styles from "../cards.module.css"
import previewStyles from "./preview.module.css"
import CardTypeSelector, { CARD_TYPES } from "../CardTypeSelector"
import ImageUpload from "../ImageUpload"
import { QRCodeSVG } from "qrcode.react"

const FIELD_TYPES = [
    { value: "phone", label: "Telefon", icon: "📱", category: "contact" },
    { value: "email", label: "Email", icon: "✉️", category: "contact" },
    { value: "sms", label: "SMS", icon: "💬", category: "contact" },
    { value: "whatsapp", label: "WhatsApp", icon: "📲", category: "contact" },
    { value: "instagram", label: "Instagram", icon: "📷", category: "social" },
    { value: "linkedin", label: "LinkedIn", icon: "💼", category: "social" },
    { value: "twitter", label: "Twitter/X", icon: "🐦", category: "social" },
    { value: "facebook", label: "Facebook", icon: "👥", category: "social" },
    { value: "tiktok", label: "TikTok", icon: "🎵", category: "social" },
    { value: "youtube", label: "YouTube", icon: "▶️", category: "social" },
    { value: "website", label: "Website", icon: "🌐", category: "link" },
    { value: "github", label: "GitHub", icon: "💻", category: "link" },
    { value: "vcard", label: "vCard", icon: "👤", category: "other" },
    { value: "video", label: "Video", icon: "🎬", category: "other" },
    { value: "custom", label: "Özel", icon: "✨", category: "other" },
]

const FIELD_ICONS: Record<string, string> = Object.fromEntries(
    FIELD_TYPES.map(t => [t.value, t.icon])
)

const PRIVACY_LEVELS = [
    { value: 0, label: "Açık", icon: "🌍", color: "#10b981" },
    { value: 1, label: "Seviye 1", icon: "🔓", color: "#f59e0b" },
    { value: 2, label: "Seviye 2", icon: "🔐", color: "#ef4444" },
]

interface Field {
    type: string
    value: string
    label?: string
    privacyLevel: number
    groupName?: string
}

interface LinkGroup {
    name: string
    icon: string
    fields: Field[]
    isEditing?: boolean
}

export default function NewCardPage() {
    const [step, setStep] = useState<"type" | "form">("type")
    const [cardType, setCardType] = useState("personal")
    const [title, setTitle] = useState("")
    const [bio, setBio] = useState("")
    const [slug, setSlug] = useState("")
    const [slugError, setSlugError] = useState("")
    const [logoUrl, setLogoUrl] = useState("")
    const [avatarUrl, setAvatarUrl] = useState("")
    const [userName, setUserName] = useState("Kullanıcı")
    const [groups, setGroups] = useState<LinkGroup[]>([
        { name: "Kişisel Bilgiler", icon: "👤", fields: [{ type: "phone", value: "", privacyLevel: 0 }] },
        { name: "Sosyal Medya", icon: "📱", fields: [{ type: "instagram", value: "", privacyLevel: 0 }] },
    ])
    const [loading, setLoading] = useState(false)
    const [level1Password, setLevel1Password] = useState("")
    const [level2Password, setLevel2Password] = useState("")
    const [newGroupName, setNewGroupName] = useState("")
    const [showGroupInput, setShowGroupInput] = useState(false)

    const allFields = groups.flatMap(g => g.fields.map(f => ({ ...f, groupName: g.name })))
    const hasLevel1Fields = allFields.some(f => f.privacyLevel >= 1 && f.value)
    const hasLevel2Fields = allFields.some(f => f.privacyLevel >= 2 && f.value)

    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const cardUrl = slug ? `${baseUrl}/c/${slug}` : ""

    useEffect(() => {
        fetch("/api/user/me")
            .then(res => res.json())
            .then(data => { if (data.name) setUserName(data.name) })
            .catch(() => { })
    }, [])

    const handleTypeSelect = (typeId: string) => {
        setCardType(typeId)
        const selectedType = CARD_TYPES.find(t => t.id === typeId)
        if (selectedType) {
            setGroups(selectedType.suggestedGroups.map((name, i) => ({
                name,
                icon: ["👤", "📱", "💼"][i] || "📁",
                fields: []
            })))
        }
        setStep("form")
    }

    const validateSlug = async (value: string) => {
        const cleaned = value.toLowerCase().replace(/[^a-z0-9-_]/g, "")
        setSlug(cleaned)

        if (cleaned.length < 3) {
            setSlugError("En az 3 karakter olmalı")
            return
        }

        try {
            const res = await fetch(`/api/cards/check-slug?slug=${cleaned}`)
            const data = await res.json()
            if (data.exists) {
                setSlugError("Bu kullanıcı adı zaten alınmış")
            } else {
                setSlugError("")
            }
        } catch {
            setSlugError("")
        }
    }

    const addGroup = () => {
        if (newGroupName.trim()) {
            setGroups([...groups, { name: newGroupName.trim(), icon: "📁", fields: [] }])
            setNewGroupName("")
            setShowGroupInput(false)
        }
    }

    const updateGroupName = (index: number, newName: string) => {
        const newGroups = [...groups]
        newGroups[index].name = newName
        newGroups[index].isEditing = false
        setGroups(newGroups)
    }

    const toggleGroupEdit = (index: number) => {
        const newGroups = [...groups]
        newGroups[index].isEditing = !newGroups[index].isEditing
        setGroups(newGroups)
    }

    const removeGroup = (index: number) => {
        if (confirm("Bu grubu silmek istediğinize emin misiniz?")) {
            setGroups(groups.filter((_, i) => i !== index))
        }
    }

    const addField = (groupIndex: number) => {
        const newGroups = [...groups]
        newGroups[groupIndex].fields.push({ type: "custom", value: "", label: "", privacyLevel: 0 })
        setGroups(newGroups)
    }

    const removeField = (groupIndex: number, fieldIndex: number) => {
        const newGroups = [...groups]
        newGroups[groupIndex].fields = newGroups[groupIndex].fields.filter((_, i) => i !== fieldIndex)
        setGroups(newGroups)
    }

    const updateField = (groupIndex: number, fieldIndex: number, key: keyof Field, value: string | number) => {
        const newGroups = [...groups]
        newGroups[groupIndex].fields[fieldIndex] = { ...newGroups[groupIndex].fields[fieldIndex], [key]: value }
        setGroups(newGroups)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (slugError) return
        setLoading(true)

        const formData = new FormData()
        formData.append("title", title)
        formData.append("bio", bio)
        formData.append("slug", slug)
        formData.append("logoUrl", logoUrl)
        formData.append("avatarUrl", avatarUrl)
        formData.append("cardType", cardType)
        formData.append("groups", JSON.stringify(groups))
        formData.append("fields", JSON.stringify(allFields.filter(f => f.value)))
        formData.append("level1Password", level1Password)
        formData.append("level2Password", level2Password)

        await createCard(formData)
    }

    const downloadQRCode = () => {
        const svg = document.querySelector("#qr-code svg")
        if (!svg) return

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const data = new XMLSerializer().serializeToString(svg)
        const img = new Image()

        canvas.width = 300
        canvas.height = 300

        img.onload = () => {
            ctx?.drawImage(img, 0, 0, 300, 300)
            const a = document.createElement("a")
            a.download = `kartvizit-qr-${slug || "code"}.png`
            a.href = canvas.toDataURL("image/png")
            a.click()
        }

        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(data)))
    }

    if (step === "type") {
        return (
            <>
                <Link href="/dashboard/cards" className={styles.backLink}>
                    ← Kartvizitlere Dön
                </Link>
                <CardTypeSelector onSelect={handleTypeSelect} />
            </>
        )
    }

    const selectedTypeInfo = CARD_TYPES.find(t => t.id === cardType)

    return (
        <>
            <Link href="/dashboard/cards" className={styles.backLink}>
                ← Kartvizitlere Dön
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <button onClick={() => setStep("type")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
                    ← Tür Değiştir
                </button>
                <h1 style={{ color: "#fff", fontSize: "1.75rem" }}>
                    {selectedTypeInfo?.icon} {selectedTypeInfo?.name}
                </h1>
            </div>

            <div className={previewStyles.container}>
                <form onSubmit={handleSubmit} className={previewStyles.formSection}>
                    {/* Benzersiz URL */}
                    <div className={styles.formCard}>
                        <h2>🔗 Paylaşım Linki</h2>
                        <div className={styles.formGroup}>
                            <label>Benzersiz Kullanıcı Adı</label>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ color: "rgba(255,255,255,0.5)" }}>{baseUrl}/c/</span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => validateSlug(e.target.value)}
                                    placeholder="kullaniciadi"
                                    style={{ flex: 1 }}
                                />
                            </div>
                            {slugError && <small style={{ color: "#ef4444" }}>{slugError}</small>}
                            {!slugError && slug.length >= 3 && <small style={{ color: "#10b981" }}>✓ Kullanılabilir</small>}
                        </div>

                        {slug.length >= 3 && !slugError && (
                            <div id="qr-code" style={{ textAlign: "center", marginTop: "1rem", padding: "1rem", background: "#fff", borderRadius: "12px" }}>
                                <QRCodeSVG value={cardUrl} size={150} />
                                <p style={{ color: "#333", fontSize: "0.85rem", marginTop: "0.5rem" }}>{cardUrl}</p>
                                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "0.75rem" }}>
                                    <button type="button" onClick={() => navigator.clipboard.writeText(cardUrl)} style={{ padding: "0.5rem 1rem", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                                        📋 Linki Kopyala
                                    </button>
                                    <button type="button" onClick={downloadQRCode} style={{ padding: "0.5rem 1rem", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                                        ⬇️ QR İndir
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Logo ve Fotoğraf */}
                    <div className={styles.formCard}>
                        <h2>🖼️ Görseller</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <ImageUpload
                                label="Kurumsal Logo"
                                icon="🏢"
                                value={logoUrl}
                                onChange={setLogoUrl}
                                type="logo"
                            />
                            <ImageUpload
                                label="Profil Fotoğrafı"
                                icon="👤"
                                value={avatarUrl}
                                onChange={setAvatarUrl}
                                type="avatar"
                            />
                        </div>
                    </div>

                    {/* Temel Bilgiler */}
                    <div className={styles.formCard}>
                        <h2>👤 Temel Bilgiler</h2>
                        <div className={styles.formGroup}>
                            <label htmlFor="title">Ünvan / Pozisyon</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="örn: Yazılım Mühendisi @ Şirket"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="bio">Hakkımda</label>
                            <textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Kısa bir tanıtım yazısı..."
                            />
                        </div>
                    </div>

                    {/* Link Grupları */}
                    {groups.map((group, groupIndex) => (
                        <div key={groupIndex} className={styles.formCard}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                {group.isEditing ? (
                                    <div style={{ display: "flex", gap: "0.5rem", flex: 1 }}>
                                        <input
                                            type="text"
                                            defaultValue={group.name}
                                            onBlur={(e) => updateGroupName(groupIndex, e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && updateGroupName(groupIndex, (e.target as HTMLInputElement).value)}
                                            autoFocus
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                ) : (
                                    <h2 onClick={() => toggleGroupEdit(groupIndex)} style={{ cursor: "pointer" }} title="Düzenlemek için tıklayın">
                                        {group.icon} {group.name} ✏️
                                    </h2>
                                )}
                                <button type="button" onClick={() => removeGroup(groupIndex)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.2rem" }}>
                                    🗑️
                                </button>
                            </div>

                            <div className={styles.fieldsSection}>
                                {group.fields.map((field, fieldIndex) => (
                                    <div key={fieldIndex} className={styles.fieldItem}>
                                        <select
                                            value={field.type}
                                            onChange={(e) => updateField(groupIndex, fieldIndex, "type", e.target.value)}
                                            className={styles.fieldSelect}
                                        >
                                            {FIELD_TYPES.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.icon} {type.label}
                                                </option>
                                            ))}
                                        </select>

                                        {field.type === "custom" && (
                                            <input
                                                type="text"
                                                placeholder="Alan adı"
                                                value={field.label || ""}
                                                onChange={(e) => updateField(groupIndex, fieldIndex, "label", e.target.value)}
                                                className={styles.fieldLabelInput}
                                            />
                                        )}

                                        <input
                                            type="text"
                                            placeholder={field.type === "vcard" ? "vCard bilgilerini girin" : "Değer girin"}
                                            value={field.value}
                                            onChange={(e) => updateField(groupIndex, fieldIndex, "value", e.target.value)}
                                            className={styles.fieldValueInput}
                                        />

                                        <select
                                            value={field.privacyLevel}
                                            onChange={(e) => updateField(groupIndex, fieldIndex, "privacyLevel", parseInt(e.target.value))}
                                            className={styles.privacySelect}
                                            style={{ background: PRIVACY_LEVELS[field.privacyLevel]?.color + "20" }}
                                        >
                                            {PRIVACY_LEVELS.map((level) => (
                                                <option key={level.value} value={level.value}>
                                                    {level.icon} {level.label}
                                                </option>
                                            ))}
                                        </select>

                                        <button type="button" onClick={() => removeField(groupIndex, fieldIndex)} className={styles.removeFieldBtn}>
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                <button type="button" onClick={() => addField(groupIndex)} className={styles.addFieldBtn}>
                                    ➕ Alan Ekle
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Yeni Grup Ekle */}
                    {showGroupInput ? (
                        <div className={styles.formCard} style={{ display: "flex", gap: "0.5rem" }}>
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                placeholder="Grup adı girin..."
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGroup())}
                                autoFocus
                                style={{ flex: 1 }}
                            />
                            <button type="button" onClick={addGroup} style={{ padding: "0.5rem 1rem", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                                ✓ Ekle
                            </button>
                            <button type="button" onClick={() => setShowGroupInput(false)} style={{ padding: "0.5rem 1rem", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                                ✕
                            </button>
                        </div>
                    ) : (
                        <button type="button" onClick={() => setShowGroupInput(true)} className={styles.addGroupBtn}>
                            ➕ Yeni Grup Ekle
                        </button>
                    )}

                    {/* Şifre Ayarları */}
                    {(hasLevel1Fields || hasLevel2Fields) && (
                        <div className={styles.formCard}>
                            <h2>🔐 Şifre Ayarları</h2>
                            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                                Seviye 2 şifresi, Seviye 1'i de açar
                            </p>

                            {hasLevel1Fields && (
                                <div className={styles.formGroup}>
                                    <label style={{ color: "#f59e0b" }}>🔓 Seviye 1 Şifresi</label>
                                    <input
                                        type="password"
                                        value={level1Password}
                                        onChange={(e) => setLevel1Password(e.target.value)}
                                        placeholder="Seviye 1 alanları için şifre"
                                    />
                                </div>
                            )}

                            {hasLevel2Fields && (
                                <div className={styles.formGroup}>
                                    <label style={{ color: "#ef4444" }}>🔐 Seviye 2 Şifresi</label>
                                    <input
                                        type="password"
                                        value={level2Password}
                                        onChange={(e) => setLevel2Password(e.target.value)}
                                        placeholder="Tüm alanlar için şifre"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <button type="submit" className={styles.submitBtn} disabled={loading || !!slugError}>
                        {loading ? "Oluşturuluyor..." : "✓ Kartviziti Oluştur"}
                    </button>
                </form>

                {/* Önizleme */}
                <div className={previewStyles.previewSection}>
                    <h3 className={previewStyles.previewTitle}>📱 Canlı Önizleme</h3>
                    <div className={previewStyles.previewCard}>
                        {logoUrl && <img src={logoUrl} alt="Logo" style={{ width: "80px", height: "40px", objectFit: "contain", marginBottom: "1rem" }} />}
                        <div className={previewStyles.avatar} style={{ backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined, backgroundSize: "cover" }}>
                            {!avatarUrl && userName.charAt(0)}
                        </div>
                        <h4 className={previewStyles.name}>{userName}</h4>
                        {title && <p className={previewStyles.title}>{title}</p>}
                        {bio && <p className={previewStyles.bio}>{bio}</p>}

                        {groups.map((group, i) => (
                            group.fields.filter(f => f.value).length > 0 && (
                                <div key={i} style={{ marginTop: "1rem" }}>
                                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                                        {group.icon} {group.name}
                                    </p>
                                    {group.fields.filter(f => f.value).map((field, j) => (
                                        <div key={j} className={previewStyles.fieldItem} style={{
                                            opacity: field.privacyLevel > 0 ? 0.5 : 1,
                                            borderLeft: `3px solid ${PRIVACY_LEVELS[field.privacyLevel]?.color || '#10b981'}`
                                        }}>
                                            <span className={previewStyles.fieldIcon}>{FIELD_ICONS[field.type] || "📌"}</span>
                                            <div className={previewStyles.fieldContent}>
                                                <span className={previewStyles.fieldLabel}>
                                                    {field.label || FIELD_TYPES.find(t => t.value === field.type)?.label}
                                                </span>
                                                <span className={previewStyles.fieldValue}>
                                                    {field.privacyLevel > 0 ? "••••••••" : field.value}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
