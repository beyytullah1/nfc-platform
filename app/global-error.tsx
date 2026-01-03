'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0a0a',
                padding: '2rem',
                margin: 0
            }}>
                <div style={{
                    textAlign: 'center',
                    maxWidth: '500px'
                }}>
                    <div style={{
                        fontSize: '5rem',
                        marginBottom: '1rem'
                    }}>
                        ⚠️
                    </div>
                    <h1 style={{
                        fontSize: '2rem',
                        color: '#fff',
                        marginBottom: '1rem'
                    }}>
                        Bir Hata Oluştu
                    </h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: '2rem',
                        fontSize: '1rem'
                    }}>
                        {error.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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
                            href="/"
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                fontWeight: '600',
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            🏠 Ana Sayfa
                        </a>
                    </div>
                </div>
            </body>
        </html>
    )
}
