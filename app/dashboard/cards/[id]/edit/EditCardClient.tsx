"use client"

import { useState } from "react"
import Link from "next/link"
import { updateCard } from "@/lib/card-actions"
import { getBaseUrl } from "@/lib/env"
import styles from "../../cards.module.css"
import previewStyles from "../../new/preview.module.css"
import ImageUpload from "../../ImageUpload"

const FIELD_TYPES = [
    { value: "phone", label: "Telefon", icon: "📱" },
    { value: "email", label: "Email", icon: "✉️" },
    { value: "sms", label: "SMS", icon: "💬" },
    { value: "whatsapp", label: "WhatsApp", icon: "📲" },
    { value: "instagram", label: "Instagram", icon: "📷" },
    { value: "linkedin", label: "LinkedIn", icon: "💼" },
    { value: "twitter", label: "Twitter/X", icon: "🐦" },
    { value: "facebook", label: "Facebook", icon: "👥" },
    { value: "tiktok", label: "TikTok", icon: "🎵" },
    { value: "youtube", label: "YouTube", icon: "▶️" },
    { value: "website", label: "Website", icon: "🌐" },
    { value: "github", label: "GitHub", icon: "💻" },
    { value: "vcard", label: "vCard", icon: "👤" },
    { value: "video", label: "Video", icon: "🎬" },
    { value: "custom", label: "Özel", icon: "✨" },
]

const PRIVACY_LEVELS = [
    { value: 0, label: "Açık", icon: "🌍", color: "#10b981" },
    { value: 1, label: "Seviye 1", icon: "🔓", color: "#f59e0b" },
    { value: 2, label: "Seviye 2", icon: "🔐", color: "#ef4444" },
]

const FIELD_ICONS: Record<string, string> = Object.fromEntries(
    FIELD_TYPES.map(t => [t.value, t.icon])
)

interface Field {
    id?: string
    type: string
    value: string
    label?: string
    privacyLevel: number
    groupId?: string | null
}

interface Group {
    id: string
    name: string
    fields: Field[]
    isNew?: boolean
}

interface EditCardClientProps {
    card: {
        id: string
        title: string | null
        bio: string | null
        slug: string | null
        logoUrl: string | null
        avatarUrl: string | null
        fields: {
            id: string
            fieldType: string
            value: string
            label: string | null
            privacyLevel: number
            groupId: string | null
        }[]
        groups: {
            id: string
            name: string
            displayOrder: number
        }[]
    }
    userName: string
}

