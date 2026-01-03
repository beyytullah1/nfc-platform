"use client"

import { useState } from "react"
import Link from "next/link"
import { addBlock, deleteBlock, deletePage, updatePage } from "@/lib/page-actions"
import { uploadImage } from "@/lib/upload-actions"
import styles from "../pages.module.css"

interface PageEditorClientProps {
    page: {
        id: string
        title: string
        blocks: {
            id: string
            blockType: string
            content: string
            displayOrder: number
        }[]
    }
}

const BLOCK_TYPES = [
    { id: "text", icon: "📝", label: "Metin" },
    { id: "image", icon: "🖼️", label: "Resim" },
    { id: "link", icon: "🔗", label: "Link" },
    { id: "video", icon: "🎬", label: "Video" },
]

export default function PageEditorClient({ page }: PageEditorClientProps) {
    const [showAddForm, setShowAddForm] = useState<string | null>(null)
    const [content, setContent] = useState("")
    const [linkText, setLinkText] = useState("")
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(false)
    const [editingTitle, setEditingTitle] = useState(false)
    const [tempTitle, setTempTitle] = useState(page.title)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingFile(true)
        const formData = new FormData()
        formData.append("file", file)

        const result = await uploadImage(formData)
        if (result.success && result.url) {
            setContent(result.url)
        } else {
            alert("Resim yüklenirken bir hata oluştu")
        }
        setUploadingFile(false)
    }

    const handleTitleUpdate = async () => {
        if (!tempTitle || tempTitle === page.title) {
            setEditingTitle(false)
            setTempTitle(page.title)
            return
        }
        const formData = new FormData()
        formData.append("title", tempTitle)
        await updatePage(page.id, formData)
        setEditingTitle(false)
    }

    const handleAddBlock = async (blockType: string) => {
        if (!content) return
        setLoading(true)

        const formData = new FormData()
        formData.append("blockType", blockType)
        formData.append("content", content)
        if (blockType === "link") {
            formData.append("linkText", linkText)
        }

        await addBlock(page.id, formData)
        setContent("")
        setLinkText("")
        setShowAddForm(null)
        setLoading(false)
    }

    const handleDeleteBlock = async (blockId: string) => {
        await deleteBlock(blockId)
    }

    const handleDeletePage = async () => {
        if (confirm("Bu sayfayı silmek istediğinizden emin misiniz? Tüm bloklar da silinecek.")) {
            setDeleting(true)
            await deletePage(page.id)
        }
    }

    const renderBlockContent = (block: { blockType: string; content: string }) => {
        let data: any = {}
        try {
            data = JSON.parse(block.content)
        } catch (e) {
            // Fallback for raw content (seed data)
            if (block.blockType === 'image' || block.blockType === 'video') {
                data = { url: block.content }
            } else if (block.blockType === 'link') {
                data = { url: block.content, text: block.content }
            } else {
                data = { text: block.content }
            }
        }

        switch (block.blockType) {
            case "text":
                return <p style={{ color: "#fff", whiteSpace: "pre-wrap" }}>{data.text}</p>
            case "image":
                return <p style={{ color: "#60a5fa" }}>🖼️ {data.url}</p>
            case "link":
                return <p style={{ color: "#8b5cf6" }}>🔗 {data.text || data.url}</p>
            case "video":
                return <p style={{ color: "#f472b6" }}>🎬 {data.url}</p>
            default:
                return <p style={{ color: "rgba(255,255,255,0.5)" }}>{data.text}</p>
        }
    }

    return (
        <>
            <Link href="/dashboard/pages" className={styles.backLink}>
                ← Sayfalara Dön
            </Link>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    {editingTitle ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <input
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem', borderRadius: '8px', color: '#fff', fontSize: '1.75rem', fontWeight: 'bold' }}
                                autoFocus
                            />
                            <button onClick={handleTitleUpdate} style={{ cursor: 'pointer', background: '#10b981', border: 'none', borderRadius: '5px', padding: '0.5rem', color: '#fff' }}>✓</button>
                            <button onClick={() => { setEditingTitle(false); setTempTitle(page.title) }} style={{ cursor: 'pointer', background: '#ef4444', border: 'none', borderRadius: '5px', padding: '0.5rem', color: '#fff' }}>✗</button>
                        </div>
                    ) : (
                        <h1 style={{ color: "#fff", fontSize: "1.75rem", marginBottom: "0.25rem", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {page.title}
                            <button onClick={() => { setEditingTitle(true); setTempTitle(page.title) }} style={{ fontSize: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }} title="Başlığı Düzenle">✏️</button>
                        </h1>
                    )}
                    <p style={{ color: "rgba(255,255,255,0.6)" }}>{page.blocks.length} blok</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <Link
                        href={`/page/${page.id}`}
                        target="_blank"
                        className={styles.createBtn}
                    >
                        🔗 Görüntüle
                    </Link>
                </div>
            </div>

            {/* Bloklar */}
            <div className={styles.formCard}>
                <h2>📋 Sayfa İçeriği</h2>

                <div className={styles.blockEditor}>
                    {page.blocks.map((block) => (
                        <div key={block.id} className={styles.blockItem}>
                            <div className={styles.blockHeader}>
                                <span className={styles.blockType}>
                                    {BLOCK_TYPES.find(t => t.id === block.blockType)?.icon} {BLOCK_TYPES.find(t => t.id === block.blockType)?.label}
                                </span>
                                <div className={styles.blockActions}>
                                    <button
                                        onClick={() => handleDeleteBlock(block.id)}
                                        className={`${styles.blockBtn} ${styles.delete}`}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <div className={styles.blockContent}>
                                {renderBlockContent(block)}
                            </div>
                        </div>
                    ))}

                    {page.blocks.length === 0 && !showAddForm && (
                        <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "2rem" }}>
                            Henüz blok yok. Aşağıdan ekleyin.
                        </p>
                    )}

                    {/* Add Block Form */}
                    {showAddForm && (
                        <div className={styles.blockItem}>
                            <div className={styles.blockHeader}>
                                <span className={styles.blockType}>
                                    {BLOCK_TYPES.find(t => t.id === showAddForm)?.icon} Yeni {BLOCK_TYPES.find(t => t.id === showAddForm)?.label}
                                </span>
                            </div>
                            <div className={styles.blockContent}>
                                {showAddForm === "text" && (
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Metninizi yazın..."
                                    />
                                )}
                                {showAddForm === "image" && (
                                    <>
                                        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem' }}>Bilgisayardan Yükle:</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                style={{ color: '#fff' }}
                                                disabled={uploadingFile}
                                            />
                                            {uploadingFile && <span style={{ color: '#60a5fa', marginLeft: '0.5rem' }}>Yükleniyor ve sıkıştırılıyor...</span>}
                                        </div>
                                        <div style={{ marginBottom: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>veya URL Kullan:</div>
                                        <input
                                            type="url"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Resim URL'si..."
                                        />
                                    </>
                                )}
                                {showAddForm === "link" && (
                                    <>
                                        <input
                                            type="url"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Link URL'si..."
                                            style={{ marginBottom: "0.5rem" }}
                                        />
                                        <input
                                            type="text"
                                            value={linkText}
                                            onChange={(e) => setLinkText(e.target.value)}
                                            placeholder="Link metni (isteğe bağlı)"
                                        />
                                    </>
                                )}
                                {showAddForm === "video" && (
                                    <input
                                        type="url"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="YouTube/Vimeo URL..."
                                    />
                                )}
                                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                                    <button
                                        onClick={() => handleAddBlock(showAddForm)}
                                        className={styles.submitBtn}
                                        disabled={loading || !content}
                                        style={{ flex: 1 }}
                                    >
                                        {loading ? "Ekleniyor..." : "Ekle"}
                                    </button>
                                    <button
                                        onClick={() => { setShowAddForm(null); setContent(""); setLinkText("") }}
                                        style={{ padding: "0.75rem 1rem", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer" }}
                                    >
                                        İptal
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Block Buttons */}
                {!showAddForm && (
                    <div className={styles.addBlockSection}>
                        {BLOCK_TYPES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setShowAddForm(type.id)}
                                className={styles.addBlockBtn}
                            >
                                {type.icon} {type.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Danger Zone */}
            <div className={styles.formCard} style={{ marginTop: "1.5rem", borderColor: "rgba(239, 68, 68, 0.3)" }}>
                <h2 style={{ color: "#fca5a5" }}>⚠️ Tehlikeli Bölge</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                    Bu sayfayı sildiğinizde tüm içerik blokları da silinecektir.
                </p>
                <button
                    onClick={handleDeletePage}
                    disabled={deleting}
                    style={{
                        padding: "0.875rem 1.5rem",
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "12px",
                        color: "#fca5a5",
                        cursor: "pointer",
                        fontSize: "0.9rem"
                    }}
                >
                    {deleting ? "Siliniyor..." : "🗑️ Sayfayı Sil"}
                </button>
            </div>
        </>
    )
}
