"use client"

import { useState } from "react"
import styles from "./dashboard.module.css"

interface MobileMenuProps {
    children: React.ReactNode
}

export function MobileMenuWrapper({ children }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={styles.mobileOnly}>
            <button
                className={styles.menuToggle}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menüyü aç/kapat"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <div
                className={`${styles.overlay} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
            />

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div onClick={() => setIsOpen(false)}>
                    {children}
                </div>
            </aside>
        </div>
    )
}
