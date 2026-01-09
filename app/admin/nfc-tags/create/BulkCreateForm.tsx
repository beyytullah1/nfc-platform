'use client'

import { useState } from 'react'
import { bulkCreateNfcTags } from '@/lib/nfc-admin-actions'
import { useRouter } from 'next/navigation'
import styles from '../../admin.module.css'

export function BulkCreateForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const count = parseInt(formData.get('count') as string)

        if (count < 1 || count > 1000) {
            alert('1 ile 1000 arasında değer girin')
            setLoading(false)
            return
        }

        try {
            const res = await bulkCreateNfcTags(count)
            setResult(res)
            alert(`${res.count} adet etiket oluşturuldu!`)
            router.refresh()
        } catch (error: any) {
            alert('Hata: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    function downloadCsv() {
        if (!result?.tags) return

        const csv = [
            ['Public Code', 'Tag ID', 'URL'].join(','),
            ...result.tags.map((tag: any) => [
                tag.publicCode,
                tag.tagId,
                `${window.location.origin}/t/${tag.publicCode}`
            ].join(','))
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `nfc-tags-${Date.now()}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div style={{ marginTop: '1.5rem' }}>
            <form onSubmit={handleSubmit}>
                <div className={styles.infoItem}>
                    <label style={{ color: 'rgba(255,255,255,0.7)' }}>Kaç Adet?</label>
                    <input
                        type="number"
                        name="count"
                        min="1"
                        max="1000"
                        defaultValue="10"
                        required
                        className={styles.searchInput}
                        style={{ width: '100%' }}
                    />
                    <small style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                        Maksimum 1000 etiket
                    </small>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={styles.actionBtnWarning}
                    style={{ width: '100%', marginTop: '1.5rem' }}
                >
                    {loading ? 'Oluşturuluyor...' : '📦 Toplu Oluştur'}
                </button>
            </form>

            {result && (
                <div style={{
                    marginTop: '1.5rem',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '12px',
                    padding: '1.25rem'
                }}>
                    <p style={{ color: '#86efac', margin: '0 0 1rem 0' }}>
                        ✅ {result.count} adet etiket başarıyla oluşturuldu!
                    </p>
                    <button
                        onClick={downloadCsv}
                        className={styles.actionBtnPrimary}
                        style={{ width: '100%' }}
                    >
                        📥 CSV İndir
                    </button>
                </div>
            )}
        </div>
    )
}
