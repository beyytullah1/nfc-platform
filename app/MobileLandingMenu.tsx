"use client"

import { useState } from "react"
import Link from "next/link"
import styles from "./landing.module.css"

interface MobileLandingMenuProps {
    isLoggedIn: boolean
}

export default function MobileLandingMenu({ isLoggedIn }: MobileLandingMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                className={styles.mobileMenuBtn}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menüyü aç/kapat"
            >
                <span className={`${styles.hamburger} ${isOpen ? styles.open : ''}`}>
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </button>

            {isOpen && (
                <div className={styles.mobileMenuOverlay} onClick={() => setIsOpen(false)} />
            )}

            <div className={`${styles.mobileMenu} ${isOpen ? styles.mobileMenuOpen : ''}`}>
                <nav className={styles.mobileMenuNav}>
                    {isLoggedIn ? (
                        <Link
                            href="/dashboard"
                            className={styles.mobileMenuLink}
                            onClick={() => setIsOpen(false)}
                        >
                            🏠 Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className={styles.mobileMenuLink}
                                onClick={() => setIsOpen(false)}
                            >
                                🔑 Giriş Yap
                            </Link>
                            <Link
                                href="/register"
                                className={`${styles.mobileMenuLink} ${styles.mobileMenuPrimary}`}
                                onClick={() => setIsOpen(false)}
                            >
                                🚀 Ücretsiz Başla
                            </Link>
                        </>
                    )}
                    <Link
                        href="#features"
                        className={styles.mobileMenuLink}
                        onClick={() => setIsOpen(false)}
                    >
                        ✨ Özellikler
                    </Link>
                </nav>
            </div>
        </>
    )
}
