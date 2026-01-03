'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface ConnectButtonProps {
    cardUserId: string
    isConnected: boolean
}

export default function ConnectButton({ cardUserId, isConnected }: ConnectButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showNote, setShowNote] = useState(false)
    const [meetingNote, setMeetingNote] = useState('')
    const [connected, setConnected] = useState(isConnected)
    const [sent, setSent] = useState(false)

    const handleConnect = async () => {
        startTransition(async () => {
            const res = await fetch('/api/connections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    friendId: cardUserId,
                    meetingNote: meetingNote || undefined,
                }),
            })

            if (res.ok) {
                setSent(true)
                setShowNote(false)
            }
        })
    }

    if (connected) {
        return (
            <div
                className="btn"
                style={{
                    background: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-primary)',
                    color: 'var(--color-primary)',
                    pointerEvents: 'none'
                }}
            >
                <span style={{ marginRight: '8px' }}>✓</span>
                Bağlantınız
            </div>
        )
    }

    if (sent) {
        return (
            <div
                className="btn"
                style={{
                    background: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-accent)',
                    color: 'var(--color-accent)',
                    pointerEvents: 'none'
                }}
            >
                <span style={{ marginRight: '8px' }}>📤</span>
                İstek Gönderildi
            </div>
        )
    }

    if (showNote) {
        return (
            <div className="card">
                <div style={{ marginBottom: '12px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.9rem'
                    }}>
                        Nerede tanıştınız? (opsiyonel)
                    </label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Örn: Bilişim Zirvesi 2024"
                        value={meetingNote}
                        onChange={(e) => setMeetingNote(e.target.value)}
                        autoFocus
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn"
                        onClick={() => setShowNote(false)}
                        style={{
                            background: 'var(--color-surface-hover)',
                            border: '1px solid var(--color-border)',
                        }}
                    >
                        İptal
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleConnect}
                        disabled={isPending}
                    >
                        {isPending ? 'Gönderiliyor...' : 'İstek Gönder'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button
                className="btn btn-primary"
                onClick={() => setShowNote(true)}
                style={{ flex: 1 }}
            >
                <span style={{ marginRight: '8px' }}>🤝</span>
                Bağlantı Kur
            </button>
        </div>
    )
}
