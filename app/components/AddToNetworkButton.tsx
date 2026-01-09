'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/app/components/Toast'
import { useRouter } from 'next/navigation'

interface AddToNetworkButtonProps {
    cardId: string
    cardOwnerId: string
    cardOwnerName: string
    onSuccess?: () => void
}

interface Category {
    id: string
    name: string
    icon: string | null
}

export function AddToNetworkButton({ cardId, cardOwnerId, cardOwnerName }: AddToNetworkButtonProps) {
    const { showToast } = useToast()
    const [status, setStatus] = useState<'idle' | 'added' | 'loading'>('idle')
    const [showModal, setShowModal] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [showNewGroupForm, setShowNewGroupForm] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupIcon, setNewGroupIcon] = useState('📁')
    const [tags, setTags] = useState('')
    const [note, setNote] = useState('')
    const router = useRouter()

    useEffect(() => {
        checkIfAdded()
        fetchCategories()
    }, [cardId])

    const checkIfAdded = async () => {
        try {
            const res = await fetch(`/api/connections/check?cardId=${cardId}`)
            const data = await res.json()
            if (data.exists) {
                setStatus('added')
            }
        } catch (error) {
            console.error('Check connection error:', error)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/connections/groups')
            const data = await res.json()
            setCategories(data.categories || [])
        } catch (error) {
            console.error('Fetch categories error:', error)
        }
    }

    const handleAddClick = () => {
        if (status === 'added') {
            // Navigate to card profile (middleware will handle slug lookup)
            router.push(`/c/${cardId}`)
        } else {
            // Modal aç
            setShowModal(true)
        }
    }

    const handleAdd = async () => {
        setStatus('loading')

        try {
            const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t)

            // Validation
            if (tagsArray.length > 10) {
                showToast('En fazla 10 etiket ekleyebilirsiniz', 'error')
                setStatus('idle')
                return
            }

            if (note.length > 500) {
                showToast('Not en fazla 500 karakter olabilir', 'error')
                setStatus('idle')
                return
            }

            // Yeni grup oluşturma
            let finalCategoryId = selectedCategory
            if (selectedCategory === 'new') {
                if (!newGroupName.trim()) {
                    showToast('Grup adı boş olamaz', 'error')
                    setStatus('idle')
                    return
                }

                // Yeni grup oluştur
                const groupRes = await fetch('/api/connections/groups', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: newGroupName,
                        icon: newGroupIcon || '📁'
                    })
                })

                if (!groupRes.ok) {
                    showToast('Grup oluşturulamadı', 'error')
                    setStatus('idle')
                    return
                }

                const groupData = await groupRes.json()
                finalCategoryId = groupData.category.id
            }

            const res = await fetch('/api/connections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cardId,
                    categoryId: finalCategoryId && finalCategoryId !== '' ? finalCategoryId : null,
                    myTags: tagsArray.length > 0 ? JSON.stringify(tagsArray) : null,
                    myNote: note || null
                })
            })

            if (res.ok) {
                setStatus('added')
                setShowModal(false)
                // Temizle
                setTags('')
                setNote('')
                setSelectedCategory('')
                setNewGroupName('')
                setNewGroupIcon('📁')
            } else {
                const data = await res.json()
                showToast(data.error || 'İletişim ağına eklenemedi. Lütfen tekrar deneyin.', 'error')
                setStatus('idle')
            }
        } catch (error) {
            console.error('Add to network error:', error)
            showToast('Bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.', 'error')
            setStatus('idle')
        }
    }

    return (
        <>
            <button
                onClick={handleAddClick}
                disabled={status === 'loading'}
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: status === 'added'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: status === 'added'
                        ? '1px solid rgba(16, 185, 129, 0.3)'
                        : 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                {status === 'loading' && '⏳ Ekleniyor...'}
                {status === 'added' && '✓ İletişim Ağımda - Profile Git'}
                {status === 'idle' && '➕ İletişim Ağıma Ekle'}
            </button>

            {/* Modal */}
            {showModal && (
                <div
                    onClick={() => setShowModal(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '1rem'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#1e293b',
                            borderRadius: '1rem',
                            padding: '2rem',
                            maxWidth: '400px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                    >
                        <h2 style={{
                            color: '#fff',
                            marginBottom: '0.5rem',
                            fontSize: '1.5rem'
                        }}>
                            İletişim Ağına Ekle
                        </h2>
                        <p style={{
                            color: '#94a3b8',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem'
                        }}>
                            {cardOwnerName} kişisini ağınıza ekleyin
                        </p>

                        {/* Grup Seçimi */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                color: '#cbd5e1',
                                fontSize: '0.9rem',
                                display: 'block',
                                marginBottom: '0.5rem'
                            }}>
                                📁 Grup (Opsiyonel)
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '0.5rem',
                                    color: '#fff',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="">Grup Seçmeyin</option>
                                <option value="new" style={{
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    fontWeight: 'bold'
                                }}>➕ Yeni Grup Oluştur</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                            {selectedCategory === 'new' && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    background: '#0f172a',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #334155'
                                }}>
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <label style={{
                                            color: '#cbd5e1',
                                            fontSize: '0.85rem',
                                            display: 'block',
                                            marginBottom: '0.5rem'
                                        }}>
                                            Grup Adı
                                        </label>
                                        <input
                                            type="text"
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            placeholder="örn: İş Arkadaşları"
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                background: '#1e293b',
                                                border: '1px solid #334155',
                                                borderRadius: '0.375rem',
                                                color: '#fff',
                                                fontSize: '0.85rem'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{
                                            color: '#cbd5e1',
                                            fontSize: '0.85rem',
                                            display: 'block',
                                            marginBottom: '0.5rem'
                                        }}>
                                            İkon (opsiyonel)
                                        </label>
                                        <input
                                            type="text"
                                            value={newGroupIcon}
                                            onChange={(e) => setNewGroupIcon(e.target.value)}
                                            placeholder="📁"
                                            maxLength={2}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                background: '#1e293b',
                                                border: '1px solid #334155',
                                                borderRadius: '0.375rem',
                                                color: '#fff',
                                                fontSize: '0.85rem'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Etiketler */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                color: '#cbd5e1',
                                fontSize: '0.9rem',
                                display: 'block',
                                marginBottom: '0.5rem'
                            }}>
                                🏷️ Etiketler (virgülle ayırın)
                            </label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="örn: iş, arkadaş, aile"
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

                        {/* Not */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                color: '#cbd5e1',
                                fontSize: '0.9rem',
                                display: 'block',
                                marginBottom: '0.5rem'
                            }}>
                                💭 Notunuz (Opsiyonel)
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Bu kişi hakkında notunuz..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '0.5rem',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        {/* Butonlar */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'transparent',
                                    border: '1px solid #334155',
                                    borderRadius: '0.5rem',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={status === 'loading'}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: '#fff',
                                    fontWeight: '600',
                                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {status === 'loading' ? '⏳ Ekleniyor...' : '✓ Ekle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
