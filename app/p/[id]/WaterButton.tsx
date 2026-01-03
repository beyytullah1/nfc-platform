'use client'

import { useState, useTransition } from 'react'
import { addWateringLog } from '@/app/actions'
import { useRouter } from 'next/navigation'

export default function WaterButton({ plantId }: { plantId: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showAmount, setShowAmount] = useState(false)
    const [amount, setAmount] = useState('')
    const [watered, setWatered] = useState(false)

    const handleWater = async (amountMl?: number) => {
        startTransition(async () => {
            await addWateringLog(plantId, amountMl)
            setWatered(true)
            setShowAmount(false)
            router.refresh()

            setTimeout(() => setWatered(false), 2000)
        })
    }

    if (watered) {
        return (
            <div
                className="btn btn-primary"
                style={{
                    background: 'var(--color-primary)',
                    pointerEvents: 'none'
                }}
            >
                <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>✓</span>
                Sulandı!
            </div>
        )
    }

    if (showAmount) {
        return (
            <div className="card">
                <div style={{ marginBottom: '12px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.9rem'
                    }}>
                        Su miktarı (opsiyonel)
                    </label>
                    <input
                        type="number"
                        className="input"
                        placeholder="ml"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        autoFocus
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn"
                        onClick={() => setShowAmount(false)}
                        style={{
                            background: 'var(--color-surface-hover)',
                            border: '1px solid var(--color-border)',
                        }}
                    >
                        İptal
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => handleWater(amount ? parseInt(amount) : undefined)}
                        disabled={isPending}
                    >
                        {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button
                className="btn btn-primary"
                onClick={() => handleWater()}
                disabled={isPending}
                style={{ flex: 1 }}
            >
                <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>💧</span>
                {isPending ? 'Kaydediliyor...' : 'Suladım'}
            </button>
            <button
                className="btn"
                onClick={() => setShowAmount(true)}
                style={{
                    background: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-border)',
                    width: '48px',
                    padding: 0,
                }}
                title="Miktar ekle"
            >
                📊
            </button>
        </div>
    )
}
