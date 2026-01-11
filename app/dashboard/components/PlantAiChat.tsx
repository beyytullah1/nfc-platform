'use client'

import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/app/components/Toast'
import styles from './PlantAiChat.module.css'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    createdAt: Date
}

interface PlantAiChatProps {
    plantId: string
    plantName: string
}

export function PlantAiChat({ plantId, plantName }: PlantAiChatProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const { showToast } = useToast()

    // Fetch chat history on open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            fetchHistory()
        }
    }, [isOpen])

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const fetchHistory = async () => {
        try {
            const res = await fetch(`/api/plants/${plantId}/chat`)
            if (res.ok) {
                const data = await res.json()
                setMessages(data.chats || [])
            }
        } catch (error) {
            console.error('Fetch history error:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage = input.trim()
        setInput('')
        setLoading(true)

        // Add user message immediately
        const tempUserMsg: Message = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: userMessage,
            createdAt: new Date()
        }
        setMessages(prev => [...prev, tempUserMsg])

        try {
            const res = await fetch(`/api/plants/${plantId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            })

            if (res.ok) {
                const data = await res.json()
                const assistantMsg: Message = {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: data.reply,
                    createdAt: new Date()
                }
                setMessages(prev => [...prev, assistantMsg])
            } else {
                showToast('AI yanıt veremedi', 'error')
            }
        } catch (error) {
            console.error('Chat error:', error)
            showToast('Bir hata oluştu', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.toggleButton}
                title="AI Asistan ile Sohbet"
            >
                {isOpen ? '✕' : '🤖'}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className={styles.chatPanel}>
                    <div className={styles.chatHeader}>
                        <div className={styles.headerInfo}>
                            <span className={styles.headerIcon}>🤖</span>
                            <div>
                                <h3>{plantName} Asistanı</h3>
                                <small>Bitki bakımı hakkında soru sorun</small>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>✕</button>
                    </div>

                    <div className={styles.messagesContainer}>
                        {messages.length === 0 && !loading && (
                            <div className={styles.welcomeMessage}>
                                <span>🌱</span>
                                <p>Merhaba! Ben {plantName}'in AI asistanıyım. Bitki bakımı hakkında sorularınızı yanıtlayabilirim.</p>
                                <div className={styles.suggestions}>
                                    <button onClick={() => setInput('Ne zaman sulamalıyım?')}>
                                        💧 Ne zaman sulamalıyım?
                                    </button>
                                    <button onClick={() => setInput('Yapraklar sararsa ne yapmalıyım?')}>
                                        🍂 Yapraklar sararsa?
                                    </button>
                                    <button onClick={() => setInput('Güneş ışığı ihtiyacı ne kadar?')}>
                                        ☀️ Güneş ihtiyacı
                                    </button>
                                </div>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
                            >
                                {msg.role === 'assistant' && <span className={styles.messageIcon}>🤖</span>}
                                <div className={styles.messageContent}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className={`${styles.message} ${styles.assistantMessage}`}>
                                <span className={styles.messageIcon}>🤖</span>
                                <div className={styles.messageContent}>
                                    <span className={styles.typing}>Düşünüyor...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className={styles.inputForm}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Bir soru sorun..."
                            disabled={loading}
                            className={styles.input}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className={styles.sendBtn}
                        >
                            {loading ? '⏳' : '➤'}
                        </button>
                    </form>
                </div>
            )}
        </>
    )
}
