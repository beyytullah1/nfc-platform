'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Connection {
    id: string
    friendId: string
    cardId: string // YENİ
    myNote: string | null
    myTags: string | null
    createdAt: string
    friend: {
        id: string
        name: string | null
        email: string | null
        avatarUrl: string | null
    }
    card: { // YENİ - Direkt kart bilgisi
        id: string
        slug: string | null  // Profile Git için
        title: string | null
        fields: { value: string }[]
    }
    category: {
        id: string
        name: string
        icon: string | null
        color: string
    } | null
}

interface Category {
    id: string
    name: string
    icon: string | null
    color: string
}

export function ConnectionsClient({
    connections: initialConnections,
    categories
}: {
    connections: Connection[]
    categories: Category[]
}) {
    const [connections, setConnections] = useState(initialConnections)
    const [searchQuery, setSearchQuery] = useState('')
    const [removingId, setRemovingId] = useState<string | null>(null)
    const [showNewGroupModal, setShowNewGroupModal] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupIcon, setNewGroupIcon] = useState('📁')
    const [selectedContact, setSelectedContact] = useState<Connection | null>(null)
    const [editingContact, setEditingContact] = useState<string | null>(null)

    // Arama filtresi
    const filteredConnections = connections.filter(conn => {
        const searchLower = searchQuery.toLowerCase()
        const name = conn.friend.name?.toLowerCase() || ''
        const email = conn.friend.email?.toLowerCase() || ''

        // myTags güvenli parse
        let tags = ''
        if (conn.myTags) {
            try {
                const parsed = JSON.parse(conn.myTags)
                tags = Array.isArray(parsed) ? parsed.join(' ').toLowerCase() : ''
            } catch {
                tags = ''
            }
        }

        const note = conn.myNote?.toLowerCase() || ''

        return name.includes(searchLower) ||
            email.includes(searchLower) ||
            tags.includes(searchLower) ||
            note.includes(searchLower)
    })

    // Gruplara göre ayır
    const grouped = filteredConnections.reduce((acc, conn) => {
        const groupName = conn.category?.name || 'Gruplandırılmamış'
        if (!acc[groupName]) acc[groupName] = []
        acc[groupName].push(conn)
        return acc
    }, {} as Record<string, Connection[]>)

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            alert('Grup adı boş olamaz')
            return
        }

        try {
            const res = await fetch('/api/connections/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newGroupName,
                    icon: newGroupIcon
                })
            })

            if (res.ok) {
                setNewGroupName('')
                setNewGroupIcon('📁')
                setShowNewGroupModal(false)
                window.location.reload()
            } else {
                const data = await res.json()
                alert(data.error || 'Grup oluşturulamadı')
            }
        } catch (err) {
            console.error('Create group error:', err)
            alert('Bir hata oluştu')
        }
    }

    const handleUpdateGroup = async (connectionId: string, categoryId: string | null) => {
        try {
            const res = await fetch(`/api/connections/${connectionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryId })
            })

            if (res.ok) {
                window.location.reload()
            } else {
                alert('Grup güncellenemedi')
            }
        } catch (err) {
            alert('Bir hata oluştu')
        }
    }

    const handleRemove = async (connectionId: string) => {
        if (!confirm('Bu kişiyi ağınızdan çıkarmak istediğinize emin misiniz?')) {
            return
        }

        setRemovingId(connectionId)
        try {
            const res = await fetch('/api/connections/remove', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId })
            })

            if (res.ok) {
                setConnections(prev => prev.filter(c => c.id !== connectionId))
            } else {
                alert('Silme işlemi başarısız oldu')
            }
        } catch (error) {
            console.error('Remove error:', error)
            alert('Bir hata oluştu')
        } finally {
            setRemovingId(null)
        }
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '2rem',
                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    👥 İletişim Ağım
                </h1>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                    {filteredConnections.length} kişi
                </div>
            </div>

            {/* Arama */}
            <div style={{ marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="🔍 İsim, email, etiket veya not ile ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '1rem'
                    }}
                />
            </div>

            {connections.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: '#1e293b',
                    borderRadius: '1rem',
                    border: '1px solid #334155'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Henüz kimse yok</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                        Kartvizitlerden "İletişim Ağına Ekle" butonuna tıklayarak kişi ekleyebilirsiniz.
                    </p>
                </div>
            ) : (
                <>
                    {/* Gruplar */}
                    {Object.entries(grouped).map(([groupName, items]) => {
                        const category = items[0]?.category

                        return (
                            <div key={groupName} style={{ marginBottom: '2.5rem' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1rem'
                                }}>
                                    <h2 style={{
                                        fontSize: '1.2rem',
                                        color: '#e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        {category?.icon || '📂'} {groupName}
                                        <span style={{
                                            color: '#94a3b8',
                                            fontSize: '0.9rem',
                                            fontWeight: 'normal'
                                        }}>
                                            ({items.length})
                                        </span>
                                    </h2>

                                    {groupName === 'Gruplandırılmamış' && (
                                        <button
                                            onClick={() => setShowNewGroupModal(true)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'rgba(59, 130, 246, 0.15)',
                                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                                borderRadius: '0.5rem',
                                                color: '#93c5fd',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            ➕ Grup Ekle
                                        </button>
                                    )}
                                </div>

                                {/* Grid Layout */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    {items.map((conn) => {
                                        // myTags güvenli parse
                                        let tags: string[] = []
                                        if (conn.myTags) {
                                            try {
                                                const parsed = JSON.parse(conn.myTags)
                                                tags = Array.isArray(parsed) ? parsed : []
                                            } catch {
                                                tags = []
                                            }
                                        }

                                        return (
                                            <div key={conn.id} style={{
                                                background: '#1e293b',
                                                padding: '1.25rem',
                                                borderRadius: '1rem',
                                                border: '1px solid #334155',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer',
                                                position: 'relative'
                                            }}
                                                onClick={() => setSelectedContact(conn)}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = '#3b82f6'
                                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#334155'
                                                    e.currentTarget.style.transform = 'translateY(0)'
                                                }}
                                            >
                                                {/* Sağ Üst - Grup Dropdown ve Sil Butonu */}
                                                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <select
                                                        value={conn.category?.id || ''}
                                                        onChange={(e) => {
                                                            e.stopPropagation()
                                                            handleUpdateGroup(conn.id, e.target.value || null)
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            background: '#0f172a',
                                                            border: '1px solid #334155',
                                                            borderRadius: '0.5rem',
                                                            color: '#94a3b8',
                                                            fontSize: '0.75rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <option value="">Grup Yok</option>
                                                        {categories.map(cat => (
                                                            <option key={cat.id} value={cat.id}>
                                                                {cat.icon} {cat.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleRemove(conn.id)
                                                        }}
                                                        disabled={removingId === conn.id}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            background: 'rgba(239, 68, 68, 0.15)',
                                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                                            borderRadius: '0.5rem',
                                                            color: '#fca5a5',
                                                            fontSize: '0.75rem',
                                                            cursor: removingId === conn.id ? 'not-allowed' : 'pointer'
                                                        }}
                                                    >
                                                        {removingId === conn.id ? '⏳' : '🗑️'}
                                                    </button>
                                                </div>

                                                <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1rem' }}>
                                                    {conn.friend.name || 'İsimsiz'}
                                                </h3>
                                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                                    {conn.friend.email}
                                                </p>

                                                {conn.myNote && (
                                                    <p style={{
                                                        color: '#cbd5e1',
                                                        fontSize: '0.8rem',
                                                        marginBottom: '0.75rem',
                                                        padding: '0.5rem',
                                                        background: 'rgba(71, 85, 105, 0.3)',
                                                        borderRadius: '0.5rem',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        💭 {conn.myNote}
                                                    </p>
                                                )}

                                                {tags.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                                        {tags.slice(0, 3).map((tag: string, idx: number) => (
                                                            <span key={idx} style={{
                                                                padding: '0.25rem 0.5rem',
                                                                background: 'rgba(99, 102, 241, 0.15)',
                                                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                                                borderRadius: '0.5rem',
                                                                color: '#a5b4fc',
                                                                fontSize: '0.75rem'
                                                            }}>
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                        {tags.length > 3 && (
                                                            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                                                +{tags.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <div style={{
                                                    color: '#64748b',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    {new Date(conn.createdAt).toLocaleDateString('tr-TR')}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </>
            )}

            {/* Yeni Grup Modal */}
            {showNewGroupModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setShowNewGroupModal(false)}>
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '1rem',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '100%'
                    }} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>
                            Yeni Grup Oluştur
                        </h2>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                                Grup Adı
                            </label>
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                placeholder="Örn: İş Arkadaşları"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '0.5rem',
                                    color: '#fff'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                                İkon (Emoji)
                            </label>
                            <input
                                type="text"
                                value={newGroupIcon}
                                onChange={(e) => setNewGroupIcon(e.target.value)}
                                placeholder="📁"
                                maxLength={2}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '0.5rem',
                                    color: '#fff',
                                    fontSize: '1.5rem',
                                    textAlign: 'center'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowNewGroupModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'transparent',
                                    border: '1px solid #334155',
                                    borderRadius: '0.5rem',
                                    color: '#94a3b8',
                                    cursor: 'pointer'
                                }}
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleCreateGroup}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: '#fff',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Oluştur
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Detail Popup */}
            {selectedContact && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setSelectedContact(null)}>
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '1rem',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '100%'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            {selectedContact.friend.avatarUrl && (
                                <img
                                    src={selectedContact.friend.avatarUrl}
                                    alt="Avatar"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        marginBottom: '1rem'
                                    }}
                                />
                            )}
                            <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                {selectedContact.friend.name || 'İsimsiz'}
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                {selectedContact.friend.email}
                            </p>
                        </div>

                        {/* Basit Bilgiler */}
                        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {/* Telefon - VARSA GÖSTER */}
                            {selectedContact.card?.fields?.[0]?.value && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem',
                                    background: '#0f172a',
                                    borderRadius: '0.5rem'
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>📞</span>
                                    <div>
                                        <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Telefon</div>
                                        <a
                                            href={`tel:${selectedContact.card.fields[0].value}`}
                                            style={{ color: '#fff', fontSize: '0.9rem', textDecoration: 'none' }}
                                        >
                                            {selectedContact.card.fields[0].value}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Grup */}
                            {selectedContact.category && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem',
                                    background: '#0f172a',
                                    borderRadius: '0.5rem'
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>{selectedContact.category.icon}</span>
                                    <div>
                                        <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Grup</div>
                                        <div style={{ color: '#fff', fontSize: '0.9rem' }}>{selectedContact.category.name}</div>
                                    </div>
                                </div>
                            )}

                            {/* Not */}
                            {selectedContact.myNote && (
                                <div style={{
                                    padding: '0.75rem',
                                    background: '#0f172a',
                                    borderRadius: '0.5rem'
                                }}>
                                    <div style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '0.25rem' }}>💭 Notum</div>
                                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{selectedContact.myNote}</div>
                                </div>
                            )}
                        </div>

                        {/* Butonlar */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => {
                                    const slug = selectedContact.card.slug || selectedContact.card.id
                                    window.open(`/c/${slug}`, '_blank')
                                }}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: '0.5rem',
                                    color: '#93c5fd',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                👤 Profile Git
                            </button>
                            <button
                                onClick={() => setSelectedContact(null)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: '#fff',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
