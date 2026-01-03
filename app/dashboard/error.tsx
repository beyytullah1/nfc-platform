'use client'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '0 auto'
        }}>
            <div style={{
                fontSize: '4rem',
                marginBottom: '1rem'
            }}>
                ⚠️
            </div>
            <h2 style={{
                fontSize: '1.5rem',
                color: 'var(--color-text)',
                marginBottom: '1rem'
            }}>
                Bir Şeyler Yanlış Gitti
            </h2>
            <p style={{
                color: 'var(--color-text-muted)',
                marginBottom: '2rem'
            }}>
                {error.message || 'Beklenmeyen bir hata oluştu.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                    onClick={() => reset()}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    🔄 Tekrar Dene
                </button>
                <a
                    href="/dashboard"
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'var(--color-bg-card)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        display: 'inline-block'
                    }}
                >
                    🏠 Dashboard'a Dön
                </a>
            </div>
        </div>
    )
}