export default function EditCardClient({ card, userName }: EditCardClientProps) {
    const [title, setTitle] = useState(card.title || "")
    const [bio, setBio] = useState(card.bio || "")
    const [slug, setSlug] = useState(card.slug || "")
    const [logoUrl, setLogoUrl] = useState(card.logoUrl || "")
    const [avatarUrl, setAvatarUrl] = useState(card.avatarUrl || "")
    const [loading, setLoading] = useState(false)

    // Initial State Construction
    const [groups, setGroups] = useState<Group[]>(() => {
        const mappedGroups: Group[] = card.groups.map(g => ({
            id: g.id,
            name: g.name,
            fields: card.fields
                .filter(f => f.groupId === g.id)
                .map(f => ({
                    id: f.id,
                    type: f.fieldType,
                    value: f.value,
                    label: f.label || undefined,
                    privacyLevel: f.privacyLevel,
                    groupId: g.id
                }))
        }))

        // Ungrouped fields
        const ungroupedFields = card.fields
            .filter(f => !f.groupId)
            .map(f => ({
                id: f.id,
                type: f.fieldType,
                value: f.value,
                label: f.label || undefined,
                privacyLevel: f.privacyLevel,
                groupId: null
            }))

        if (ungroupedFields.length > 0) {
            mappedGroups.push({
                id: "ungrouped",
                name: "Gruplandırılmamış",
                fields: ungroupedFields
            })
        }

        return mappedGroups
    })

    const baseUrl = getBaseUrl()

    const addGroup = () => {
        setGroups([...groups, {
            id: `temp_group_${Date.now()}`,
            name: "Yeni Grup",
            fields: [],
            isNew: true
        }])
    }

    const removeGroup = (groupId: string) => {
        setGroups(groups.filter(g => g.id !== groupId))
    }

    const updateGroupName = (groupId: string, name: string) => {
        setGroups(groups.map(g => g.id === groupId ? { ...g, name } : g))
    }

    const addFieldToGroup = (groupId: string) => {
        setGroups(groups.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    fields: [...g.fields, { type: "custom", value: "", label: "", privacyLevel: 0, groupId: g.id }]
                }
            }
            return g
        }))
    }

    const removeFieldFromGroup = (groupId: string, fieldIndex: number) => {
        setGroups(groups.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    fields: g.fields.filter((_, i) => i !== fieldIndex)
                }
            }
            return g
        }))
    }

    const updateFieldInGroup = (groupId: string, fieldIndex: number, key: keyof Field, value: any) => {
        setGroups(groups.map(g => {
            if (g.id === groupId) {
                const newFields = [...g.fields]
                newFields[fieldIndex] = { ...newFields[fieldIndex], [key]: value }
                return { ...g, fields: newFields }
            }
            return g
        }))
    }

    // Helper to get flat fields for preview (filtering out empty ones)
    const getAllFieldsForPreview = () => {
        return groups.flatMap(g => g.fields).filter(f => f.value)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        formData.append("title", title)
        formData.append("bio", bio)
        formData.append("slug", slug)
        formData.append("logoUrl", logoUrl)
        formData.append("avatarUrl", avatarUrl)

        // Prepare payload for backend
        const payloadData = {
            groups: groups.filter(g => g.id !== 'ungrouped').map(g => ({
                name: g.name,
                fields: g.fields.filter(f => f.value)
            })),
            ungroupedFields: groups.find(g => g.id === 'ungrouped')?.fields.filter(f => f.value) || []
        }

        formData.append("groupsData", JSON.stringify(payloadData))

        await updateCard(card.id, formData)
    }

    return (
        <>
            <Link href={`/dashboard/cards/${card.id}`} className={styles.backLink}>
                ← Kartvizite Dön
            </Link>

            <h1 style={{ color: "#fff", marginBottom: "1.5rem", fontSize: "1.75rem" }}>
                Kartviziti Düzenle ✏️
            </h1>

            <div className={previewStyles.container}>
                {/* Form */}
                <form onSubmit={handleSubmit} className={previewStyles.formSection}>
                    {/* Slug, Görseller, Temel Bilgiler (Aynı) */}
                    <div className={styles.formCard}>
                        <h2>🔗 Paylaşım Linki</h2>
                        <div className={styles.formGroup}>
                            <label>Benzersiz Kullanıcı Adı</label>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ color: "rgba(255,255,255,0.5)" }}>{baseUrl}/c/</span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                                    placeholder="kullaniciadi"
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>
                    </div>

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

                    {/* GRUPLAR VE ALANLAR */}
                    <div className={styles.formCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2>📱 İletişim Bilgileri</h2>
                            <button type="button" onClick={addGroup} className={styles.addFieldBtn} style={{ background: '#4f46e5' }}>
                                📁 Grup Ekle
                            </button>
                        </div>

                        {groups.map((group) => (
                            <div key={group.id} style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem',
                                borderLeft: '3px solid #6366f1'
                            }}>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {group.id !== 'ungrouped' ? (
                                        <input
                                            value={group.name}
                                            onChange={(e) => updateGroupName(group.id, e.target.value)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                borderBottom: '1px solid #4b5563',
                                                color: 'white',
                                                fontSize: '1.1rem',
                                                fontWeight: 'bold',
                                                padding: '0.25rem',
                                                flex: 1
                                            }}
                                            placeholder="Grup Adı"
                                        />
                                    ) : (
                                        <h3 style={{ color: '#9ca3af', flex: 1 }}>{group.name}</h3>
                                    )}
                                    {group.id !== 'ungrouped' && (
                                        <button type="button" onClick={() => removeGroup(group.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️ Sil</button>
                                    )}
                                </div>

                                <div className={styles.fieldsSection}>
                                    {group.fields.map((field, fieldIndex) => (
                                        <div key={fieldIndex} className={styles.fieldItem}>
                                            <select
                                                value={field.type}
                                                onChange={(e) => updateFieldInGroup(group.id, fieldIndex, "type", e.target.value)}
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
                                                    onChange={(e) => updateFieldInGroup(group.id, fieldIndex, "label", e.target.value)}
                                                    className={styles.fieldLabelInput}
                                                />
                                            )}

                                            <input
                                                type="text"
                                                placeholder="Değer girin"
                                                value={field.value}
                                                onChange={(e) => updateFieldInGroup(group.id, fieldIndex, "value", e.target.value)}
                                                className={styles.fieldValueInput}
                                            />

                                            <select
                                                value={field.privacyLevel}
                                                onChange={(e) => updateFieldInGroup(group.id, fieldIndex, "privacyLevel", parseInt(e.target.value))}
                                                className={styles.privacySelect}
                                            >
                                                {PRIVACY_LEVELS.map((level) => (
                                                    <option key={level.value} value={level.value}>
                                                        {level.icon} {level.label}
                                                    </option>
                                                ))}
                                            </select>

                                            <button
                                                type="button"
                                                onClick={() => removeFieldFromGroup(group.id, fieldIndex)}
                                                className={styles.removeFieldBtn}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addFieldToGroup(group.id)} className={styles.addFieldBtn} style={{ fontSize: '0.9rem', padding: '0.5rem' }}>
                                        + Alan Ekle
                                    </button>
                                </div>
                            </div>
                        ))}

                        {groups.length === 0 && (
                            <button type="button" onClick={addGroup} className={styles.addFieldBtn}>
                                İlk Grubu Oluştur
                            </button>
                        )}

                        {/* Ungrouped button fallback if no groups exist and we want direct fields? No, force groups is better for this UI now */}
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? "Kaydediliyor..." : "💾 Değişiklikleri Kaydet"}
                    </button>
                </form>

                {/* Live Preview */}
                <div className={previewStyles.previewSection}>
                    {/* ... Preview Code same as before mostly, but iterating groups if wanted? Or just flat fields? 
                        Let's keep flat fields preview for now as Public Card design might be flat or grouped. 
                        Actually user wants groups visibly. 
                        Let's render groups in preview too.
                    */}
                    <div className={previewStyles.previewCard}>
                        {/* Header parts same ... */}
                        {logoUrl && <img src={logoUrl} alt="Logo" style={{ width: "80px", height: "40px", objectFit: "contain", marginBottom: "1rem" }} />}
                        <div className={previewStyles.avatar} style={{ backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined, backgroundSize: "cover" }}>
                            {!avatarUrl && userName.charAt(0)}
                        </div>
                        <h4 className={previewStyles.name}>{userName}</h4>
                        {title && <p className={previewStyles.title}>{title}</p>}
                        {bio && <p className={previewStyles.bio}>{bio}</p>}

                        <div className={previewStyles.fields}>
                            {groups.map(group => {
                                const activeFields = group.fields.filter(f => f.value);
                                if (activeFields.length === 0) return null;
                                return (
                                    <div key={group.id} style={{ marginBottom: '1rem' }}>
                                        {group.id !== 'ungrouped' && <h5 style={{ color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.9rem', borderBottom: '1px solid #374151' }}>{group.name}</h5>}
                                        {activeFields.map((field, idx) => (
                                            <div key={idx} className={previewStyles.fieldItem} style={{
                                                opacity: field.privacyLevel > 0 ? 0.5 : 1,
                                                borderLeft: `3px solid ${PRIVACY_LEVELS[field.privacyLevel]?.color || '#10b981'}`
                                            }}>
                                                <span className={previewStyles.fieldIcon}>
                                                    {FIELD_ICONS[field.type] || "📌"}
                                                </span>
                                                <div className={previewStyles.fieldContent}>
                                                    <span className={previewStyles.fieldLabel}>
                                                        {field.label || FIELD_TYPES.find(t => t.value === field.type)?.label || "Bilgi"}
                                                    </span>
                                                    <span className={previewStyles.fieldValue}>
                                                        {field.privacyLevel > 0 ? "••••••••" : field.value}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
