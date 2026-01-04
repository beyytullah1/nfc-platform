"use client"

import { useRef, useEffect } from "react"
import { useToast } from "@/app/components/Toast"
import { QRCodeSVG } from "qrcode.react"
import styles from "./qrcode-modal.module.css"

interface QRCodeModalProps {
    url: string
    title: string
    isOpen: boolean
    onClose: () => void
}

export function QRCodeModal({ url, title, isOpen, onClose }: QRCodeModalProps) {
    const { showToast } = useToast()
    const qrRef = useRef<HTMLDivElement>(null)

    // Escape key handler
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    const handleDownload = () => {
        const svg = qrRef.current?.querySelector("svg")
        if (!svg) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.onload = () => {
            canvas.width = 300
            canvas.height = 300
            ctx?.drawImage(img, 0, 0, 300, 300)

            const pngUrl = canvas.toDataURL("image/png")
            const link = document.createElement("a")
            link.download = `${title.replace(/\s+/g, "-")}-qr.png`
            link.href = pngUrl
            link.click()
        }

        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    }

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(url)
        showToast("Link kopyalandı!", "success")
    }

    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>

                <h2 className={styles.title}>QR Kod</h2>
                <p className={styles.subtitle}>{title}</p>

                <div className={styles.qrContainer} ref={qrRef}>
                    <QRCodeSVG
                        value={url}
                        size={200}
                        level="H"
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#000000"
                    />
                </div>

                <p className={styles.urlText}>{url}</p>

                <div className={styles.actions}>
                    <button className={styles.downloadBtn} onClick={handleDownload}>
                        📥 PNG İndir
                    </button>
                    <button className={styles.copyBtn} onClick={handleCopyLink}>
                        📋 Link Kopyala
                    </button>
                </div>
            </div>
        </div>
    )
}
