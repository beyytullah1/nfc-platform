"use client"

import { useState, useEffect } from "react"
import styles from "./public-card.module.css"

const FIELD_ICONS: Record<string, string> = {
    phone: "📱",
    email: "✉️",
    sms: "💬",
    whatsapp: "📲",
    instagram: "📷",
    linkedin: "💼",
    twitter: "🐦",
    facebook: "👥",
    tiktok: "🎵",
    youtube: "▶️",
    website: "🌐",
    github: "💻",
    vcard: "👤",
    video: "🎬",
    custom: "✨",
}

// vCard oluşturma fonksiyonu
const generateVCard = (name: string, title: string | null, fields: { fieldType: string; value: string }[]) => {
    const phoneField = fields.find(f => f.fieldType === "phone")
    const emailField = fields.find(f => f.fieldType === "email")
    const websiteField = fields.find(f => f.fieldType === "website")

    let vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
${title ? `TITLE:${title}` : ""}
${phoneField ? `TEL;TYPE=CELL:${phoneField.value}` : ""}
${emailField ? `EMAIL:${emailField.value}` : ""}
${websiteField ? `URL:${websiteField.value.startsWith("http") ? websiteField.value : "https://" + websiteField.value}` : ""}
END:VCARD`

    // Boş satırları temizle
    vcard = vcard.split('\n').filter(line => line.trim() !== '').join('\n')
    return vcard
}

// Paylaşım fonksiyonu
const shareCard = async (url: string, name: string) => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: `${name} - Dijital Kartvizit`,
                text: `${name} ile iletişime geçin`,
                url: url
            })
            return true
        } catch {
            // Kullanıcı iptal etti veya hata oluştu
        }
    }
    // Fallback: panoya kopyala
    try {
        await navigator.clipboard.writeText(url)
        return "copied"
    } catch {
        return false
    }
}

const SOCIAL_TYPES = ["instagram", "youtube", "tiktok", "twitter", "facebook", "linkedin", "github", "whatsapp"]

const FIELD_LINKS: Record<string, (value: string) => string> = {
    phone: (v) => `tel:${v.replace(/\s/g, "")}`,
    email: (v) => `mailto:${v}`,
    sms: (v) => `sms:${v.replace(/\s/g, "")}`,
    whatsapp: (v) => `https://wa.me/${v.replace(/\s/g, "").replace(/^\+/, "")}`,
    instagram: (v) => `https://instagram.com/${v.replace("@", "")}`,
    linkedin: (v) => v.startsWith("http") ? v : `https://linkedin.com/in/${v}`,
    twitter: (v) => `https://twitter.com/${v.replace("@", "")}`,
    facebook: (v) => v.startsWith("http") ? v : `https://facebook.com/${v}`,
    tiktok: (v) => `https://tiktok.com/@${v.replace("@", "")}`,
    youtube: (v) => v.startsWith("http") ? v : `https://youtube.com/@${v}`,
    website: (v) => v.startsWith("http") ? v : `https://${v}`,
    github: (v) => `https://github.com/${v}`,
    video: (v) => v,
    vcard: (v) => v,
    custom: (v) => v,
}

interface CardData {
    id: string
    hasLevel1Password: boolean
    hasLevel2Password: boolean
    logoUrl?: string | null
    avatarUrl?: string | null
    user: {
        name: string | null
        avatarUrl: string | null
    }
    title: string | null
    bio: string | null
    fields: {
        id: string
        fieldType: string
        label: string | null
        value: string
        privacyLevel: number
    }[]
}

interface PublicCardClientProps {
    initialCard: CardData
}

