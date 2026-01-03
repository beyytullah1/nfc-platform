'use client'

import { useState, useEffect } from 'react'
import styles from '../gift-public.module.css'

interface Gift {
    title: string | null
    message: string | null
    giftType: string
    mediaUrl: string | null
    spotifyUrl: string | null
    sender?: { name: string | null } | null
    senderName: string | null
}

export function GiftReveal({ gift }: { gift: Gift }) {
    const [isOpened, setIsOpened] = useState(false)
    const [audio] = useState(typeof Audio !== 'undefined' ? new Audio('/sounds/pop.mp3') : null) // Optional sound

    const triggerConfetti = () => {
        const colors = ['#ec4899', '#8b5cf6', '#eab308', '#22c55e', '#3b82f6']
        const container = document.body

        for (let i = 0; i < 50; i++) {
            const el = document.createElement('div')
            el.className = styles.confetti
            el.style.left = Math.random() * 100 + 'vw'
            el.style.top = '-10px'
            el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
            el.style.animationDuration = (Math.random() * 2 + 2) + 's'
            el.style.animationDelay = (Math.random() * 0.5) + 's'
            container.appendChild(el)

            setTimeout(() => el.remove(), 4000)
        }
    }

    const handleOpen = () => {
        setIsOpened(true)
        triggerConfetti()
        // audio?.play().catch(() => {}) 
    }

    // Common Helper for extracting YouTube ID
    const getYouTubeId = (url: string | null) => {
        if (!url) return null
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url.match(regExp)
        return (match && match[2].length === 11) ? match[2] : null
    }

    // Logic for Music Player (Spotify or YouTube)
    const getMusicEmbed = (url: string | null) => {
        if (!url) return null

        // 1. Check YouTube
        const ytId = getYouTubeId(url)
        if (ytId) {
            return {
                type: 'youtube',
                src: `https://www.youtube.com/embed/${ytId}?playsinline=1`
            }
        }

        // 2. Check Spotify
        try {
            if (url.includes('spotify.com')) {
                let embedUrl = url
                if (!url.includes('/embed/')) {
                    const urlObj = new URL(url)
                    embedUrl = `https://open.spotify.com/embed${urlObj.pathname}`
                }
                return { type: 'spotify', src: embedUrl }
            }
        } catch { }

        return null
    }

    const musicEmbed = getMusicEmbed(gift.spotifyUrl)
    const mediaYoutubeId = getYouTubeId(gift.mediaUrl)
    const sender = gift.senderName || gift.sender?.name

    if (!isOpened) {
        return (
            <div className={`${styles.container} ${styles[`theme-${gift.giftType}`]}`}>
                <div className={styles.background}></div>

                <div className={styles.giftBoxContainer} onClick={handleOpen}>
                    <div className={styles.giftEmoji}>🎁</div>
                    <div className={styles.tapText}>Hediyeni Açmak İçin Dokun</div>
                </div>

                {sender && (
                    <div className={styles.senderInfo} style={{ marginTop: '2rem' }}>
                        <div className={styles.avatar}>
                            {sender.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.senderName}>
                            <strong>{sender}</strong> sana bir hediye gönderdi
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={`${styles.container} ${styles[`theme-${gift.giftType}`]}`}>
            <div className={styles.background}></div>

            <div className={styles.content}>
                {sender && (
                    <div className={styles.senderInfo}>
                        <div className={styles.avatar}>
                            {sender.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.senderName}>
                            Gönderen: <strong>{sender}</strong>
                        </div>
                    </div>
                )}

                <h1 className={styles.title}>{gift.title || 'Sürpriz!'}</h1>

                <div className={styles.messageCard}>
                    <p className={styles.message}>{gift.message}</p>
                </div>

                {/* Main Media Display */}
                {gift.mediaUrl && (
                    <div className={styles.mediaContainer}>
                        {mediaYoutubeId ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${mediaYoutubeId}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ width: '100%', height: '100%', minHeight: '300px', border: 'none' }}
                            />
                        ) : (
                            <img src={gift.mediaUrl} alt="Hediye Medyası" />
                        )}
                    </div>
                )}

                {/* Music Player */}
                {musicEmbed && (
                    <div className={styles.spotifyContainer}>
                        {musicEmbed.type === 'spotify' ? (
                            <iframe
                                src={musicEmbed.src}
                                width="100%"
                                height="152"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                            ></iframe>
                        ) : (
                            // YouTube Music Mode (Small Height)
                            <iframe
                                src={musicEmbed.src}
                                width="100%"
                                height="80" // Smaller height for audio-like experience
                                frameBorder="0"
                                allow="autoplay; encrypted-media"
                                title="Music Player"
                            ></iframe>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
