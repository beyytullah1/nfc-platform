"use client"

import { useState, useRef, ChangeEvent } from "react"
import styles from "./cards.module.css"

interface ImageUploadProps {
    label: string
    icon: string
    value: string
    onChange: (url: string) => void
    type: "logo" | "avatar"
}

export default function ImageUpload({ label, icon, value, onChange, type }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState(value)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Önizleme
        const reader = new FileReader()
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string)
        }
        reader.readAsDataURL(file)

        // Yükleme
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("type", type)

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })

            const data = await res.json()
            if (data.url) {
                onChange(data.url)
                setPreviewUrl(data.url)
            } else {
                alert(data.error || "Yükleme hatası")
            }
        } catch (error) {
            console.error("Upload error:", error)
            alert("Dosya yüklenemedi")
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = () => {
        setPreviewUrl("")
        onChange("")
        if (inputRef.current) {
            inputRef.current.value = ""
        }
    }

    return (
        <div className={styles.imageUpload}>
            <label>{icon} {label}</label>

            <div className={styles.uploadArea}>
                {previewUrl ? (
                    <div className={styles.previewContainer}>
                        <img
                            src={previewUrl}
                            alt={label}
                            className={type === "avatar" ? styles.avatarPreview : styles.logoPreview}
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className={styles.removeBtn}
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <div
                        className={styles.dropZone}
                        onClick={() => inputRef.current?.click()}
                    >
                        <span className={styles.uploadIcon}>📤</span>
                        <span>Tıklayın veya sürükleyin</span>
                        <small>JPG, PNG, GIF, WebP - Max 5MB</small>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />
            </div>

            {uploading && (
                <div className={styles.uploadingIndicator}>
                    ⏳ Yükleniyor...
                </div>
            )}
        </div>
    )
}
