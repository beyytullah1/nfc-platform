'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../gift-public.module.css'
import { FollowButton } from '@/app/components/FollowButton'

// Music Control Component
function MusicControl({ embed }: { embed: { type: string, src: string } }) {
    const [isPlaying, setIsPlaying] = useState(true)
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <div className={styles.musicControlWrapper}>
            {/* Music Toggle Button */}
            <div className={styles.musicToggle}>
                <button
                    onClick={() => {
                        setIsPlaying(!isPlaying)
                        if (!isPlaying) setIsVisible(true)
                    }}
                    className={`${styles.musicBtn} ${isPlaying ? styles.musicBtnPlaying : ''}`}
                >
                    {isPlaying ? '🎵 Müziği Durdur' : '▶️ Müziği Oynat'}
                </button>
            </div>

            {/* Hidden/Visible Player */}
            <div className={isPlaying ? styles.musicPlayerVisible : styles.musicPlayerHidden}>
                {embed.type === 'spotify' ? (
                    <iframe
                        src={embed.src}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                    ></iframe>
                ) : (
                    <iframe
                        src={`${embed.src}&autoplay=1`}
                        width="100%"
                        height="1" // Hidden but playing
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        title="Music Player"
                    ></iframe>
                )}
            </div>
        </div>
    )
}

interface Gift {
    title: string | null
    message: string | null
    giftType: string
    mediaUrl: string | null
    youtubeUrls: string | null
    musicUrl: string | null
    spotifyUrl: string | null
    isBirthday: boolean
    sender?: { name: string | null } | null
    senderName: string | null
    isClaimed?: boolean
}

interface GiftRevealProps {
    gift: Gift
    tagId?: string
    giftId?: string
    publicCode?: string
}

export function GiftReveal({ gift, tagId, giftId, publicCode }: GiftRevealProps) {
    const [isOpened, setIsOpened] = useState(false)
    const [audio] = useState(typeof Audio !== 'undefined' ? new Audio('/sounds/pop.mp3') : null) // Optional sound
    const router = useRouter()

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

    // Logic for Music Player (Custom music URL, Spotify, or YouTube)
    const getMusicEmbed = () => {
        // 1. Priority: Custom music URL (Pixabay, Mixkit, Bensound)
        if (gift.musicUrl) {
            // Check if it's a YouTube music link
            const ytId = getYouTubeId(gift.musicUrl)
            if (ytId) {
                return {
                    type: 'youtube',
                    src: `https://www.youtube.com/embed/${ytId}?playsinline=1`
                }
            }
            // For other direct audio URLs, we'll use HTML5 audio
            return {
                type: 'audio',
                src: gift.musicUrl
            }
        }

        // 2. Birthday auto-music if no custom music
        if (gift.isBirthday && !gift.musicUrl && !gift.spotifyUrl) {
            // Default birthday song from Pixabay
            return {
                type: 'youtube',
                src: 'https://www.youtube.com/embed/456278?playsinline=1&autoplay=1' // Sample ID, use actual birthday song
            }
        }

        // 3. Fallback to Spotify if provided
        if (gift.spotifyUrl) {
            // Check YouTube first
            const ytId = getYouTubeId(gift.spotifyUrl)
            if (ytId) {
                return {
                    type: 'youtube',
                    src: `https://www.youtube.com/embed/${ytId}?playsinline=1`
                }
            }

            // Then Spotify
            try {
                if (gift.spotifyUrl.includes('spotify.com')) {
                    let embedUrl = gift.spotifyUrl
                    if (!gift.spotifyUrl.includes('/embed/')) {
                        const urlObj = new URL(gift.spotifyUrl)
                        embedUrl = `https://open.spotify.com/embed${urlObj.pathname}`
                    }
                    return { type: 'spotify', src: embedUrl }
                }
            } catch { }
        }

        return null
    }

    const musicEmbed = getMusicEmbed()
    const mediaYoutubeId = getYouTubeId(gift.mediaUrl)

    // Parse YouTube URLs array
    let youtubeVideos: string[] = []
    try {
        if (gift.youtubeUrls) {
            const parsed = JSON.parse(gift.youtubeUrls)
            youtubeVideos = Array.isArray(parsed) ? parsed : []
        }
    } catch {
        youtubeVideos = []
    }
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
                                className={styles.youtubeFrame}
                            />
                        ) : (
                            <img src={gift.mediaUrl} alt="Hediye Medyası" />
                        )}
                    </div>
                )}

                {/* YouTube Videos */}
                {youtubeVideos.length > 0 && (
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {youtubeVideos.map((url, index) => {
                            const videoId = getYouTubeId(url)
                            if (!videoId) return null
                            return (
                                <div key={index} className={styles.mediaContainer}>
                                    <iframe
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className={styles.youtubeFrame}
                                    />
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Music Player */}
                {musicEmbed && musicEmbed.type !== 'audio' && (
                    <MusicControl embed={musicEmbed} />
                )}

                {/* HTML5 Audio Player for direct audio URLs */}
                {musicEmbed && musicEmbed.type === 'audio' && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <audio controls autoPlay loop style={{ width: '100%', maxWidth: '400px' }}>
                            <source src={musicEmbed.src} type="audio/mpeg" />
                            Tarayıcınız bu ses formatını desteklemiyor.
                        </audio>
                    </div>
                )}

                {/* Follow Button */}
                {tagId && gift.isClaimed && (
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <FollowButton tagId={tagId} />
                    </div>
                )}

                {/* Claim Button - Show only for unclaimed gifts */}
                {!gift.isClaimed && (
                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '1px dashed rgba(255,255,255,0.3)'
                        }}>
                            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                🎉 Bu hediyeyi NFC etiketine bağlamak için sahiplen!
                            </p>
                        </div>
                        <button
                            onClick={() => router.push(`/gift/${publicCode || giftId}/claim`)}
                            style={{
                                padding: '1rem 2rem',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            🎁 Bu Hediyeyi Sahiplen
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