export default function PublicCardClient({ initialCard }: PublicCardClientProps) {
    const [unlockedLevel, setUnlockedLevel] = useState(0)
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPasswordDialog, setShowPasswordDialog] = useState(false)
    const [toast, setToast] = useState<string | null>(null)

    // Track view on page load
    useEffect(() => {
        fetch(`/api/cards/${initialCard.id}/view`, { method: "POST" }).catch(() => { })
    }, [initialCard.id])

    // Toast göster
    const showToast = (message: string) => {
        setToast(message)
        setTimeout(() => setToast(null), 3000)
    }

    // vCard indir
    const handleDownloadVCard = () => {
        const name = initialCard.user.name || "Kişi"
        const vcard = generateVCard(name, initialCard.title, visibleFields)
        const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${name.replace(/\s+/g, "_")}.vcf`
        a.click()
        URL.revokeObjectURL(url)
        showToast("✓ Kişi kaydedildi!")
    }

    // Paylaş
    const handleShare = async () => {
        const url = window.location.href
        const name = initialCard.user.name || "Dijital Kartvizit"
        const result = await shareCard(url, name)
        if (result === "copied") {
            showToast("✓ Link kopyalandı!")
        }
    }

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch(`/api/cards/${initialCard.id}/verify-level`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            })

            const data = await res.json()

            if (res.ok && data.level) {
                setUnlockedLevel(data.level)
                setShowPasswordDialog(false)
                setPassword("")
            } else {
                setError(data.error || "Yanlış şifre")
            }
        } catch {
            setError("Bir hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    const visibleFields = initialCard.fields.filter(f => f.privacyLevel <= unlockedLevel)
    const lockedFields = initialCard.fields.filter(f => f.privacyLevel > unlockedLevel)

    // Sosyal medya linkleri (hızlı erişim ikonu için)
    const socialFields = visibleFields.filter(f => SOCIAL_TYPES.includes(f.fieldType))
    const otherFields = visibleFields.filter(f => !SOCIAL_TYPES.includes(f.fieldType))

    // Kullanıcı avatar veya kart avatar
    const displayAvatar = initialCard.avatarUrl || initialCard.user.avatarUrl

    // Sosyal medya SVG ikonları
    const getSocialSVG = (type: string) => {
        switch (type) {
            case "instagram":
                return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            case "youtube":
                return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
            case "tiktok":
                return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
            case "twitter":
                return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            case "facebook":
                return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            case "linkedin":
                return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            case "github":
                return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
            case "whatsapp":
                return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            default:
                return null
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.cardContainer}>
                {/* Hero Section - Büyük Görsel */}
                <div className={styles.heroSection}>
                    {displayAvatar ? (
                        <>
                            <img
                                src={displayAvatar}
                                alt=""
                                className={styles.heroImage}
                            />
                            <div className={styles.heroGradient} />
                        </>
                    ) : (
                        <div className={styles.heroFallback} />
                    )}

                    {/* Logo - Sağ üst köşe */}
                    {initialCard.logoUrl && (
                        <img
                            src={initialCard.logoUrl}
                            alt="Logo"
                            className={styles.heroLogo}
                        />
                    )}
                </div>

                {/* Main Content */}
                <div className={styles.contentSection}>
                    <div className={styles.card}>
                        {/* Name & Title */}
                        <h1 className={styles.name}>{initialCard.user.name}</h1>
                        {initialCard.title && <p className={styles.title}>{initialCard.title}</p>}
                        {initialCard.bio && <p className={styles.bio}>{initialCard.bio}</p>}

                        {/* Action Buttons */}
                        <div className={styles.actionButtons}>
                            <button onClick={handleDownloadVCard} className={styles.saveContactBtn}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M19 8v6M22 11h-6" />
                                </svg>
                                Kişiyi Kaydet
                            </button>
                            <button onClick={handleShare} className={styles.shareBtn}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="18" cy="5" r="3" />
                                    <circle cx="6" cy="12" r="3" />
                                    <circle cx="18" cy="19" r="3" />
                                    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
                                </svg>
                                Paylaş
                            </button>
                        </div>

                        {/* Quick Social Icons with SVG */}
                        {socialFields.length > 0 && (
                            <div className={styles.socialQuickLinks}>
                                {socialFields.map((field) => {
                                    const linkFn = FIELD_LINKS[field.fieldType]
                                    const href = linkFn ? linkFn(field.value) : "#"
                                    const svgIcon = getSocialSVG(field.fieldType)

                                    return (
                                        <a
                                            key={field.id}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.socialIcon}
                                            title={field.fieldType}
                                        >
                                            {svgIcon || FIELD_ICONS[field.fieldType]}
                                        </a>
                                    )
                                })}
                            </div>
                        )}

                        {/* Other Fields */}
                        {otherFields.length > 0 && (
                            <div className={styles.section}>
                                <div className={styles.fields}>
                                    {otherFields.map((field) => {
                                        const linkFn = FIELD_LINKS[field.fieldType]
                                        const href = linkFn ? linkFn(field.value) : "#"
                                        const isClickable = field.fieldType !== "custom" || field.value.startsWith("http")

                                        return isClickable ? (
                                            <a
                                                key={field.id}
                                                href={href}
                                                target={field.fieldType === "phone" || field.fieldType === "email" || field.fieldType === "sms" ? "_self" : "_blank"}
                                                rel="noopener noreferrer"
                                                className={styles.fieldLink}
                                            >
                                                <div className={styles.fieldIcon}>
                                                    {FIELD_ICONS[field.fieldType] || "📌"}
                                                </div>
                                                <div className={styles.fieldContent}>
                                                    <span className={styles.fieldLabel}>
                                                        {field.label || field.fieldType.charAt(0).toUpperCase() + field.fieldType.slice(1)}
                                                    </span>
                                                    <span className={styles.fieldValue}>{field.value}</span>
                                                </div>
                                                <div className={styles.fieldArrow}>→</div>
                                            </a>
                                        ) : (
                                            <div key={field.id} className={styles.fieldBlock}>
                                                <div className={styles.fieldIcon}>
                                                    {FIELD_ICONS[field.fieldType] || "📌"}
                                                </div>
                                                <div className={styles.fieldContent}>
                                                    <span className={styles.fieldLabel}>{field.label || "Bilgi"}</span>
                                                    <span className={styles.fieldValue}>{field.value}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Locked Fields Indicator */}
                        {lockedFields.length > 0 && (
                            <div
                                className={styles.lockedField}
                                onClick={() => setShowPasswordDialog(true)}
                            >
                                <div className={styles.fieldIcon}>🔐</div>
                                <div className={styles.fieldContent}>
                                    <span className={styles.fieldLabel}>Gizli Alanlar</span>
                                    <span className={styles.fieldValue}>{lockedFields.length} kilitli alan</span>
                                </div>
                                <button className={styles.unlockBtn}>Kilit Aç</button>
                            </div>
                        )}

                        {/* Footer */}
                        <div className={styles.footer}>
                            <span>🏷️ NFC Platform</span>
                            {unlockedLevel > 0 && (
                                <span style={{ marginLeft: "1rem", color: "#10b981" }}>
                                    🔓 Seviye {unlockedLevel}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Password Dialog */}
                {showPasswordDialog && (
                    <div className={styles.passwordOverlay} onClick={() => setShowPasswordDialog(false)}>
                        <div className={styles.passwordCard} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.lockIcon}>🔐</div>
                            <h2 className={styles.passwordTitle}>Şifre Gir</h2>
                            <p className={styles.passwordDesc}>
                                Gizli alanları görmek için şifre girin
                            </p>

                            <form onSubmit={handleUnlock} className={styles.passwordForm}>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Şifre"
                                    className={styles.passwordInput}
                                    autoFocus
                                />
                                {error && <p className={styles.passwordError}>{error}</p>}
                                <button
                                    type="submit"
                                    className={styles.passwordBtn}
                                    disabled={loading || !password}
                                >
                                    {loading ? "Kontrol ediliyor..." : "Kilidi Aç"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {toast && (
                    <div className={styles.toast}>
                        {toast}
                    </div>
                )}
            </div>
        </div>
    )
}
