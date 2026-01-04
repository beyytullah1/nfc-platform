'use client'

import { Suspense } from 'react'
import ClaimPageContent from './ClaimPageContent'

export default function ClaimPage() {
    return (
        <Suspense fallback={
            <div className="container" style={{
                display: 'flex',
                height: '100vh',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Yükleniyor...
                    </p>
                </div>
            </div>
        }>
            <ClaimPageContent />
        </Suspense>
    )
}
