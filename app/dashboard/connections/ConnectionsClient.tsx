'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/app/components/Toast'
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
        avatarUrl: string | null
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

interface Follow {
    id: string
    tag: {
        id: string
        publicCode: string
        plant?: { id: string; name: string; species?: string; coverImageUrl?: string } | null
        mug?: { id: string; name: string } | null
        page?: { id: string; title: string } | null
        card?: { id: string; title: string; slug: string } | null
    }
}

export function ConnectionsClient({
    connections: initialConnections,
    categories,
    follows
}: {
    connections: Connection[]
    categories: Category[]
    follows: Follow[]
}) {
    const { showToast } = useToast()
    const [connections, setConnections] = useState(initialConnections)
    const [activeTab, setActiveTab] = useState<'people' | 'plants' | 'mugs'>('people') // TAB SİSTEMİ
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all')
    const [removingId, setRemovingId] = useState<string | null>(null)
    const [showNewGroupModal, setShowNewGroupModal] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupIcon, setNewGroupIcon] = useState('📁')
    const [selectedContact, setSelectedContact] = useState<Connection | null>(null)
    const [editingContact, setEditingContact] = useState<string | null>(null)
    const [editNote, setEditNote] = useState('')
    const [editTags, setEditTags] = useState('')

    // Arama ve kategori filtresi
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

        const matchesSearch = name.includes(searchLower) ||
            email.includes(searchLower) ||
            tags.includes(searchLower) ||
            note.includes(searchLower)

        const matchesCategory = selectedCategoryFilter === 'all' ||
            (selectedCategoryFilter === 'uncategorized' && !conn.category) ||
            conn.category?.id === selectedCategoryFilter

        return matchesSearch && matchesCategory
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
            showToast('Grup adı boş olamaz', 'error')
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
                showToast(data.error || 'Grup oluşturulmadı', 'error')
            }
        } catch (err) {
            console.error('Create group error:', err)
            showToast('Bir hata oluştu', 'error')
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
                showToast('Grup güncellenemedi', 'error')
            }
        } catch (err) {
            showToast('Bir hata oluştu', 'error')
        }
    }

    const handleSaveEdit = async () => {
        if (!editingContact) return

        try {
            const tagsArray = editTags
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0)

            const res = await fetch(`/api/connections/${editingContact}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    myNote: editNote || null,
                    myTags: tagsArray.length > 0 ? JSON.stringify(tagsArray) : null
                })
            })

            if (res.ok) {
                showToast('Başarıyla güncellendi', 'success')
                setEditingContact(null)
                window.location.reload()
            } else {
                showToast('Güncelleme başarısız', 'error')
            }
        } catch (err) {
            showToast('Bir hata oluştu', 'error')
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
                showToast('Silme işlemi başarısız oldu', 'error')
            }
        } catch (error) {
            console.error('Remove error:', error)
            showToast('Bir hata oluştu', 'error')
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

            {/* TABS */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
                <button
                    onClick={() => setActiveTab('people')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        background: activeTab === 'people' ? '#3b82f6' : 'transparent',
                        color: activeTab === 'people' ? 'white' : '#94a3b8',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'people' ? 'bold' : 'normal'
                    }}
                >
                    👥 Kişiler ({connections.length})
                </button>
                <button
                    onClick={() => setActiveTab('plants')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        background: activeTab === 'plants' ? '#22c55e' : 'transparent',
                        color: activeTab === 'plants' ? 'white' : '#94a3b8',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'plants' ? 'bold' : 'normal'
                    }}
                >
                    🪴 Bitkiler ({follows.filter(f => f.tag.plant).length})
                </button>
                <button
                    onClick={() => setActiveTab('mugs')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        background: activeTab === 'mugs' ? '#f59e0b' : 'transparent',
                        color: activeTab === 'mugs' ? 'white' : '#94a3b8',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'mugs' ? 'bold' : 'normal'
                    }}
                >
                    ☕ Kupalar ({follows.filter(f => f.tag.mug).length})
                </button>
            </div>

            {/* Filters (Sadece Kişiler sekmesinde göster) */}
            {activeTab === 'people' && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {/* Category Filter */}
                    <select
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        style={{
                            padding: '1rem',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '0.75rem',
                            color: '#fff',
                            fontSize: '1rem',
                            minWidth: '200px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">📁 Tüm Kategoriler ({connections.length})</option>
                        <option value="uncategorized">📂 Gruplandırılmamış ({connections.filter(c => !c.category).length})</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name} ({connections.filter(c => c.category?.id === cat.id).length})
                            </option>
                        ))}
                    </select>

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="🔍 İsim, email, etiket veya not ile ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: '300px',
                            padding: '1rem',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '0.75rem',
                            color: '#fff',
                            fontSize: '1rem'
                        }}
                    />
                </div>

            )}

            {/* PEOPLE CONTENT */}
            {activeTab === 'people' && (
                connections.length === 0 ? (
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
                                                    {/* Sağ Üst - Grup Dropdown, Düzenle ve Sil Butonu */}
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
                                                                // Populate edit fields
                                                                const tags = (() => {
                                                                    try {
                                                                        const parsed = JSON.parse(conn.myTags || '[]')
                                                                        return Array.isArray(parsed) ? parsed.join(', ') : ''
                                                                    } catch {
                                                                        return ''
                                                                    }
                                                                })()
                                                                setEditNote(conn.myNote || '')
                                                                setEditTags(tags)
                                                                setEditingContact(conn.id)
                                                            }}
                                                            title="Düzenle"
                                                            style={{
                                                                padding: '0.25rem 0.5rem',
                                                                background: 'rgba(59, 130, 246, 0.15)',
                                                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                                                borderRadius: '0.5rem',
                                                                color: '#93c5fd',
                                                                fontSize: '0.75rem',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            🖊️
                                                        </button>
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

                                                    {/* Avatar */}
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                        {conn.card.avatarUrl ? (
                                                            <img
                                                                src={conn.card.avatarUrl}
                                                                alt={conn.friend.name || 'Avatar'}
                                                                style={{
                                                                    width: '48px',
                                                                    height: '48px',
                                                                    borderRadius: '50%',
                                                                    marginRight: '1rem',
                                                                    objectFit: 'cover',
                                                                    border: '2px solid rgba(255,255,255,0.1)',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    const slug = conn.card.slug || conn.card.id
                                                                    window.open(`/${slug}`, '_blank')
                                                                }}
                                                            />
                                                        ) : (
                                                            <div
                                                                style={{
                                                                    width: '48px',
                                                                    height: '48px',
                                                                    borderRadius: '50%',
                                                                    marginRight: '1rem',
                                                                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: 'white',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '1.2rem',
                                                                    border: '2px solid rgba(255,255,255,0.1)',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    const slug = conn.card.slug || conn.card.id
                                                                    window.open(`/${slug}`, '_blank')
                                                                }}
                                                            >
                                                                {(conn.friend.name || '?').charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                                                            {conn.friend.name || 'İsimsiz'}
                                                        </h3>
                                                    </div>
                                                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.75rem', height: '1.4em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {conn.card.title || `@${conn.friend.email?.split('@')[0]}`}
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

                                        {/* Yeni Grup Modal */}
                                        {
                                            showNewGroupModal && (
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
                                            )
                                        }

                                        {/* Contact Detail Popup */}
                                        {
                                            selectedContact && (
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
                                                            {selectedContact.card.avatarUrl && (
                                                                <img
                                                                    src={selectedContact.card.avatarUrl}
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

                                                            {/* Etiketler */}
                                                            {(() => {
                                                                try {
                                                                    const tags = selectedContact.myTags ? JSON.parse(selectedContact.myTags) : []
                                                                    if (Array.isArray(tags) && tags.length > 0) {
                                                                        return (
                                                                            <div style={{
                                                                                padding: '0.75rem',
                                                                                background: '#0f172a',
                                                                                borderRadius: '0.5rem'
                                                                            }}>
                                                                                <div style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '0.5rem' }}>🏷️ Etiketler</div>
                                                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                                    {tags.map((tag: string, idx: number) => (
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
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    }
                                                                } catch {
                                                                    return null
                                                                }
                                                                return null
                                                            })()}
                                                        </div>

                                                        {/* Butonlar */}
                                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                            <button
                                                                onClick={() => {
                                                                    const slug = selectedContact.card.slug || selectedContact.card.id
                                                                    window.open(`/${slug}`, '_blank')
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
                                            )
                                        }

                                        {/* Edit Modal */}
                                        {editingContact && (() => {
                                            const conn = connections.find(c => c.id === editingContact)
                                            if (!conn) return null

                                            return (
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
                                                }} onClick={() => setEditingContact(null)}>
                                                    <div style={{
                                                        background: '#1e293b',
                                                        borderRadius: '1rem',
                                                        padding: '2rem',
                                                        maxWidth: '500px',
                                                        width: '100%'
                                                    }} onClick={(e) => e.stopPropagation()}>
                                                        <h2 style={{ color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            🖊️ Düzenle - {conn.friend.name || 'İsimsiz'}
                                                        </h2>

                                                        {/* Not */}
                                                        <div style={{ marginBottom: '1.5rem' }}>
                                                            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                                💭 Notum
                                                            </label>
                                                            <textarea
                                                                value={editNote}
                                                                onChange={(e) => setEditNote(e.target.value)}
                                                                placeholder="Bu kişi hakkında notlarınız..."
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '0.75rem',
                                                                    background: '#0f172a',
                                                                    border: '1px solid #334155',
                                                                    borderRadius: '0.5rem',
                                                                    color: '#fff',
                                                                    fontSize: '0.9rem',
                                                                    minHeight: '100px',
                                                                    resize: 'vertical'
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Etiketler */}
                                                        <div style={{ marginBottom: '1.5rem' }}>
                                                            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                                🏷️ Etiketler (virgülle ayırın)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={editTags}
                                                                onChange={(e) => setEditTags(e.target.value)}
                                                                placeholder="örn: arkadaş, iş, önemli"
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '0.75rem',
                                                                    background: '#0f172a',
                                                                    border: '1px solid #334155',
                                                                    borderRadius: '0.5rem',
                                                                    color: '#fff',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Butonlar */}
                                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                            <button
                                                                onClick={() => setEditingContact(null)}
                                                                style={{
                                                                    flex: 1,
                                                                    padding: '0.75rem',
                                                                    background: 'rgba(71, 85, 105, 0.5)',
                                                                    border: '1px solid #334155',
                                                                    borderRadius: '0.5rem',
                                                                    color: '#94a3b8',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                İptal
                                                            </button>
                                                            <button
                                                                onClick={handleSaveEdit}
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
                                                                💾 Kaydet
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })()}
                                    </div>
                                </div>
                            )
                        })}
                    </>
                )
            )}

            {/* Plants Tab */}
            {activeTab === 'plants' && (
                follows.filter(f => f.tag.plant).length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: '#1e293b',
                        borderRadius: '1rem',
                        border: '1px solid #334155'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🪴</div>
                        <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Henüz bitki takip etmiyorsunuz</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                            Bitki sayfalarından "Takip Et" butonuna tıklayarak bitkileri takip edebilirsiniz.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1rem'
                    }}>
                        {follows.filter(f => f.tag.plant).map((follow) => {
                            const plant = follow.tag.plant!
                            return (
                                <div
                                    key={follow.id}
                                    style={{
                                        background: '#1e293b',
                                        padding: '1.25rem',
                                        borderRadius: '1rem',
                                        border: '1px solid #334155',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => window.location.href = `/p/${plant.id}`}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#22c55e'
                                        e.currentTarget.style.transform = 'translateY(-2px)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#334155'
                                        e.currentTarget.style.transform = 'translateY(0)'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        {plant.coverImageUrl ? (
                                            <img
                                                src={plant.coverImageUrl}
                                                alt={plant.name}
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    objectFit: 'cover',
                                                    borderRadius: '1rem'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                fontSize: '3rem',
                                                width: '60px',
                                                height: '60px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                borderRadius: '1rem'
                                            }}>
                                                🌱
                                            </div>
                                        )}

                                        <div style={{ flex: 1 }}>
                                            <h3 style={{
                                                color: '#fff',
                                                margin: 0,
                                                marginBottom: '0.25rem',
                                                fontSize: '1.1rem',
                                                fontWeight: '600'
                                            }}>
                                                {plant.name}
                                            </h3>
                                            <p style={{
                                                color: '#94a3b8',
                                                fontSize: '0.9rem',
                                                margin: 0
                                            }}>
                                                {plant.species || 'Bitki'}
                                            </p>
                                            <div style={{
                                                color: '#64748b',
                                                fontSize: '0.75rem',
                                                marginTop: '0.5rem'
                                            }}>
                                                🪴 Takip Ediliyor
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            )}

            {/* Mugs Tab */}
            {activeTab === 'mugs' && (
                follows.filter(f => f.tag.mug).length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: '#1e293b',
                        borderRadius: '1rem',
                        border: '1px solid #334155'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
                        <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Henüz kupa takip etmiyorsunuz</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                            Kupa sayfalarından "Takip Et" butonuna tıklayarak kupaları takip edebilirsiniz.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1rem'
                    }}>
                        {follows.filter(f => f.tag.mug).map((follow) => {
                            const mug = follow.tag.mug!
                            return (
                                <div
                                    key={follow.id}
                                    style={{
                                        background: '#1e293b',
                                        padding: '1.25rem',
                                        borderRadius: '1rem',
                                        border: '1px solid #334155',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => window.location.href = `/mug/${mug.id}`}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#f59e0b'
                                        e.currentTarget.style.transform = 'translateY(-2px)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#334155'
                                        e.currentTarget.style.transform = 'translateY(0)'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{
                                            fontSize: '3rem',
                                            width: '60px',
                                            height: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                            borderRadius: '1rem'
                                        }}>
                                            ☕
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <h3 style={{
                                                color: '#fff',
                                                margin: 0,
                                                marginBottom: '0.25rem',
                                                fontSize: '1.1rem',
                                                fontWeight: '600'
                                            }}>
                                                {mug.name}
                                            </h3>
                                            <p style={{
                                                color: '#94a3b8',
                                                fontSize: '0.9rem',
                                                margin: 0
                                            }}>
                                                Kahve Kupası
                                            </p>
                                            <div style={{
                                                color: '#64748b',
                                                fontSize: '0.75rem',
                                                marginTop: '0.5rem'
                                            }}>
                                                ☕ Takip Ediliyor
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            )}
        </div>
    )
}
