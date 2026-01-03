'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    imageUrl?: string
}

export default function PlantAiPage() {
    const params = useParams()
    const plantId = params.id as string

    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() && !imagePreview) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            imageUrl: imagePreview || undefined,
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setImagePreview(null)
        setIsLoading(true)

        try {
            const res = await fetch(`/api/plants/${plantId}/ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    imageUrl: imagePreview,
                }),
            })

            const data = await res.json()

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.reply || 'Bir hata oluştu.',
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const suggestedQuestions = [
        'Ne sıklıkla sulamalıyım?',
        'Yapraklar neden sararıyor?',
        'Ne kadar güneş istiyor?',
        'Hangi gübre önerirsin?',
    ]

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--color-bg)'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <a
                    href={`/p/${plantId}`}
                    style={{
                        color: 'var(--color-text-muted)',
                        textDecoration: 'none',
                        fontSize: '1.5rem'
                    }}
                >
                    ←
                </a>
                <div>
                    <h1 style={{ fontSize: '1.1rem', margin: 0 }}>🤖 AI Bitki Asistanı</h1>
                    <p style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        color: 'var(--color-text-muted)'
                    }}>
                        Fotoğraf yükle veya soru sor
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌿</div>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                            Merhaba! Bitkin hakkında yardımcı olabilirim.
                        </h2>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            justifyContent: 'center'
                        }}>
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(q)}
                                    style={{
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-sm)',
                                        padding: '8px 12px',
                                        color: 'var(--color-text)',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            }}
                        >
                            <div style={{
                                maxWidth: '80%',
                                padding: '12px 16px',
                                borderRadius: 'var(--radius-md)',
                                background: msg.role === 'user'
                                    ? 'var(--color-primary)'
                                    : 'var(--color-surface)',
                                color: msg.role === 'user' ? '#000' : 'var(--color-text)',
                            }}>
                                {msg.imageUrl && (
                                    <img
                                        src={msg.imageUrl}
                                        alt="Uploaded"
                                        style={{
                                            maxWidth: '200px',
                                            borderRadius: '8px',
                                            marginBottom: '8px'
                                        }}
                                    />
                                )}
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                    {msg.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--color-surface)',
                        }}>
                            <span style={{ animation: 'pulse 1s infinite' }}>💭 Düşünüyorum...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Image Preview */}
            {imagePreview && (
                <div style={{
                    padding: '12px 20px',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                        }}
                    />
                    <button
                        onClick={() => setImagePreview(null)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        ✕ Kaldır
                    </button>
                </div>
            )}

            {/* Input */}
            <form
                onSubmit={handleSubmit}
                style={{
                    padding: '12px 20px 24px',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    gap: '8px'
                }}
            >
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        width: '48px',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                    }}
                >
                    📷
                </button>
                <input
                    type="text"
                    className="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Bitkine sor..."
                    disabled={isLoading}
                    style={{ flex: 1 }}
                />
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading || (!input.trim() && !imagePreview)}
                    style={{ width: '48px', padding: 0 }}
                >
                    ➤
                </button>
            </form>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    )
}
